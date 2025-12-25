import { useState, useEffect } from 'react';
import { Star, Send, User, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { getPublicReviews, createPublicReview } from '@/lib/api';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
  response?: string;
}

export default function ClientReviews() {
  const { tenantId, isLoading: isEstablishmentLoading } = useEstablishment();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [clientName, setClientName] = useState('');

  const fetchReviews = async () => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const data = await getPublicReviews(tenantId);
      setReviews(data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tenantId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Selecione uma nota de 1 a 5 estrelas');
      return;
    }
    if (clientName.length < 3) {
      toast.error('Informe seu nome');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPublicReview({
        tenantId,
        clientName,
        rating,
        comment
      });

      toast.success('Avaliação enviada!', {
        description: 'Obrigado pelo seu feedback!'
      });

      setDialogOpen(false);
      setRating(0);
      setComment('');
      setClientName('');
      fetchReviews(); // Refresh list
    } catch (error: any) {
      toast.error('Erro ao enviar avaliação', {
        description: error.response?.data?.error || 'Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEstablishmentLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Header & Stats Dashboard */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-premium-gradient p-10 md:p-12 shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-4xl font-black text-white italic tracking-tighter">Voz dos Clientes</h2>
            <p className="text-white/70 font-medium max-w-xs">Nossa reputação é construída em cada detalhe e cada sorriso.</p>
          </div>

          <div className="flex flex-col items-center bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-xl min-w-[200px]">
            <span className="text-5xl font-black text-white italic tracking-tighter mb-2">
              {reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : "5.0"}
            </span>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-amber-300 fill-amber-300" />
              ))}
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{reviews.length} AVALIAÇÕES</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest shadow-2xl shadow-black/10 hover:scale-[1.03] transition-all group">
                <Star className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Avaliar Agora
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-primary/10 rounded-[2.5rem] p-0 overflow-hidden max-w-[450px] animate-scale-in">
              <div className="bg-premium-gradient p-8 text-white text-center">
                <Sparkles className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-2xl font-black italic tracking-tight">Sua Opinião Importa</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mt-1">Como foi sua experiência?</p>
              </div>

              <div className="p-8 space-y-8">
                <div className="text-center space-y-3">
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-all hover:scale-125 focus:outline-none group/star"
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 transition-all duration-300",
                            star <= rating
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                              : "text-muted-foreground/20 group-hover/star:text-amber-400/40"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Clique para dar sua nota</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Seu Nome</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                      <Input
                        placeholder="Como podemos te chamar?"
                        className="pl-11 h-12 glass border-primary/10 rounded-xl focus:border-primary/50 transition-all"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Mensagem (Opcional)</Label>
                    <Textarea
                      placeholder="Conte detalhes do atendimento..."
                      className="glass border-primary/10 rounded-xl focus:border-primary/50 transition-all min-h-[100px] resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-14 bg-premium-gradient text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Publicar Feedback
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Reviews Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {reviews.length === 0 ? (
          <div className="col-span-full py-24 glass rounded-[3rem] border-2 border-dashed border-primary/10 text-center animate-scale-in mx-2">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary opacity-20" />
            </div>
            <h3 className="font-black uppercase tracking-[0.2em] text-foreground mb-2">Primeiro Feedback</h3>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto font-medium">Ainda não temos avaliações. Inaugure nosso mural de elogios!</p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <Card
              key={review.id}
              className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] group overflow-hidden animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                      <span className="text-sm font-black text-white italic">
                        {review.clientName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-black text-base italic tracking-tight">{review.clientName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-primary/30" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-tighter italic">Verificado</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-400/10 px-3 py-1.5 rounded-2xl border border-amber-400/20 group-hover:bg-amber-400/20 transition-colors">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-600">{review.rating.toFixed(1)}</span>
                  </div>
                </div>

                {review.comment && (
                  <div className="relative">
                    <span className="absolute -top-4 -left-2 text-4xl text-primary/10 font-serif italic">"</span>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium italic pr-4 pl-2">
                      {review.comment}
                    </p>
                  </div>
                )}

                {review.response && (
                  <div className="relative mt-4 p-5 glass bg-primary/5 rounded-[1.5rem] border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Resposta VIP</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">{review.response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
