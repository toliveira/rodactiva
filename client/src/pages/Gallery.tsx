import { useState, useEffect } from 'react';
import { getGalleries } from '@/api/gallery';
import { Gallery, GalleryMedia } from '@/types/gallery';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import SEO from '@/components/SEO';

// Define custom slide type
type CustomSlide = {
  type: 'youtube' | 'image' | 'video';
  src: string;
  thumbnail?: string;
  index?: number;
  sources?: { src: string; type: string }[];
};

const ITEMS_PER_PAGE = 30;

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentGalleryMedia, setCurrentGalleryMedia] = useState<GalleryMedia[]>([]);

  // Pagination state per gallery
  const [pageState, setPageState] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGalleries();
        setGalleries(data);
        // Initialize pagination state
        const initialPages: Record<string, number> = {};
        data.forEach(g => initialPages[g.id] = 1);
        setPageState(initialPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMediaClick = (media: GalleryMedia[], index: number) => {
    setCurrentGalleryMedia(media);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const loadMore = (galleryId: string) => {
    setPageState(prev => ({
      ...prev,
      [galleryId]: (prev[galleryId] || 1) + 1
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 min-h-screen">
      <SEO title="Galeria" description="Galeria de fotos e vídeos da Rodactiva" />

      <h1 className="text-4xl font-bold mb-8 text-center">Galeria</h1>

      {galleries.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhuma galeria encontrada.</p>
      ) : (
        <Accordion type="single" collapsible defaultValue={galleries[0]?.id} className="w-full space-y-4">
          {galleries.map((gallery) => {
            const currentPage = pageState[gallery.id] || 1;
            const displayedMedia = gallery.media?.slice(0, currentPage * ITEMS_PER_PAGE) || [];
            const hasMore = (gallery.media?.length || 0) > displayedMedia.length;

            return (
              <AccordionItem key={gallery.id} value={gallery.id} className="border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xl font-semibold">{gallery.name}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {new Date(gallery.date).toLocaleDateString()} • {gallery.media?.length || 0} items
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {gallery.description && (
                    <p className="text-muted-foreground mb-6">{gallery.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayedMedia.map((item, index) => (
                      <Card
                        key={item.id}
                        className="overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group relative aspect-square p-0"
                        onClick={() => handleMediaClick(gallery.media, index)}
                      >
                        <CardContent className="p-0 h-full">
                          <img
                            src={item.type === 'video' ? item.thumbnail : item.url}
                            alt="Gallery Item"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                              <Play className="w-10 h-10 text-white fill-white opacity-80" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="flex justify-center mt-8">
                      <Button onClick={() => loadMore(gallery.id)} variant="outline">
                        Carregar mais
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={currentGalleryMedia.map((item, index) =>
        ({
          type: item.type === 'video' ? 'youtube' : 'image',
          src: item.url,
          thumbnail: item.thumbnail,
          index
        } as CustomSlide)
        ) as any}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
        render={{
          slide: ({ slide: s, rect }) => {
            const slide = s as CustomSlide;
            if (slide.type === 'youtube') {
              const isCurrent = slide.index === lightboxIndex;

              if (!isCurrent) {
                return (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    {slide.thumbnail && (
                      <img
                        src={slide.thumbnail}
                        alt="Video thumbnail"
                        className="max-w-full max-h-full object-contain opacity-50"
                      />
                    )}
                    <Play className="absolute w-12 h-12 text-white opacity-80" />
                  </div>
                );
              }

              const url = slide.src as string;
              let videoId = '';
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
              const match = url.match(regExp);
              if (match && match[2].length === 11) videoId = match[2];

              const width = Math.min(rect.width, 1280);
              const height = (width * 9) / 16; // 16:9 aspect ratio

              return (
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    width={width}
                    height={Math.min(height, rect.height)}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="max-w-full max-h-full"
                  ></iframe>
                </div>
              );
            }
            return undefined;
          }
        }}
      />
    </div>
  );
}
