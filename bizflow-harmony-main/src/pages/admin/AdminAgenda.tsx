import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Clock, User, Briefcase, Check, X, Scissors, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointmentsByDate, getAdminProfessionals, getAdminServices, updateAppointmentStatus } from '@/lib/api';

type ViewMode = 'day' | 'week';

export default function AdminAgenda() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterProfessional, setFilterProfessional] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Fetch Data
  const { data: professionals = [] } = useQuery({
    queryKey: ['admin-professionals'],
    queryFn: getAdminProfessionals
  });

  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: getAdminServices
  });

  const isoDate = selectedDate.toISOString().split('T')[0];
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', isoDate],
    queryFn: () => getAppointmentsByDate(isoDate),
    refetchInterval: 30000
  });

  // Mutation for status update
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status atualizado com sucesso');
      setSelectedAppointment(null);
    },
    onError: () => toast.error('Erro ao atualizar status')
  });

  const filteredAppointments = appointments.filter((apt: any) => {
    const matchPro = filterProfessional === 'all' || apt.professionalId === filterProfessional;
    const matchService = filterService === 'all' || apt.serviceId === filterService;
    return matchPro && matchService;
  });

  const timeSlots = Array.from({ length: 22 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${min}`;
  });

  const navigateDate = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const handleStatusChange = (aptId: string, newStatus: string) => {
    statusMutation.mutate({ id: aptId, status: newStatus.toUpperCase() });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter bg-premium-gradient bg-clip-text text-transparent drop-shadow-sm">
            Gestão de Agenda
          </h1>
          <p className="text-white font-black uppercase tracking-[0.2em] text-[10px] mt-1 opacity-90">
            Controle de fluxo e disponibilidade
          </p>
        </div>

        <div className="flex bg-secondary/20 p-1.5 rounded-2xl glass border border-secondary/30">
          {[
            { id: 'day', label: 'Visão Diária' },
            { id: 'week', label: 'Visão Semanal' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className={cn(
                "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-sm",
                viewMode === mode.id
                  ? "bg-white text-primary shadow-xl shadow-black/20 scale-[1.02] border border-primary/10"
                  : "text-white/60 hover:text-white"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-2 rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDate(-1)}
            className="w-12 h-12 rounded-2xl hover:bg-primary/5 text-primary transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="px-8 py-3 bg-premium-gradient rounded-[1.5rem] shadow-lg shadow-primary/30 min-w-[240px] text-center border border-white/10">
            <span className="text-xs font-black text-white uppercase tracking-tighter italic text-shadow-sm">
              {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDate(1)}
            className="w-12 h-12 rounded-2xl hover:bg-primary/5 text-primary transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          <Select value={filterProfessional} onValueChange={setFilterProfessional}>
            <SelectTrigger className="glass-dark h-12 rounded-xl border-white/10 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest min-w-[180px] text-white">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <SelectValue placeholder="Profissional" />
              </div>
            </SelectTrigger>
            <SelectContent className="glass border-primary/10 rounded-xl overflow-hidden">
              <SelectItem value="all" className="font-bold text-xs py-3">Todos Profissionais</SelectItem>
              {professionals.map((pro: any) => (
                <SelectItem key={pro.id} value={pro.id} className="font-bold text-xs py-3">{pro.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="glass-dark h-12 rounded-xl border-white/10 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest min-w-[180px] text-white">
              <div className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-primary" />
                <SelectValue placeholder="Serviço" />
              </div>
            </SelectTrigger>
            <SelectContent className="glass border-primary/10 rounded-xl overflow-hidden">
              <SelectItem value="all" className="font-bold text-xs py-3">Todos Serviços</SelectItem>
              {services.map((srv: any) => (
                <SelectItem key={srv.id} value={srv.id} className="font-bold text-xs py-3">{srv.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-12 w-12 rounded-xl glass border-primary/5 text-primary/50 flex items-center justify-center p-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Agenda Grid */}
      <Card className="glass border-primary/5 rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary/5 border-t-primary animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Sincronizando Agenda...</p>
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {timeSlots.map((time) => {
                const aptAtTime = filteredAppointments.find((a: any) => {
                  const dateObj = new Date(a.date);
                  const aptTimeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                  return aptTimeStr === time;
                });

                return (
                  <div key={time} className="group/slot flex min-h-[90px] transition-colors hover:bg-primary/[0.02]">
                    <div className="w-24 p-6 border-r border-white/5 flex flex-col items-center justify-center bg-white/[0.02]">
                      <span className="text-sm font-black italic tracking-tight text-white/40 group-hover/slot:text-primary transition-colors text-shadow-sm">
                        {time}
                      </span>
                    </div>

                    <div className="flex-1 p-3 flex items-center relative">
                      {aptAtTime && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="w-full text-left p-5 rounded-[1.5rem] glass bg-white/40 border border-primary/10 hover:border-primary/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group/card"
                              onClick={() => setSelectedAppointment(aptAtTime)}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center shadow-lg group-hover/card:rotate-6 transition-transform">
                                    <span className="text-white font-black italic text-sm">{aptAtTime.userId ? 'C' : 'G'}</span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-black text-sm italic tracking-tight">
                                        {aptAtTime.user?.name || (aptAtTime.guestName ? aptAtTime.guestName : 'Cliente VIP')}
                                      </p>
                                      <span className="text-[9px] font-black py-0.5 px-2 rounded-full bg-primary/10 text-primary uppercase italic">Premium</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                      {aptAtTime.service?.name} • {aptAtTime.professional?.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="hidden sm:flex flex-col items-end mr-4">
                                    <span className="text-[9px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">Valor</span>
                                    <span className="text-sm font-black text-primary italic">R$ {parseFloat(aptAtTime.service?.price || 0).toFixed(2).replace('.', ',')}</span>
                                  </div>
                                  <div className="scale-90 origin-right">
                                    <StatusBadge status={aptAtTime.status.toLowerCase() as any} />
                                  </div>
                                </div>
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="glass border-primary/10 rounded-[2.5rem] p-0 overflow-hidden max-w-[500px] animate-scale-in">
                            <div className="bg-premium-gradient p-8 text-white relative">
                              <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/10" />
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                  <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <DialogTitle className="text-2xl font-black italic tracking-tight">Ficha de Atendimento</DialogTitle>
                                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Controle operacional</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-8 space-y-8">
                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Cliente</Label>
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-primary/50" />
                                    <p className="font-black text-sm italic">{aptAtTime.user?.name || aptAtTime.guestName || 'Cliente Autônomo'}</p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Status Fluxo</Label>
                                  <div className="block"><StatusBadge status={aptAtTime.status.toLowerCase() as any} /></div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Serviço & Preço</Label>
                                  <p className="font-black text-sm italic">{aptAtTime.service?.name}</p>
                                  <p className="text-primary font-bold text-xs">R$ {parseFloat(aptAtTime.service?.price || 0).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Responsável</Label>
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5 text-primary/50" />
                                    <p className="font-black text-sm italic">{aptAtTime.professional?.name}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-6 border-t border-primary/5">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Ações Rápidas</Label>
                                <div className="grid grid-cols-3 gap-3">
                                  <Button
                                    className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white gap-2 transition-all active:scale-95"
                                    disabled={statusMutation.isPending}
                                    onClick={() => handleStatusChange(aptAtTime.id, 'confirmed')}
                                  >
                                    <Check className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Confirmar</span>
                                  </Button>
                                  <Button
                                    className="h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-white gap-2 transition-all active:scale-95"
                                    disabled={statusMutation.isPending}
                                    onClick={() => handleStatusChange(aptAtTime.id, 'completed')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Concluir</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="h-14 rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive/10 gap-2 transition-all active:scale-95 border border-destructive/10"
                                    disabled={statusMutation.isPending}
                                    onClick={() => handleStatusChange(aptAtTime.id, 'cancelled')}
                                  >
                                    <X className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Cancelar</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {!aptAtTime && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 rounded-full bg-primary/5 text-primary font-black uppercase tracking-[0.2em] text-[8px] border border-primary/10">
                            Disponível
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
