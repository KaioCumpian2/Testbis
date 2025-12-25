import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Clock, DollarSign, Loader2, Scissors, Sparkles, MessageSquare, Tag, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAdminServices, createService, updateService, deleteService } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
}

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: ''
  });

  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: getAdminServices,
    refetchInterval: 30000
  });

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Serviço criado com sucesso!');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Erro ao criar serviço';
      toast.error(errorMsg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Serviço atualizado!');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar serviço');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Serviço removido!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover serviço');
    }
  });

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration: '', category: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category || ''
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      category: formData.category || 'Geral'
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      createMutation.mutate(serviceData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      deleteMutation.mutate(id);
    }
  };

  const groupedServices = services.reduce((acc: Record<string, Service[]>, service: Service) => {
    const category = service.category || 'Geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter bg-premium-gradient bg-clip-text text-transparent">
            Catálogo de Serviços
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Gestão estratégica de procedimentos e valores
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="h-14 px-8 rounded-2xl bg-premium-gradient shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group">
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-black uppercase tracking-widest text-xs">Novo Serviço</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-primary/10 rounded-[2.5rem] p-0 overflow-hidden max-w-[500px] animate-scale-in">
            <div className="bg-premium-gradient p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black italic tracking-tight">
                    {editingService ? 'Ajustar Serviço' : 'Criar Experiência'}
                  </DialogTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Definição de preço e tempo</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Título do Serviço</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Corte Artístico Masculino"
                    className="h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Descrição Detalhada</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="O que está incluso neste atendimento?"
                    className="glass border-primary/10 rounded-xl focus:border-primary/50 transition-all min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Valor (R$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="pl-11 h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Duração (Min)</Label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="60"
                        className="pl-11 h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Categoria</Label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: Cabelo, Barba, Estética"
                      className="pl-11 h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-[2] h-14 bg-premium-gradient text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    editingService ? 'Salvar Mudanças' : 'Publicar Serviço'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 && (
        <Card className="glass border-primary/10 border-dashed p-24 text-center rounded-[3rem] animate-scale-in">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Layout className="w-12 h-12 text-primary opacity-20" />
            <div className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-full animate-spin-slow" />
          </div>
          <h3 className="text-xl font-black italic tracking-tight mb-2">Catálogo Vazio</h3>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest max-w-xs mx-auto mb-8 opacity-60">
            Defina seu primeiro serviço para habilitar agendamentos e começar a lucrar.
          </p>
          <Button onClick={openCreateDialog} className="h-12 px-8 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 font-black uppercase tracking-widest text-[10px]">
            Criar Meu Primeiro Serviço
          </Button>
        </Card>
      )}

      {Object.entries(groupedServices).map(([category, categoryServices], catIdx) => (
        <div key={category} className="space-y-6 animate-slide-up" style={{ animationDelay: `${catIdx * 0.1}s` }}>
          <div className="flex items-center gap-4 ml-2">
            <div className="h-8 w-1.5 bg-premium-gradient rounded-full" />
            <h2 className="text-xl font-black italic tracking-tight uppercase tracking-widest opacity-80">{category}</h2>
            <span className="text-[10px] font-black text-primary/40">{(categoryServices as Service[]).length} itens</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(categoryServices as Service[]).map((service: Service, idx: number) => (
              <Card key={service.id} className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-[2.5rem] group overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black italic tracking-tight group-hover:text-primary transition-colors">{service.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Procedimento VIP</span>
                        <Sparkles className="w-3 h-3 text-primary/30" />
                      </div>
                    </div>

                    <div className="flex gap-1 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary"
                        onClick={() => openEditDialog(service)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDelete(service.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-8 line-clamp-2 h-8">
                    {service.description || "Nenhuma descrição detalhada fornecida para este serviço."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-primary/5">
                    <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-black text-primary italic">{service.duration} MIN</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-0.5">Investimento</span>
                      <div className="flex items-center text-2xl font-black text-primary italic tracking-tighter">
                        <span className="text-xs mr-1 mt-1 font-bold">R$</span>
                        {Number(service.price || 0).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
