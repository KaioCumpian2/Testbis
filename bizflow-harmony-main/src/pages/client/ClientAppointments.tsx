import { useState } from 'react';
import { Calendar, Clock, Upload, User, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { appointments, establishment } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Tab = 'upcoming' | 'history';

export default function ClientAppointments() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const upcomingStatuses = ['requested', 'awaiting_payment', 'awaiting_validation', 'confirmed'];
  const upcoming = appointments.filter(a => upcomingStatuses.includes(a.status));
  const history = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  const currentList = activeTab === 'upcoming' ? upcoming : history;

  const handleUploadReceipt = () => {
    toast.success('Comprovante enviado!', {
      description: 'Aguarde a validação do pagamento.'
    });
    setSelectedAppointment(null);
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(establishment.pixKey);
    toast.success('Chave Pix copiada!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Meus Agendamentos</h2>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === 'upcoming' 
              ? "bg-card text-foreground shadow-sm" 
              : "text-muted-foreground"
          )}
        >
          Próximos ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === 'history' 
              ? "bg-card text-foreground shadow-sm" 
              : "text-muted-foreground"
          )}
        >
          Histórico ({history.length})
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum agendamento {activeTab === 'upcoming' ? 'próximo' : 'no histórico'}
            </p>
          </div>
        ) : (
          currentList.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{apt.serviceName}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {apt.professionalName}
                    </p>
                  </div>
                  <StatusBadge status={apt.status as any} />
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(apt.date).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {apt.time}
                  </div>
                </div>

                {/* Status Timeline */}
                {activeTab === 'upcoming' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        ['requested', 'awaiting_payment', 'awaiting_validation', 'confirmed'].includes(apt.status)
                          ? "bg-primary" : "bg-muted"
                      )} />
                      <span className={apt.status === 'requested' ? 'font-medium' : 'text-muted-foreground'}>
                        Solicitado
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        ['awaiting_payment', 'awaiting_validation', 'confirmed'].includes(apt.status)
                          ? "bg-primary" : "bg-muted"
                      )} />
                      <span className={apt.status === 'awaiting_payment' ? 'font-medium' : 'text-muted-foreground'}>
                        Pagamento
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        ['awaiting_validation', 'confirmed'].includes(apt.status)
                          ? "bg-primary" : "bg-muted"
                      )} />
                      <span className={apt.status === 'awaiting_validation' ? 'font-medium' : 'text-muted-foreground'}>
                        Validação
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        apt.status === 'confirmed' ? "bg-primary" : "bg-muted"
                      )} />
                      <span className={apt.status === 'confirmed' ? 'font-medium' : 'text-muted-foreground'}>
                        Confirmado
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions based on status */}
                {apt.status === 'awaiting_payment' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="default">
                        Pagar via Pix
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pagamento via Pix</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          <p className="text-sm text-muted-foreground">Chave Pix</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm font-mono bg-card p-2 rounded">
                              {establishment.pixKey}
                            </code>
                            <Button size="sm" variant="outline" onClick={copyPixKey}>
                              Copiar
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-primary/10 rounded-lg">
                          <p className="text-sm font-medium text-primary">
                            Valor: R$ {apt.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Enviar comprovante</Label>
                          <Input type="file" accept="image/*,.pdf" />
                        </div>
                        <Button className="w-full" onClick={handleUploadReceipt}>
                          <Upload className="w-4 h-4 mr-2" />
                          Enviar Comprovante
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {apt.status === 'awaiting_validation' && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Aguardando validação do pagamento
                    </p>
                  </div>
                )}

                {apt.status === 'completed' && (
                  <Button variant="outline" className="w-full">
                    Avaliar Atendimento
                  </Button>
                )}

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Valor</span>
                  <span className="font-semibold text-primary">R$ {apt.price.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
