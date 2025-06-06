// src/Components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiSettings, 
  FiCalendar, 
  FiInfo, 
  FiActivity,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiArrowRight
} from 'react-icons/fi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const primaryColor = '#004A65';
  const secondaryColor = '#0077a3';

  const menuItems = [
    { path: '/dashboard', name: 'Home', icon: FiHome },
    { path: '/services', name: 'Services', icon: FiSettings },
    { path: '/events', name: 'Events', icon: FiCalendar },
    { path: '/about', name: 'About', icon: FiInfo },
    { path: '/status', name: 'ContactUs', icon: FiActivity },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white text-[#004A65] rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200"
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar with Enhanced Background */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${isCollapsed ? 'w-20' : 'w-72'} overflow-hidden
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl
        `}
      >
        {/* Background Image Layer with Dark Overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`,
              filter: 'brightness(0.7)'
            }}
          />
          //backdrop gradient off--
          {/* <div className="absolute inset-0 bg-gradient-to-b from-[#004A65]/90 via-[#004A65]/80 to-[#0077a3]/90" /> */}
        </div>
        
        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full backdrop-blur-sm">
          {/* Logo/Brand Section */}
          <div className={`p-6 border-b border-white/20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">EventHub</h2>
                <p className="text-sm text-white/80">Dashboard</p>
              </div>
            )}
            
            {/* Close Button for Mobile */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-all text-white"
            >
              <FiX size={20} />
            </button>

            {/* Collapse Button for Desktop */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-white/20 transition-all text-white border border-white/30"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiChevronLeft size={18} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-lg text-sm font-medium
                    transition-all duration-200 group relative
                    ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-md text-white shadow-md border border-white/30'
                        : 'text-white/90 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                    }
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`${isCollapsed ? 'mr-0' : 'mr-3'} transition-all duration-200 ${
                      isActive ? 'text-white scale-110' : 'text-white/90 group-hover:text-white group-hover:scale-105'
                    }`} 
                  />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Promotional Section */}
          {!isCollapsed ? (
            <div className="mx-4 mb-6 p-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <h3 className="text-white font-bold text-lg mb-2">Explore Events</h3>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                Discover amazing experiences and connect with your community
              </p>
              
              <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center">
                Browse Events
                <FiArrowRight className="ml-2" size={16} />
              </button>
            </div>
          ) : (
            <div className="mx-2 mb-6">
              <button 
                className="w-full p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center"
                title="Browse Events"
              >
                <FiArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;