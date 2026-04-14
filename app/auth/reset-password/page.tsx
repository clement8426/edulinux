'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError('Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.');
    } else {
      setSuccess(true);
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
        <span className="text-gray-600 text-xs">auth / reset-password</span>
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
            <p className="text-[#a3e635] text-xs tracking-widest uppercase mb-1">Nouveau mot de passe</p>
            <p className="text-gray-500 text-xs">choisis un mot de passe sécurisé</p>
          </div>

          <div className="border border-white/8 rounded-xl bg-[#0d1117] p-6">

            {success ? (
              <div className="space-y-4 text-center">
                <p className="text-[#a3e635] text-xs bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-lg px-3 py-3">
                  Mot de passe mis à jour avec succès.
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full bg-[#a3e635] hover:bg-[#bef264] text-black text-sm font-bold py-2.5 rounded-lg transition-colors text-center"
                >
                  Se connecter →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-3">
                <div>
                  <label className="block text-gray-500 text-xs mb-1">nouveau mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    className="w-full bg-[#0a0e17] border border-white/10 focus:border-[#a3e635]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs mb-1">confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    className="w-full bg-[#0a0e17] border border-white/10 focus:border-[#a3e635]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mise à jour…' : 'Enregistrer le mot de passe'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-600 mt-5">
            <Link href="/auth/login" className="text-[#a3e635] hover:underline">
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
