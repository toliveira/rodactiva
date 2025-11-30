import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Zap, Filter, Loader } from 'lucide-react';
import { useFirestoreDocuments } from '@/hooks/useFirestore';
import { where } from 'firebase/firestore';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'btt' | 'trail' | 'caminhada' | 'outro';
  difficulty: 'fácil' | 'médio' | 'difícil';
  distance?: string;
  participants?: number;
  image?: string;
  registrationUrl?: string;
}

export default function Activities() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Fetch events from Firestore
  const { data: allActivities, loading, error } = useFirestoreDocuments<Activity>(
    'events',
    [],
    { realtime: true }
  );

  const filteredActivities = allActivities.filter((activity) => {
    const typeMatch = selectedType === 'all' || activity.type === selectedType;
    const difficultyMatch = selectedDifficulty === 'all' || activity.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  });

  const typeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'btt', label: 'BTT' },
    { value: 'trail', label: 'Trail' },
    { value: 'caminhada', label: 'Caminhada' },
    { value: 'outro', label: 'Outro' },
  ];

  const difficultyOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'fácil', label: 'Fácil' },
    { value: 'médio', label: 'Médio' },
    { value: 'difícil', label: 'Difícil' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/events-header.jpg"
            alt="Events Header"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Próximos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Eventos</span>
          </h1>
          <p className="text-xl text-white/90">
            Descubra as aventuras que te esperam
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filtrar</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Tipo de Evento
              </label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedType === option.value ? 'default' : 'outline'}
                    onClick={() => setSelectedType(option.value)}
                    className={selectedType === option.value ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Dificuldade
              </label>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedDifficulty === option.value ? 'default' : 'outline'}
                    onClick={() => setSelectedDifficulty(option.value)}
                    className={selectedDifficulty === option.value ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-orange-600 animate-spin" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">Carregando eventos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600 dark:text-red-400">
                Erro ao carregar eventos: {error.message}
              </p>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredActivities.map((activity) => (
                <Card
                  key={activity.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {activity.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {activity.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span>{new Date(activity.date).toLocaleDateString('pt-PT')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span>{activity.location}</span>
                      </div>
                      {activity.distance && (
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          <span>{activity.distance}</span>
                        </div>
                      )}
                      {activity.participants && (
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          <span>~{activity.participants} participantes</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-semibold">
                        {activity.type}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                        {activity.difficulty}
                      </span>
                    </div>

                    {activity.registrationUrl && activity.registrationUrl !== '#' ? (
                      <a href={activity.registrationUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          Inscrever-se
                        </Button>
                      </a>
                    ) : (
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Saber Mais
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Nenhum evento encontrado com os filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
