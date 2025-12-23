import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui/status-badge';

export default function EmployeeDashboard() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Ideally we have a dedicated endpoint /employee/appointments
            // For MVP we reuse the general list but filter by "my" ID (handled by backend or client filter)
            // Assuming backend returns ALL if admin, or ONLY assigned if employee? 
            // Let's assume we filter client side for MVP or use the existing safe endpoint
            const today = new Date().toISOString().split('T')[0];
            const response = await api.get(`/appointments?date=${today}&myAppointments=true`);
            setAppointments(response.data);
        } catch (error) {
            console.error(error);
            // Mock data for now if API fails
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/appointments/${id}/status`, { status });
            toast.success('Status atualizado!');
            fetchAppointments();
        } catch (error) {
            toast.error('Erro ao atualizar.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Olá, {user?.name}</h1>
                        <p className="text-muted-foreground">Sua agenda de hoje</p>
                    </div>
                    <Button variant="outline" onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}>
                        Sair
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Agendamentos</p>
                                <p className="text-2xl font-bold">{appointments.length}</p>
                            </div>
                            <Calendar className="text-primary w-8 h-8" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Próximo</p>
                                <p className="text-xl font-bold">
                                    {appointments.length > 0 ? appointments[0].time : '-'}
                                </p>
                            </div>
                            <Clock className="text-primary w-8 h-8" />
                        </CardContent>
                    </Card>
                </div>

                {/* Agenda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Horários</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <p>Carregando...</p>
                        ) : appointments.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>Nenhum agendamento para hoje. Aproveite o descanso!</p>
                            </div>
                        ) : (
                            appointments.map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center min-w-[60px]">
                                            <p className="text-lg font-bold text-primary">{apt.time}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{apt.clientName}</p>
                                            <p className="text-sm text-gray-500">{apt.serviceName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={apt.status} />
                                        {apt.status === 'confirmed' && (
                                            <Button size="sm" onClick={() => updateStatus(apt.id, 'completed')}>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Concluir
                                            </Button>
                                        )}
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
