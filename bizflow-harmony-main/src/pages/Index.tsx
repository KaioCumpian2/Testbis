import { Link } from 'react-router-dom';
import { Calendar, Smartphone, Monitor, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import logo from '@/assets/logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto shadow-lg overflow-hidden">
            <img src={logo} alt="Service Hub Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Service Hub
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sistema completo de agendamento e gestao para estabelecimentos de servicos de estetica e beleza
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-card to-muted/20 group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Smartphone className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Demonstracao Loja</CardTitle>
              <CardDescription>
                Veja como seus clientes acessariam sua barbearia ou clinica exclusiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full rounded-xl shadow-md group">
                <Link to="/s/exemplo" className="flex items-center justify-center gap-2">
                  Ver Loja de Exemplo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-card to-muted/20 group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Monitor className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Crie sua Conta</CardTitle>
              <CardDescription>
                Administrador: Gerencie agenda, servicos e profissionais do seu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full rounded-xl border-2 group">
                <Link to="/admin" className="flex items-center justify-center gap-2">
                  Comecar Agora (Admin)
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm">
            <p className="text-2xl font-bold text-primary">6+</p>
            <p className="text-sm text-muted-foreground">Servicos</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm">
            <p className="text-2xl font-bold text-primary">3</p>
            <p className="text-sm text-muted-foreground">Profissionais</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm">
            <p className="text-2xl font-bold text-primary">Pix</p>
            <p className="text-sm text-muted-foreground">Pagamentos</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold text-primary">IA</p>
            </div>
            <p className="text-sm text-muted-foreground">WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
