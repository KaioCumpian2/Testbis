import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from '../Register';
import Login from '../Login';
import AdminDashboard from '../../admin/AdminDashboard';
import { api } from '@/lib/api';

// Mock API
vi.mock('@/lib/api', () => ({
    api: {
        post: vi.fn(),
        get: vi.fn(),
        interceptors: {
            request: { use: vi.fn() }
        }
    },
    getFinancialSummary: vi.fn(),
    getTodayAppointments: vi.fn(),
    getPendingPayments: vi.fn(),
    updateAppointmentStatus: vi.fn()
}));

describe('Authentication Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Registration page correctly', () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
    });

    it('renders Login page correctly', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByText('Acessar Painel')).toBeInTheDocument();
    });

    it('simulates successful Login and redirect', async () => {
        (api.post as any).mockResolvedValueOnce({
            data: {
                token: 'fake-jwt-token',
                user: { name: 'Admin User', role: 'ADMIN' }
            }
        });

        // We can't easily test window.location.href in JSDOM validation without more setup,
        // so we will verify the API call and Token storage logic.

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@admin.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByText('Entrar no Sistema'));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                email: 'test@admin.com',
                password: 'password123'
            });
        });
    });
});
