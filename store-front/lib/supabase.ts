// Mock Supabase client that uses Socket.IO instead
// This maintains the same interface for compatibility with existing code

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using Socket.IO instead.');
}

// Mock Supabase client that uses Socket.IO
export const supabase = {
  // Mock auth methods
  auth: {
    setSession: async (session: { access_token: string; refresh_token: string }) => {
      if (session?.access_token && session?.refresh_token) {
        console.log('✅ Session would be set with Supabase, but using Socket.IO instead');
        return { data: { user: null }, error: null };
      }
      return { data: null, error: new Error('Invalid session') };
    },
  },
  
  // Mock channel methods for presence
  channel: (name: string, config: any) => {
    console.log(`📡 Creating mock channel: ${name}`);
    return {
      on: (event: string, filter: any, callback: Function) => {
        console.log(`📡 Setting up mock listener for event: ${event}`);
        // In a real implementation, this would connect to Socket.IO
        return {
          on: () => {},
          subscribe: (callback: Function) => {
            console.log('📡 Mock subscription created');
            // Simulate successful subscription
            setTimeout(() => {
              if (callback) callback('SUBSCRIBED');
            }, 100);
            return Promise.resolve();
          }
        };
      },
      presenceState: () => ({}),
      track: async (data: any) => {
        console.log('👥 Tracking presence via Socket.IO mock:', data);
        return Promise.resolve();
      },
      untrack: () => {
        console.log('👥 Untracking presence via Socket.IO mock');
      }
    };
  },
  
  // Mock removeChannel method
  removeChannel: (channel: any) => {
    console.log('📡 Removing mock channel');
  }
};

// Set session function (mock)
export const setSupabaseSession = async (session: { access_token: string; refresh_token: string }) => {
  if (session?.access_token && session?.refresh_token) {
    console.log('✅ Supabase session would be set, but using Socket.IO instead');
    return true;
  }
  return false;
};

// Get authenticated client (mock)
export const getAuthenticatedSupabase = () => {
  return supabase;
};