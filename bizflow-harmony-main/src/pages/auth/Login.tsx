import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            const { token, user } = response.data;

            // Store Auth Data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success('Bem-vindo de volta!', {
                description: `Login realizado como ${user.name}`
            });

            // Redirect based on Role
            // Force reload to ensure context picks up token
            setTimeout(() => {
                if (user.role === 'EMPLOYEE') {
                    window.location.href = '/employee';
                } else {
                    window.location.href = '/admin';
                }
            }, 500);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || 'Credenciais inválidas. Tente novamente.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-dashed">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">F</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">FlowMaster</CardTitle>
                    <CardDescription>
                        Acesse seu estabelecimento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@empresa.com"
                                    className="pl-9"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link to="#" className="text-xs text-primary hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>
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
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Autenticando...
                                </>
                            ) : (
                                'Entrar no Sistema'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            Criar conta grátis
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
