import { Link } from 'react-router-dom';
import { Calendar, Clock, Phone, Star, ChevronRight, Sparkles, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { reviews } from '@/data/mockData';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useState, useEffect } from 'react';
import { getServices, getProfessionals } from '@/lib/api';
import { Service, Professional } from '@/types';

export default function ClientHome() {
  const { portfolioImages, workingHours, slug, tenantId, isLoading: isEstablishmentLoading } = useEstablishment();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [servicesData, professionalsData] = await Promise.all([
            getServices(tenantId),
            getProfessionals(tenantId)
          ]);
          setServices(servicesData);
          setProfessionals(professionalsData || []);
        } catch (error) {
          console.error('Error fetching home data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [tenantId]);

  const featuredServices = (services || []).slice(0, 4);
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;
  const activePortfolio = (portfolioImages || []).filter(img => img.isActive).slice(0, 3);
  const base = `/s/${slug || 'exemplo'}`;

  if (isEstablishmentLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-center space-y-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-border/50">
            <Star className="w-4 h-4 fill-current" />
            {avgRating.toFixed(1)} - {reviews.length} avaliacoes
          </div>
          <h2 className="text-2xl font-bold text-foreground mt-4">
            Cuide-se com quem entende de voce
          </h2>
          <p className="text-muted-foreground mt-2">
            Agende seu horario de forma rapida e pratica
          </p>
          <Button asChild size="lg" className="w-full mt-4 rounded-xl shadow-lg">
            <Link to={`${base}/booking`}>
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Agora
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick Info */}
      <section className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Horario</p>
              <p className="text-sm font-semibold">{workingHours.open} - {workingHours.close}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contato</p>
              <p className="text-sm font-semibold">(11) 99999</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Portfolio Preview */}
      {activePortfolio.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Nossos Trabalhos</h3>
            </div>
            <Link to={`${base}/portfolio`} className="text-sm text-primary font-medium flex items-center gap-1">
              Ver mais <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {activePortfolio.map((image) => (
              <div key={image.id} className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden shadow-md">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <Link
              to={`${base}/portfolio`}
              className="flex-shrink-0 w-28 h-28 rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary transition-colors"
            >
              <Image className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Ver todos</span>
            </Link>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nossos Servicos</h3>
          <Link to={`${base}/booking`} className="text-sm text-primary font-medium flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid gap-3">
          {featuredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground">{service.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {service.duration} min
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      R$ {Number(service.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Nossa Equipe</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {professionals.map((pro) => (
            <div key={pro.id} className="flex-shrink-0 text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto shadow-sm">
                <span className="text-xl font-bold text-primary">
                  {pro.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{pro.name}</p>
                <p className="text-xs text-muted-foreground">{pro.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Avaliacoes Recentes</h3>
          <Link to={`${base}/reviews`} className="text-sm text-primary font-medium flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {reviews.slice(0, 2).map((review) => (
            <Card key={review.id} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{review.clientName.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-sm">{review.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground'
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
