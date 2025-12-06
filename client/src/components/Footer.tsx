import { Link } from 'wouter';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <img
                src="/rodactiva-logo.png"
                alt="Rodactiva Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-slate-400">
              Associação de Desporto de Aventura dedicada a promover eventos de BTT, Trail Running e outras atividades outdoor em Castro Marim.
            </p>
          </div>

          {/* Spacer to maintain alignment */}
          <div className="hidden md:block"></div>          {/* Useful Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.cm-castromarim.pt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-400"
                >
                  Câmara Municipal
                </a>
              </li>
              <li>
                <a
                  href="https://www.federacaociclismo.pt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-400"
                >
                  Federação Portuguesa de Ciclismo
                </a>
              </li>
              <li>
                <a
                  href="https://www.icnf.pt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-400"
                >
                  ICNF
                </a>
              </li>
              <li>
                <a
                  href="http://www.jf-castromarim.pt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-400"
                >
                  Junta de Freguesia de Castro Marim
                </a>
              </li>
              <li>
                <a
                  href="http://www.odiana.pt/homepage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-400"
                >
                  Odiana
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacte-nos</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                <a
                  href="mailto:rodactiva.geral@gmail.com"
                  className="text-slate-400 hover:text-orange-400"
                >
                  rodactiva.geral@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-slate-400">Castro Marim, Algarve</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/profile.php?id=100064405251354"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-orange-400"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UCTrjnZhzJx0T-eSZGQZmD0w"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-orange-400"
                  >
                    <FaYoutube className="w-5 h-5" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>&copy; 2025 Rodactiva. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy">
                <span className="hover:text-orange-400 cursor-pointer">Privacidade</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-orange-400 cursor-pointer">Termos</span>
              </Link>
              <Link href="/private">
                <span className="hover:text-orange-400 cursor-pointer">Área Privada</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
