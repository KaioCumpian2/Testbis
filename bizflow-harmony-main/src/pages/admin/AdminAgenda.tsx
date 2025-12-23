import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { appointments, professionals, services } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type ViewMode = 'day' | 'week';

export default function AdminAgenda() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 0, 15));
  const [filterProfessional, setFilterProfessional] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<typeof appointments[0] | null>(null);

  const filteredAppointments = appointments.filter(apt => {
    const matchDate = apt.date === selectedDate.toISOString().split('T')[0];
    const matchPro = filterProfessional === 'all' || apt.professionalId === filterProfessional;
    const matchService = filterService === 'all' || apt.serviceId === filterService;
    return matchDate && matchPro && matchService;
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
    toast.success(`Status atualizado para "${newStatus}"`);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setViewMode('day')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              viewMode === 'day' ? "bg-card shadow-sm" : "text-muted-foreground"
            )}
          >
            Dia
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              viewMode === 'week' ? "bg-card shadow-sm" : "text-muted-foreground"
            )}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Date Navigation & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-card border rounded-lg min-w-[200px] text-center">
            <p className="font-medium">
              {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-1 sm:justify-end">
          <Select value={filterProfessional} onValueChange={setFilterProfessional}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos profissionais</SelectItem>
              {professionals.map(pro => (
                <SelectItem key={pro.id} value={pro.id}>{pro.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos serviços</SelectItem>
              {services.map(srv => (
                <SelectItem key={srv.id} value={srv.id}>{srv.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Day View */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {timeSlots.map((time) => {
              const aptAtTime = filteredAppointments.find(a => a.time === time);
              
              return (
                <div key={time} className="flex">
                  <div className="w-20 p-3 text-sm text-muted-foreground border-r border-border flex-shrink-0">
                    {time}
                  </div>
                  <div className="flex-1 p-2 min-h-[60px]">
                    {aptAtTime && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className="w-full text-left p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                            onClick={() => setSelectedAppointment(aptAtTime)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{aptAtTime.clientName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {aptAtTime.serviceName} • {aptAtTime.professionalName}
                                </p>
                              </div>
                              <StatusBadge status={aptAtTime.status as any} />
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Agendamento</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Cliente</p>
                                <p className="font-medium">{aptAtTime.clientName}</p>
                                <p className="text-sm text-muted-foreground">{aptAtTime.clientPhone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Serviço</p>
                                <p className="font-medium">{aptAtTime.serviceName}</p>
                                <p className="text-sm text-muted-foreground">R$ {aptAtTime.price.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Profissional</p>
                                <p className="font-medium">{aptAtTime.professionalName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <StatusBadge status={aptAtTime.status as any} />
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4 border-t">
                              <Button 
                                className="flex-1" 
                                onClick={() => handleStatusChange(aptAtTime.id, 'confirmed')}
                              >
                                Confirmar
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => handleStatusChange(aptAtTime.id, 'completed')}
                              >
                                Concluir
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleStatusChange(aptAtTime.id, 'cancelled')}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
