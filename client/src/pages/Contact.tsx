import { Card } from '@/components/ui/card';
import { Mail, MapPin, FileText } from 'lucide-react';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import SEO from '@/components/SEO';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SEO
        title="Contactos"
        description="Entre em contacto com a Rodactiva. Estamos disponíveis para esclarecer as suas dúvidas."
      />
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
            Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Contacto</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Estamos aqui para ajudar
          </p>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Info Card */}
          <Card className="p-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  RODACTIVA
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Associação Desportiva, Recreativa, Cultural e Social do Sotavento
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">NIPC</h3>
                    <p className="text-slate-600 dark:text-slate-400">510 009 247</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">E-mail</h3>
                    <a
                      href="mailto:rodactiva.geral@gmail.com"
                      className="text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      rodactiva.geral@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Sede</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Edifício da Antiga Escola Primaria do Rio Seco,<br />
                      Estrada Municipal M1132-1,<br />
                      8950 Castro Marim
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Map */}
          <Card className="overflow-hidden h-[400px] shadow-lg p-0">
            <iframe
              width="100%"
              height="100%"
              src="https://maps.google.com/maps?q=37.22699826503792,-7.492202912634261&t=k&z=17&ie=UTF8&iwloc=&output=embed"
              title="Localização Rodactiva"
              className="w-full h-full transition-all duration-500"
            ></iframe>
          </Card>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Siga-nos nas Redes Sociais
          </h2>

          <div className="flex justify-center gap-6">
            <a
              href="https://www.facebook.com/profile.php?id=100064405251354"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
            <a
              href="https://www.youtube.com/channel/UCTrjnZhzJx0T-eSZGQZmD0w"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FaYoutube className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
