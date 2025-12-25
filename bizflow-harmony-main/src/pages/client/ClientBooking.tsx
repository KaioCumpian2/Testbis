import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Clock, User, Phone, BadgeCheck, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getServices, getProfessionals, createPublicAppointment } from '@/lib/api';
import { Service, Professional } from '@/types';

type Step = 'service' | 'professional' | 'datetime' | 'identification' | 'confirm';

const steps: { id: Step; label: string }[] = [
  { id: 'service', label: 'Serviço' },
  { id: 'professional', label: 'Profissional' },
  { id: 'datetime', label: 'Data' },
  { id: 'identification', label: 'Dados' },
  { id: 'confirm', label: 'Fim' },
];

const getNextDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
};

export default function ClientBooking() {
  const navigate = useNavigate();
  const { timeSlots, slug, tenantId, isLoading: isEstablishmentLoading } = useEstablishment();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientData, setClientData] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (tenantId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [servicesData, professionalsData] = await Promise.all([
            getServices(tenantId),
            getProfessionals(tenantId)
          ]);
          setServices(servicesData);
          setProfessionals(professionalsData || []);
        } catch (error) {
          console.error('Error fetching booking data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [tenantId]);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const nextDays = getNextDays();
  const availableTimeSlots = timeSlots.filter(slot => slot.isActive).map(slot => slot.time);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);
  const availableProfessionals = professionals; // Can filter based on service if needed

  const canProceed = () => {
    switch (currentStep) {
      case 'service': return !!selectedService;
      case 'professional': return !!selectedProfessional;
      case 'datetime': return !!selectedDate && !!selectedTime;
      case 'identification': return clientData.name.length > 2 && clientData.phone.length > 8;
      case 'confirm': return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === 'confirm') {
      setIsSubmitting(true);
      try {
        if (!selectedDate || !selectedTime) throw new Error("Data inválida");

        // Construct Date object
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(hours, minutes, 0, 0);

        await createPublicAppointment({
          tenantId,
          serviceId: selectedService,
          professionalId: selectedProfessional,
          date: selectedDate.toISOString().split('T')[0], // Send just the date part
          time: selectedTime, // Send the time string separately
          clientName: clientData.name,
          clientPhone: clientData.phone
        });

        toast.success('Agendamento solicitado!', {
          description: 'Aguarde a confirmação do estabelecimento.'
        });
        navigate(`/s/${slug || 'exemplo'}/appointments`);
      } catch (error: any) {
        toast.error('Erro ao agendar', {
          description: error.response?.data?.error || 'Tente novamente.'
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  if (isEstablishmentLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex items-center gap-4">
          {currentStepIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={isSubmitting}
              className="rounded-xl hover:bg-primary/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-black tracking-tight bg-premium-gradient bg-clip-text text-transparent">Agendar Horário</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {steps[currentStepIndex].label} — {currentStepIndex + 1} de {steps.length}
            </p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-3">
          {steps.map((step, i) => (
            <div key={step.id} className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "h-2 flex-1 rounded-full transition-all duration-500",
                  i < currentStepIndex ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" :
                    i === currentStepIndex ? "bg-primary w-full shadow-[0_4px_12px_rgba(var(--primary),0.4)]" : "bg-muted"
                )}
              />
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                  i < currentStepIndex ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {currentStep === 'service' && (
          <div className="grid gap-4 animate-slide-up">
            {services.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  "cursor-pointer glass-dark transition-all duration-500 border-white/5 hover:border-white/20 group hover:shadow-2xl overflow-hidden relative",
                  selectedService === service.id && "ring-2 ring-primary bg-primary/20 border-primary shadow-xl"
                )}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full transition-transform group-hover:scale-110" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors text-shadow-sm">{service.name}</h4>
                        {selectedService === service.id && (
                          <div className="bg-primary rounded-full p-1 animate-scale-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white/70 font-medium line-clamped-2 pr-4">{service.description}</p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-widest opacity-80">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {service.duration} MIN
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-widest opacity-80">
                          <Check className="w-3.5 h-3.5 text-primary" />
                          DISPONÍVEL
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-primary italic text-shadow-sm">
                        R$ {Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {currentStep === 'professional' && (
          <div className="grid sm:grid-cols-2 gap-4 animate-slide-up">
            {availableProfessionals.map((pro) => (
              <Card
                key={pro.id}
                className={cn(
                  "cursor-pointer glass transition-all duration-500 border-primary/5 hover:border-primary/20 hover:shadow-2xl group text-center",
                  selectedProfessional === pro.id && "ring-2 ring-primary bg-primary/5 border-primary shadow-xl"
                )}
                onClick={() => setSelectedProfessional(pro.id)}
              >
                <CardContent className="p-8">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className={cn(
                      "w-full h-full rounded-2xl flex items-center justify-center transition-all duration-500 rotate-3 group-hover:rotate-0",
                      selectedProfessional === pro.id ? "bg-primary shadow-lg" : "bg-primary/10"
                    )}>
                      <span className={cn(
                        "text-3xl font-black",
                        selectedProfessional === pro.id ? "text-white" : "text-primary"
                      )}>
                        {pro.name.charAt(0)}
                      </span>
                    </div>
                    {selectedProfessional === pro.id && (
                      <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1.5 border-4 border-background animate-scale-in">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{pro.name}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">{pro.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {currentStep === 'datetime' && (
          <div className="space-y-8 animate-slide-up">
            {/* Date Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Escolha o dia</h4>
                <Calendar className="w-4 h-4 text-primary opacity-50" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar">
                {nextDays.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex-shrink-0 w-[5rem] py-4 rounded-3xl border glass transition-all duration-500 text-center shadow-sm",
                      selectedDate?.toDateString() === date.toDateString()
                        ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/30 scale-105 z-10"
                        : "bg-white border-primary/5 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <p className={cn(
                      "text-[10px] uppercase font-black mb-1",
                      selectedDate?.toDateString() === date.toDateString() ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </p>
                    <p className="text-2xl font-black">{date.getDate()}</p>
                    <p className="text-[10px] opacity-70 mt-1 uppercase font-bold">
                      {date.toLocaleDateString('pt-BR', { month: 'short' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Escolha o horário</h4>
                  <Clock className="w-4 h-4 text-primary opacity-50" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-3 rounded-2xl glass border transition-all duration-500 font-bold text-sm",
                        selectedTime === time
                          ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105"
                          : "bg-white border-primary/5 hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {availableTimeSlots.length === 0 && (
                  <div className="text-center text-muted-foreground py-12 glass rounded-3xl border-2 border-dashed border-primary/10">
                    <Clock className="w-10 h-10 mx-auto mb-3 text-primary opacity-20" />
                    <p className="font-medium">Sem horários para hoje.</p>
                    <p className="text-xs">Tente selecionar outro dia.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 'identification' && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Seu Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Ex: João da Silva"
                      className="pl-9"
                      value={clientData.name}
                      onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Seu Telefone (WhatsApp)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      className="pl-9"
                      value={clientData.phone}
                      onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'confirm' && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black">Tudo revisado?</h3>
              <p className="text-sm text-muted-foreground">Confira os detalhes para finalizar sua reserva.</p>
            </div>

            <Card className="glass border-primary/20 bg-primary/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-5 rounded-bl-[100px]" />
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="flex items-center gap-5 pb-6 border-b border-primary/10">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-black">{clientData.name}</p>
                    <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase opacity-70">{clientData.phone}</p>
                  </div>
                </div>

                <div className="space-y-4 py-2 text-sm">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Serviço</span>
                    <span className="font-bold text-base">{selectedServiceData?.name}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Profissional</span>
                    <span className="font-bold">{selectedProfessionalData?.name}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Data e Horário</span>
                    <span className="font-bold">
                      {selectedDate?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} — {selectedTime}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-primary/20 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pagamento Total</p>
                    <p className="text-3xl font-black text-primary tracking-tighter">
                      R$ {Number(selectedServiceData?.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <BadgeCheck className="w-10 h-10 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4">
        <Button
          className={cn(
            "w-full h-14 text-lg font-black uppercase tracking-widest shadow-2xl transition-all duration-500",
            canProceed() ? "bg-premium-gradient shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] opacity-100" : "opacity-30 grayscale"
          )}
          size="lg"
          disabled={!canProceed() || isSubmitting}
          onClick={handleNext}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              PROCESSANDO...
            </div>
          ) : currentStep === 'confirm' ? (
            'CONFIRMAR AGORA'
          ) : (
            <div className="flex items-center gap-3">
              PRÓXIMO PASSO
              <ChevronRight className="w-6 h-6" />
            </div>
          )}
        </Button>
        <p className="text-center text-[10px] uppercase font-bold text-muted-foreground tracking-[0.3em] mt-6 opacity-50">
          Booking Seguro via BizFlow Harmony
        </p>
      </div>
    </div>
  );
}
