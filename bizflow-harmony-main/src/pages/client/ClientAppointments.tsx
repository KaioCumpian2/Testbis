import { useState, useEffect } from 'react';
import { Calendar, Clock, Upload, User, Check, AlertCircle, Loader2, Phone, Search, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPublicAppointmentsByPhone, api } from '@/lib/api';

type Tab = 'upcoming' | 'history';

export default function ClientAppointments() {
  const queryClient = useQueryClient();
  const { pixKey, tenantId, isLoading: isEstablishmentLoading } = useEstablishment();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  // Client Identification State
  const [clientPhone, setClientPhone] = useState(localStorage.getItem('clientPhone') || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [isIdentified, setIsIdentified] = useState(!!localStorage.getItem('clientPhone'));

  // Query only runs if we have a phone and tenantId
  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['my-appointments', clientPhone],
    queryFn: () => getPublicAppointmentsByPhone(tenantId!, clientPhone),
    enabled: !!tenantId && !!clientPhone && clientPhone.length > 8,
    retry: false
  });

  const handleIdentify = () => {
    if (phoneInput.length < 8) {
      toast.error('Informe um telefone válido');
      return;
    }
    setClientPhone(phoneInput);
    localStorage.setItem('clientPhone', phoneInput);
    setIsIdentified(true);
    // The query will auto-run due to dependency
  };

  const handleLogout = () => {
    setClientPhone('');
    localStorage.removeItem('clientPhone');
    setIsIdentified(false);
    setPhoneInput('');
  };

  const handleUploadReceipt = async (appointmentId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Public endpoint for upload? Or use the ID directly allowed?
      // Assuming public upload allowed if you know ID.
      await api.post(`/public/appointments/${appointmentId}/payment-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success('Comprovante enviado!', {
        description: 'Aguarde a validação do pagamento.'
      });
    } catch (error) {
      toast.error('Erro ao enviar comprovante');
    }
  };

  const copyPixKey = () => {
    if (!pixKey) {
      toast.error('Chave Pix não configurada pelo estabelecimento.');
      return;
    }
    navigator.clipboard.writeText(pixKey);
    toast.success('Chave Pix copiada!');
  };

  // Sorting
  const sortedAppointments = Array.isArray(appointments) ? [...appointments].sort((a: any, b: any) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ) : [];

  const upcoming = sortedAppointments.filter((a: any) =>
    ['REQUESTED', 'CONFIRMED'].includes(a.status) ||
    (a.paymentStatus === 'PENDING_APPROVAL' || a.paymentStatus === 'PENDING')
  );

  const history = sortedAppointments.filter((a: any) =>
    ['COMPLETED', 'CANCELLED'].includes(a.status) &&
    !upcoming.some((u: any) => u.id === a.id)
  );

  const currentList = activeTab === 'upcoming' ? upcoming : history;

  if (isEstablishmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not Identified State
  if (!isIdentified) {
    return (
      <div className="max-w-md mx-auto space-y-8 pt-12 animate-slide-up px-4">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Suas Reservas</h2>
          <p className="text-muted-foreground font-medium">
            Informe seu telefone para acessar o histórico de agendamentos.
          </p>
        </div>

        <Card className="glass border-primary/10 shadow-2xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Telefone WhatsApp</Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                <Input
                  placeholder="(11) 99999-9999"
                  className="pl-11 h-12 glass border-primary/10 focus:border-primary/50 text-base rounded-xl transition-all"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="w-full h-12 text-base font-black uppercase tracking-widest bg-premium-gradient shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={handleIdentify}
            >
              <Search className="w-5 h-5 mr-2" />
              Ver Meus Horários
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-[10px] uppercase font-bold text-muted-foreground tracking-[0.3em] opacity-40">
          Booking Seguro — BizFlow Harmony
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pb-12 px-4 md:px-0 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight bg-premium-gradient bg-clip-text text-transparent italic">Minha Agenda</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Olá! {clientPhone}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
        >
          Trocar Conta
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-primary/5 rounded-[1.25rem] border border-primary/5 glass">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
            activeTab === 'upcoming'
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100"
              : "text-muted-foreground hover:bg-primary/5 translate-y-0"
          )}
        >
          Próximos ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
            activeTab === 'history'
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100"
              : "text-muted-foreground hover:bg-primary/5"
          )}
        >
          Histórico ({history.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.length === 0 ? (
            <div className="text-center py-20 glass rounded-[2rem] border-2 border-dashed border-primary/10 animate-scale-in">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-primary opacity-20" />
              </div>
              <p className="text-foreground font-black uppercase tracking-widest">
                Nenhuma reserva {activeTab === 'upcoming' ? 'ativa' : 'antiga'}
              </p>
              {activeTab === 'upcoming' && (
                <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto opacity-70">Sua agenda está vazia. Que tal agendar algo agora?</p>
              )}
            </div>
          ) : (
            currentList.map((apt: any, idx: number) => (
              <Card
                key={apt.id}
                className="overflow-hidden glass border-primary/5 shadow-sm hover:shadow-2xl transition-all duration-500 animate-slide-up group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className={cn(
                    "h-1.5 w-full",
                    apt.status === 'CONFIRMED' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                      apt.status === 'CANCELLED' ? "bg-red-500" :
                        "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  )} />

                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-black text-xl tracking-tight group-hover:text-primary transition-colors">{apt.service?.name || 'Serviço'}</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {apt.professional?.name || 'Profissional'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        status={
                          apt.paymentStatus === 'PENDING_APPROVAL' ? 'awaiting_validation' :
                            (apt.paymentStatus === 'PENDING' && apt.status === 'REQUESTED') ? 'awaiting_payment' :
                              apt.status.toLowerCase() as any
                        }
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/5 glass transition-all group-hover:translate-x-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-tighter italic">
                          {new Date(apt.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-primary/10" />
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-lg font-black tracking-tighter">
                          {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-2">
                      {apt.paymentStatus === 'PENDING' && apt.status !== 'CANCELLED' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 text-white transition-all hover:scale-[1.02]">
                              Finalizar com PIX
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass border-primary/10 rounded-[2rem] gap-0 overflow-hidden max-w-[400px]">
                            <div className="bg-emerald-500 p-8 text-white text-center">
                              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <DollarSign className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="text-2xl font-black italic tracking-tight">Pagamento PIX</h3>
                              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Total: R$ {Number(apt.service?.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>

                            <div className="p-8 space-y-8">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Copie a Chave</Label>
                                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-2xl border border-primary/5 glass group/copy">
                                  <code className="flex-1 text-xs font-mono font-bold break-all opacity-70 group-hover/copy:opacity-100 transition-opacity">
                                    {pixKey || 'Chave não cadastrada'}
                                  </code>
                                  <Button size="sm" variant="outline" onClick={copyPixKey} className="h-9 w-9 rounded-xl p-0 glass hover:bg-primary hover:text-white transition-all">
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Enviar Comprovante</Label>
                                <div className="border-2 border-dashed border-primary/10 rounded-2xl p-8 text-center hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all cursor-pointer relative group/upload">
                                  <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadReceipt(apt.id, file);
                                    }}
                                  />
                                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-transform">
                                    <Upload className="w-5 h-5 text-muted-foreground group-hover/upload:text-emerald-500" />
                                  </div>
                                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Selecionar Imagem</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {apt.paymentStatus === 'PENDING_APPROVAL' && (
                        <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                          </div>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Validando seu Comprovante...</p>
                        </div>
                      )}

                      {/* Price Row */}
                      <div className="flex items-center justify-between pt-4 border-t border-primary/5 mt-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 italic">Valor do Serviço</span>
                        <span className="font-black text-xl text-primary tracking-tighter italic">
                          R$ {Number(apt.service?.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
