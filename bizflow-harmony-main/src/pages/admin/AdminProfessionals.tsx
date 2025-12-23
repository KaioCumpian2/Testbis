import { useState } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { professionals as initialProfessionals, services } from '@/data/mockData';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Professional } from '@/types';

export default function AdminProfessionals() {
  const [professionals, setProfessionals] = useState(initialProfessionals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    services: [] as string[]
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
      services: pro.services
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
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingPro) {
      setProfessionals(prev => prev.map(p => 
        p.id === editingPro.id 
          ? { ...p, ...formData }
          : p
      ));
      toast.success('Profissional atualizado!');
    } else {
      const newPro: Professional = {
        id: Date.now().toString(),
        name: formData.name,
        role: formData.role,
        services: formData.services
      };
      setProfessionals(prev => [...prev, newPro]);
      toast.success('Profissional adicionado!');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    toast.success('Profissional removido!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie sua equipe</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPro ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do profissional"
                />
              </div>
              <div className="space-y-2">
                <Label>Função *</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Ex: Cabeleireira, Manicure"
                />
              </div>
              <div className="space-y-2">
                <Label>Serviços</Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg max-h-[200px] overflow-y-auto">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center gap-2">
                      <Checkbox
                        id={service.id}
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <label 
                        htmlFor={service.id} 
                        className="text-sm cursor-pointer"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>
                {editingPro ? 'Salvar Alterações' : 'Adicionar Profissional'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Professionals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {professionals.map((pro) => (
          <Card key={pro.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {pro.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{pro.name}</h3>
                    <p className="text-sm text-muted-foreground">{pro.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => openEditDialog(pro)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(pro.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Serviços:</p>
                <div className="flex flex-wrap gap-1">
                  {pro.services.map((serviceId) => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <span 
                        key={serviceId}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        {service.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
