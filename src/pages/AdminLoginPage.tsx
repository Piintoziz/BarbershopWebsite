
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

// In a real application, this would be handled securely with a backend
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'elite123'
};

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (
        credentials.username === ADMIN_CREDENTIALS.username && 
        credentials.password === ADMIN_CREDENTIALS.password
      ) {
        // Set admin authenticated in localStorage (in a real app, use a more secure method)
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <span className="text-barber-gold font-playfair text-2xl font-bold">ELITE</span>
            <span className="text-white font-playfair ml-1 text-lg">BARBER</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-barber-gray">
            Enter your credentials to access the admin dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="form-control-wrapper">
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-barber-gray" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="pl-10 bg-[#1c1c1c] border-[#333] focus:border-barber-gold"
                  placeholder="Username"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="password" className="sr-only">Password</label>
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
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
