import { Bell, CheckCircle, AlertCircle, Info, Clock, Loader2, Sparkles, Trash2, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationsAsRead } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const getIcon = (type: string) => {
  switch (type) {
    case 'SUCCESS':
    case 'PAYMENT_APPROVED': return CheckCircle;
    case 'WARNING':
    case 'PAYMENT_PENDING': return AlertCircle;
    default: return Info;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'SUCCESS':
    case 'PAYMENT_APPROVED': return 'text-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10';
    case 'WARNING':
    case 'PAYMENT_PENDING': return 'text-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10';
    default: return 'text-primary bg-primary/10 shadow-lg shadow-primary/10';
  }
};

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 15000 // Poll more frequently for notifications
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas as notificações foram lidas');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter bg-premium-gradient bg-clip-text text-transparent">
            Inbox de Atividade
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            {unreadCount > 0
              ? `Você possui ${unreadCount} interações para revisar`
              : 'Seu histórico está atualizado e limpo'
            }
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markReadMutation.mutate()}
            disabled={markReadMutation.isPending}
            className="h-14 px-8 rounded-2xl glass border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/5 transition-all active:scale-95"
          >
            {markReadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MailOpen className="w-5 h-5" />
                Marcar tudo como lido
              </>
            )}
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="glass border-primary/10 border-dashed p-32 text-center rounded-[3rem] animate-scale-in">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Bell className="w-12 h-12 text-primary opacity-20" />
              <div className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-full animate-spin-slow" />
            </div>
            <h3 className="text-xl font-black italic tracking-tight mb-2">Silêncio Absoluto</h3>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest max-w-xs mx-auto opacity-60">
              Não há novas atualizações do sistema ou alertas financeiros por enquanto.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {notifications.map((notification: any, idx: number) => {
              const Icon = getIcon(notification.type);
              const iconColors = getIconColor(notification.type);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-500 rounded-[2rem] border border-primary/5 shadow-sm animate-slide-up",
                    !notification.isRead
                      ? "glass bg-primary/[0.03] border-primary/20 shadow-xl shadow-primary/5"
                      : "bg-white/40 hover:bg-white/60"
                  )}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="p-6 flex items-start gap-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", iconColors)}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn("text-lg font-black italic tracking-tight transition-colors", !notification.isRead ? "text-primary" : "text-muted-foreground")}>
                          {notification.message.split(':')[0] || 'Alerta de Sistema'}
                        </h4>
                        {!notification.isRead && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black py-0.5 px-2 bg-primary text-white uppercase italic rounded shadow-lg shadow-primary/20">Novo</span>
                          </div>
                        )}
                      </div>

                      <p className={cn("text-sm font-medium leading-relaxed", !notification.isRead ? "text-foreground" : "text-muted-foreground/70")}>
                        {notification.message.includes(':')
                          ? notification.message.split(':').slice(1).join(':').trim()
                          : notification.message
                        }
                      </p>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(notification.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-primary/20" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary italic opacity-0 group-hover:opacity-100 transition-opacity">Detalhes técnicos</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 scale-90 group-hover:scale-100 transition-all opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Glass highlight effect on hover */}
                  <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
