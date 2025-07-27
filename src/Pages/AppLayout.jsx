import React, { useState, useEffect } from 'react';
import Header from './Header'; // Adjust path if needed
import Sidebar from './Sidebar'; // Adjust path if needed

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-open sidebar on desktop, close on mobile
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen && !isMobile ? 'lg:ml-72' : 'lg:ml-0'
        }`}
      >
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Content Container */}
          <div className="h-full">
            {/* Page Content */}
            <div className="p-6 lg:p-8">
              <div className="max-w-full mx-auto">
                {children}
              </div>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;