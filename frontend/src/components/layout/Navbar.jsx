import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      {/* Welcome Message */}
      <div>
        <h1 className="text-xl font-semibold text-blue-900">
          Welcome back, {user.firstName || 'Staff'}!
        </h1>
        <p className="text-sm text-gray-500">
          Here's what's happening with your rental business today.
        </p>
      </div>

      {/* Profile Dropdown */}
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center space-x-3 text-gray-700 hover:text-blue-900">
          <UserCircleIcon className="w-8 h-8" />
          <span className="text-sm font-medium">{user.username || 'Staff'}</span>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`${
                      active ? 'bg-gray-50 text-blue-900' : 'text-gray-700'
                    } w-full text-left px-4 py-2 text-sm`}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Navbar; 