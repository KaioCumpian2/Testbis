import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import logo from '@/assets/logo.png';

export function ClientLayout() {
  const { name } = useEstablishment();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">{name}</h1>
              <p className="text-xs text-muted-foreground">Agende seu horario</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
