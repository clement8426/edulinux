import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = { title: 'Mentions légales — EduLinux' };

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono flex flex-col">
      <nav className="border-b border-white/5 px-6 py-4">
        <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
          ← EduLinux
        </Link>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 space-y-10">
        <div>
          <p className="text-[#a3e635] text-xs font-bold uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-2xl font-bold text-white">Mentions légales</h1>
          <p className="text-gray-500 text-sm mt-1">Dernière mise à jour : avril 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            Éditeur
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            EduLinux est un projet open-source à but éducatif, développé et maintenu à titre personnel.
            Il ne constitue pas une entreprise, une société ou une entité commerciale.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Pour toute question : <span className="text-[#a3e635]">contact disponible via le dépôt GitHub du projet</span>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            Hébergement
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            La plateforme est hébergée sur <strong className="text-white">Render</strong> (Render Services, Inc.)
            — 525 Brannan St, Suite 300, San Francisco, CA 94107, États-Unis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            Propriété intellectuelle
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Le code source d'EduLinux est publié en open-source. Le contenu pédagogique (exercices, scénarios,
            descriptions) est la propriété de l'auteur. Toute reproduction à des fins commerciales est interdite.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Les marques citées (Linux, SSH, Nmap, etc.) sont la propriété de leurs détenteurs respectifs.
            Leur mention sur cette plateforme est exclusivement à titre pédagogique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            Limitation de responsabilité
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            EduLinux est fourni <strong className="text-white">"tel quel"</strong>, sans garantie d'aucune sorte.
            L'auteur ne saurait être tenu responsable de tout dommage direct ou indirect résultant
            de l'utilisation ou de l'impossibilité d'utilisation de la plateforme.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Les simulations de commandes (nmap, ssh, base64, etc.) sont des environnements fictifs isolés.
            Aucune connexion réelle n'est établie vers des systèmes tiers.
          </p>
        </section>

        <div className="border border-yellow-600/20 bg-yellow-600/5 rounded-lg p-4">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">⚠ Usage éducatif uniquement</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Les connaissances acquises sur EduLinux doivent être utilisées de manière légale et éthique.
            Toute tentative d'appliquer ces techniques sur des systèmes sans autorisation explicite
            est illégale et contraire à l'esprit de cette plateforme.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
