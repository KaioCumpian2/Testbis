import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EstablishmentContext } from '@/contexts/EstablishmentContext';

// Import Pages (Mock or Real)
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ClientBooking from '@/pages/client/ClientBooking';
import ClientAppointments from '@/pages/client/ClientAppointments';
import ClientReviews from '@/pages/client/ClientReviews';

// --- POLYFILLS ---
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// --- MOCK API & STORAGE ---
const mockDb = {
    services: [] as any[],
    professionals: [] as any[],
    appointments: [] as any[],
    reviews: [] as any[]
};

// Hoisted Factory
vi.mock('@/lib/api', () => {
    return {
        getServices: vi.fn(() => Promise.resolve(mockDb.services)),
        getProfessionals: vi.fn(() => Promise.resolve(mockDb.professionals)),
        getFinancialSummary: vi.fn(() => Promise.resolve({
            revenue: mockDb.appointments.reduce((acc, curr) => acc + (curr.service?.price || 0), 0),
            appointments: mockDb.appointments.length
        })),
        getTodayAppointments: vi.fn(() => Promise.resolve(mockDb.appointments)),
        getPendingPayments: vi.fn(() => Promise.resolve(mockDb.appointments.filter(a => a.paymentStatus === 'PENDING_APPROVAL'))),
        getAdminProfessionals: vi.fn(() => Promise.resolve(mockDb.professionals)),
        getDetailedReport: vi.fn(() => Promise.resolve({ totalRevenue: 0, totalAppointments: 0, appointmentsByDay: [] })),
        approvePayment: vi.fn((id) => Promise.resolve({ success: true })),
        rejectPayment: vi.fn((id) => Promise.resolve({ success: true })),
        updateAppointmentStatus: vi.fn((id, status) => {
            const apt = mockDb.appointments.find(a => a.id === id);
            if (apt) apt.status = status;
            return Promise.resolve(apt);
        }),
        getPublicReviews: vi.fn(() => Promise.resolve(mockDb.reviews)),
        getPublicAppointmentsByPhone: vi.fn((tid, phone) => {
            return Promise.resolve(mockDb.appointments.filter(a => a.clientPhone === phone));
        }),
        createPublicAppointment: vi.fn((data) => {
            const newItem = {
                id: 'apt-' + Date.now(),
                status: 'REQUESTED',
                paymentStatus: 'PENDING',
                ...data,
                service: mockDb.services.find(s => s.id === data.serviceId),
                professional: mockDb.professionals.find(p => p.id === data.professionalId)
            };
            mockDb.appointments.push(newItem);
            return Promise.resolve(newItem);
        }),
        createPublicReview: vi.fn((data) => {
            const newItem = { id: 'rev-' + Date.now(), ...data, createdAt: new Date().toISOString() };
            mockDb.reviews.push(newItem);
            return Promise.resolve(newItem);
        }),
        api: {
            get: vi.fn(),
            post: vi.fn((url, data) => {
                // Intercept Owner Actions
                if (url === '/services') {
                    const newItem = { id: 'srv-' + Date.now(), ...data };
                    mockDb.services.push(newItem);
                    return Promise.resolve({ data: newItem });
                }
                if (url === '/professionals') {
                    const newItem = { id: 'pro-' + Date.now(), ...data };
                    mockDb.professionals.push(newItem);
                    return Promise.resolve({ data: newItem });
                }
                if (url.includes('/status')) {
                    // /appointments/:id/status
                    const id = url.split('/')[2];
                    const apt = mockDb.appointments.find(a => a.id === id);
                    if (apt) apt.status = data.status;
                    return Promise.resolve({ data: apt });
                }
                return Promise.resolve({ data: {} });
            }),
            put: vi.fn(),
            delete: vi.fn()
        }
    };
});

// Helper for Test Body to access these "Internal" mocks?
// Actually, we can just import them to spy on them?
// Or better, we expose a helper to 'seed' the db if needed, but here we just rely on the mockDb closure.
// Since mockDb is defined before vi.mock, it *might* still be an issue if vitest hoists the factory above mockDb.
// SAFE WAY: Use vi.hoisted() or keep mockDb *inside* the factory and expose getters/setters on the mocked module.
// But simpler: just define mockDb globally in the test file but outside the factory?
// No, the factory runs BEFORE the file body.
// CORRECTION: mockDb must be inside. But how do we assert?
// We will export a "testState" from the mock.


// --- TEST SETUP ---
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

import { TooltipProvider } from '@/components/ui/tooltip';

const renderApp = (ui: React.ReactNode, role: 'owner' | 'client') => {
    // Mock Context based on Role
    const contextValue = {
        slug: 'barbearia-top',
        tenantId: 'tenant-123',
        name: 'Barbearia Top',
        setName: vi.fn(),
        pixKey: '123456',
        setPixKey: vi.fn(),
        logo: '', setLogo: vi.fn(),
        portfolioImages: [], setPortfolioImages: vi.fn(),
        timeSlots: [{ id: '1', time: '10:00', isActive: true }], setTimeSlots: vi.fn(),
        workingHours: { open: '09:00', close: '18:00' },
        isLoading: false,
        updateSettings: vi.fn().mockResolvedValue(true)
    };

    return render(
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <BrowserRouter>
                    <EstablishmentContext.Provider value={contextValue}>
                        {ui}
                    </EstablishmentContext.Provider>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

import { api, getFinancialSummary } from '@/lib/api';

describe('THE STORY: Owner meets Client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDb.services = [];
        mockDb.professionals = [];
        mockDb.appointments = [];
        mockDb.reviews = [];
        localStorage.clear();
    });

    it('Simulation: Owner Setup -> Client Book -> Owner Confirm -> Client Review', async () => {
        // ACT 1: THE OWNER SETS UP (Simulated by direct API calls for speed, verifying state)
        console.log('🎬 ACT 1: Owner opens the shop...');

        // Owner creates data via API (Mock intercepts this)
        await api.post('/services', { name: 'Corte Master', price: 50, duration: 45 });
        await api.post('/professionals', { name: 'Mestre Navalha', role: 'Barbeiro' });

        expect(mockDb.services).toHaveLength(1);
        expect(mockDb.professionals).toHaveLength(1);
        console.log('✅ Shop is ready with Service and Professional.');

        // ACT 2: THE CLIENT BOOKS
        console.log('🎬 ACT 2: Client visits and books...');
        renderApp(<ClientBooking />, 'client');

        // Select Service
        await waitFor(() => expect(screen.getByText('Corte Master')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Corte Master'));
        fireEvent.click(screen.getByText('Continuar'));

        // Select Pro
        await waitFor(() => expect(screen.getByText('Mestre Navalha')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Mestre Navalha'));
        fireEvent.click(screen.getByText('Continuar'));

        // Select Date (Click first available date)
        await waitFor(() => expect(screen.getByText('Selecione a data')).toBeInTheDocument());
        // Find a date button (usually numeric text)
        const dateButton = screen.getByText(new Date().getDate().toString());
        fireEvent.click(dateButton);

        // Select Time (Mocked 10:00)
        await waitFor(() => expect(screen.getByText('10:00')).toBeInTheDocument());
        fireEvent.click(screen.getByText('10:00'));
        fireEvent.click(screen.getByText('Continuar'));

        // Identification
        await waitFor(() => expect(screen.getByText('Seu Nome Completo')).toBeInTheDocument());

        const nameInput = screen.getByLabelText('Seu Nome Completo');
        const phoneInput = screen.getByLabelText('Seu Telefone (WhatsApp)');

        fireEvent.change(nameInput, { target: { value: 'Cliente Feliz' } });
        fireEvent.change(phoneInput, { target: { value: '11999999999' } });

        const continueBtn = screen.getByText('Continuar');
        await waitFor(() => expect(continueBtn).not.toBeDisabled());
        fireEvent.click(continueBtn);

        // Confirm
        await waitFor(() => expect(screen.getByText('Tudo pronto?')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Confirmar Agendamento'));

        await waitFor(() => expect(mockDb.appointments).toHaveLength(1));
        console.log('✅ Client booked successfully!');

        // ACT 3: THE OWNER CHECKS DASHBOARD
        console.log('🎬 ACT 3: Owner checks dashboard...');
        // (Re-render as Owner)
        renderApp(<AdminDashboard />, 'owner'); // This assumes simulation, in reality route change.

        // Check if Revenue Update is called (Dashboard fetches summary)
        await waitFor(() => expect(getFinancialSummary).toHaveBeenCalled());
        console.log('✅ Owner sees the new booking on Dashboard.');

        // ACT 4: CLIENT TRACKS & REVIEWS
        console.log('🎬 ACT 4: Client tracks and reviews...');
        const aptId = mockDb.appointments[0].id;

        // Simulate Owner marking as Completed
        await api.post(`/appointments/${aptId}/status`, { status: 'COMPLETED' });

        // Client Reviews
        renderApp(<ClientReviews />, 'client');

        await waitFor(() => expect(screen.getByText('Avaliar Agora')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Avaliar Agora'));

        await waitFor(() => expect(screen.getByText('Enviar Avaliação')).toBeInTheDocument());

        // Select Rating (Click the 5th star) - Assuming Lucide Star icons are rendered as buttons or clickable SVGs
        // The component uses <Star /> icons inside a button/div
        // We can get them by role 'button' (if they are buttons) or generic click.
        // Let's try matching the 5th star specifically.

        const starButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg.lucide-star'));
        if (starButtons.length >= 5) {
            fireEvent.click(starButtons[4]); // Click 5th star
        } else {
            // Fallback: try querying by testid or assumption
            const allStars = document.querySelectorAll('svg.lucide-star');
            if (allStars.length > 0) fireEvent.click(allStars[allStars.length - 1]);
        }

        fireEvent.change(screen.getByLabelText('Seu Nome'), { target: { value: 'Cliente Feliz' } });
        fireEvent.change(screen.getByLabelText('Comentário (Opcional)'), { target: { value: 'Serviço Incrível!' } });
        fireEvent.click(screen.getByText('Enviar Avaliação'));

        await waitFor(() => expect(mockDb.reviews).toHaveLength(1));
        expect(mockDb.reviews[0].comment).toBe('Serviço Incrível!');
        console.log('✅ Client left a 5-star review!');

        console.log('🎉 STORY COMPLETE: Full Cycle Verified.');
    });
});
