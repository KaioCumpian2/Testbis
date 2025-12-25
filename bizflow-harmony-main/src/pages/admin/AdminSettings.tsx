import { useState, useRef, useEffect } from 'react';
import { Upload, Save, Palette, Clock, Image, Plus, X, Eye, EyeOff, Trash2, DollarSign, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { setThemeColor: setGlobalTheme } = useTheme();
  const {
    name, setName,
    pixKey, setPixKey,
    logo, setLogo,
    themeColor: establishmentColor,
    portfolioImages, setPortfolioImages,
    timeSlots, setTimeSlots,
    updateSettings // Use the new function
  } = useEstablishment();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: name,
    pixKey: pixKey,
    themeColor: establishmentColor
  });

  // Sync with context when loaded
  useEffect(() => {
    setFormData({
      name: name,
      pixKey: pixKey,
      themeColor: establishmentColor
    });
  }, [name, pixKey, establishmentColor]);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const handleSave = async () => {
    // Basic Pix Validation
    const pix = formData.pixKey.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cpfRegex = /^\d{11}$/;
    const cnpjRegex = /^\d{14}$/;
    const phoneRegex = /^\d{10,13}$/;
    const evpRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const isValidPix = !pix || emailRegex.test(pix) ||
      cpfRegex.test(pix.replace(/\D/g, '')) ||
      cnpjRegex.test(pix.replace(/\D/g, '')) ||
      phoneRegex.test(pix.replace(/\D/g, '')) ||
      evpRegex.test(pix);

    if (!isValidPix) {
      toast.error('Chave Pix inválida', {
        description: 'A chave deve ser um E-mail, CPF, CNPJ, Telefone ou Chave Aleatória válida.'
      });
      return;
    }

    try {
      console.log('🔵 Iniciando salvamento...', {
        publicName: formData.name,
        pixKey: formData.pixKey,
        themeColor: formData.themeColor,
        logoUrl: logo ? 'Logo presente (base64)' : 'Sem logo'
      });

      await updateSettings({
        publicName: formData.name,
        pixKey: formData.pixKey,
        themeColor: formData.themeColor,
        logoUrl: logo
      });

      console.log('✅ Salvamento bem-sucedido!');

      // Also update global theme immediately for visual feedback
      setGlobalTheme(formData.themeColor);

      toast.success('Configurações salvas!', {
        description: 'As alterações foram aplicadas.'
      });
    } catch (error: any) {
      console.error('❌ ERRO AO SALVAR:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Erro ao salvar: ' + (error.response?.data?.error || error.message));
    }
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

  const handlePortfolioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo invalido', {
        description: 'Selecione uma imagem PNG, JPG ou SVG'
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'O tamanho maximo e 2MB'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPortfolioImages([
        ...portfolioImages,
        { id: `p${Date.now()}`, url: base64, title: file.name.split('.')[0], isActive: true }
      ]);
      toast.success('Imagem adicionada ao portfolio!');
    };
    reader.readAsDataURL(file);

    // Reset input
    if (event.target) event.target.value = '';
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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-6 rounded-2xl border border-primary/10 glass">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Identidade do Negócio</h1>
          <p className="text-muted-foreground mt-1">Gerencie a presença digital e configurações do seu estabelecimento.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('hasSeenTour');
              window.location.reload();
            }}
            className="glass hover:bg-primary/5"
          >
            Aprender a usar
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2 bg-premium-gradient shadow-lg shadow-primary/30 hover:scale-105 transition-all text-white border-primary"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card className="glass border-primary/10 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Palette className="w-5 h-5 text-primary" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome Comercial</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Espaço Harmonia & Beleza"
                  className="glass border-primary/10 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chave Pix (Recebimento)</Label>
                <div className="relative group/pix">
                  <Input
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    placeholder="E-mail, CPF, CNPJ ou Celular"
                    className="glass border-primary/10 focus:border-primary/50 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/pix:opacity-100 transition-opacity">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  * Usado para facilitar o fluxo de confirmação de agendamentos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/10 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Identidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Logotipo da Marca</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                {logo ? (
                  <div className="flex items-center gap-6 p-5 border border-primary/10 rounded-2xl bg-primary/5 glass">
                    <div className="relative group/logo">
                      <img
                        src={logo}
                        alt="Logo atual"
                        className="w-20 h-20 rounded-xl object-contain bg-background shadow-inner transition-transform group-hover/logo:scale-105"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Sua Logo</p>
                      <p className="text-xs text-muted-foreground mt-1">Este símbolo aparecerá no topo da sua vitrine.</p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 text-[10px] glass"
                        >
                          <Upload className="w-3 h-3 mr-1.5" />
                          ALTERAR
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="h-8 text-[10px] text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3 mr-1.5" />
                          REMOVER
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center bg-primary/5 cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/10 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Enviar logotipo</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG (Máx 2MB)</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cor de Destaque (Tema)</Label>
                <div className="flex gap-2.5 flex-wrap">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, themeColor: color.value })}
                      className={`w-9 h-9 rounded-full transition-all border-2 ${formData.themeColor === color.value
                        ? 'border-primary ring-2 ring-primary/20 ring-offset-2 scale-110 shadow-lg'
                        : 'border-transparent hover:scale-110'
                        }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  <div className="relative">
                    <Input
                      type="color"
                      value={formData.themeColor}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      className="w-9 h-9 p-0 cursor-pointer rounded-full border-none overflow-hidden"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="h-8 text-xs font-mono lowercase glass"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Slots Card */}
          <Card className="glass border-primary/10 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Clock className="w-5 h-5 text-primary" />
                Disponibilidade (Horários)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="HH:MM (ex: 18:30)"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="glass border-primary/10 h-10 pr-10"
                    maxLength={5}
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                </div>
                <Button onClick={addTimeSlot} className="bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="relative group/slot animate-scale-in">
                    <button
                      onClick={() => toggleTimeSlot(slot.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${slot.isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-100'
                        : 'bg-muted/30 text-muted-foreground border-border/50 line-through opacity-70'
                        } hover:scale-105 active:scale-95`}
                    >
                      {slot.time}
                    </button>
                    <button
                      onClick={() => removeTimeSlot(slot.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/slot:opacity-100 transition-all scale-75 group-hover/slot:scale-100 flex items-center justify-center shadow-xl z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Card */}
          <Card className="glass border-primary/10 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Image className="w-5 h-5 text-primary" />
                Portfólio & Vitrine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 glass">
                <input
                  type="file"
                  ref={portfolioInputRef}
                  onChange={handlePortfolioUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => portfolioInputRef.current?.click()}
                  variant="outline"
                  className="h-10 w-10 shrink-0 p-0 glass border-primary/20 hover:bg-primary/10"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Ou cole uma URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 h-10 glass border-primary/10 text-xs"
                  />
                  <Input
                    placeholder="Título"
                    value={newImageTitle}
                    onChange={(e) => setNewImageTitle(e.target.value)}
                    className="w-24 h-10 glass border-primary/10 text-xs"
                  />
                  <Button onClick={addImage} className="h-10 bg-primary/80 hover:bg-primary border-none shadow-sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {portfolioImages.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-muted rounded-2xl">
                    <p className="text-sm text-muted-foreground italic">Nenhuma imagem no portfólio ainda.</p>
                  </div>
                ) : (
                  portfolioImages.map((image) => (
                    <div
                      key={image.id}
                      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all animate-fade-in ${image.isActive
                        ? 'border-primary/20 bg-primary/5 glass shadow-sm'
                        : 'border-border/50 bg-muted/20 opacity-60'
                        }`}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-14 h-14 rounded-xl object-cover shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{image.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate opacity-70 italic">{image.url}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleImageActive(image.id)}
                          className={`h-9 w-9 rounded-xl ${image.isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          {image.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(image.id)}
                          className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Preview Frame */}
        <div className="lg:sticky lg:top-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Vista do Cliente
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">Preview Ao Vivo</span>
          </div>

          <div className="relative mx-auto w-[300px] h-[600px] border-[8px] border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden bg-background ring-4 ring-slate-800 animate-slide-up">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />

            <div className="h-full overflow-y-auto overflow-x-hidden pt-8 pb-10 custom-scrollbar">
              {/* Client Storefront Header Mock */}
              <div
                className="p-6 transition-colors duration-500"
                style={{ backgroundColor: formData.themeColor + '10' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-xl glass-dark transition-all"
                    style={{ borderColor: formData.themeColor + '40' }}
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <Palette className="w-8 h-8 text-primary opacity-50" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-lg leading-tight truncate w-32 text-white italic text-shadow-sm">{formData.name || 'Seu Negócio'}</h4>
                    <p className="text-[10px] text-primary uppercase font-black tracking-[0.2em] mt-1 drop-shadow-sm">Agendamento Online</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="w-20 h-1 bg-primary/20 rounded-full mb-4" />
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-4">Serviços Sugeridos</p>
                  <div className="p-5 glass-dark rounded-[1.5rem] border border-white/10 shadow-2xl space-y-4 relative overflow-hidden group">
                    <div
                      className="absolute top-0 right-0 w-20 h-20 bg-primary opacity-10 rounded-bl-full"
                      style={{ backgroundColor: formData.themeColor }}
                    />
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[9px] font-black text-primary px-2.5 py-1 bg-primary/20 rounded-full uppercase tracking-widest" style={{ color: formData.themeColor, backgroundColor: formData.themeColor + '20' }}>Populares</span>
                      <span className="font-black text-white italic text-shadow-sm">R$ 80,00</span>
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-sm text-white italic text-shadow-sm">Corte + Barba Premium</p>
                      <p className="text-[10px] text-white/70 font-medium mt-1 line-clamp-2">Experiência completa com toalha quente e massagem.</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-14 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] transition-all border border-white/10"
                  style={{
                    backgroundColor: formData.themeColor,
                    color: 'white',
                    boxShadow: `0 10px 20px -5px ${formData.themeColor}66`
                  }}
                >
                  Agendar horário agora
                </Button>

                {portfolioImages.filter(i => i.isActive).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Galeria</p>
                    <div className="grid grid-cols-2 gap-2">
                      {portfolioImages.filter(i => i.isActive).slice(0, 4).map(img => (
                        <div key={img.id} className="aspect-square rounded-xl overflow-hidden glass border border-primary/5">
                          <img src={img.url} className="w-full h-full object-cover" alt="portfolio" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-900/10 rounded-full" />
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic font-medium">
            * Este é um modelo interativo do que seus clientes encontrarão.
          </p>
        </div>
      </div>
    </div>
  );
}
