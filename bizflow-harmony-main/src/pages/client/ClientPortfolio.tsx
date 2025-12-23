import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEstablishment } from '@/contexts/EstablishmentContext';

export default function ClientPortfolio() {
  const { portfolioImages } = useEstablishment();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const activeImages = portfolioImages.filter(img => img.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
          <ImageIcon className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Nosso Portfolio</h2>
        <p className="text-muted-foreground">
          Confira alguns dos nossos trabalhos
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-3">
        {activeImages.map((image) => (
          <Card
            key={image.id}
            className="overflow-hidden cursor-pointer group"
            onClick={() => setSelectedImage(image.url)}
          >
            <CardContent className="p-0 relative aspect-square">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-card text-sm font-medium">{image.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma imagem disponivel</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-card/10 hover:bg-card/20 transition-colors"
          >
            <X className="w-6 h-6 text-card" />
          </button>
          <img
            src={selectedImage}
            alt="Portfolio"
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
