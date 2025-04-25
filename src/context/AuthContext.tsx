import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut as supabaseSignOut } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session when the app loads
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }
      
      if (data && data.user) {
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, error: 'Falha na autenticação' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Erro ao efetuar login' };
    }
  };

  const handleSignUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await signUp(email, password, userData);
      
      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
      }
      
      // O registro foi bem-sucedido
      if (data && data.user) {
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, error: 'Falha no registro' };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Erro ao registrar-se' };
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
      setUser(null);
      navigate('/login');
      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erro ao Desconectar",
        description: error.message || "Não foi possível fazer logout.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 