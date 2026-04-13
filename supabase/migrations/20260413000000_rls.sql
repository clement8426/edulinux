-- Activation Row Level Security sur les tables utilisateurs
-- Idempotent : peut être rejoué sans erreur
-- Exécuter dans Supabase SQL Editor ou via : supabase db push

-- ── user_progress ─────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_progress" ON user_progress;
CREATE POLICY "users_own_progress" ON user_progress
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── user_notes ────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_notes" ON user_notes;
CREATE POLICY "users_own_notes" ON user_notes
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Vérification (lancer manuellement) ───────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE tablename IN ('user_progress','user_notes');
-- Résultat attendu : rowsecurity = true pour les deux lignes
