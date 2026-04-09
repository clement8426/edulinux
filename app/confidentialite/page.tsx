import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = { title: 'Politique de confidentialité — EduLinux' };

export default function Confidentialite() {
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
          <h1 className="text-2xl font-bold text-white">Politique de confidentialité</h1>
          <p className="text-gray-500 text-sm mt-1">Dernière mise à jour : avril 2025</p>
        </div>

        <div className="border border-[#a3e635]/20 bg-[#a3e635]/5 rounded-lg p-4">
          <p className="text-[#a3e635] text-xs font-bold uppercase tracking-widest mb-1">Résumé en une ligne</p>
          <p className="text-gray-200 text-sm leading-relaxed">
            EduLinux ne collecte aucune donnée personnelle. Votre progression est stockée
            uniquement dans votre navigateur, sur votre appareil.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            1. Données collectées
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            EduLinux <strong className="text-white">ne collecte, ne stocke et ne transmet aucune donnée personnelle</strong>
            sur ses serveurs. Il n'y a pas de création de compte, pas de formulaire d'inscription,
            pas de tracking utilisateur.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Les seules données enregistrées sont stockées <strong className="text-white">localement dans votre navigateur</strong>
            via <code className="text-[#a3e635] text-xs bg-black/30 px-1 py-0.5 rounded">localStorage</code> :
          </p>
          <ul className="space-y-1.5 pl-4 border-l border-white/8">
            {[
              { label: 'Progression', detail: 'niveaux et scénarios complétés, XP, badges' },
              { label: 'Notes', detail: 'textes saisis dans l\'onglet Notes de chaque exercice' },
              { label: 'Préférences', detail: 'état du tutoriel (déjà vu ou non)' },
            ].map(({ label, detail }) => (
              <li key={label} className="text-sm leading-relaxed flex gap-2">
                <span className="text-[#a3e635] flex-shrink-0">›</span>
                <span>
                  <span className="text-white font-bold">{label}</span>
                  <span className="text-gray-500"> — {detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            2. Cookies
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            EduLinux n'utilise <strong className="text-white">aucun cookie</strong> de tracking, de publicité
            ou d'analyse comportementale. Aucun outil tiers de type Google Analytics ou Meta Pixel n'est intégré.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            3. Terminal et sessions
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Chaque session de terminal est créée dans un répertoire temporaire isolé sur le serveur,
            détruit à la fermeture de la connexion WebSocket. Aucun historique de commandes n'est conservé
            côté serveur après la déconnexion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            4. Logs serveur
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Comme tout serveur web, Render (hébergeur) peut enregistrer des logs techniques standards
            (adresse IP, horodatage, ressource demandée). Ces logs sont gérés par Render conformément
            à leur propre <Link href="https://render.com/privacy" target="_blank" className="text-[#a3e635] hover:underline">politique de confidentialité</Link>.
            EduLinux n'a pas accès ni ne conserve ces logs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            5. Vos droits (RGPD)
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Dans la mesure où aucune donnée personnelle n'est collectée côté serveur,
            les droits d'accès, rectification et suppression prévus par le RGPD s'exercent
            directement depuis votre navigateur :
          </p>
          <ul className="space-y-1.5 pl-4 border-l border-white/8">
            {[
              "Supprimer le localStorage de votre navigateur efface toute donnée EduLinux.",
              "La navigation en mode privé ne laisse aucune trace après fermeture de la fenêtre.",
            ].map((item, i) => (
              <li key={i} className="text-gray-400 text-sm leading-relaxed flex gap-2">
                <span className="text-[#a3e635] flex-shrink-0">›</span> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            6. Évolution de cette politique
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Si EduLinux venait à intégrer un système d'authentification ou de sauvegarde cloud
            (voir feuille de route), cette politique sera mise à jour avant tout déploiement,
            avec information explicite des utilisateurs.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
