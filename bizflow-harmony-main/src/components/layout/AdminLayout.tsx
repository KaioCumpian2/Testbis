import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import OnboardingTour from '../onboarding/OnboardingTour';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useTheme } from '@/contexts/ThemeContext';

export function AdminLayout() {
  const navigate = useNavigate();
  const { themeColor } = useEstablishment();
  const { setThemeColor } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Sync theme color with establishment color on load
  useEffect(() => {
    if (themeColor) {
      console.log('[AdminLayout] Syncing theme color:', themeColor);
      setThemeColor(themeColor);
    }
  }, [themeColor, setThemeColor]);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />
      <AdminSidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
