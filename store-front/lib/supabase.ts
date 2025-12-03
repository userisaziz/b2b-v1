// Supabase client configuration and session management
import { createClient } from '@supabase/supabase-js';

// Get Supabase config from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Set Supabase session from auth response
 * @param sessionData - Session data from backend auth response
 */
export async function setSupabaseSession(sessionData: any) {
  if (!supabase) return;
  
  try {
    // Set the session in Supabase client
    await supabase.auth.setSession({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
    });
  } catch (error) {
    console.error('Error setting Supabase session:', error);
  }
}

/**
 * Clear Supabase session (logout)
 */
export async function clearSupabaseSession() {
  if (!supabase) return;
  
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error clearing Supabase session:', error);
  }
}

export default supabase;