import { useEffect, useState } from 'react';
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getFinancialSummary, getTodayAppointments, getPendingPayments, updateAppointmentStatus } from '@/lib/api';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    todayCount: 0,
    pendingCount: 0,
    avgRating: 5.0
  });

  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  const loadData = async () => {
    try {
      console.log('🔵 Dashboard: Starting data load...');
      setIsLoading(true);
      const [finance, today, pending] = await Promise.all([
        getFinancialSummary().catch((err) => {
          console.warn('⚠️ Finance API failed:', err);
          return { totalRevenue: 0 };
        }),
        getTodayAppointments().catch((err) => {
          console.warn('⚠️ Today Appointments API failed:', err);
          return [];
        }),
        getPendingPayments().catch((err) => {
          console.warn('⚠️ Pending Payments API failed:', err);
          return [];
        })
      ]);

      console.log('✅ Dashboard: Data loaded successfully', { finance, today, pending });

      setStats({
        revenue: finance.totalRevenue || 0,
        todayCount: today.length,
        pendingCount: pending.length,
        avgRating: 4.8 // Mocked for now until review API is ready
      });

      setTodayAppointments(today);
      setPendingPayments(pending);

    } catch (error) {
      console.error('❌ Dashboard: Error loading dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      console.log('🏁 Dashboard: Load complete, setting isLoading=false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Dashboard: Component mounted, calling loadData()');
    loadData();
  }, []);

  const handleQuickAction = async (action: 'confirm' | 'reject', id: string) => {
    try {
      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled'; // or 'created' logic
      // Actually pending payment usually acts on 'confirmed' or 'rejected'
      // If action is 'aprovar' (approve payment), status -> confirmed

      const statusToSend = action === 'confirm' ? 'confirmed' : 'cancelled';

      await updateAppointmentStatus(id, statusToSend);
      toast.success('Status atualizado com sucesso');
      loadData(); // Reload data
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
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
                <p className="text-sm text-muted-foreground">Receita (Total)</p>
                <p className="text-2xl font-bold">R$ {Number(stats.revenue || 0).toFixed(2)}</p>
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
                <p className="text-2xl font-bold">{stats.todayCount}</p>
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
                <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
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
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
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
                        onClick={() => handleQuickAction('confirm', apt.id)}
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
                    <p className="font-bold text-primary">R$ {apt.price?.toFixed(2) || '0.00'}</p>
                    <div className="flex gap-1 mt-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleQuickAction('confirm', apt.id)}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction('reject', apt.id)}
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
    </div>
  );
}
