import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Mensagem enviada com sucesso! Obrigado pelo contacto.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
            Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Contacto</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Tem dúvidas? Queremos ouvir de si!
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Mail className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Email
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                rodactiva.trilhos@gmail.com
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Responderemos em 24h
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <MapPin className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Localização
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Castro Marim, Algarve
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Portugal
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Disponibilidade
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Seg - Sex: 09h - 18h
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Fim de semana: Eventos
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Envie-nos uma Mensagem
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="Assunto da mensagem"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
                  placeholder="Sua mensagem..."
                ></textarea>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 font-semibold"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
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
              href="https://www.facebook.com/rodactiva"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <span className="text-xl">f</span>
            </a>
            <a
              href="https://www.youtube.com/rodactiva"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <span className="text-xl">▶</span>
            </a>
            <a
              href="https://www.instagram.com/rodactiva"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <span className="text-xl">📷</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
