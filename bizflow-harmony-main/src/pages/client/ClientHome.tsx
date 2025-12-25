import { Link } from 'react-router-dom';
import { Calendar, Clock, Phone, Star, ChevronRight, Sparkles, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useState, useEffect } from 'react';
import { getServices, getProfessionals, getPublicReviews } from '@/lib/api';
import { Service, Professional } from '@/types';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ClientHome() {
  const { portfolioImages, workingHours, slug, tenantId, isLoading: isEstablishmentLoading } = useEstablishment();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [servicesData, professionalsData, reviewsData] = await Promise.all([
            getServices(tenantId),
            getProfessionals(tenantId),
            getPublicReviews(tenantId)
          ]);
          setServices(servicesData);
          setProfessionals(professionalsData || []);
          setReviews(reviewsData || []);
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
  const displayRating = reviews.length > 0 ? avgRating.toFixed(1) : '5.0'; // Still default to 5.0 for aesthetic if empty, or hide? Let's keep 5.0 as "New" status often implies 5 stars potential or hide it.
  // Actually, requested to be "Real". If 0 reviews, show "Novo" or 0.
  const hasReviews = reviews.length > 0;

  if (isEstablishmentLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        {/* Using Loader2 for consistent UI */}
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      {/* Hero Section - High WOW Factor */}
      <section className="relative overflow-hidden rounded-[3rem] bg-premium-gradient p-12 md:p-20 text-center space-y-8 shadow-2xl shadow-primary/30 group border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl border border-white/10 animate-slide-up">
            {hasReviews ? (
              <>
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-shadow-sm">{displayRating} • {reviews.length} Clientes Satisfeitos</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-primary fill-primary animate-pulse" />
                <span className="text-shadow-sm">Sua Nova Experiência Premium</span>
              </>
            )}
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.9] animate-slide-up text-shadow-lg" style={{ animationDelay: '0.1s' }}>
            Transforme seu visual <br className="hidden md:block" /> com perfeição
          </h1>
          <p className="text-white font-bold text-xl md:text-2xl leading-relaxed animate-slide-up text-shadow-sm max-w-2xl mx-auto opacity-90" style={{ animationDelay: '0.2s' }}>
            Agende agora em segundos e descubra por que somos a escolha número um da região.
          </p>
          <div className="pt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="h-20 px-12 rounded-[1.5rem] bg-white text-primary hover:bg-white/95 font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-black/20 hover:scale-[1.05] transition-all group/btn active:scale-95">
              <Link to={`${base}/booking`}>
                <Calendar className="w-6 h-6 mr-4 group-hover/btn:rotate-12 transition-transform" />
                Reservar Horário Agora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-dark border-white/10 shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden relative group cursor-pointer rounded-[2.5rem]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:rotate-12 transition-transform shadow-inner">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Aberto Hoje</p>
            <p className="text-xl font-black text-white italic tracking-tight">{workingHours.open} - {workingHours.close}</p>
          </CardContent>
        </Card>

        <Card className="glass-dark border-white/10 shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden relative group cursor-pointer rounded-[2.5rem]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:-rotate-12 transition-transform shadow-inner">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">WhatsApp</p>
            <p className="text-xl font-black text-white italic tracking-tight">Atendimento VIP</p>
          </CardContent>
        </Card>

        {/* Portfolio Mini Gallery */}
        <section className="col-span-2 space-y-5">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">O QUE FAZEMOS</h3>
            <Link to={`${base}/portfolio`} className="text-[10px] font-black uppercase text-primary tracking-widest hover:brightness-125 hover:translate-x-1 transition-all">FULL GALERIA <ChevronRight className="w-3 h-3 inline ml-1" /></Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide px-4">
            {activePortfolio.map((image, idx) => (
              <div key={image.id} className="flex-shrink-0 w-36 h-36 rounded-[2rem] overflow-hidden glass border-4 border-white/10 shadow-2xl hover:scale-105 transition-all cursor-pointer relative group" style={{ animationDelay: `${idx * 0.1}s` }}>
                <img src={image.url} alt={image.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
            <Link
              to={`${base}/portfolio`}
              className="flex-shrink-0 w-36 h-36 rounded-[2rem] glass-dark flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 hover:border-primary/50 transition-all hover:bg-primary/5 group"
            >
              <Image className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-primary">Ver +</span>
            </Link>
          </div>
        </section>
      </section>

      {/* Services Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Serviços Estelares</h3>
          <Link to={`${base}/booking`} className="text-xs font-black uppercase text-primary tracking-widest">Todos <ChevronRight className="w-4 h-4 inline" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {featuredServices.length === 0 ? (
            <div className="col-span-full py-20 glass rounded-[2.5rem] text-center border-2 border-dashed border-primary/5">
              <Sparkles className="w-12 h-12 text-primary opacity-20 mx-auto mb-4" />
              <p className="text-muted-foreground font-black uppercase tracking-widest">Em breve novidades...</p>
            </div>
          ) : featuredServices.map((service, idx) => (
            <Card key={service.id} className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] group-hover:bg-primary/10 transition-colors" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black italic tracking-tight group-hover:text-primary transition-colors">{service.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-[80%]">{service.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-primary" />
                        {service.duration} MIN
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary italic">
                      R$ {Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Showcase */}
      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Nossa Equipe</h3>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-2">
          {professionals.length === 0 ? (
            <div className="w-full py-10 glass rounded-3xl text-center border border-primary/5">
              <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-50">Equipe em formação</p>
            </div>
          ) : professionals.map((pro, idx) => (
            <div key={pro.id} className="flex-shrink-0 text-center space-y-3 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="w-20 h-20 rounded-[2rem] bg-premium-gradient flex items-center justify-center mx-auto shadow-xl group cursor-pointer overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                  <span className="text-2xl font-black text-white italic">
                    {pro.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-black italic tracking-tight">{pro.name}</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{pro.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof - Reviews */}
      {reviews.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">O que dizem</h3>
            <Link to={`${base}/reviews`} className="text-xs font-black uppercase text-primary tracking-widest hover:underline">Ver todas</Link>
          </div>
          <div className="grid gap-4">
            {reviews.slice(0, 2).map((review) => (
              <Card key={review.id} className="glass border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/5">
                        <span className="text-xs font-black text-primary">{review.clientName.charAt(0)}</span>
                      </div>
                      <div>
                        <span className="font-black text-sm block italic">{review.clientName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Cliente Verificado</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 scale-90">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating
                            ? 'text-amber-400 fill-amber-400 shadow-sm'
                            : 'text-muted-foreground/30'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 font-medium leading-relaxed italic pr-4">"{review.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
