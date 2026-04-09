'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = '/';
  };

  if (loading) {
    return <span className="w-6 h-6 rounded-full bg-white/5 animate-pulse block" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="border border-white/15 hover:border-[#a3e635]/50 text-gray-400 hover:text-[#a3e635] px-3 py-1.5 rounded-lg text-xs transition-all"
      >
        Connexion
      </Link>
    );
  }

  const initials = user.email ? user.email[0].toUpperCase() : '?';
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string) ?? (user.user_metadata?.user_name as string) ?? user.email ?? '';
  const displayName = name.length > 16 ? name.slice(0, 16) + '…' : name;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Menu utilisateur"
      >
        {avatar ? (
          <img src={avatar} alt={initials} className="w-7 h-7 rounded-full border border-white/15" />
        ) : (
          <span className="w-7 h-7 rounded-full bg-[#a3e635]/20 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] text-xs font-bold">
            {initials}
          </span>
        )}
        <span className="hidden sm:block text-xs text-gray-400 max-w-[120px] truncate">{displayName}</span>
        <svg className="w-3 h-3 text-gray-600" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-white text-xs font-medium truncate">{name}</p>
            <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/levels"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <span className="text-[#a3e635]">⬡</span> Mes niveaux
            </Link>
            <Link
              href="/scenarios"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <span className="text-[#a3e635]">◈</span> Mes scénarios
            </Link>
          </div>
          <div className="p-1.5 border-t border-white/8">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors text-left"
            >
              <span>↩</span> Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
