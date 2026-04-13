import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { validateProgress } = require('@/lib/security');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { checkRateLimit } = require('@/lib/rate-limit');

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`progress:${user.id}`, 60, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data, error } = await supabase
    .from('user_progress').select('*').eq('user_id', user.id).single();
  if (error && error.code !== 'PGRST116')
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ progress: data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`progress:${user.id}`, 60, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { valid, data: validated, errors } = validateProgress(body);
  if (!valid) return NextResponse.json({ error: 'Invalid input', details: errors }, { status: 400 });

  const { error } = await supabase.from('user_progress').upsert({
    user_id:             user.id,
    completed_levels:    validated!.completedLevels,
    current_level:       validated!.currentLevel,
    total_xp:            validated!.totalXP,
    badges:              validated!.badges,
    completed_scenarios: validated!.completedScenarios,
    scenario_steps:      validated!.scenarioSteps,
    updated_at:          new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
