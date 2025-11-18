import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
      />
      
      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen && !isMobile 
            ? isCollapsed 
              ? 'lg:ml-20' 
              : 'lg:ml-72' 
            : 'lg:ml-0'
        }`}
      >
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar} 
          isCollapsed={isCollapsed}
          setCollapsed={setCollapsed}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;