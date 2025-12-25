import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, User, Briefcase, LayoutGrid, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAdminProfessionals, createProfessional, updateProfessional, deleteProfessional, getAdminServices } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Professional {
  id: string;
  name: string;
  role: string;
  services: string[];
}

export default function AdminProfessionals() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    services: [] as string[]
  });

  // Fetch professionals
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['admin-professionals'],
    queryFn: getAdminProfessionals,
    refetchInterval: 30000
  });

  // Fetch services for the checkbox list
  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: getAdminServices
  });

  const createMutation = useMutation({
    mutationFn: createProfessional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professionals'] });
      toast.success('Profissional adicionado!');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Erro ao criar profissional';
      toast.error(errorMsg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProfessional(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professionals'] });
      toast.success('Profissional atualizado!');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Erro ao atualizar profissional';
      toast.error(errorMsg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProfessional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professionals'] });
      toast.success('Profissional removido!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Erro ao remover profissional';
      toast.error(errorMsg);
    }
  });

  const openCreateDialog = () => {
    setEditingPro(null);
    setFormData({ name: '', role: '', services: [] });
    setDialogOpen(true);
  };

  const openEditDialog = (pro: Professional) => {
    setEditingPro(pro);
    setFormData({
      name: pro.name,
      role: pro.role,
      services: pro.services || []
    });
    setDialogOpen(true);
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.role) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const proData = {
      name: formData.name,
      role: formData.role,
      services: formData.services
    };

    if (editingPro) {
      updateMutation.mutate({ id: editingPro.id, data: proData });
    } else {
      createMutation.mutate(proData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este profissional?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter bg-premium-gradient bg-clip-text text-transparent">
            Time de Especialistas
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Gestão de profissionais e especialidades
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="h-14 px-8 rounded-2xl bg-premium-gradient shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group">
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-black uppercase tracking-widest text-xs">Adicionar Profissional</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-primary/10 rounded-[2.5rem] p-0 overflow-hidden max-w-[500px] animate-scale-in">
            <div className="bg-premium-gradient p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black italic tracking-tight">
                    {editingPro ? 'Editar Perfil' : 'Novo Talento'}
                  </DialogTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Cadastro de profissional</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Nome Completo</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Amanda Silva"
                      className="pl-11 h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Cargo / Função</Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                    <Input
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Ex: Expert Colorista"
                      className="pl-11 h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Atribuições de Serviço</Label>
                    <span className="text-[9px] font-bold text-primary">{formData.services.length} selecionados</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 p-4 glass bg-primary/5 border-primary/5 rounded-2xl max-h-[160px] overflow-y-auto scrollbar-hide">
                    {services.map((service: any) => (
                      <div
                        key={service.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer group/item",
                          formData.services.includes(service.id)
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-white/50 border-primary/5 hover:border-primary/20"
                        )}
                        onClick={() => toggleService(service.id)}
                      >
                        <div className="flex items-center gap-3">
                          <LayoutGrid className={cn("w-4 h-4", formData.services.includes(service.id) ? "text-white/70" : "text-primary/40")} />
                          <span className="text-xs font-bold">{service.name}</span>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                          formData.services.includes(service.id) ? "bg-white/20" : "bg-primary/5 group-hover/item:bg-primary/10"
                        )}>
                          {formData.services.includes(service.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-4 font-bold uppercase tracking-widest opacity-40">Nenhum serviço disponível</p>
                    )}
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
                    editingPro ? 'Atualizar Dados' : 'Confirmar Cadastro'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid Content */}
      {professionals.length === 0 ? (
        <Card className="glass border-primary/10 border-dashed p-24 text-center rounded-[3rem] animate-scale-in">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <User className="w-12 h-12 text-primary opacity-20" />
            <div className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-full animate-spin-slow" />
          </div>
          <h3 className="text-xl font-black italic tracking-tight mb-2">Sem Especialistas no Momento</h3>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest max-w-xs mx-auto mb-8 opacity-60">
            Comece a montar seu time dos sonhos cadastrando o primeiro profissional agora mesmo.
          </p>
          <Button onClick={openCreateDialog} className="h-12 px-8 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 font-black uppercase tracking-widest text-[10px]">
            Iniciar Cadastro
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((pro: Professional, idx: number) => (
            <Card key={pro.id} className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-[2.5rem] group overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2rem] bg-premium-gradient flex items-center justify-center shadow-xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 relative">
                      <span className="text-3xl font-black text-white italic drop-shadow-lg">
                        {pro.name.charAt(0)}
                      </span>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic tracking-tight group-hover:text-primary transition-colors">{pro.name}</h3>
                      <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mt-1 opacity-70">{pro.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Especialidades</span>
                    <div className="h-[1px] flex-1 mx-4 bg-primary/5" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pro.services && pro.services.length > 0 ? (
                      pro.services.map((serviceId: string) => {
                        const service = services.find((s: any) => s.id === serviceId);
                        return service ? (
                          <div
                            key={serviceId}
                            className="text-[9px] px-3 py-1.5 glass bg-primary/5 border-primary/10 text-primary font-black uppercase tracking-widest rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            {service.name}
                          </div>
                        ) : null;
                      })
                    ) : (
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic py-2">
                        Sem atribuições definidas
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-8 pt-6 border-t border-primary/5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <Button
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[9px] gap-2"
                    onClick={() => openEditDialog(pro)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 w-12 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive flex items-center justify-center transition-all"
                    onClick={() => handleDelete(pro.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
