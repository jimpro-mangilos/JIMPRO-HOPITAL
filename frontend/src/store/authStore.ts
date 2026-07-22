import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface StaffInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  speciality?: string;
  department?: string;
}

interface AppUser {
  id: string;
  email: string;
  role: string;
  staff?: StaffInfo;
}

interface AuthState {
  user: AppUser | null;
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: AppUser | null) => {
    set({ user, isAuthenticated: !!user });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  initialize: async () => {
    set({ isLoading: true });

    // Écouter les changements d'auth Supabase
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Récupérer le profil utilisateur complet
        const { data: userData } = await supabase
          .from('users')
          .select('*, staff(*)')
          .eq('id', session.user.id)
          .single();

        set({
          user: userData as AppUser,
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      }
    });

    // Vérifier la session existante
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      set({ isLoading: false });
    }
  },
}));
