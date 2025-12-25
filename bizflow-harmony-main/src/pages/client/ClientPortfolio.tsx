import { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Maximize2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEstablishment } from '@/contexts/EstablishmentContext';

export default function ClientPortfolio() {
  const { portfolioImages } = useEstablishment();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const activeImages = portfolioImages.filter(img => img.isActive);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header with Sparkles */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-primary/10 mb-2 relative group">
          <ImageIcon className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter bg-premium-gradient bg-clip-text text-transparent">
          Galeria de Estilo
        </h2>
        <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] max-w-[250px] mx-auto leading-relaxed border-t border-primary/10 pt-4">
          Inspire-se com as transformações realizadas por nossos especialistas
        </p>
      </div>

      {/* Gallery Grid - Masonry-like spacing */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
        {activeImages.map((image, idx) => (
          <Card
            key={image.id}
            className="overflow-hidden cursor-pointer group glass border-primary/5 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-700 animate-slide-up"
            style={{ animationDelay: `${idx * 0.1}s` }}
            onClick={() => setSelectedImage(image.url)}
          >
            <CardContent className="p-0 relative aspect-[3/4]">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 scale-50 group-hover:scale-100 transition-transform duration-500">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {image.title}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeImages.length === 0 && (
        <div className="text-center py-32 glass rounded-[3rem] border-2 border-dashed border-primary/10 mx-2">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-primary opacity-20" />
          </div>
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Galeria em construção</p>
        </div>
      )}

      {/* Premium Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all z-[110] border border-white/10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-4xl h-full flex items-center justify-center animate-scale-in">
            <img
              src={selectedImage}
              alt="Portfolio Expansion"
              className="max-w-full max-h-full rounded-3xl object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
