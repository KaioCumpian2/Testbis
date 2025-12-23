import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { EstablishmentProvider, useEstablishment } from '@/contexts/EstablishmentContext';

// Helper component to display context values
const ContextTester = () => {
    const { slug, name } = useEstablishment();
    return (
        <div>
            <div data-testid="slug">{slug || 'no-slug'}</div>
            <div data-testid="name">{name}</div>
        </div>
    );
};

describe('App Routing & Context', () => {
    it('detects tenant slug from URL', async () => {
        render(
            <MemoryRouter initialEntries={['/s/barber-shop']}>
                <EstablishmentProvider>
                    <Routes>
                        <Route path="/s/:slug" element={<ContextTester />} />
                    </Routes>
                </EstablishmentProvider>
            </MemoryRouter>
        );

        // Should update slug based on URL
        // Note: Context updates are async inside useEffect, but React Testing Library's findBy handles this
        expect(await screen.findByTestId('slug')).toHaveTextContent('barber-shop');
    });

    it('handles root path without slug', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <EstablishmentProvider>
                    <Routes>
                        <Route path="/" element={<ContextTester />} />
                    </Routes>
                </EstablishmentProvider>
            </MemoryRouter>
        );

        expect(screen.getByTestId('slug')).toHaveTextContent('no-slug');
    });
});
