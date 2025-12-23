import { useState } from 'react';
import { Bot, MessageSquare, Calendar, Power, PowerOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { whatsAppAgent, conversationLogs } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminWhatsApp() {
  const [agent, setAgent] = useState(whatsAppAgent);
  const [formData, setFormData] = useState({
    name: agent.name,
    persona: agent.persona,
    tone: agent.tone
  });

  const handleSave = () => {
    setAgent(prev => ({ ...prev, ...formData }));
    toast.success('Configurações salvas!');
  };

  const toggleAgent = () => {
    setAgent(prev => ({ ...prev, isActive: !prev.isActive }));
    toast.success(agent.isActive ? 'Agente pausado' : 'Agente ativado');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp IA</h1>
          <p className="text-muted-foreground">Configure o agente de atendimento automático</p>
        </div>
        <Button
          variant={agent.isActive ? "destructive" : "default"}
          onClick={toggleAgent}
        >
          {agent.isActive ? (
            <>
              <PowerOff className="w-4 h-4 mr-2" />
              Pausar Agente
            </>
          ) : (
            <>
              <Power className="w-4 h-4 mr-2" />
              Ativar Agente
            </>
          )}
        </Button>
      </div>

      {/* Status & Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={cn(
                  "text-lg font-bold",
                  agent.isActive ? "text-emerald-600" : "text-muted-foreground"
                )}>
                  {agent.isActive ? 'Ativo' : 'Pausado'}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                agent.isActive ? "bg-emerald-100" : "bg-muted"
              )}>
                <Bot className={cn(
                  "w-6 h-6",
                  agent.isActive ? "text-emerald-600" : "text-muted-foreground"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversas</p>
                <p className="text-2xl font-bold">{agent.totalConversations}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Gerados</p>
                <p className="text-2xl font-bold">{agent.appointmentsGenerated}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Agente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Agente</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Bia, Sofia, Max"
            />
            <p className="text-xs text-muted-foreground">
              O nome usado pelo agente ao se apresentar aos clientes.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Persona</Label>
            <Textarea
              value={formData.persona}
              onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
              placeholder="Descreva a personalidade do agente..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Descreva quem é o agente e como ele deve se comportar.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tom de Comunicação</Label>
            <Input
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              placeholder="Ex: Amigável, formal, divertido"
            />
            <p className="text-xs text-muted-foreground">
              O estilo de comunicação que o agente deve usar.
            </p>
          </div>

          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Conversation Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Conversas Recentes</CardTitle>
          <p className="text-sm text-muted-foreground">
            {conversationLogs.length} conversas
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversationLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{log.clientPhone}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.messages.length} mensagens • {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.appointmentId && (
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    Agendamento gerado
                  </span>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Conversa - {log.clientPhone}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto space-y-3 p-2">
                      {log.messages.map((msg, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "p-3 rounded-lg max-w-[80%]",
                            msg.role === 'client' 
                              ? "bg-muted ml-0" 
                              : "bg-primary/10 ml-auto"
                          )}
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {msg.role === 'client' ? 'Cliente' : agent.name}
                          </p>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
