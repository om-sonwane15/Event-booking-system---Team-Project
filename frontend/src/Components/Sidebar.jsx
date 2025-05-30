import React from 'react';
import { 
  FiHome, 
  FiSettings, 
  FiCalendar, 
  FiInfo, 
  FiActivity,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ activeRoute, setActiveRoute, sidebarOpen, setSidebarOpen }) => {
  const sidebarRoutes = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'services', label: 'Services', icon: FiSettings },
    { id: 'events', label: 'Events', icon: FiCalendar },
    { id: 'about', label: 'About', icon: FiInfo },
    { id: 'status', label: 'Status', icon: FiActivity },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 to-purple-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 bg-black bg-opacity-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-white text-xl font-bold">DVENTS</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white"
        >
          <FiX size={24} />
        </button>
      </div>
      
      <nav className="mt-8 px-4">
        {sidebarRoutes.map((route) => {
          const Icon = route.icon;
          return (
            <button
              key={route.id}
              onClick={() => setActiveRoute(route.id)}
              className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-colors duration-200 ${
                activeRoute === route.id 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white'
              }`}
            >
              <Icon className="mr-3" size={20} />
              <span className="font-medium">{route.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;