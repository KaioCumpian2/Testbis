import { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, Star, Loader2, Check, X, Copy, ExternalLink, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinancialSummary, getTodayAppointments, getPendingPayments, updateAppointmentStatus, approvePayment, rejectPayment, getAdminProfessionals, getDetailedReport } from '@/lib/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, LayoutGrid, Settings, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { slug, tenantId } = useEstablishment();
  const [copied, setCopied] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie'>('area');
  const [viewRange, setViewRange] = useState<'7d' | '12m'>('12m');

  const copyLink = () => {
    const url = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Queries
  const { data: finance = { totalRevenue: 0 }, isLoading: isFinanceLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: getFinancialSummary,
    refetchInterval: 30000 // Real-time sync every 30s
  });

  const { data: todayAppointments = [], isLoading: isTodayLoading } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: getTodayAppointments,
    refetchInterval: 30000
  });

  const { data: pendingPayments = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ['appointments', 'pending-payments'],
    queryFn: getPendingPayments,
    refetchInterval: 30000
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ['admin-professionals'],
    queryFn: getAdminProfessionals
  });

  // Chart Data Query
  const { data: report = [] } = useQuery({
    queryKey: ['finance-report-dashboard', viewRange],
    queryFn: () => {
      const end = new Date();
      const start = new Date();

      if (viewRange === '7d') {
        start.setDate(start.getDate() - 6);
      } else {
        start.setFullYear(start.getFullYear() - 1);
      }

      return getDetailedReport({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      });
    }
  });

  // Process Chart Data
  const getChartData = () => {
    if (viewRange === '7d') {
      const days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('pt-BR', { weekday: 'short' });
      }).reverse();

      return days.map(day => {
        const safeReport = Array.isArray(report) ? report : [];
        const dayReport = safeReport.filter((item: any) => {
          const itemDay = new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' });
          return itemDay === day;
        });
        return {
          label: day,
          revenue: dayReport.reduce((sum: number, item: any) => sum + parseFloat(item.price), 0)
        };
      });
    } else {
      const months = [...Array(12)].map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          key: d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
          monthIndex: d.getMonth(),
          year: d.getFullYear()
        };
      }).reverse();

      return months.map(period => {
        const safeReport = Array.isArray(report) ? report : [];
        const monthRevenue = safeReport
          .filter((item: any) => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === period.monthIndex && itemDate.getFullYear() === period.year;
          })
          .reduce((sum: number, item: any) => sum + parseFloat(item.price), 0);

        return {
          label: period.key,
          revenue: monthRevenue
        };
      });
    }
  };

  const chartData = getChartData();

  const avgRating = professionals.length > 0
    ? professionals.reduce((acc: number, p: any) => acc + (p.averageRating || 0), 0) / professionals.length
    : 0;

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status atualizado');
    }
  });

  const approveMutation = useMutation({
    mutationFn: approvePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      toast.success('Pagamento aprovado');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Pagamento rejeitado');
    }
  });

  const isLoading = isFinanceLoading || isTodayLoading || isPendingLoading;

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
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Proprietário</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo ao centro de comando da sua vitrine.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="lg" onClick={copyLink} className="gap-2 bg-background shadow-sm hover:shadow-md transition-all">
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            Copiar Link da Vitrine
          </Button>
          <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <a href={`/s/${slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-5 h-5" />
              Ver Vitrine Online
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={async () => {
              const toastId = toast.loading('Gerando dados de demonstração...');
              try {
                const api = await import('@/lib/api');
                const services = await api.getAdminServices();
                const pros = await api.getAdminProfessionals();

                if (!services.length || !pros.length) {
                  toast.error('Crie pelo menos 1 serviço e 1 profissional primeiro!', { id: toastId });
                  return;
                }

                let created = 0;
                let skipped = 0;
                const clientNames = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa', 'Paula Lima'];
                const usedSlots = new Set<string>();

                for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
                  const date = new Date();
                  date.setDate(date.getDate() - dayOffset);
                  const dateStr = date.toISOString().split('T')[0];
                  const appsPerDay = Math.floor(Math.random() * 2) + 2;

                  for (let i = 0; i < appsPerDay; i++) {
                    try {
                      const s = services[Math.floor(Math.random() * services.length)];
                      const p = pros[Math.floor(Math.random() * pros.length)];
                      const clientName = clientNames[Math.floor(Math.random() * clientNames.length)];
                      const hour = 9 + Math.floor(Math.random() * 9);
                      const minute = Math.random() > 0.5 ? '00' : '30';
                      const time = `${hour}:${minute}`;

                      const slotKey = `${dateStr}-${time}-${p.id}`;
                      if (usedSlots.has(slotKey)) {
                        skipped++;
                        continue;
                      }

                      const app = await api.createPublicAppointment({
                        tenantId: tenantId!,
                        serviceId: s.id,
                        professionalId: p.id,
                        date: dateStr,
                        time: time,
                        clientName,
                        clientPhone: '11999999999'
                      });

                      if (app?.id) {
                        usedSlots.add(slotKey);
                        // Always approve and complete demo data
                        await api.approvePayment(app.id);
                        await api.updateAppointmentStatus(app.id, 'COMPLETED');
                        created++;
                      }
                    } catch (err: any) {
                      if (err.response?.status === 409) skipped++;
                      else console.error('Demo yield error:', err);
                    }
                  }
                }

                queryClient.invalidateQueries({ queryKey: ['appointments'] });
                queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
                queryClient.invalidateQueries({ queryKey: ['finance-report'] });

                toast.success(`✨ ${created} agendamentos criados com sucesso!`, { id: toastId });
              } catch (e: any) {
                toast.error(`Erro ao gerar dados: ${e.message}`, { id: toastId });
              }
            }}
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
          >
            <TrendingUp className="w-5 h-5" />
            Gerar Dados Demo
          </Button>
        </div>
      </div>

      {/* Glassy Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/appointments')}
          className="h-auto py-4 flex-col gap-2 glass hover:bg-primary/5 border-primary/20 hover-lift group"
        >
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-xs">Novo Agendamento</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/services')}
          className="h-auto py-4 flex-col gap-2 glass hover:bg-primary/5 border-primary/20 hover-lift group"
        >
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <LayoutGrid className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-xs">Novo Serviço</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/professionals')}
          className="h-auto py-4 flex-col gap-2 glass hover:bg-primary/5 border-primary/20 hover-lift group"
        >
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-xs">Profissionais</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/settings')}
          className="h-auto py-4 flex-col gap-2 glass hover:bg-primary/5 border-primary/20 hover-lift group"
        >
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-xs">Configurações</span>
        </Button>
      </div>

      {/* KPI Cards with Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Card className="glass border-primary/10 hover-lift shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-16 h-16 text-primary" />
          </div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receita (Mês)</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">R$ {parseFloat(finance.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-xs font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> 12%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10 hover-lift shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-16 h-16 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agendamentos (Hoje)</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">{todayAppointments.length}</p>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Ativo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10 hover-lift shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-16 h-16 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aguardando Pagamento</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">{pendingPayments.length}</p>
                  {pendingPayments.length > 0 && (
                    <span className="animate-pulse flex h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10 hover-lift shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Star className="w-16 h-16 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avaliação Média</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-3 h-3 ${i <= (avgRating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
          <div className="flex flex-col space-y-1">
            <CardTitle>Receita: Visão Detalhada</CardTitle>
            <p className="text-sm text-muted-foreground">
              {viewRange === '7d' ? 'Desempenho da última semana' : 'Evolução nos últimos 12 meses'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-muted/50 p-1 rounded-lg">
            <Tabs value={viewRange} onValueChange={(v) => setViewRange(v as '7d' | '12m')} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="7d" className="text-xs">7 Dias</TabsTrigger>
                <TabsTrigger value="12m" className="text-xs">1 Ano</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-1">
              {/* Controls for Chart Type */}
              {[
                { type: 'area', icon: TrendingUp, label: 'Área', desc: 'Ideal para visualizar tendências de crescimento e volume acumulado.' },
                { type: 'bar', icon: Calendar, label: 'Barras', desc: 'Melhor para comparar valores exatos entre períodos distintos.' },
                { type: 'line', icon: Clock, label: 'Linha', desc: 'Perfeito para identificar flutuações e picos de receita.' },
                { type: 'pie', icon: PieChartIcon, label: 'Pizza', desc: 'Útil para ver a proporção de receita entre os períodos.' }
              ].map((opt) => (
                <UiTooltip key={opt.type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={chartType === opt.type ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setChartType(opt.type as any)}
                    >
                      <opt.icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold mb-1">{opt.label}</p>
                    <p className="max-w-xs text-xs text-muted-foreground">{opt.desc}</p>
                  </TooltipContent>
                </UiTooltip>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border shadow-xl rounded-lg p-3">
                            <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
                            <p className="text-lg font-bold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
                </AreaChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border shadow-xl rounded-lg p-3">
                            <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
                            <p className="text-lg font-bold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'pie' ? (
                chartData.filter(d => d.revenue > 0).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                    <PieChartIcon className="w-10 h-10 mb-2" />
                    <p>Sem dados de receita para este período</p>
                  </div>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData.filter(d => d.revenue > 0)}
                      dataKey="revenue"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="hsl(var(--foreground))"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            className="text-xs font-medium"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {chartData.filter(d => d.revenue > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${Math.max(0.3, 1 - (index * 0.15))})`} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border shadow-xl rounded-lg p-3">
                              <p className="text-sm font-medium text-popover-foreground mb-1">{payload[0].name}</p>
                              <p className="text-lg font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                )
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border shadow-xl rounded-lg p-3">
                            <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
                            <p className="text-lg font-bold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed"
          onClick={() => navigate('/admin/services')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span>Novo Serviço</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed"
          onClick={() => navigate('/admin/professionals')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <span>Profissionais</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed"
          onClick={() => navigate('/admin/hours')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <span>Horários</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed"
          onClick={() => navigate('/admin/settings')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <span>Configurações</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Agendamentos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Calendar className="h-8 w-8 mb-2 opacity-50" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-background border">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{app.service.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{app.user?.name || app.clientName || 'Cliente'}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pagamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <CheckCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>Todos os pagamentos em dia</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((app: any) => (
                  <div key={app.id} className="flex flex-col gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{app.user?.name || app.clientName || 'Cliente'}</p>
                        <p className="text-sm text-muted-foreground">{app.service.title}</p>
                        <p className="text-sm font-bold mt-1">R$ {parseFloat(app.service.price).toFixed(2)}</p>
                      </div>
                      <StatusBadge status="awaiting_validation" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => approveMutation.mutate(app.id)}
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => rejectMutation.mutate(app.id)}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
