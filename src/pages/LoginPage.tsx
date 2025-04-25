import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { resetPassword } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// In a real application, this would be connected to a backend service like Supabase
const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { success, error } = await signIn(credentials.email, credentials.password);
      
      if (success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta à Studio53.",
        });
        
        // Verificar se há um agendamento pendente
        const pendingBooking = sessionStorage.getItem('pendingBooking');
        if (pendingBooking) {
          navigate('/booking');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error(error || 'Falha na autenticação');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Falha no Login",
        description: error.message || "Email ou senha inválidos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsResetting(true);
      const { error } = await resetPassword(resetEmail);
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      
      setResetPasswordOpen(false);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="pt-32 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto glass-card p-8 rounded-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            <p className="text-muted-foreground mb-8">
              Bem-vindo de volta! Faça login para gerenciar seus agendamentos
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="form-control-wrapper">
              <label htmlFor="email">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <div className="flex items-center justify-between">
                <label htmlFor="password">Senha</label>
                <button 
                  type="button"
                  onClick={() => {
                    setResetEmail(credentials.email);
                    setResetPasswordOpen(true);
                  }}
                  className="text-sm text-barber-gold hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-barber-gold hover:underline">
                Registre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Dialog de recuperação de senha */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#111] border-[#333]">
          <DialogHeader>
            <DialogTitle>Recuperação de Senha</DialogTitle>
            <DialogDescription>
              Insira seu email para receber um link de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="pl-10"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setResetPasswordOpen(false)}
              className="border-[#333] text-barber-gray"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={isResetting}
              className="bg-barber-gold hover:bg-barber-gold/90 text-black"
            >
              {isResetting ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
