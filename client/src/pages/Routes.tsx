import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Download, Clock, TrendingUp, Loader } from 'lucide-react';
import { useFirestoreDocuments } from '@/hooks/useFirestore';
import SEO from '@/components/SEO';

interface Route {
  id: string;
  name: string;
  description: string;
  distance: string;
  elevation: string;
  duration: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  type: 'btt' | 'trail' | 'caminhada';
  gpxUrl?: string;
}

export default function Routes() {
  // Fetch routes from Firestore
  const { data: routes, loading, error } = useFirestoreDocuments<Route>(
    'routes',
    [],
    { realtime: true }
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'médio':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'difícil':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SEO
        title="Percursos GPS"
        description="Descarregue os percursos GPS dos nossos eventos de BTT e Trail."
      />
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
            Percursos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">GPS</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Descarregue os percursos GPS dos nossos eventos
          </p>
        </div>
      </section>

      {/* Routes Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-orange-600 animate-spin" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">Carregando percursos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600 dark:text-red-400">
                Erro ao carregar percursos: {error.message}
              </p>
            </div>
          ) : routes.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {routes.map((route) => (
                <Card
                  key={route.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {route.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(route.difficulty)}`}>
                        {route.difficulty}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {route.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">Distância</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {route.distance}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">Elevação</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {route.elevation}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Duração</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {route.duration}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                          Tipo
                        </div>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {route?.type?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {route.gpxUrl && route.gpxUrl !== '#' ? (
                      <a href={route.gpxUrl} download>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          <Download className="w-4 h-4 mr-2" />
                          Descarregar GPS
                        </Button>
                      </a>
                    ) : (
                      <Button disabled className="w-full bg-slate-400 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Em Breve
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Nenhum percurso disponível no momento.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Como Usar os Percursos GPS
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              Os ficheiros GPS estão disponíveis em formato GPX, compatível com a maioria dos dispositivos GPS e aplicações de navegação.
            </p>
            <p>
              <strong>Aplicações recomendadas:</strong> Strava, Komoot, AllTrails, Garmin Connect, ou qualquer aplicação que suporte ficheiros GPX.
            </p>
            <p>
              Antes de sair, certifique-se de que tem bateria suficiente no seu dispositivo e que descarregou o percurso offline.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
