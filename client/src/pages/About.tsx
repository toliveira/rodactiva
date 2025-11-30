import { Card } from '@/components/ui/card';
import { Users, Target, Award, Heart, MapPin, Calendar, Bike } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useFirestoreDocuments } from '@/hooks/useFirestore';

export default function About() {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Sobre Nós - Rodactiva</title>
        <meta name="description" content="Conheça a história da RODACTIVA, associação criada em 2011 dedicada à prática de BTT e Ciclismo em Castro Marim, Algarve." />
      </Helmet>

      {/* Hero Section with Background */}
      <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <img
              src="/rodactiva-logo.png"
              alt="Rodactiva Logo"
              className="h-24 w-auto mx-auto object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Sobre a Rodactiva
          </h1>
          <p className="text-xl text-white/90">
            Paixão pelo ciclismo desde 2011
          </p>
        </div>
      </section>

      {/* Quem Somos Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Quem Somos
              </h2>
            </div>

            <Card className="p-8 md:p-10 bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800 dark:to-orange-900/10 border-l-4 border-orange-600">
              <div className="space-y-4 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  A <strong className="text-orange-600 dark:text-orange-400">RODACTIVA</strong> é uma associação criada em <strong>Setembro de 2011</strong> por um grupo de amigos que partilham o mesmo gosto pela prática de BTT e Ciclismo de estrada. Apesar das adversidades destes tempos que correm decidimos avançar com este projecto e desenvolver várias actividades na região do Baixo Guadiana.
                </p>
                <p>
                  Estamos sediados em <strong>Castro Marim</strong>, visto que é um concelho onde a prática do ciclismo quer na versão de BTT como Ciclismo de Estrada tem vindo a aumentar. O Concelho de Castro Marim tem umas condições excelentes para a execução destas modalidades, tanto pela qualidade dos seus caminhos serranos quer pelas estradas asfaltadas, nunca esquecendo o relevo próprio do Sotavento Algarvio.
                </p>
              </div>
            </Card>
          </div>

          {/* Key Facts */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Calendar className="w-10 h-10 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">2011</div>
              <p className="text-slate-600 dark:text-slate-400">Ano de Fundação</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <MapPin className="w-10 h-10 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Castro Marim</div>
              <p className="text-slate-600 dark:text-slate-400">Baixo Guadiana, Algarve</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Bike className="w-10 h-10 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">BTT & Estrada</div>
              <p className="text-slate-600 dark:text-slate-400">Modalidades Principais</p>
            </Card>
          </div>

          {/* Objectivos Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Objectivos
              </h2>
            </div>

            <Card className="p-8 md:p-10 bg-gradient-to-br from-orange-50 to-red-50/30 dark:from-orange-900/10 dark:to-red-900/10 border-l-4 border-orange-600">
              <div className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                <p>
                  A RODACTIVA tem como objectivo desenvolver a prática do desporto no concelho de Castro Marim. Motivados a proteger, defender, promover e divulgar o património cultural, artístico, paisagístico e ambiental no concelho de Castro Marim.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Eventos Diversificados</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Organizar eventos de várias actividades Desportivas, Educativas e Culturais para todas as idades.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Novos Roteiros</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Marcar novos roteiros no concelho para uma melhor divulgação do mesmo a nível recreativo, desportivo e turístico.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Património e Ambiente</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Proteger, defender e promover o património cultural, artístico, paisagístico e ambiental.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Apoio Comunitário</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Auxiliar outras Associações e clubes do concelho, apoiando e promovendo a sua divulgação.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Junte-se à Nossa Comunidade
          </h2>
          <p className="text-xl text-orange-50 mb-8">
            Faça parte da família Rodactiva e descubra as maravilhas do ciclismo em Castro Marim.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/activities" className="inline-block">
              <button className="bg-white hover:bg-slate-100 text-orange-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Ver Eventos
              </button>
            </a>
            <a href="/contact" className="inline-block">
              <button className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Contacte-nos
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function TeamSection() {
  const { data: members, loading, error } = useFirestoreDocuments<any>('members', [], { realtime: true });

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
    </div>
  );

  if (error || !members.length) return null;

  return (
    <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white text-center">
            A Nossa Equipa
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {members.map((member) => (
            <Card
              key={member.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
              <div className="p-6">
                <div className="mb-4">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400 font-semibold mb-3">
                    {member.role}
                  </p>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {member.bio}
                </p>

                <div className="flex flex-wrap gap-2">
                  {member.specialty?.split(', ').map((spec: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
