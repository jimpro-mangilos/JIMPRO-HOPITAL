import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AppUser {
  id: string;
  email: string;
  role: string;
  staff?: any;
}

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  logout: async () => {
    console.log('[AUTH] logout');
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  initialize: () => {
    console.log('[AUTH] initialize');

    // 1. Quick scan: do we have a session right now?
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] getSession result:', !!session);
      if (session) {
        set({
          user: { id: session.user.id, email: session.user.email || '', role: 'ACCUEIL' },
          isAuthenticated: true,
          isLoading: false,
        });
        // Async: enrich with staff later (fire-and-forget)
        Promise.resolve().then(async () => {
          try {
            const { data } = await supabase.from('users').select('*, staff(*)').eq('id', session.user.id).single();
            if (data) { console.log('[AUTH] profile loaded'); set({ user: data as AppUser }); }
          } catch (_) {}
        });
      } else {
        set({ isLoading: false });
      }
    });

    // 2. Listen for changes
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AUTH] onAuthStateChange:', _event, !!session);
      if (session?.user) {
        set({
          user: { id: session.user.id, email: session.user.email || '', role: 'ACCUEIL' },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },
}));
