import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const payload = {
    user_id: user.id,
    completed_levels: body.completedLevels ?? [],
    current_level: body.currentLevel ?? 1,
    total_xp: body.totalXP ?? 0,
    badges: body.badges ?? [],
    completed_scenarios: body.completedScenarios ?? [],
    scenario_steps: body.scenarioSteps ?? {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_progress')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
