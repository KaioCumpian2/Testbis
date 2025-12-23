import { useState } from 'react';
import { Star, MessageSquare, Eye, EyeOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { reviews as initialReviews } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminReviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [response, setResponse] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

  const handleToggleVisibility = (id: string) => {
    setReviews(prev => prev.map(r => 
      r.id === id ? { ...r, isHidden: !r.isHidden } : r
    ));
    toast.success('Visibilidade alterada');
  };

  const handleRespond = (id: string) => {
    if (!response.trim()) {
      toast.error('Digite uma resposta');
      return;
    }
    setReviews(prev => prev.map(r => 
      r.id === id ? { ...r, response } : r
    ));
    setResponse('');
    setSelectedReviewId(null);
    toast.success('Resposta enviada!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground">Gerencie as avaliações dos clientes</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{avgRating.toFixed(1)}</p>
                <div className="flex justify-center my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= Math.round(avgRating) 
                          ? "text-amber-400 fill-amber-400" 
                          : "text-muted-foreground"
                      )} 
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{reviews.length} avaliações</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-3">{rating}</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {reviews.filter(r => r.response).length}
                </p>
                <p className="text-sm text-muted-foreground">Respondidas</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {reviews.filter(r => !r.response).length}
                </p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {reviews.filter(r => !r.isHidden).length}
                </p>
                <p className="text-sm text-muted-foreground">Visíveis</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-muted-foreground">
                  {reviews.filter(r => r.isHidden).length}
                </p>
                <p className="text-sm text-muted-foreground">Ocultas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className={cn(review.isHidden && "opacity-60")}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {review.clientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{review.clientName}</p>
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
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-sm">{review.comment}</p>

                  {review.response && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Sua resposta:</p>
                      <p className="text-sm">{review.response}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 sm:flex-col">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVisibility(review.id)}
                  >
                    {review.isHidden ? (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Mostrar
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Ocultar
                      </>
                    )}
                  </Button>

                  {!review.response && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Responder
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Responder Avaliação</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium">{review.clientName}</p>
                            <div className="flex items-center gap-1 my-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={cn(
                                    "w-3 h-3",
                                    star <= review.rating 
                                      ? "text-amber-400 fill-amber-400" 
                                      : "text-muted-foreground"
                                  )} 
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                          <Textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Escreva sua resposta..."
                            rows={4}
                          />
                          <Button 
                            className="w-full" 
                            onClick={() => handleRespond(review.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Resposta
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
