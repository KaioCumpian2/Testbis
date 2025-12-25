import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientBooking from '../ClientBooking';
import ClientAppointments from '../ClientAppointments';
import ClientReviews from '../ClientReviews';
import { EstablishmentContext } from '@/contexts/EstablishmentContext';

// --- MOCK API ---
const mockCreateAppointment = vi.fn();
const mockGetAppointmentsByPhone = vi.fn();
const mockCreateReview = vi.fn();

vi.mock('@/lib/api', () => ({
    getServices: vi.fn().mockResolvedValue([
        { id: 'srv-1', name: 'Corte Cabelo', price: 50, duration: 30, description: 'Corte top' }
    ]),
    getProfessionals: vi.fn().mockResolvedValue([
        { id: 'pro-1', name: 'Joao Barbeiro', role: 'Master' }
    ]),
    getPublicReviews: vi.fn().mockResolvedValue([]),
    createPublicAppointment: (...args) => mockCreateAppointment(...args),
    getPublicAppointmentsByPhone: (...args) => mockGetAppointmentsByPhone(...args),
    createPublicReview: (...args) => mockCreateReview(...args),
    api: { get: vi.fn(), post: vi.fn() }
}));

// --- MOCK CONTEXT ---
const mockContextValue = {
    slug: 'barbearia-top',
    tenantId: 'tenant-123',
    name: 'Barbearia Top',
    setName: vi.fn(),
    pixKey: '123456',
    setPixKey: vi.fn(),
    logo: 'logo.png',
    setLogo: vi.fn(),
    themeColor: '#000000',
    setThemeColor: vi.fn(),
    portfolioImages: [],
    setPortfolioImages: vi.fn(),
    timeSlots: [
        { id: 'slot-1', time: '10:00', isActive: true },
        { id: 'slot-2', time: '11:00', isActive: true }
    ],
    setTimeSlots: vi.fn(),
    workingHours: { open: '09:00', close: '18:00' },
    isLoading: false,
    updateSettings: vi.fn().mockResolvedValue(undefined)
};

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const renderWithContext = (component: React.ReactNode) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <EstablishmentContext.Provider value={mockContextValue}>
                    {component}
                </EstablishmentContext.Provider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Full Client Flow Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Complete Booking Flow: Service -> Professional -> Time -> Identity -> Confirm', async () => {
        renderWithContext(<ClientBooking />);

        // 1. Service Selection
        await waitFor(() => expect(screen.getByText('Corte Cabelo')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Corte Cabelo'));
        fireEvent.click(screen.getByText('PRÓXIMO PASSO'));

        // 2. Professional Selection
        await waitFor(() => expect(screen.getByText('Joao Barbeiro')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Joao Barbeiro'));
        fireEvent.click(screen.getByText('PRÓXIMO PASSO'));

        // 3. Date/Time Selection
        await waitFor(() => expect(screen.getByText('Escolha o dia')).toBeInTheDocument());

        // Find the button that represents today's date.
        // The component renders date number in a <p>.
        const todayText = new Date().getDate().toString();
        // Look for buttons that contain this text.
        const allButtons = screen.getAllByRole('button');
        // Find the button that contains the day text.
        // Note: getAllByText might return multiple if the date is "10" (could match time 10:00).
        // So we filter buttons.
        const dateButton = allButtons.find(btn => btn.textContent?.includes(todayText));

        if (dateButton) {
            fireEvent.click(dateButton);
        } else {
            // Fallback to clicking the first date-looking button (usually index 2 after Back and Pro selectors)
            // Indices: 0=Back (if visible), 1... could be other things.
            // Actually, looking at the code, date buttons are in a horizontal scroll.
            // Let's rely on finding any button with the text.
            const fallbackDate = screen.getAllByText(todayText)[0];
            fireEvent.click(fallbackDate);
        }

        await waitFor(() => expect(screen.getByText('10:00')).toBeInTheDocument());
        fireEvent.click(screen.getByText('10:00'));
        fireEvent.click(screen.getByText('PRÓXIMO PASSO'));

        // 4. Identification (Crucial New Step)
        await waitFor(() => expect(screen.getByText('Seu Nome Completo')).toBeInTheDocument());

        const nameInput = screen.getByLabelText('Seu Nome Completo');
        const phoneInput = screen.getByLabelText('Seu Telefone (WhatsApp)');

        fireEvent.change(nameInput, { target: { value: 'Teste Robot' } });
        fireEvent.change(phoneInput, { target: { value: '11999999999' } });

        const continueBtn = screen.getByText('PRÓXIMO PASSO');
        // Wait for state to update and button to enable
        await waitFor(() => expect(continueBtn).not.toBeDisabled());

        fireEvent.click(continueBtn);

        // 5. Confirmation
        await waitFor(() => expect(screen.getByText('Tudo revisado?')).toBeInTheDocument());
        fireEvent.click(screen.getByText('CONFIRMAR AGORA'));

        // ASSERT: API called with correct types
        await waitFor(() => {
            expect(mockCreateAppointment).toHaveBeenCalledWith(expect.objectContaining({
                tenantId: 'tenant-123',
                clientName: 'Teste Robot',
                clientPhone: '11999999999',
                serviceId: 'srv-1',
                professionalId: 'pro-1'
            }));
        });
    });

    it('Appointments Tracking: Unidentified -> Phone Input -> List View', async () => {
        // Mock successful appointment fetch
        mockGetAppointmentsByPhone.mockResolvedValue([
            {
                id: 'apt-1',
                status: 'REQUESTED',
                paymentStatus: 'PENDING',
                date: new Date().toISOString(),
                service: { name: 'Corte Cabelo', price: 50 },
                professional: { name: 'Joao' }
            }
        ]);

        renderWithContext(<ClientAppointments />);

        // 1. Should see "Informe seu telefone" initially
        expect(screen.getByText('Informe seu telefone para acessar o histórico de agendamentos.')).toBeInTheDocument();

        // 2. Enter Phone
        const input = screen.getByPlaceholderText('(11) 99999-9999');
        fireEvent.change(input, { target: { value: '11999999999' } });
        fireEvent.click(screen.getByText('Ver Meus Horários')); // Updated button text logic if needed, actually it is 'Ver Meus Horários' in code too? Let's check.

        // 3. Should switch view and call API
        await waitFor(() => expect(mockGetAppointmentsByPhone).toHaveBeenCalledWith('tenant-123', '11999999999'));

        // 4. Verify Appointment Display
        await waitFor(() => expect(screen.getByText('Corte Cabelo')).toBeInTheDocument());
        expect(screen.getByText('Joao')).toBeInTheDocument();
        expect(screen.getByText('Finalizar com PIX')).toBeInTheDocument(); // Payment button check
    });

    it('Reviews: Submit Review Flow', async () => {
        renderWithContext(<ClientReviews />);

        // 1. Open Dialog - Wait for loading to finish
        await waitFor(() => expect(screen.getByText('Avaliar Agora')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Avaliar Agora'));

        // 2. Fill Form
        await waitFor(() => expect(screen.getByText('Publicar Feedback')).toBeInTheDocument());

        // Stars are buttons inside a div.
        // We target the dialog specifically to avoid clicking outside
        const dialog = screen.getByRole('dialog');
        const dialogButtons = within(dialog).getAllByRole('button');
        // The first 5 buttons in the dialog are stars [0..4]
        // Click the 5th star (index 4)
        fireEvent.click(dialogButtons[4]);

        fireEvent.change(screen.getByPlaceholderText('Como podemos te chamar?'), { target: { value: 'Cliente Feliz' } });
        fireEvent.change(screen.getByPlaceholderText('Conte detalhes do atendimento...'), { target: { value: 'Adorei!' } });

        fireEvent.click(screen.getByText('Publicar Feedback'));

        // ASSERT
        await waitFor(() => {
            expect(mockCreateReview).toHaveBeenCalledWith(expect.objectContaining({
                tenantId: 'tenant-123',
                clientName: 'Cliente Feliz',
                comment: 'Adorei!',
                rating: 5
            }));
        });
    });
});
