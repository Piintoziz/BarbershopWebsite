import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

// In a real application, this would be connected to a backend service like Supabase
const RegisterPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (userData.password !== userData.confirmPassword) {
      toast({
        title: "Senhas não correspondem",
        description: "Por favor, verifique se as senhas inseridas são iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (userData.password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Dividir o nome completo em primeiro nome e sobrenome
      const nameParts = userData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { success, error } = await signUp(
        userData.email, 
        userData.password, 
        {
          firstName,
          lastName,
          phone: userData.phone || ''
        }
      );
      
      if (success) {
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada. Bem-vindo à Studio53!",
        });
        
        // Redirecionar para a página de marcações
        navigate('/booking');
      } else {
        throw new Error(error || 'Falha no registro');
      }
    } catch (error: any) {
      console.error("Erro no registro:", error);
      
      // Mensagens de erro mais específicas
      let errorMessage = error.message || "Ocorreu um erro durante o registro.";
      if (errorMessage.includes("User already registered")) {
        errorMessage = "Este email já está registrado. Por favor, faça login ou use um email diferente.";
      }
      
      toast({
        title: "Falha no Registro",
        description: errorMessage,
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
            <h1 className="text-3xl font-bold mb-6">Criar Conta</h1>
            <p className="text-barber-gray mb-6">
              Junte-se à Studio53 para facilmente agendar marcações e gerenciar suas preferências
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="form-control-wrapper">
              <label htmlFor="name">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={userData.name}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="João Silva"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="email">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={userData.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="phone">Telefone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={userData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="912 345 678"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="password">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={userData.password}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                A senha deve ter pelo menos 8 caracteres
              </p>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={userData.confirmPassword}
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
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-barber-gold hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
