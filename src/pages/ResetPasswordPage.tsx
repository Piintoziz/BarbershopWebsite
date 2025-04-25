import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hashError, setHashError] = useState(false);
  const navigate = useNavigate();

  // Verificar se temos um hash válido na URL
  useEffect(() => {
    const hash = window.location.hash;
    
    if (!hash || !hash.includes('type=recovery')) {
      setHashError(true);
      toast({
        title: "Link inválido",
        description: "O link de recuperação de senha é inválido ou expirou.",
        variant: "destructive",
      });
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // O Supabase pega o token automaticamente da URL
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso!",
      });
      
      // Redirecionar para a página de login após alguns segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível atualizar sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto glass-card p-8 rounded-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Redefinir Senha</h1>
            <p className="text-muted-foreground mb-8">
              {hashError 
                ? "Link inválido ou expirado. Solicite um novo link de recuperação."
                : "Crie uma nova senha para sua conta"}
            </p>
          </div>
          
          {!hashError && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="form-control-wrapper">
                <label htmlFor="password">Nova Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="form-control-wrapper">
                <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black"
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Atualizar Senha'}
              </Button>
            </form>
          )}
          
          {hashError && (
            <div className="mt-6">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black"
              >
                Voltar para Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 