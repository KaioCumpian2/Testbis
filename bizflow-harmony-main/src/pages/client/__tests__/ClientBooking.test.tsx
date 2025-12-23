import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ClientBooking from '../ClientBooking';
import { EstablishmentContext } from '@/contexts/EstablishmentContext';

// Mock API
vi.mock('@/lib/api', () => ({
    getServices: vi.fn().mockResolvedValue([]),
    getProfessionals: vi.fn().mockResolvedValue([]),
    api: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

const mockContextValue = {
    slug: 'test-slug',
    tenantId: 'tenant-123',
    name: 'Test Setup',
    setName: vi.fn(),
    pixKey: '123',
    setPixKey: vi.fn(),
    logo: 'logo.png',
    setLogo: vi.fn(),
    portfolioImages: [],
    setPortfolioImages: vi.fn(),
    timeSlots: [{ id: 'slot-1', time: '10:00', isActive: true }],
    setTimeSlots: vi.fn(),
    workingHours: { open: '09:00', close: '18:00' },
    isLoading: false,
    updateSettings: vi.fn().mockResolvedValue(undefined)
};

const renderWithContext = (component: React.ReactNode) => {
    return render(
        <BrowserRouter>
            <EstablishmentContext.Provider value={mockContextValue}>
                {component}
            </EstablishmentContext.Provider>
        </BrowserRouter>
    );
};

describe('ClientBooking Flow', () => {
    it('renders the first step (Service Selection)', async () => {
        renderWithContext(<ClientBooking />);
        // Expect to see "Agendar Horario" title
        expect(await screen.findByText('Agendar Horario')).toBeInTheDocument();
        // Expect to see "Servico" step active (implied by content)
        // Since services are fetched async, we might see loader or empty state if not mocked responding yet
    });

    // We can add more detailed interaction tests here once we mock the api responses effectively in beforeEach
});
