
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (userData.password !== userData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (userData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // This is a mock registration - in a real application, this would create a user in a database
      // For demo purposes, we'll just "register" the user
      localStorage.setItem('userAuthenticated', 'true');
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userName', userData.name);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Welcome to Elite Barber Shop!",
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
            <h1 className="text-3xl font-bold mb-6">Create Account</h1>
            <p className="text-muted-foreground mb-8">
              Join Elite Barber Shop to easily book appointments and manage your preferences
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="form-control-wrapper">
              <label htmlFor="name">Full Name</label>
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
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="email">Email Address</label>
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
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="phone">Phone Number</label>
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
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="password">Password</label>
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
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="form-control-wrapper">
              <label htmlFor="confirmPassword">Confirm Password</label>
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
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-barber-gold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
