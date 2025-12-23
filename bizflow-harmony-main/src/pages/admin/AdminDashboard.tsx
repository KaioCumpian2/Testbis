import { Calendar, DollarSign, Users, TrendingUp, Clock, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appointments, services, professionals, reviews } from '@/data/mockData';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const todayStr = new Date().toISOString().split('T')[0];

  // KPIs
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0);

  const todayAppointments = appointments.filter(a => a.date === '2024-01-15');
  const pendingPayments = appointments.filter(a => a.status === 'awaiting_validation');
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const handleQuickAction = (action: string, id: string) => {
    toast.success(`Ação "${action}" realizada para agendamento #${id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita (mês)</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos hoje</p>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagamentos pendentes</p>
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliação média</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Agenda */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Agenda de Hoje</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/agenda">Ver tudo</a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum agendamento para hoje
              </p>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold">{apt.time}</p>
                    </div>
                    <div>
                      <p className="font-medium">{apt.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.serviceName} • {apt.professionalName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status as any} />
                    {apt.status === 'requested' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction('confirmar', apt.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pagamentos Pendentes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/payments">Ver tudo</a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum pagamento pendente
              </p>
            ) : (
              pendingPayments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{apt.clientName}</p>
                    <p className="text-sm text-muted-foreground">{apt.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">R$ {apt.price.toFixed(2)}</p>
                    <div className="flex gap-1 mt-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleQuickAction('aprovar', apt.id)}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction('rejeitar', apt.id)}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{services.length}</p>
            <p className="text-sm text-muted-foreground">Serviços</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{professionals.length}</p>
            <p className="text-sm text-muted-foreground">Profissionais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{appointments.length}</p>
            <p className="text-sm text-muted-foreground">Total Agendamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{reviews.length}</p>
            <p className="text-sm text-muted-foreground">Avaliações</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
