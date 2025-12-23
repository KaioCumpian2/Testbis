import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { establishment as mockEstablishment } from '@/data/mockData';
import { PortfolioImage, TimeSlot } from '@/types';
import defaultLogo from '@/assets/logo.png';
import { getEstablishmentBySlug } from '@/lib/api';

interface EstablishmentContextType {
  slug: string | null;
  tenantId: string | null;
  name: string;
  setName: (name: string) => void;
  pixKey: string;
  setPixKey: (key: string) => void;
  logo: string;
  setLogo: (logo: string) => void;
  portfolioImages: PortfolioImage[];
  setPortfolioImages: (images: PortfolioImage[]) => void;
  timeSlots: TimeSlot[];
  setTimeSlots: (slots: TimeSlot[]) => void;
  workingHours: { open: string; close: string };
  isLoading: boolean;
  updateSettings: (data: any) => Promise<void>;
}

export const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

export function EstablishmentProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [name, setName] = useState(mockEstablishment.name);
  const [pixKey, setPixKey] = useState(mockEstablishment.pixKey);
  const [logo, setLogo] = useState<string>(() => {
    const saved = localStorage.getItem('establishmentLogo');
    return saved || defaultLogo;
  });
  const [portfolioImages, setPortfolioImages] = useState(mockEstablishment.portfolioImages);
  const [timeSlots, setTimeSlots] = useState(mockEstablishment.availableTimeSlots);
  const [workingHours] = useState(mockEstablishment.workingHours);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to sync with API and Context
  const updateSettings = async (data: any) => {
    try {
      const { updateTenantConfig } = await import('@/lib/api');
      const updatedConfig = await updateTenantConfig(data);

      if (updatedConfig) {
        if (updatedConfig.publicName) setName(updatedConfig.publicName);
        if (updatedConfig.pixKey) setPixKey(updatedConfig.pixKey);
        if (updatedConfig.logoUrl) {
          setLogo(updatedConfig.logoUrl);
          localStorage.setItem('establishmentLogo', updatedConfig.logoUrl);
        }
        // Note: ThemeColor is handled by ThemeContext, but we can return it or let the caller handle it.
        // Ideally EstablishmentContext should also know about themeColor but it's split.
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const location = useLocation();

  useEffect(() => {
    // Attempt to extract slug from URL path: /s/:slug/...
    const match = location.pathname.match(/\/s\/([^/]+)/);

    // Check if we are in a tenant context
    if (match && match[1]) {
      const detectedSlug = match[1];

      // Only reload if slug changed to avoid unnecessary fetches
      if (slug !== detectedSlug) {
        setSlug(detectedSlug);

        const loadEstablishment = async () => {
          setIsLoading(true);
          try {
            const data = await getEstablishmentBySlug(detectedSlug);
            if (data) {
              setTenantId(data.id);
              setName(data.config?.publicName || data.name);

              // Update Pix Key if available
              if (data.config?.pixKey) setPixKey(data.config.pixKey);

              // Update Logo if available
              if (data.config?.logoUrl) {
                setLogo(data.config.logoUrl);
                // Don't persist tenant logo to global localStorage to avoid confusion between tenants
                // localStorage.setItem('establishmentLogo', data.config.logoUrl); 
              }

              console.log('Context updated for tenant:', data.name);
            }
          } catch (error) {
            console.error('Failed to load establishment context:', error);
            // Optional: Redirect to 404 or show error toast
          } finally {
            setIsLoading(false);
          }
        };

        loadEstablishment();
      }
    } else {
      // Not in a tenant route (e.g. Landing Page or Admin Root)
      // Reset if needed, or keep generic defaults
      // setSlug(null); 
    }
  }, [location.pathname]);

  const handleSetLogo = (newLogo: string) => {
    setLogo(newLogo);
    localStorage.setItem('establishmentLogo', newLogo);
  };

  return (
    <EstablishmentContext.Provider value={{
      slug,
      tenantId,
      name,
      setName,
      pixKey,
      setPixKey,
      logo,
      setLogo: handleSetLogo,
      portfolioImages,
      setPortfolioImages,
      timeSlots,
      setTimeSlots,
      workingHours,
      isLoading,
      updateSettings
    }}>
      {children}
    </EstablishmentContext.Provider>
  );
}

export function useEstablishment() {
  const context = useContext(EstablishmentContext);
  if (!context) {
    throw new Error('useEstablishment must be used within an EstablishmentProvider');
  }
  return context;
}
