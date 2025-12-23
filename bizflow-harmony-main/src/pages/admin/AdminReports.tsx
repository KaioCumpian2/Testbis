import { DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appointments, professionals, services } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminReports() {
  // Calculate KPIs
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const totalRevenue = completedAppointments.reduce((sum, a) => sum + a.price, 0);
  const avgTicket = totalRevenue / (completedAppointments.length || 1);
  const completionRate = (completedAppointments.length / appointments.length) * 100;

  // Commission data
  const commissionRate = 0.3; // 30%
  const commissionData = professionals.map(pro => {
    const proAppointments = completedAppointments.filter(a => a.professionalId === pro.id);
    const proRevenue = proAppointments.reduce((sum, a) => sum + a.price, 0);
    return {
      name: pro.name,
      appointments: proAppointments.length,
      revenue: proRevenue,
      commission: proRevenue * commissionRate
    };
  });

  // Service distribution
  const serviceDistribution = services.map(service => {
    const count = appointments.filter(a => a.serviceId === service.id).length;
    return {
      name: service.name,
      value: count
    };
  }).filter(s => s.value > 0);

  const COLORS = ['hsl(258, 89%, 66%)', 'hsl(270, 95%, 75%)', 'hsl(234, 89%, 73%)', 'hsl(255, 91%, 76%)', 'hsl(240, 3%, 46%)'];

  // Weekly data (mock)
  const weeklyData = [
    { day: 'Seg', revenue: 320, appointments: 4 },
    { day: 'Ter', revenue: 480, appointments: 6 },
    { day: 'Qua', revenue: 400, appointments: 5 },
    { day: 'Qui', revenue: 560, appointments: 7 },
    { day: 'Sex', revenue: 640, appointments: 8 },
    { day: 'Sáb', revenue: 800, appointments: 10 },
    { day: 'Dom', revenue: 0, appointments: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Análise financeira e de desempenho</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agendamentos</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {avgTicket.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {serviceDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Report */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões por Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Profissional</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Atendimentos</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Faturamento</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Comissão (30%)</th>
                </tr>
              </thead>
              <tbody>
                {commissionData.map((item) => (
                  <tr key={item.name} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-center">{item.appointments}</td>
                    <td className="py-3 px-4 text-right">R$ {item.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-primary">
                      R$ {item.commission.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td className="py-3 px-4 font-bold">Total</td>
                  <td className="py-3 px-4 text-center font-bold">
                    {commissionData.reduce((sum, i) => sum + i.appointments, 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    R$ {commissionData.reduce((sum, i) => sum + i.revenue, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-primary">
                    R$ {commissionData.reduce((sum, i) => sum + i.commission, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
