
import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Calendar, Users, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const AdminLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const adminAuth = localStorage.getItem('adminAuthenticated');
    setIsAuthenticated(adminAuth === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === false) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="min-h-screen bg-[#111111] flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-[#1c1c1c] border-r border-[#333] text-white">
        <div className="p-5 border-b border-[#333]">
          <div className="flex items-center">
            <span className="text-barber-gold font-playfair text-xl font-bold">ELITE</span>
            <span className="text-white font-playfair ml-1">ADMIN</span>
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink to="/admin/dashboard" icon={<Calendar />} label="Bookings" />
          <NavLink to="/admin/clients" icon={<Users />} label="Clients" />
          <NavLink to="/admin/settings" icon={<Settings />} label="Settings" />
        </nav>
        
        <div className="p-4 border-t border-[#333]">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-[#333] transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div 
        className={`md:hidden fixed inset-0 z-40 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        {/* Sidebar Content */}
        <div className="relative flex flex-col w-64 h-full bg-[#1c1c1c] border-r border-[#333] text-white">
          <div className="flex items-center justify-between p-5 border-b border-[#333]">
            <div className="flex items-center">
              <span className="text-barber-gold font-playfair text-xl font-bold">ELITE</span>
              <span className="text-white font-playfair ml-1">ADMIN</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavLink to="/admin/dashboard" icon={<Calendar />} label="Bookings" onClick={() => setSidebarOpen(false)} />
            <NavLink to="/admin/clients" icon={<Users />} label="Clients" onClick={() => setSidebarOpen(false)} />
            <NavLink to="/admin/settings" icon={<Settings />} label="Settings" onClick={() => setSidebarOpen(false)} />
          </nav>
          
          <div className="p-4 border-t border-[#333]">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-[#333] transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-[#1c1c1c] border-b border-[#333] p-4 flex items-center justify-between md:justify-end">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white"
          >
            <Menu size={24} />
          </button>
          
          <div className="text-sm text-gray-300">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavLink = ({ to, icon, label, onClick }: NavLinkProps) => {
  return (
    <Link 
      to={to} 
      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-[#333] transition-colors"
      onClick={onClick}
    >
      <span className="mr-3 text-gray-400">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default AdminLayout;
