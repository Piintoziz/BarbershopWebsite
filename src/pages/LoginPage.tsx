
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

// In a real application, this would be connected to a backend service like Supabase
const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
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
      // This is a mock login - in a real application, this would validate against a database
      // For demo purposes, we'll just "log in" the user
      localStorage.setItem('userAuthenticated', 'true');
      localStorage.setItem('userEmail', credentials.email);
      
      toast({
        title: "Login Successful",
        description: "Welcome back to Elite Barber Shop.",
      });
      
      navigate('/booking');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="pt-32 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto glass-card p-8 rounded-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Sign In</h1>
            <p className="text-muted-foreground mb-8">
              Welcome back! Sign in to your account to manage your bookings
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="form-control-wrapper">
              <label htmlFor="email">Email Address</label>
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
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <div className="flex items-center justify-between">
                <label htmlFor="password">Password</label>
                <a href="#" className="text-sm text-barber-gold hover:underline">
                  Forgot password?
                </a>
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-barber-gold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
