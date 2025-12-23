import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { reviews, appointments } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ClientReviews() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const completedWithoutReview = appointments.filter(
    a => a.status === 'completed' && !reviews.find(r => r.appointmentId === a.id)
  );

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota');
      return;
    }
    toast.success('Avaliação enviada!', {
      description: 'Obrigado pelo seu feedback!'
    });
    setRating(0);
    setComment('');
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Avaliações</h2>
        {completedWithoutReview.length > 0 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                Avaliar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Avaliar Atendimento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Como foi sua experiência?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star 
                          className={cn(
                            "w-8 h-8 transition-colors",
                            star <= rating 
                              ? "text-amber-400 fill-amber-400" 
                              : "text-muted-foreground"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Conte-nos mais sobre sua experiência (opcional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button className="w-full" onClick={handleSubmitReview}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Avaliação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Pending Reviews Alert */}
      {completedWithoutReview.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm">
              Você tem <strong>{completedWithoutReview.length}</strong> atendimento(s) para avaliar!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Minhas Avaliações</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Você ainda não fez nenhuma avaliação
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= review.rating 
                            ? "text-amber-400 fill-amber-400" 
                            : "text-muted-foreground"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm">{review.comment}</p>
                {review.response && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Resposta do estabelecimento
                    </p>
                    <p className="text-sm">{review.response}</p>
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
