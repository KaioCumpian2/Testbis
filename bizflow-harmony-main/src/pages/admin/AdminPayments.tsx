import { useState } from 'react';
import { Check, X, Eye, FileImage, AlertCircle, Loader2, DollarSign, Clock, ShieldCheck, Sparkles, User, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminAppointments, approvePayment, rejectPayment } from '@/lib/api';

type Tab = 'pending' | 'approved' | 'rejected';

const STATUS_MAP = {
  pending: 'PENDING_APPROVAL',
  approved: 'PAID',
  rejected: 'REJECTED'
};

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedApt, setSelectedApt] = useState<string | null>(null);

  // Fetch Data for current tab
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['admin-payments', activeTab],
    queryFn: () => getAdminAppointments({ paymentStatus: STATUS_MAP[activeTab] }),
    refetchInterval: 30000
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: approvePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success('Pagamento aprovado com sucesso!');
    },
    onError: () => toast.error('Erro ao aprovar pagamento')
  });

  const rejectMutation = useMutation({
    mutationFn: rejectPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success('Pagamento rejeitado');
      setRejectReason('');
      setSelectedApt(null);
    },
    onError: () => toast.error('Erro ao rejeitar pagamento')
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    if (!rejectReason) {
      toast.error('Informe o motivo da rejeição');
      return;
    }
    rejectMutation.mutate(id);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter bg-premium-gradient bg-clip-text text-transparent">
            Central de Recebíveis
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Validação financeira e fluxo de caixa
          </p>
        </div>

        <div className="flex items-center gap-2 bg-primary/5 p-1.5 rounded-2xl glass border border-primary/10">
          <div className="flex items-center gap-2 px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Ambiente Seguro</span>
          </div>
        </div>
      </div>

      {/* Tabs / Dashboard Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['pending', 'approved', 'rejected'] as Tab[]).map((tab) => (
          <Card
            key={tab}
            className={cn(
              "glass transition-all duration-500 cursor-pointer overflow-hidden group",
              activeTab === tab
                ? "ring-2 ring-primary bg-primary/[0.03] shadow-2xl shadow-primary/10 scale-[1.02]"
                : "border-primary/5 hover:border-primary/20 hover:bg-white/50"
            )}
            onClick={() => setActiveTab(tab)}
          >
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {tab === 'pending' && <Clock className="w-12 h-12" />}
                {tab === 'approved' && <Check className="w-12 h-12" />}
                {tab === 'rejected' && <X className="w-12 h-12" />}
              </div>

              <p className={cn(
                "text-4xl font-black italic tracking-tighter mb-1",
                tab === 'pending' ? "text-amber-500" : tab === 'approved' ? "text-emerald-500" : "text-destructive"
              )}>
                {activeTab === tab ? appointments.length : (isLoading ? "..." : "0")}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {tab === 'pending' ? 'Buscando Validação' : tab === 'approved' ? 'Liquidados' : 'Recusados'}
                </p>
                {activeTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 ml-2">
          <div className="h-8 w-1.5 bg-premium-gradient rounded-full" />
          <h2 className="text-xl font-black italic tracking-tight uppercase tracking-widest opacity-80">
            {activeTab === 'pending' ? 'Fila de Auditoria' : activeTab === 'approved' ? 'Histórico de Sucesso' : 'Registros de Conflito'}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary/5 border-t-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Consultando Transações...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card className="glass border-primary/10 border-dashed p-24 text-center rounded-[3rem] animate-scale-in">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-black italic tracking-tight mb-2">Tudo em Dia</h3>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest max-w-xs mx-auto opacity-60">
              {activeTab === 'pending' ? 'Nenhuma pendência financeira aguardando sua análise.' : 'Nenhum registro encontrado nesta categoria.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((apt: any, idx: number) => (
              <Card key={apt.id} className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] group overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-premium-gradient flex items-center justify-center shadow-xl group-hover:rotate-3 transition-transform relative">
                        <User className="w-8 h-8 text-white/50" />
                        <div className="absolute -top-2 -right-2 scale-75 lg:scale-90">
                          <StatusBadge status={apt.paymentStatus.toLowerCase().replace('_', '-') as any} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black italic tracking-tight group-hover:text-primary transition-colors">
                            {apt.user?.name || apt.guestName || 'Cliente Autônomo'}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <Scissors className="w-3 h-3" />
                            {apt.service?.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {new Date(apt.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <p className="text-[9px] font-black text-primary/30 uppercase tracking-tighter mt-1 italic">{apt.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 pt-6 lg:pt-0">
                      <div className="text-right">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-0.5 block">Total Bruto</span>
                        <div className="flex items-center text-3xl font-black text-primary italic tracking-tighter">
                          <span className="text-xs mr-1 mt-1 font-bold">R$</span>
                          {parseFloat(apt.service?.price || 0).toFixed(2).replace('.', ',')}
                        </div>
                        {apt.paymentProof && (
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                            Anexado em {new Date(apt.paymentProof.uploadedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {apt.paymentProof && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" className="w-14 h-14 rounded-2xl bg-white/50 hover:bg-white border border-primary/5 hover:border-primary/20 shadow-lg transition-all">
                                <Eye className="w-5 h-5 text-primary" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass border-primary/10 rounded-[2.5rem] p-0 overflow-hidden max-w-[600px] animate-scale-in">
                              <div className="bg-premium-gradient p-8 text-white">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <FileImage className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <DialogTitle className="text-2xl font-black italic tracking-tight">Comprovante Digital</DialogTitle>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Auditoria financeira</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-8 space-y-6">
                                <div className="aspect-[16/10] bg-black/5 rounded-3xl overflow-hidden flex items-center justify-center border border-primary/5 group/img shadow-inner">
                                  {apt.paymentProof.url ? (
                                    <img src={apt.paymentProof.url} alt="Comprovante" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-[2000ms]" />
                                  ) : (
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                      <FileImage className="w-16 h-16 text-primary" />
                                      <p className="text-[10px] font-black uppercase tracking-widest">Visualização indisponível</p>
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 p-6 glass bg-primary/5 rounded-2xl border-primary/5">
                                  <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Transação No</p>
                                    <p className="text-xs font-black italic truncate">{apt.id}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Valor Verificado</p>
                                    <p className="text-xs font-black italic text-primary">R$ {parseFloat(apt.service?.price || 0).toFixed(2).replace('.', ',')}</p>
                                  </div>
                                </div>
                                <Button className="w-full h-14 bg-premium-gradient rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => window.open(apt.paymentProof.url, '_blank')}>
                                  Abrir em Nova Aba
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {activeTab === 'pending' && (
                          <>
                            <Button
                              className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white transition-all active:scale-90"
                              disabled={approveMutation.isPending}
                              onClick={() => handleApprove(apt.id)}
                            >
                              {approveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-6 h-6" />}
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="w-14 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 text-white transition-all active:scale-90">
                                  <X className="w-6 h-6" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="glass border-destructive/10 rounded-[2.5rem] p-0 overflow-hidden max-w-[450px] animate-scale-in">
                                <div className="bg-destructive p-8 text-white">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                      <AlertCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <DialogTitle className="text-2xl font-black italic tracking-tight">Rejeitar Recibo</DialogTitle>
                                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Operação irreversível</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-8 space-y-6">
                                  <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Motivo da Recusa *</Label>
                                    <Textarea
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      placeholder="Ex: Comprovante com valor divergente ou data expirada..."
                                      className="glass border-destructive/10 rounded-xl focus:border-destructive/30 transition-all min-h-[120px] resize-none"
                                    />
                                  </div>
                                  <Button
                                    variant="destructive"
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-destructive/20"
                                    disabled={rejectMutation.isPending}
                                    onClick={() => handleReject(apt.id)}
                                  >
                                    {rejectMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : null}
                                    Confirmar Rejeição
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
