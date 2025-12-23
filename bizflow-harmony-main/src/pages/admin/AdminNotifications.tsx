import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const notifications = [
  {
    id: '1',
    type: 'success',
    title: 'Pagamento aprovado',
    message: 'Pagamento de Juliana Oliveira foi confirmado para o serviço Corte Feminino.',
    time: '5 min atrás',
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Comprovante pendente',
    message: 'Maria Santos enviou um comprovante para validação.',
    time: '15 min atrás',
    read: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Novo agendamento',
    message: 'Fernanda Lima solicitou um agendamento para Massagem Relaxante.',
    time: '30 min atrás',
    read: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Nova avaliação',
    message: 'Camila Rocha deixou uma avaliação 5 estrelas.',
    time: '1 hora atrás',
    read: true
  },
  {
    id: '5',
    type: 'success',
    title: 'Atendimento concluído',
    message: 'O atendimento de Camila Rocha foi marcado como concluído.',
    time: '2 horas atrás',
    read: true
  }
];

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'warning': return AlertCircle;
    default: return Info;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-emerald-600 bg-emerald-100';
    case 'warning': return 'text-amber-600 bg-amber-100';
    default: return 'text-primary bg-primary/10';
  }
};

export default function AdminNotifications() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} notificações não lidas` 
              : 'Todas as notificações foram lidas'
            }
          </p>
        </div>
        <Button variant="outline">
          Marcar todas como lidas
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const iconColors = getIconColor(notification.type);
            
            return (
              <div 
                key={notification.id}
                className={cn(
                  "p-4 flex items-start gap-4 transition-colors hover:bg-muted/50",
                  !notification.read && "bg-primary/5"
                )}
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", iconColors)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("font-medium", !notification.read && "text-foreground")}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {notification.time}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
