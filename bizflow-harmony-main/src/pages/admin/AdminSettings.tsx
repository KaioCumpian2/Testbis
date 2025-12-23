import { useState, useRef } from 'react';
import { Upload, Save, Palette, Clock, Image, Plus, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { themeColor, setThemeColor } = useTheme();
  const {
    name, setName,
    pixKey, setPixKey,
    logo, setLogo,
    portfolioImages, setPortfolioImages,
    timeSlots, setTimeSlots
  } = useEstablishment();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: name,
    pixKey: pixKey,
    themeColor: themeColor
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const handleSave = () => {
    setName(formData.name);
    setPixKey(formData.pixKey);
    setThemeColor(formData.themeColor);
    toast.success('Configuracoes salvas!', {
      description: 'As alteracoes foram aplicadas.'
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo invalido', {
        description: 'Selecione uma imagem PNG, JPG ou SVG'
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'O tamanho maximo e 2MB'
      });
      return;
    }

    // Convert to base64 and save
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setLogo(base64);
      toast.success('Logo atualizada!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo('');
    toast.success('Logo removida');
  };

  const predefinedColors = [
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Laranja', value: '#F97316' },
    { name: 'Vermelho', value: '#EF4444' },
  ];

  const toggleImageActive = (id: string) => {
    setPortfolioImages(
      portfolioImages.map(img => img.id === id ? { ...img, isActive: !img.isActive } : img)
    );
  };

  const removeImage = (id: string) => {
    setPortfolioImages(portfolioImages.filter(img => img.id !== id));
  };

  const addImage = () => {
    if (!newImageUrl || !newImageTitle) {
      toast.error('Preencha URL e titulo da imagem');
      return;
    }
    setPortfolioImages([
      ...portfolioImages,
      { id: `p${Date.now()}`, url: newImageUrl, title: newImageTitle, isActive: true }
    ]);
    setNewImageUrl('');
    setNewImageTitle('');
    toast.success('Imagem adicionada ao portfolio');
  };

  const toggleTimeSlot = (id: string) => {
    setTimeSlots(
      timeSlots.map(slot => slot.id === id ? { ...slot, isActive: !slot.isActive } : slot)
    );
  };

  const addTimeSlot = () => {
    // Validate HH:MM format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(newTimeSlot)) {
      toast.error('Formato invalido', {
        description: 'Use o formato HH:MM (ex: 21:00)'
      });
      return;
    }

    // Check for duplicates
    if (timeSlots.some(slot => slot.time === newTimeSlot)) {
      toast.error('Horario ja existe');
      return;
    }

    // Add and sort
    const newSlots = [
      ...timeSlots,
      { id: `slot-custom-${Date.now()}`, time: newTimeSlot, isActive: true }
    ].sort((a, b) => a.time.localeCompare(b.time));

    setTimeSlots(newSlots);
    setNewTimeSlot('');
    toast.success('Horario adicionado');
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    toast.success('Horario removido');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">CMS do Estabelecimento</h1>
        <p className="text-muted-foreground">Personalize a identidade visual do seu negocio</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Informacoes Basicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Estabelecimento</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome que aparecera para os clientes"
                />
              </div>

              <div className="space-y-2">
                <Label>Chave Pix</Label>
                <Input
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  placeholder="email@exemplo.com ou CPF/CNPJ"
                />
                <p className="text-xs text-muted-foreground">
                  Esta chave sera exibida para os clientes realizarem o pagamento.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Identidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                {logo ? (
                  <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/30">
                    <img
                      src={logo}
                      alt="Logo atual"
                      className="w-16 h-16 rounded-lg object-contain bg-background"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Logo atual</p>
                      <p className="text-xs text-muted-foreground">Clique para alterar</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Alterar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveLogo}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arraste uma imagem ou clique para fazer upload
                    </p>
                    <Button variant="outline" size="sm" type="button">
                      Selecionar Arquivo
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Recomendado: PNG ou SVG, 200x200px minimo (max 2MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cor do Tema</Label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, themeColor: color.value })}
                      className={`w-10 h-10 rounded-xl transition-all ${formData.themeColor === color.value
                        ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-lg'
                        : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Label className="text-sm">Cor personalizada:</Label>
                  <Input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer rounded-lg"
                  />
                  <Input
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="w-28"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Slots Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horarios Disponiveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gerencie os horarios que aparecerao para os clientes. Clique para ativar/desativar.
              </p>

              {/* Add new time slot */}
              <div className="flex gap-2">
                <Input
                  placeholder="HH:MM (ex: 21:00)"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="flex-1"
                  maxLength={5}
                />
                <Button onClick={addTimeSlot} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="relative group">
                    <button
                      onClick={() => toggleTimeSlot(slot.id)}
                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all border ${slot.isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border line-through'
                        }`}
                    >
                      {slot.time}
                    </button>
                    <button
                      onClick={() => removeTimeSlot(slot.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeSlots.filter(s => s.isActive).length} horarios ativos de {timeSlots.length} disponiveis
              </p>
            </CardContent>
          </Card>

          {/* Portfolio Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Portfolio / Vitrine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gerencie as imagens que aparecem na vitrine do app do cliente
              </p>

              {/* Add new image */}
              <div className="flex gap-2">
                <Input
                  placeholder="URL da imagem"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Titulo"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  className="w-32"
                />
                <Button onClick={addImage} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Image list */}
              <div className="space-y-2">
                {portfolioImages.map((image) => (
                  <div
                    key={image.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${image.isActive ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-60'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{image.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{image.url}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleImageActive(image.id)}
                      className="shrink-0"
                    >
                      {image.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(image.id)}
                      className="shrink-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold">Pre-visualizacao</h3>
          <Card className="overflow-hidden">
            <div
              className="p-4"
              style={{ backgroundColor: formData.themeColor + '15' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: formData.themeColor + '20' }}
                >
                  <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h4 className="font-semibold">{formData.name}</h4>
                  <p className="text-xs text-muted-foreground">Agende seu horario</p>
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Servico exemplo</p>
                <p className="font-medium">Corte Feminino</p>
              </div>
              <Button
                className="w-full"
                style={{
                  backgroundColor: formData.themeColor,
                  color: 'white'
                }}
              >
                Agendar Agora
              </Button>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center">
            E assim que seu estabelecimento aparecera para os clientes
          </p>
        </div>
      </div>
    </div>
  );
}
