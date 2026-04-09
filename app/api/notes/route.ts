import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const context = searchParams.get('context'); // e.g. "level-3" or "scenario-1"

  const query = supabase
    .from('user_notes')
    .select('context, content')
    .eq('user_id', user.id);

  if (context) query.eq('context', context);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { context, content } = await req.json();
  if (!context) return NextResponse.json({ error: 'Missing context' }, { status: 400 });

  const { error } = await supabase
    .from('user_notes')
    .upsert(
      { user_id: user.id, context, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,context' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
