import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getServices, getProfessionals, api } from '@/lib/api';
import { Service, Professional } from '@/types';

type Step = 'service' | 'professional' | 'datetime' | 'confirm';

const steps: { id: Step; label: string }[] = [
  { id: 'service', label: 'Servico' },
  { id: 'professional', label: 'Profissional' },
  { id: 'datetime', label: 'Data/Hora' },
  { id: 'confirm', label: 'Confirmar' },
];

// Generate next 7 days
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

  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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

  // Get available time slots from establishment context
  const availableTimeSlots = timeSlots.filter(slot => slot.isActive).map(slot => slot.time);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);
  const availableProfessionals = professionals; // Showing all professionals for the tenant

  const canProceed = () => {
    switch (currentStep) {
      case 'service': return !!selectedService;
      case 'professional': return !!selectedProfessional;
      case 'datetime': return !!selectedDate && !!selectedTime;
      case 'confirm': return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 'confirm') {
      toast.success('Agendamento solicitado com sucesso!', {
        description: 'Voce recebera as instrucoes de pagamento em breve.'
      });
      navigate(`/s/${slug || 'exemplo'}/appointments`);
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {currentStepIndex > 0 && (
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold">Agendar Horario</h2>
          <p className="text-sm text-muted-foreground">
            Etapa {currentStepIndex + 1} de {steps.length}: {steps[currentStepIndex].label}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= currentStepIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {currentStep === 'service' && (
          <div className="space-y-3">
            {services.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                  selectedService === service.id && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => setSelectedService(service.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{service.name}</h4>
                        {selectedService === service.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      R$ {Number(service.price).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {currentStep === 'professional' && (
          <div className="grid gap-3">
            {availableProfessionals.map((pro) => (
              <Card
                key={pro.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                  selectedProfessional === pro.id && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => setSelectedProfessional(pro.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {pro.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{pro.name}</h4>
                      <p className="text-sm text-muted-foreground">{pro.role}</p>
                    </div>
                    {selectedProfessional === pro.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {currentStep === 'datetime' && (
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-3">
              <h4 className="font-medium">Selecione a data</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {nextDays.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex-shrink-0 w-16 py-3 rounded-lg border text-center transition-colors",
                      selectedDate?.toDateString() === date.toDateString()
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary"
                    )}
                  >
                    <p className="text-xs uppercase">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-bold">{date.getDate()}</p>
                    <p className="text-xs">
                      {date.toLocaleDateString('pt-BR', { month: 'short' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <h4 className="font-medium">Selecione o horario</h4>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-2.5 rounded-xl border text-sm font-medium transition-all",
                        selectedTime === time
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-card border-border hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {availableTimeSlots.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum horario disponivel
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 'confirm' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-lg">Resumo do Agendamento</h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedServiceData?.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedServiceData?.duration} min</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedProfessionalData?.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedProfessionalData?.role}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Data e Horario</p>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })} as {selectedTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {selectedServiceData?.price.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              Apos confirmar, voce recebera as instrucoes para pagamento via Pix.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <Button
        className="w-full"
        size="lg"
        disabled={!canProceed()}
        onClick={handleNext}
      >
        {currentStep === 'confirm' ? 'Confirmar Agendamento' : 'Continuar'}
        {currentStep !== 'confirm' && <ChevronRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
}
