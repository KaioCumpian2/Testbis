import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, ClipboardList, Star, Home, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEstablishment } from '@/contexts/EstablishmentContext';

export function MobileNav() {
  const location = useLocation();
  const { slug } = useEstablishment();

  // Base path for tenant-specific routes
  const base = `/s/${slug || 'exemplo'}`;

  const navItems = [
    { to: base, icon: Home, label: 'Inicio', end: true },
    { to: `${base}/portfolio`, icon: Image, label: 'Portfolio' },
    { to: `${base}/booking`, icon: Calendar, label: 'Agendar' },
    { to: `${base}/appointments`, icon: ClipboardList, label: 'Agenda' },
    { to: `${base}/reviews`, icon: Star, label: 'Avaliacoes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
