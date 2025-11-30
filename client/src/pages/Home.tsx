import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import { useFirestoreDocuments } from '@/hooks/useFirestore';
import { Helmet } from 'react-helmet-async';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  difficulty: string;
  distance?: string;
  participants?: number;
  image?: string;
}

export default function Home() {
  // Fetch featured events from Firestore (limit to 3)
  const { data: allEvents } = useFirestoreDocuments<Event>(
    'events',
    [],
    { realtime: true }
  );

  const featuredEvents = allEvents.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Rodactiva - Desporto de Aventura em Castro Marim</title>
        <meta name="description" content="Associação de Desporto de Aventura em Castro Marim. Eventos de BTT, Trail Running e muito mais. Junte-se a nós!" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hero-background.jpg"
            alt="Cyclist at sunset"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-orange-900/50 dark:from-slate-950/80 dark:via-slate-950/70 dark:to-orange-950/60"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-orange-500/80 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-4">
              🚴 Bem-vindo à Rodactiva
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-center">
            Desafie seus <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Limites</span>
          </h1>

          <p className="text-xl text-white/90 text-center mb-8 max-w-2xl mx-auto">
            Associação de Desporto de Aventura em Castro Marim. Eventos de BTT, Trail Running e muito mais.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/activities">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
                Explorar Eventos <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="px-8 py-3 text-lg">
                Sobre Nós
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">
                10+
              </div>
              <p className="text-white/80">Anos de Experiência</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">
                5K+
              </div>
              <p className="text-white/80">Participantes</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">
                50+
              </div>
              <p className="text-white/80">Eventos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Próximos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Eventos</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Descubra as aventuras que te esperam
            </p>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {featuredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {event.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span>{new Date(event.date).toLocaleDateString('pt-PT')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-semibold">
                        {event.type}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                        {event.difficulty}
                      </span>
                    </div>

                    <Link href="/activities">
                      <Button variant="outline" className="w-full">
                        Saber Mais
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Nenhum evento disponível no momento.
              </p>
            </div>
          )}

          <div className="text-center">
            <Link href="/activities">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                Ver Todos os Eventos <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Por Que Escolher a Rodactiva?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Experiência Comprovada
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Mais de 10 anos organizando eventos de qualidade com segurança e profissionalismo.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Comunidade Ativa
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Junte-se a uma comunidade de aventureiros apaixonados por desporto outdoor.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌲</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Natureza Preservada
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Respeitamos o ambiente e promovemos práticas sustentáveis em todos os eventos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para o Próximo Desafio?
          </h2>
          <p className="text-xl text-orange-50 mb-8">
            Inscreva-se nos nossos eventos e comece a sua aventura com a Rodactiva.
          </p>
          <Link href="/activities">
            <Button className="bg-white hover:bg-slate-100 text-orange-600 px-8 py-3 text-lg font-semibold">
              Explorar Eventos
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
