import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, ChevronDown, User, Settings, LogOut, Bell, Search, 
  MessageSquare, Shield, HelpCircle, Zap, Sun, Moon
} from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const AbhasthraLogo = () => (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
        <Zap className="h-4 w-4 text-white" />
      </div>
      <span className="text-sm font-semibold text-gray-800">Abhastra</span>
    </div>
  );

  const notifications = [
    { id: 1, title: 'New survey completed', message: 'Survey #1247 has been completed', time: '2 min ago', unread: true },
    { id: 2, title: 'System update', message: 'Dashboard will be updated at 3:00 PM', time: '1 hour ago', unread: true },
    { id: 3, title: 'Data export ready', message: 'Monthly report is ready for download', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
      <div className="flex items-center justify-between h-16">
        {/* Left Section - Menu Button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="group h-full w-16 flex items-center justify-center   hover:from-slate-700 hover:to-slate-800 transition-all duration-200 "
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          {/* Breadcrumb or Title */}
          <div className="hidden md:flex items-center ml-6">
            <div className="text-sm text-gray-500">Admin Dashboard</div>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 pr-4">
          {/* Dark Mode Toggle */}
      

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <img src="https://visiondata.in/wp-content/uploads/2023/09/WhatsApp_Image_2023-09-14_at_12.56.23_PM-removebg-preview-e1695032684224.png" alt="User Avatar" className="h-8 w-8 rounded-full" />
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Admin User</p>
                      <p className="text-xs text-gray-500">admin@example.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link 
                    to="/settings/website" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link 
                    to="/security" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                  <Link 
                    to="/help" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help & Support
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-2">
                  <a 
                    href="/login" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;