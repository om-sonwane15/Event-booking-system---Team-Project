// src/Components/MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar (if you want to keep it) */}
        <Navbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;