
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Scissors, User, Phone, Clock, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock data for bookings
const mockBookings = [
  {
    id: '1',
    name: 'John Smith',
    service: 'Classic Haircut',
    date: '2025-04-10',
    time: '10:00 AM',
    phone: '(123) 456-7890',
    email: 'john@example.com'
  },
  {
    id: '2',
    name: 'Michael Johnson',
    service: 'Beard Trim',
    date: '2025-04-10',
    time: '11:30 AM',
    phone: '(234) 567-8901',
    email: 'michael@example.com'
  },
  {
    id: '3',
    name: 'David Wilson',
    service: 'Hot Shave',
    date: '2025-04-10',
    time: '2:00 PM',
    phone: '(345) 678-9012',
    email: 'david@example.com'
  },
  {
    id: '4',
    name: 'Robert Brown',
    service: 'Haircut & Beard Trim',
    date: '2025-04-11',
    time: '9:30 AM',
    phone: '(456) 789-0123',
    email: 'robert@example.com'
  },
  {
    id: '5',
    name: 'James Davis',
    service: 'Skin Fade',
    date: '2025-04-11',
    time: '1:00 PM',
    phone: '(567) 890-1234',
    email: 'james@example.com'
  },
  {
    id: '6',
    name: 'William Miller',
    service: 'Full Service',
    date: '2025-04-12',
    time: '11:00 AM',
    phone: '(678) 901-2345',
    email: 'william@example.com'
  }
];

const AdminDashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState(mockBookings);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    // Filter bookings based on selected date and search term
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    const filtered = mockBookings.filter(booking => {
      const dateMatch = booking.date === formattedSelectedDate;
      
      // If search term exists, apply additional filtering
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          dateMatch && 
          (booking.name.toLowerCase().includes(searchTermLower) ||
          booking.service.toLowerCase().includes(searchTermLower) ||
          booking.time.toLowerCase().includes(searchTermLower))
        );
      }
      
      return dateMatch;
    });
    
    setFilteredBookings(filtered);
  }, [selectedDate, searchTerm]);

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-barber">
      {/* Admin Header */}
      <header className="bg-barber-dark shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-barber-gold font-playfair text-xl font-bold">ELITE</span>
            <span className="text-white font-playfair ml-1">ADMIN</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Booking Dashboard</h1>
        
        {/* Date Navigation and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-barber-light rounded-lg p-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevDay}
              className="h-8 w-8 border-barber-gray"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-barber-gold" />
              <span className="font-medium">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              className="h-8 w-8 border-barber-gray"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-barber-gray" />
              <Input
                placeholder="Search by client name, service, or time..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-barber-light border-barber focus:border-barber-gold"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-barber-light rounded-lg overflow-hidden">
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-barber-dark text-barber-gold border-b border-barber">
                    <th className="text-left py-3 px-4">Time</th>
                    <th className="text-left py-3 px-4">Client</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Contact</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.sort((a, b) => {
                    // Convert time strings to comparable values for sorting
                    const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
                    const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
                    return timeA - timeB;
                  }).map((booking) => (
                    <tr key={booking.id} className="border-b border-barber hover:bg-barber">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-barber-gold" />
                          {booking.time}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-barber-gold" />
                          {booking.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Scissors className="mr-2 h-4 w-4 text-barber-gold" />
                          {booking.service}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-barber-gold" />
                          {booking.phone}
                        </div>
                        <div className="text-sm text-barber-gray mt-1">
                          {booking.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-barber-gray text-barber-gray hover:bg-barber"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <Calendar className="h-12 w-12 text-barber-gray" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Bookings Found</h3>
              <p className="text-barber-gray">
                There are no bookings scheduled for this date or matching your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
