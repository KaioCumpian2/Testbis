import { useState, useEffect } from 'react';
import { Bot, MessageSquare, Calendar, Power, PowerOff, Eye, Loader2, Sparkles, Send, Brain, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { conversationLogs } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgentConfigAdmin, updateAgentConfigAdmin } from '@/lib/api';

export default function AdminWhatsApp() {
  const queryClient = useQueryClient();
  const { data: agentConfig, isLoading } = useQuery({
    queryKey: ['agent-config'],
    queryFn: getAgentConfigAdmin
  });

  const [formData, setFormData] = useState({
    agentName: '',
    agentPersonality: '',
    agentTone: 'friendly',
    agentGreeting: ''
  });

  useEffect(() => {
    if (agentConfig) {
      setFormData({
        agentName: agentConfig.agentName,
        agentPersonality: agentConfig.agentPersonality || '',
        agentTone: agentConfig.agentTone,
        agentGreeting: agentConfig.agentGreeting || ''
      });
    }
  }, [agentConfig]);

  const updateMutation = useMutation({
    mutationFn: updateAgentConfigAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-config'] });
      toast.success('Cérebro artificial atualizado!');
    },
    onError: () => {
      toast.error('Erro ao sincronizar com a IA');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter bg-premium-gradient bg-clip-text text-transparent">
            WhatsApp Business IA
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Automação inteligente e fluxo de conversas
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-500/10 p-2 px-4 rounded-2xl glass border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Servidor Ativo</span>
        </div>
      </div>

      {/* Intelligence Dashboard */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { label: 'Status do Agente', value: 'Online', icon: Bot, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Conversas / Mês', value: '1.248', icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Agendamentos IA', value: '412', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' }
        ].map((stat, idx) => (
          <Card key={idx} className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] group overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">{stat.label}</p>
                <p className={cn("text-3xl font-black italic tracking-tighter", stat.color)}>{stat.value}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Agent Configuration */}
        <Card className="lg:col-span-3 glass border-primary/5 shadow-2xl rounded-[3rem] overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-premium-gradient p-8 text-white relative">
            <Brain className="absolute top-4 right-4 w-12 h-12 text-white/10" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black italic tracking-tight">Cérebro do Agente</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Personalidade e comportamento</p>
              </div>
            </div>
          </div>

          <CardContent className="p-8 space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Identidade da IA</Label>
                <div className="relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    value={formData.agentName}
                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                    placeholder="Ex: Sophia, Max..."
                    className="pl-11 h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Tom de Voz</Label>
                <select
                  className="w-full h-12 px-4 rounded-xl glass border-primary/10 focus:border-primary/50 transition-all font-bold text-sm appearance-none outline-none"
                  value={formData.agentTone}
                  onChange={(e) => setFormData({ ...formData, agentTone: e.target.value })}
                >
                  <option value="friendly">Amigável (Informal + Emojis)</option>
                  <option value="formal">Executivo (Sério + Técnico)</option>
                  <option value="casual">Criativo (Jovem + Moderno)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Mensagem de Recepção</Label>
              <Input
                value={formData.agentGreeting}
                onChange={(e) => setFormData({ ...formData, agentGreeting: e.target.value })}
                placeholder="Ex: Olá! Sou a assistente digital da [Loja]. Em que posso te ajudar hoje?"
                className="h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Instruções de Personalidade (Prompt)</Label>
              <Textarea
                value={formData.agentPersonality}
                onChange={(e) => setFormData({ ...formData, agentPersonality: e.target.value })}
                placeholder="Descreva como o agente deve agir, o que deve vender e como lidar com objeções..."
                className="glass border-primary/10 rounded-xl focus:border-primary/50 transition-all min-h-[160px] resize-none font-medium leading-relaxed"
              />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 text-right mt-2">Dica: Use frases claras para melhores resultados</p>
            </div>

            <Button
              className="w-full h-14 bg-premium-gradient text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3" />
                  Sincronizar Inteligência
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Conversation Logs (Mock but themed) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 ml-2">
            <div className="h-8 w-1.5 bg-primary/20 rounded-full" />
            <h2 className="text-xl font-black italic tracking-tight uppercase tracking-widest opacity-80">Timeline IA</h2>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto scrollbar-hide pr-2">
            {conversationLogs.map((log, idx) => (
              <Card
                key={log.id}
                className="glass border-primary/5 hover:border-primary/20 shadow-lg hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden group animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm italic tracking-tight">{log.clientPhone}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          {log.messages.length} interações
                        </p>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass border-primary/10 rounded-[2.5rem] p-0 overflow-hidden max-w-[450px] animate-scale-in">
                        <div className="bg-primary p-6 text-white">
                          <DialogTitle className="text-xl font-black italic tracking-tight truncate">Log de Conversa: {log.clientPhone}</DialogTitle>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto space-y-4 p-6 scrollbar-hide bg-white/30 backdrop-blur-xl">
                          {log.messages.map((msg, i) => (
                            <div
                              key={i}
                              className={cn(
                                "p-4 rounded-[1.5rem] max-w-[85%] relative animate-fade-in shadow-sm",
                                msg.role === 'client'
                                  ? "bg-white border border-primary/5 ml-0 rounded-bl-none"
                                  : "bg-premium-gradient text-white ml-auto rounded-br-none"
                              )}
                            >
                              <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1.5 opacity-40", msg.role !== 'client' && "text-white/60")}>
                                {msg.role === 'client' ? 'Cliente' : (agentConfig?.agentName || 'IA Assistente')}
                              </p>
                              <p className="text-xs font-semibold leading-relaxed">{msg.content}</p>
                              <p className={cn("text-[8px] font-bold mt-2 text-right opacity-30", msg.role !== 'client' && "text-white/40")}>
                                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 bg-white/50 border-t border-primary/5 flex justify-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-40 italic">Transmissão Criptografada</span>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary/30" />
                      <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50">
                        {new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    {log.appointmentId && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Conversão OK</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
