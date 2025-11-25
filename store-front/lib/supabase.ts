import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Supabase client will not be initialized.');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
  : {} as any;

// Set Supabase session after login
export const setSupabaseSession = async (session: { access_token: string; refresh_token: string }) => {
  if (session?.access_token && session?.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (error) {
      console.error('Failed to set Supabase session:', error);
      return false;
    }

    console.log('✅ Supabase session set successfully');
    return true;
  }
  return false;
};

// Get authenticated Supabase client
export const getAuthenticatedSupabase = () => {
  return supabase;
};
