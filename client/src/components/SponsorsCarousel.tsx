import { useEffect, useState } from 'react';
import httpClient from '@/lib/http';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import AutoScroll from 'embla-carousel-auto-scroll';

// Flag to toggle between mockup and real data
const USE_MOCKUP_DATA = false;

type Sponsor = {
  id: string;
  title: string;
  imageUrl: string;
  websiteUrl: string;
};

export default function SponsorsCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    const fetchSponsors = async () => {
      if (USE_MOCKUP_DATA) {
        // Generate 20 mockup sponsors
        const mockData: Sponsor[] = Array.from({ length: 20 }).map((_, i) => ({
          id: `mock-${i}`,
          title: `Sponsor ${i + 1}`,
          imageUrl: `https://placehold.co/200x100/e2e8f0/1e293b?text=Sponsor+${i + 1}`,
          websiteUrl: '#',
        }));
        setSponsors(mockData);
      } else {
        try {
          const response = await httpClient.get<Sponsor[]>('/api/sponsors');
          setSponsors(response.data);
        } catch (error) {
          console.error('Error fetching sponsors:', error);
        }
      }
    };

    fetchSponsors();
  }, []);

  if (sponsors.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 py-8">
      <div className="w-full">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
          plugins={[
            AutoScroll({
              speed: 2,
              stopOnInteraction: false,
              stopOnMouseEnter: false,
            }),
          ]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4 py-8">
            {sponsors.map((sponsor) => (
              <CarouselItem key={sponsor.id} className="pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 hover:z-50 relative">
                <a 
                  href={sponsor.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block h-full transition-transform duration-300 hover:scale-125 relative"
                >
                  <Card className="border-0 shadow-sm bg-white h-full">
                    <CardContent className="flex items-center justify-center p-4 h-24">
                      <img
                        src={sponsor.imageUrl}
                        alt={sponsor.title}
                        className="max-h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </CardContent>
                  </Card>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
