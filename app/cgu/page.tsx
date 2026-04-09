import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = { title: "Conditions d'utilisation — EduLinux" };

export default function CGU() {
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
          <h1 className="text-2xl font-bold text-white">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-500 text-sm mt-1">Dernière mise à jour : avril 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            1. Objet
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            EduLinux est une plateforme d'apprentissage interactive dédiée aux commandes Linux,
            à l'administration système, à la sécurité réseau et à la forensique informatique.
            Elle est accessible gratuitement, sans création de compte obligatoire.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            En accédant à EduLinux, vous acceptez les présentes conditions dans leur intégralité.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            2. But exclusivement éducatif
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            EduLinux est conçu <strong className="text-white">uniquement à des fins pédagogiques</strong>.
            Toutes les commandes, scénarios et simulations proposés visent à enseigner des compétences
            informatiques légitimes dans un environnement sécurisé et isolé.
          </p>
          <ul className="space-y-1.5 pl-4 border-l border-white/8">
            {[
              "Les terminaux sont des environnements sandbox — aucune connexion à des systèmes réels.",
              "Les scénarios de type 'hacking' simulent des situations d'audit légal (pentest autorisé, IR).",
              "Les outils évoqués (nmap, ssh, etc.) sont présentés dans un cadre légal et éthique.",
            ].map((item, i) => (
              <li key={i} className="text-gray-400 text-sm leading-relaxed flex gap-2">
                <span className="text-[#a3e635] flex-shrink-0">›</span> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            3. Engagements de l'utilisateur
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">En utilisant EduLinux, vous vous engagez à :</p>
          <ul className="space-y-1.5 pl-4 border-l border-white/8">
            {[
              "N'utiliser les connaissances acquises qu'à des fins légales et éthiques.",
              "Ne pas tenter de contourner les mesures de sécurité de la plateforme.",
              "Ne pas utiliser EduLinux pour porter atteinte à des systèmes tiers sans autorisation.",
              "Respecter la législation en vigueur dans votre pays concernant la cybersécurité.",
            ].map((item, i) => (
              <li key={i} className="text-gray-400 text-sm leading-relaxed flex gap-2">
                <span className="text-[#a3e635] flex-shrink-0">›</span> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            4. Accès et disponibilité
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            L'accès à EduLinux est gratuit. L'auteur se réserve le droit de modifier, suspendre
            ou interrompre le service à tout moment, sans préavis, notamment pour maintenance ou évolution.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            La progression est sauvegardée localement dans votre navigateur (localStorage).
            Aucune garantie de persistance n'est assurée en cas de suppression des données du navigateur.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            5. Responsabilité
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            L'auteur d'EduLinux ne saurait être tenu responsable :
          </p>
          <ul className="space-y-1.5 pl-4 border-l border-white/8">
            {[
              "De tout usage illégal ou non éthique des connaissances acquises via la plateforme.",
              "Des interruptions de service, pertes de données ou bugs de la plateforme.",
              "Des contenus de sites tiers vers lesquels EduLinux pourrait pointer.",
            ].map((item, i) => (
              <li key={i} className="text-gray-400 text-sm leading-relaxed flex gap-2">
                <span className="text-red-500/70 flex-shrink-0">›</span> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            6. Modification des CGU
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Les présentes CGU peuvent être modifiées à tout moment. La date de dernière mise à jour est
            indiquée en haut de cette page. L'utilisation continue de la plateforme vaut acceptation
            des nouvelles conditions.
          </p>
        </section>

        <div className="border border-yellow-600/20 bg-yellow-600/5 rounded-lg p-4">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">⚠ Rappel important</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            En France, l'accès non autorisé à un système informatique est punissable par l'article 323-1
            du Code pénal (jusqu'à 3 ans d'emprisonnement et 100 000 € d'amende).
            EduLinux vous apprend à défendre les systèmes — pas à les attaquer illégalement.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
