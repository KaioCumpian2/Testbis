import { useState } from 'react';
import { Check, X, Eye, FileImage, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { appointments } from '@/data/mockData';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Tab = 'pending' | 'approved' | 'rejected';

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedApt, setSelectedApt] = useState<string | null>(null);

  const pendingPayments = appointments.filter(a => a.status === 'awaiting_validation');
  const approvedPayments = appointments.filter(a => a.status === 'confirmed' && a.paymentReceipt);
  const completedPayments = appointments.filter(a => a.status === 'completed');

  const handleApprove = (id: string) => {
    toast.success('Pagamento aprovado!', {
      description: 'O cliente foi notificado.'
    });
  };

  const handleReject = (id: string) => {
    if (!rejectReason) {
      toast.error('Informe o motivo da rejeição');
      return;
    }
    toast.success('Pagamento rejeitado', {
      description: 'O cliente foi notificado para reenviar o comprovante.'
    });
    setRejectReason('');
    setSelectedApt(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-muted-foreground">Aprove ou rejeite comprovantes de pagamento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn(activeTab === 'pending' && "ring-2 ring-primary")}>
          <CardContent className="p-4 cursor-pointer" onClick={() => setActiveTab('pending')}>
            <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className={cn(activeTab === 'approved' && "ring-2 ring-primary")}>
          <CardContent className="p-4 cursor-pointer" onClick={() => setActiveTab('approved')}>
            <p className="text-2xl font-bold text-emerald-600">{approvedPayments.length + completedPayments.length}</p>
            <p className="text-sm text-muted-foreground">Aprovados</p>
          </CardContent>
        </Card>
        <Card className={cn(activeTab === 'rejected' && "ring-2 ring-primary")}>
          <CardContent className="p-4 cursor-pointer" onClick={() => setActiveTab('rejected')}>
            <p className="text-2xl font-bold text-destructive">0</p>
            <p className="text-sm text-muted-foreground">Rejeitados</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments List */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Aguardando Validação</h2>
          {pendingPayments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum pagamento pendente</p>
              </CardContent>
            </Card>
          ) : (
            pendingPayments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{apt.clientName}</h3>
                        <StatusBadge status="awaiting_validation" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {apt.serviceName} • {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                      </p>
                      <p className="text-sm text-muted-foreground">{apt.clientPhone}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">R$ {apt.price.toFixed(2)}</p>
                        {apt.paymentDate && (
                          <p className="text-xs text-muted-foreground">
                            Enviado em {new Date(apt.paymentDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Comprovante de Pagamento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                                <FileImage className="w-12 h-12 text-muted-foreground" />
                              </div>
                              <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm"><strong>Cliente:</strong> {apt.clientName}</p>
                                <p className="text-sm"><strong>Serviço:</strong> {apt.serviceName}</p>
                                <p className="text-sm"><strong>Valor:</strong> R$ {apt.price.toFixed(2)}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="icon" 
                          variant="default"
                          onClick={() => handleApprove(apt.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="destructive">
                              <X className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Pagamento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-destructive/10 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                <p className="text-sm">
                                  O cliente será notificado e poderá reenviar um novo comprovante.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label>Motivo da rejeição *</Label>
                                <Textarea
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder="Ex: Comprovante ilegível, valor incorreto..."
                                />
                              </div>
                              <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => handleReject(apt.id)}
                              >
                                Confirmar Rejeição
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Approved Payments */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pagamentos Aprovados</h2>
          {[...approvedPayments, ...completedPayments].map((apt) => (
            <Card key={apt.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{apt.clientName}</h3>
                    <p className="text-sm text-muted-foreground">{apt.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">R$ {apt.price.toFixed(2)}</p>
                    <StatusBadge status={apt.status as any} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejected */}
      {activeTab === 'rejected' && (
        <div className="text-center py-12">
          <X className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum pagamento rejeitado</p>
        </div>
      )}
    </div>
  );
}
