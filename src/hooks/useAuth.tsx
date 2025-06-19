
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  clinicData: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clinicData, setClinicData] = useState(null);

  useEffect(() => {
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserRole(session.user);
        } else {
          setIsAdmin(false);
          setClinicData(null);
          // Limpar localStorage quando fazer logout
          localStorage.removeItem("cinebaby_clinic");
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Getting existing session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkUserRole(session.user);
      } else {
        setIsAdmin(false);
        setClinicData(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (user: User) => {
    const adminEmail = 'admin@cinebaby.online';
    
    if (user.email === adminEmail) {
      console.log('User is admin:', user.email);
      setIsAdmin(true);
      setClinicData(null);
      localStorage.removeItem("cinebaby_clinic");
    } else {
      // Verificar se é uma clínica válida
      console.log('Checking if user is a clinic:', user.email);
      
      const { data: clinic, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (clinic && !error) {
        console.log('User is clinic:', clinic.name, clinic.id);
        setIsAdmin(false);
        setClinicData(clinic);
        localStorage.setItem("cinebaby_clinic", JSON.stringify(clinic));
      } else {
        console.log('User is not a valid clinic, signing out');
        // Se não é admin nem clínica válida, fazer logout
        await supabase.auth.signOut();
        setIsAdmin(false);
        setClinicData(null);
        localStorage.removeItem("cinebaby_clinic");
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Sign in error:', error);
    }
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out');
    await supabase.auth.signOut();
    localStorage.removeItem("cinebaby_admin");
    localStorage.removeItem("cinebaby_clinic");
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut,
      isAdmin,
      clinicData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
