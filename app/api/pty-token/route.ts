import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Import CJS depuis le même process Node.js (cache require partagé avec server.js)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generatePtyToken } = require('@/lib/security');

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token: string = generatePtyToken(user.id);
  return NextResponse.json({ token });
}
