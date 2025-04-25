import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { signIn, getUserRole } from '@/lib/supabase';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    password: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error: signInError } = await signIn(credentials.email, credentials.password);
      
      if (signInError) throw signInError;
      
      const role = await getUserRole();
      
      if (role === 'admin' || role === 'barber') {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('userRole', role); 
        navigate('/admin/dashboard');
      } else {
        throw new Error("Acesso negado. Você não tem permissão para acessar esta área.");
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Falha na Autenticação",
        description: error.message || "Email ou senha inválidos, ou acesso não permitido.",
        variant: "destructive",
      });
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <span className="text-barber-gold font-playfair text-2xl font-bold">STUDIO</span>
            <span className="text-white font-playfair text-2xl font-bold">53</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-sm text-barber-gray">
            Insira suas credenciais para acessar o painel.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="form-control-wrapper">
              <label htmlFor="email" className="sr-only">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-barber-gray" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="pl-10 bg-[#1c1c1c] border-[#333] focus:border-barber-gold"
                  placeholder="E-mail"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="password" className="sr-only">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-barber-gray" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="pl-10 bg-[#1c1c1c] border-[#333] focus:border-barber-gold"
                  placeholder="Senha"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
