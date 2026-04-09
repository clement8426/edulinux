'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Email ou mot de passe incorrect.');
    } else {
      window.location.href = next;
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(true);
    setError('');
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(`Connexion ${provider} impossible. Vérifie la configuration Supabase.`);
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Entre ton email pour recevoir un lien magique.'); return; }
    setLoading(true);
    setError('');
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError('Impossible d\'envoyer le lien. Vérifie l\'email.');
    } else {
      setInfo('Lien envoyé ! Vérifie ta boîte mail.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono flex flex-col">

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#a3e635] font-bold tracking-widest text-sm hover:text-[#bef264] transition-colors">
          EDULINUX
        </Link>
        <span className="text-gray-600 text-xs">auth / login</span>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Terminal header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-1.5 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <p className="text-[#a3e635] text-xs tracking-widest uppercase mb-1">Connexion</p>
            {next !== '/' ? (
              <p className="text-yellow-400/80 text-xs">Connecte-toi pour accéder à cet exercice</p>
            ) : (
              <p className="text-gray-500 text-xs">sauvegarde ta progression dans le cloud</p>
            )}
          </div>

          <div className="border border-white/8 rounded-xl bg-[#0d1117] p-6 space-y-4">

            {/* OAuth buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleOAuth('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/6 text-white text-sm py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continuer avec GitHub
              </button>

              <button
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/6 text-white text-sm py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-gray-600 text-xs">ou par email</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Email / password form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-gray-500 text-xs mb-1">email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="toi@example.com"
                  className="w-full bg-[#0a0e17] border border-white/10 focus:border-[#a3e635]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1">mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0e17] border border-white/10 focus:border-[#a3e635]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}
              {info && (
                <p className="text-[#a3e635] text-xs bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-lg px-3 py-2">{info}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            {/* Magic link */}
            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              Recevoir un lien magique par email →
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-5">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-[#a3e635] hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e17]" />}>
      <LoginForm />
    </Suspense>
  );
}
