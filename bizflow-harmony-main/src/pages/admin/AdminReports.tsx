import { DollarSign, Calendar, TrendingUp, Users, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getFinancialSummary, getDetailedReport, getAdminAppointments } from '@/lib/api';

const COLORS = ['hsl(var(--primary))', 'hsl(258, 89%, 66%)', 'hsl(270, 95%, 75%)', 'hsl(234, 89%, 73%)', 'hsl(255, 91%, 76%)', 'hsl(240, 3%, 46%)'];

interface ProCommission {
  name: string;
  appointments: number;
  revenue: number;
  commission: number;
}

export default function AdminReports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Queries
  const { data: summary = { totalRevenue: 0, totalAppointments: 0, month: '' }, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: getFinancialSummary
  });

  const { data: report = [], isLoading: isReportLoading } = useQuery({
    queryKey: ['finance-report', dateRange],
    queryFn: () => getDetailedReport({ start_date: dateRange.start, end_date: dateRange.end } as any)
  });

  const { data: allAppointments = [], isLoading: isAllAptsLoading } = useQuery({
    queryKey: ['admin-appointments-all'],
    queryFn: () => getAdminAppointments({})
  });

  const isLoading = isSummaryLoading || isReportLoading || isAllAptsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculations based on real data
  const totalRevenue = parseFloat(summary.totalRevenue || 0);
  const avgTicket = totalRevenue / (summary.totalAppointments || 1);
  const completionRate = allAppointments.length > 0
    ? (allAppointments.filter((a: any) => a.status === 'COMPLETED').length / allAppointments.length) * 100
    : 0;

  // Commission data by professional
  const proReport = report.reduce((acc: any, item: any) => {
    const proName = item.professional || 'Indefinido';
    if (!acc[proName]) {
      acc[proName] = { name: proName, appointments: 0, revenue: 0, commission: 0 };
    }
    acc[proName].appointments++;
    acc[proName].revenue += parseFloat(item.price);
    acc[proName].commission += parseFloat(item.commissionAmount);
    return acc;
  }, {});
  const commissionData = Object.values(proReport) as ProCommission[];

  // Service distribution
  const svcReport = report.reduce((acc: any, item: any) => {
    const svcName = item.service || 'Outros';
    if (!acc[svcName]) {
      acc[svcName] = { name: svcName, value: 0 };
    }
    acc[svcName].value++;
    return acc;
  }, {});
  const serviceDistribution = Object.values(svcReport).sort((a: any, b: any) => b.value - a.value).slice(0, 5);

  // Weekly data (derived from report items in the last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('pt-BR', { weekday: 'short' });
  }).reverse();

  const weeklyData = last7Days.map(day => {
    const dayReport = report.filter((item: any) => {
      const itemDay = new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' });
      return itemDay === day;
    });
    return {
      day,
      revenue: dayReport.reduce((sum: number, item: any) => sum + parseFloat(item.price), 0),
      appointments: dayReport.length
    };
  });

  const exportToCSV = () => {
    if (report.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    const headers = ['Data', 'Servico', 'Profissional', 'Preco', 'Comissao', 'Status'];
    const csvContent = [
      headers.join(','),
      ...report.map((item: any) => [
        new Date(item.date).toLocaleDateString('pt-BR'),
        item.service,
        item.professional,
        item.price,
        item.commissionAmount,
        item.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_financeiro_${dateRange.start}_a_${dateRange.end}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Relatório exportado com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Métricas</h1>
          <p className="text-muted-foreground mt-1">Acompanhe o desempenho do seu negócio em tempo real.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-secondary/20 p-2 rounded-xl border border-secondary/30 glass">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="h-9 w-40 bg-transparent border-none focus-visible:ring-0 text-xs font-medium"
              />
            </div>
            <div className="w-4 h-[1px] bg-muted-foreground/30" />
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="h-9 w-40 bg-transparent border-none focus-visible:ring-0 text-xs font-medium"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="glass border-primary/20 hover:bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl gap-2"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Card className="glass border-primary/10 hover-lift overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receita Total</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10 hover-lift overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agendamentos</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">{summary.totalAppointments}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10 hover-lift overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ticket Médio</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10 hover-lift overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Taxa de Conclusão</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Weekly Revenue Chart */}
        <Card className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 group">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Fluxo de Receita Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.5)" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(val) => `R$${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(12px)'
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 group">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Distribuição de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1500}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(12px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {serviceDistribution.map((entry: any, index: number) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group/item"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-muted-foreground group-hover/item:text-foreground transition-colors truncate">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Report */}
      <Card className="glass border-primary/5 shadow-xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Comissões por Profissional (Período)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="text-left py-4 px-6 font-semibold">Profissional</th>
                  <th className="text-center py-4 px-6 font-semibold">Atendimentos</th>
                  <th className="text-right py-4 px-6 font-semibold">Faturamento</th>
                  <th className="text-right py-4 px-6 font-semibold">Comissão</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {commissionData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">Nenhum dado de comissão disponível para este período</td>
                  </tr>
                ) : (
                  commissionData.map((item: any) => (
                    <tr key={item.name} className="border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors group">
                      <td className="py-4 px-6 font-medium group-hover:text-primary transition-colors">{item.name}</td>
                      <td className="py-4 px-6 text-center">{item.appointments}</td>
                      <td className="py-4 px-6 text-right font-medium">R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 px-6 text-right font-bold text-primary">
                        R$ {item.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {commissionData.length > 0 && (
                <tfoot>
                  <tr className="bg-primary/5 border-t border-primary/10">
                    <td className="py-4 px-6 font-bold">Total</td>
                    <td className="py-4 px-6 text-center font-bold">
                      {commissionData.reduce((sum: number, i: any) => sum + i.appointments, 0)}
                    </td>
                    <td className="py-4 px-6 text-right font-bold">
                      R$ {commissionData.reduce((sum: number, i: any) => sum + i.revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-primary text-base">
                      R$ {commissionData.reduce((sum: number, i: any) => sum + i.commission, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
