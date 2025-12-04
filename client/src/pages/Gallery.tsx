import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Play, FileText, Loader } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { useFirestoreDocuments } from '@/hooks/useFirestore';
import SEO from '@/components/SEO';

interface GalleryItem {
  id: string;
  type: 'photo' | 'video' | 'poster';
  title: string;
  description: string;
  thumbnail: string;
  url?: string;
}

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch gallery items from Firestore
  const { data: allGalleryItems, loading, error } = useFirestoreDocuments<GalleryItem>(
    'gallery',
    [],
    { realtime: true }
  );

  const filteredItems = allGalleryItems.filter(
    (item) => selectedType === 'all' || item.type === selectedType
  );

  const photos = filteredItems.filter((item) => item.type === 'photo');

  const handlePhotoClick = (index: number) => {
    const photoIndex = photos.findIndex(
      (photo) => photo.id === filteredItems[index].id
    );
    setSelectedIndex(photoIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SEO
        title="Galeria"
        description="Fotos e vídeos dos eventos da Rodactiva."
      />
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Galeria</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Reviva os melhores momentos dos nossos eventos
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
              className={selectedType === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              Todos
            </Button>
            <Button
              variant={selectedType === 'photo' ? 'default' : 'outline'}
              onClick={() => setSelectedType('photo')}
              className={selectedType === 'photo' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Image className="w-4 h-4 mr-2" />
              Fotos
            </Button>
            <Button
              variant={selectedType === 'video' ? 'default' : 'outline'}
              onClick={() => setSelectedType('video')}
              className={selectedType === 'video' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Play className="w-4 h-4 mr-2" />
              Vídeos
            </Button>
            <Button
              variant={selectedType === 'poster' ? 'default' : 'outline'}
              onClick={() => setSelectedType('poster')}
              className={selectedType === 'poster' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              Cartazes
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-orange-600 animate-spin" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">Carregando galeria...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600 dark:text-red-400">
                Erro ao carregar galeria: {error.message}
              </p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                    {item.type === 'poster' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                        <FileText className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {item.description}
                    </p>
                    {item.type === 'photo' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handlePhotoClick(index)}
                      >
                        Ver Foto
                      </Button>
                    )}
                    {item.type === 'video' && item.url && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        Ver Vídeo
                      </Button>
                    )}
                    {item.type === 'poster' && item.url && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        Descarregar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Nenhum item de galeria disponível no momento.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        open={selectedIndex >= 0}
        close={() => setSelectedIndex(-1)}
        slides={photos.map((photo) => ({
          src: photo.url || photo.thumbnail,
          title: photo.title,
        }))}
        index={selectedIndex}
      />
    </div>
  );
}
