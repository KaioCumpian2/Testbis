import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  LayoutDashboard,
  Users,
  Scissors,
  Star,
  CreditCard,
  BarChart3,
  Settings,
  MessageSquare,
  Bot,
  Menu,
  X,
  Image,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';
import { useEstablishment } from '@/contexts/EstablishmentContext';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, tourKey: 'dashboard' },
      { to: '/admin/agenda', icon: Calendar, label: 'Agenda', tourKey: 'agenda' },
    ]
  },
  {
    label: 'Gestao',
    items: [
      { to: '/admin/services', icon: Scissors, label: 'Servicos', tourKey: 'services' },
      { to: '/admin/professionals', icon: Users, label: 'Profissionais', tourKey: 'professionals' },
    ]
  },
  {
    label: 'Relacionamento',
    items: [
      { to: '/admin/reviews', icon: Star, label: 'Avaliacoes' },
      { to: '/admin/notifications', icon: MessageSquare, label: 'Notificacoes' },
    ]
  },
  {
    label: 'Financeiro',
    items: [
      { to: '/admin/payments', icon: CreditCard, label: 'Pagamentos', tourKey: 'payments' },
      { to: '/admin/reports', icon: BarChart3, label: 'Relatorios' },
    ]
  },
  {
    label: 'Integracoes',
    items: [
      { to: '/admin/whatsapp', icon: Bot, label: 'WhatsApp IA' },
    ]
  },
  {
    label: 'Configuracoes',
    items: [
      { to: '/admin/settings', icon: Settings, label: 'CMS', tourKey: 'settings' },
    ]
  }
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { logo, name, slug } = useEstablishment();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-lg font-bold text-primary">{name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">
                  {name || 'FlowMaster'}
                </h1>
                <p className="text-xs text-muted-foreground">Painel Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = item.end
                      ? location.pathname === item.to
                      : location.pathname.startsWith(item.to);

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        data-tour={item.tourKey}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-10 border-sidebar-border hover:bg-sidebar-accent"
              asChild
            >
              <a href={`/s/${slug || 'exemplo'}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Ver Vitrine Pública</span>
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-10 mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold">Sair do Sistema</span>
            </Button>
          </div>
        </div>
      </aside >
    </>
  );
}
