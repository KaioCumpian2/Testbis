import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

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

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/s\/([^/]+)/);
    if (match && match[1]) {
      const detectedSlug = match[1];
      setSlug(detectedSlug);

      const loadEstablishment = async () => {
        setIsLoading(true);
        try {
          const data = await getEstablishmentBySlug(detectedSlug);
          if (data) {
            setTenantId(data.id);
            setName(data.config?.publicName || data.name);
            setPixKey(data.config?.pixKey || '');
            if (data.config?.logoUrl) setLogo(data.config.logoUrl);
            // Additional mapping can be done here for services, professionals etc. if needed globally
            console.log('Real establishment data loaded:', data.name);
          }
        } catch (error) {
          console.error('Error loading establishment from API:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadEstablishment();
    }
  }, []);

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
      isLoading
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
