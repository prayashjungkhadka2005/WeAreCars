import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  TruckIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../../context/NotificationContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Cars', href: '/dashboard/cars', icon: TruckIcon },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarIcon },
  ];

  const handleLogout = () => {
    try {
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show success notification
      showNotification('Successfully logged out', 'success');
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Error during logout. Please try again.');
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center">
          <span className="text-2xl font-bold text-blue-900">WeAreCars</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-900'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${
                isActive ? 'text-blue-900' : 'text-gray-400'
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-6 py-4 text-base font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 