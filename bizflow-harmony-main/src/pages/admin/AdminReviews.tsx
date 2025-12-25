import { useState } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getAdminReviews } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminReviews() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => getAdminReviews(),
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter((r: any) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r: any) => r.rating === rating).length / reviews.length) * 100
      : 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground">O que seus clientes estão dizendo</p>
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
            <div className="flex flex-col justify-center h-full space-y-4">
              <h3 className="font-semibold text-lg">Resumo de Feedback</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  As avaliações refletem a experiência dos seus clientes.
                  Use esses dados para melhorar seus serviços e agasajar seus profissionais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma avaliação recebida ainda.
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {(review.user?.name || 'C').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{review.user?.name || 'Cliente'}</p>
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

                    <p className="text-sm italic text-muted-foreground">
                      Serviço: <span className="font-medium text-foreground">{review.service?.name}</span> •
                      Profissional: <span className="font-medium text-foreground">{review.professional?.name}</span>
                    </p>

                    <p className="text-sm">{review.comment || 'Sem comentário.'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
