import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Clock, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAdminServices, createService, updateService, deleteService } from '@/lib/api';

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
    queryFn: getAdminServices
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Serviço criado!');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('❌ Erro ao criar serviço:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao criar serviço';
      toast.error(errorMsg);
    }
  });

  // Update mutation
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

  // Delete mutation
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
      toast.error('Preencha todos os campos obrigatórios');
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

  // Group services by category
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
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Corte Feminino"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o serviço"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (min) *</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Cabelo, Unhas, Bem-estar"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nenhum serviço cadastrado</h3>
              <p className="text-muted-foreground">
                Comece adicionando seu primeiro serviço
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Serviço
            </Button>
          </div>
        </Card>
      )}

      {/* Services by Category */}
      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryServices.map((service: Service) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{service.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(service)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(service.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {service.duration} min
                    </div>
                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                      <DollarSign className="w-4 h-4" />
                      {Number(service.price || 0).toFixed(2)}
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
