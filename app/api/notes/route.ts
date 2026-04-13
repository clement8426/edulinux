import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CONTEXT_MAX_LEN = 64;
const CONTENT_MAX_LEN = 50_000; // 50 KB

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const context = searchParams.get('context');

  if (context && context.length > CONTEXT_MAX_LEN) {
    return NextResponse.json({ error: 'context too long' }, { status: 400 });
  }

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

  let context: string, content: string;
  try {
    const body = await req.json() as { context?: unknown; content?: unknown };
    context = String(body.context ?? '');
    content = String(body.content ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!context) {
    return NextResponse.json({ error: 'Missing context' }, { status: 400 });
  }
  if (context.length > CONTEXT_MAX_LEN) {
    return NextResponse.json({ error: 'context too long (max 64)' }, { status: 400 });
  }
  if (content.length > CONTENT_MAX_LEN) {
    return NextResponse.json({ error: 'content too long (max 50000)' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_notes')
    .upsert(
      { user_id: user.id, context, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,context' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
