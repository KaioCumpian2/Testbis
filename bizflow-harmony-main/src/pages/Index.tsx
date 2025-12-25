import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  Star,
  TrendingUp,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Store,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logo from '@/assets/logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-violet-500/30 font-sans">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white text-lg">F</span>
            </div>
            <span className="font-bold text-lg tracking-tight">FlowMaster</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-400 font-bold border border-violet-500/30">BETA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Button asChild size="sm" className="bg-white text-slate-950 hover:bg-slate-200 font-semibold rounded-full px-6">
              <Link to="/register">
                Começar Grátis
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm md:mb-8 mb-6 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300">Nova versão disponível</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Gerencie seu negócio com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400">
              Maestria e Inteligência
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A plataforma completa para seu negócio. Crie sua vitrine, gerencie sua agenda e aceite pagamentos Pix. Tudo com seu link personalizado para marketing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base bg-violet-600 hover:bg-violet-700 rounded-full w-full sm:w-auto shadow-lg shadow-violet-500/25">
              <Link to="/register">
                Criar Conta Grátis
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 hover:bg-white/5 text-slate-300 rounded-full w-full sm:w-auto">
              <Link to="/s/exemplo">
                Ver Loja Demo
              </Link>
            </Button>
          </div>

          {/* Feature Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-10">
            <div>
              <p className="text-3xl font-bold text-white mb-1">10k+</p>
              <p className="text-slate-500 text-sm">Agendamentos/mês</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">R$ 2M+</p>
              <p className="text-slate-500 text-sm">Processados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">500+</p>
              <p className="text-slate-500 text-sm">Negócios ativos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">4.9/5</p>
              <p className="text-slate-500 text-sm">Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Ferramentas poderosas simplificadas para o seu dia a dia. Foque no seu serviço enquanto cuidamos da burocracia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Agenda Inteligente</h3>
                <p className="text-slate-400">
                  Link exclusivo para seus clientes agendarem 24/7. Sincronização automática e lembretes via WhatsApp.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Gestão Completa</h3>
                <p className="text-slate-400">
                  Controle financeiro, comissões de profissionais e relatórios detalhados em um único painel.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-sky-600/20 flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Seu Link, Sua Marca</h3>
                <p className="text-slate-400">
                  Sua marca em destaque com link personalizado. Customize cores, logo e serviços para criar uma experiência única para seus clientes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-24 border-y border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-12 text-slate-200">Ideal para todo tipo de negócio</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Barbearias', 'Salões de Beleza', 'Clínicas de Estética', 'Spas & Bem-estar'].map((item) => (
              <div key={item} className="flex items-center justify-center gap-2 text-slate-400 font-medium">
                <CheckCircle2 className="w-5 h-5 text-violet-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Crie sua conta gratuíta hoje mesmo. Sem cartão de crédito necessário.
          </p>
          <Button asChild size="lg" className="h-14 px-10 text-lg bg-white text-slate-950 hover:bg-slate-200 rounded-full shadow-2xl shadow-white/10">
            <Link to="/register">
              Começar Gratuitamente
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-indigo-600" />
            <span className="font-bold text-slate-200">FlowMaster</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 FlowMaster. Plataforma SaaS de agendamentos.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
