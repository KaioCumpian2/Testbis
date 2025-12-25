import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { PortfolioImage, TimeSlot } from '@/types';
import defaultLogo from '@/assets/logo.png';
import { getEstablishmentBySlug, getAdminTenantConfig } from '@/lib/api';
import { useLocation } from 'react-router-dom';

interface EstablishmentContextType {
  slug: string | null;
  tenantId: string | null;
  name: string;
  pixKey: string;
  logo: string;
  themeColor: string;
  portfolioImages: PortfolioImage[];
  timeSlots: TimeSlot[];
  workingHours: { open: string; close: string };
  isLoading: boolean;
  setLogo: (logo: string) => void;
  setPortfolioImages: (images: PortfolioImage[]) => void;
  setTimeSlots: (slots: TimeSlot[]) => void;
  updateSettings: (data: any) => Promise<void>;
  setName: (name: string) => void;
  setPixKey: (key: string) => void;
  setThemeColor: (color: string) => void;
}

export const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

export function EstablishmentProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [logo, setLogo] = useState<string>(defaultLogo);
  const [themeColor, setThemeColor] = useState<string>('#8B5CF6'); // Default purple
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [workingHours] = useState({ open: '09:00', close: '18:00' });
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const initialLoadRef = useRef(false);

  // Helper to map backend data to context state
  const applyEstablishmentData = (data: any) => {
    if (!data) return;

    setTenantId(data.id || data.tenantId || null);
    setSlug(data.slug || null);

    // Extract basic config - handle both nested and flat structures
    const config = data.config || data;
    setName(config.publicName || data.name || 'Meu Estabelecimento');
    setPixKey(config.pixKey || '');

    // Extract themeColor from either location
    const color = config.themeColor || data.themeColor || '#8B5CF6';
    setThemeColor(color);
    console.log('[EstablishmentContext] Applied themeColor:', color);

    if (config.logoUrl) {
      setLogo(config.logoUrl);
    } else {
      setLogo(defaultLogo);
    }

    // Portfolio
    if (data.portfolioImages) {
      setPortfolioImages(data.portfolioImages);
    } else {
      setPortfolioImages([]);
    }

    // Slots
    if (data.availableSlots) {
      setTimeSlots(data.availableSlots.map((s: any) => ({
        id: s.id,
        time: s.time,
        isActive: s.isActive
      })));
    } else {
      setTimeSlots([]);
    }

    // Update Browser Title
    const finalName = config.publicName || data.name || 'FlowMaster';
    document.title = `${finalName} | FlowMaster`;
  };

  const updateSettings = async (data: any) => {
    try {
      const { updateTenantConfig } = await import('@/lib/api');

      const payload = {
        ...data,
        portfolioImages: portfolioImages.map(img => ({
          url: img.url,
          title: img.title || '',
          isActive: img.isActive
        })),
        availableSlots: timeSlots.map(slot => ({
          time: slot.time,
          isActive: slot.isActive
        }))
      };

      const result = await updateTenantConfig(payload);
      if (result) {
        applyEstablishmentData(result);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    const match = location.pathname.match(/\/s\/([^/]+)/);
    const token = localStorage.getItem('token');

    const loadData = async () => {
      setIsLoading(true);
      // Reset state to avoid "ghosting" previous tenant data
      setName('');
      setSlug(null);
      setTenantId(null);

      try {
        if (match && match[1]) {
          // 1. Load by Slug (Client or Admin viewing specific shop)
          const data = await getEstablishmentBySlug(match[1]);
          applyEstablishmentData(data);
        } else if (token) {
          // 2. Load by Token (Admin Dashboard/Settings)
          const data = await getAdminTenantConfig();
          applyEstablishmentData(data);
        } else {
          // 3. No context (Landing page etc)
          setTenantId(null);
          setSlug(null);
          setName('FlowMaster');
          document.title = 'FlowMaster - Sistema de Agendamentos SaaS';
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Failed to load establishment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [location.pathname]);

  return (
    <EstablishmentContext.Provider value={{
      slug,
      tenantId,
      name,
      pixKey,
      logo,
      themeColor,
      portfolioImages,
      timeSlots,
      workingHours,
      isLoading,
      setLogo,
      setPortfolioImages,
      setTimeSlots,
      updateSettings,
      setName,
      setPixKey,
      setThemeColor
    }}>
      {children}
    </EstablishmentContext.Provider>
  );
}

export function useEstablishment() {
  const context = useContext(EstablishmentContext);
  if (context === undefined) {
    throw new Error('useEstablishment must be used within an EstablishmentProvider');
  }
  return context;
}
