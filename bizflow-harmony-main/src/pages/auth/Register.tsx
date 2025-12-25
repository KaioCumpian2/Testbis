import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Check, Loader2, Store, User, Mail, Lock } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        organizationName: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        setIsLoading(true);

        try {
            // Call the SaaS Registration Endpoint
            const response = await api.post('/auth/register-saas', {
                organizationName: formData.organizationName,
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            const { user, tenant, token } = response.data;

            // Store token and flag for newly created account tour
            localStorage.setItem('token', token);
            localStorage.setItem('hasSeenTour', 'false'); // Marcar que ainda não viu para forçar o tour agora

            toast.success('Conta criada com sucesso!', {
                description: `Bem-vindo ao ${tenant.name}. Você será redirecionado.`
            });

            // Redirect to the Admin Dashboard of the new Tenant
            // Since we don't have a "global" admin domain, we redirect to /admin inside the app info if we handle it
            // But our routing is /admin (mapped to local context?) 
            // Actually, Client Routes are /s/:slug. Admin Routes are /admin. 
            // If we are logged in, /admin should work if it detects the user's tenant from the token.

            setTimeout(() => {
                // Force reload/redirect to ensure Context picks up the new token/tenant
                window.location.href = '/admin'; // This assumes /admin uses the token to find the tenant
            }, 1500);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || 'Erro ao criar conta. Tente novamente.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Visual Side */}
            <div className="hidden lg:flex flex-col justify-between p-10 bg-[#0f172a] text-white">
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Store className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-bold leading-tight">
                        Gerencie seu negócio<br />com excelência
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        Junte-se a milhares de estabelecimentos que modernizaram seus agendamentos.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <span>Agenda Inteligente</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <span>Pagamentos via Pix</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <span>Link Personalizado</span>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-4 bg-background">
                <Card className="w-full max-w-md border-0 shadow-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Crie sua conta</CardTitle>
                        <CardDescription>
                            Preencha os dados abaixo para criar seu estabelecimento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="organizationName">Nome do Estabelecimento</Label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="organizationName"
                                        name="organizationName"
                                        placeholder="Ex: Barbearia do Silva"
                                        className="pl-9"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Isso será usado para criar seu link: flowmaster.com/s/<b>barbearia-do-silva</b></p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Seu Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Ex: João Silva"
                                        className="pl-9"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail Profissional</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="nome@empresa.com"
                                        className="pl-9"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            className="pl-9"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            className="pl-9"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando ambiente...
                                    </>
                                ) : (
                                    'Começar Agora'
                                )}
                            </Button>

                            <div className="text-center text-sm">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Fazer login
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
