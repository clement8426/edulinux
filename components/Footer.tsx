import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/5 bg-[#060a10] font-mono">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

          {/* Identité */}
          <div>
            <p className="text-white text-sm font-bold tracking-tight">
              Edu<span className="text-[#a3e635]">Linux</span>
            </p>
            <p className="text-gray-600 text-xs mt-1 leading-relaxed max-w-xs">
              Plateforme pédagogique open-source — Linux, réseau, cybersécurité.
              <br />
              <span className="text-yellow-600/80">Uniquement à but éducatif. Aucun usage commercial ou offensif.</span>
            </p>
          </div>

          {/* Liens légaux */}
          <nav className="flex flex-col gap-1.5 text-xs text-gray-600">
            <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgu" className="hover:text-gray-300 transition-colors">
              Conditions d'utilisation (CGU)
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">
              Politique de confidentialité
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-gray-700 text-xs">
          <p>© {year} EduLinux — Tous droits réservés</p>
          <p className="text-gray-800">
            Les simulations de commandes (nmap, ssh, etc.) sont fictives et à but éducatif uniquement.
          </p>
        </div>
      </div>
    </footer>
  );
}
