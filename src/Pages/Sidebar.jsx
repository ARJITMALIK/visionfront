import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, ChevronDown, Users, Smile, Vote, Database, 
  FileText, Briefcase, MapPin, Blocks, User, Bell, Landmark, Building2,
  ChevronRight, Zap, Home,
  MapPinCheck
} from 'lucide-react';

const navItems = [
  { 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    href: '/dashboard' 
  },
  {
    label: 'General Settings',
    icon: Settings,
    basePath: '/settings',
    subItems: [
      { label: 'Website Settings', href: '/settings/website' },
    ],
  },
  {
    label: 'Users',
    icon: Users,
    basePath: '/users',
    subItems: [
      { label: 'All Users', href: '/allusers' },
    ]
  },
  {
    label: 'Emoji',
    icon: Smile,
    basePath: '/emoji',
    subItems: [
      { label: 'Add Emoji', href: '/addemoji' },
      { label: 'All Emoji', href: '/allemoji' },
    ]
  },
  {
    label: 'Elections',
    icon: Vote,
    basePath: '/election',
    subItems: [
      { label: 'Add Election', href: '/addelection' },
      { label: 'All Elections', href: '/allelection' },
    ]
  },
  {
    label: 'Survey Data',
    icon: Database,
    basePath: '/survey',
    subItems: [
      { label: 'All Survey Data', href: '/allsurveydata' },
    ]
  },
  {
    label: 'Questions',
    icon: FileText,
    basePath: '/questions',
    subItems: [
      { label: 'Add Question', href: '/addquestions' },
      { label: 'All Question', href: '/allquestions' },
    ]
  },
 
  
  {
    label: 'Party',
    icon: Blocks,
    basePath: '/party',
    subItems: [
      { label: 'Add Party', href: '/addparty' },
      { label: 'All Party', href: '/allparty' },
    ]
  },
  {
    label: 'Candidates',
    icon: User,
    basePath: '/candidates',
    subItems: [
      { label: 'Add Candidate', href: '/addcandidates' },
      { label: 'All Candidates', href: '/allcandidates' },
    ]
  },
  {
    label: 'Notification',
    icon: Bell, 
    basePath: '/notification',
    subItems: [
      { label: 'Add Notification', href: '/addnotification' },
      { label: 'All Notifications', href: '/allnotifications' },
    ]
  },
   {
    label: 'Loksabha',
    icon: Building2, 
    basePath: '/loksabha',
    subItems: [
      { label: 'Add Loksabha', href: '/addloksabha' },
      { label: 'All Loksabha', href: '/allloksabha' },
    ],
  },
  {
    label: 'Vidhan Sabha',
    icon: Landmark,
    basePath: '/vidhan',
    subItems: [
        { label: 'Add Vidhan Sabha', href: '/add-vidhan' },
        { label: 'All Vidhan Sabha', href: '/all-vidhan' },
    ]
  },
  {
    label: 'booth',
    icon: MapPin,
    basePath: '/booth',
    subItems: [
      { label: 'Add Booth', href: '/addbooth' },
      { label: 'All Booth', href: '/allbooth' },
    ]
  },
   

 
];

const Sidebar = ({ isOpen, setOpen }) => {
  const [openSections, setOpenSections] = useState({});
  const location = useLocation();

  useEffect(() => {
    const newOpenSections = {};
    navItems.forEach(item => {
      if (item.basePath && location.pathname.startsWith(item.basePath)) {
        newOpenSections[item.label] = true;
      }
    });
    setOpenSections(prevSections => ({ ...prevSections, ...newOpenSections }));
  }, [location.pathname]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  }, [location.pathname, setOpen]);

  const toggleSection = (label) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isLinkActive = (item) => {
    if (item.subItems) {
      return item.basePath && location.pathname.startsWith(item.basePath);
    }
    return location.pathname === item.href;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setOpen(false)} 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden transition-opacity duration-300" 
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Enhanced Header */}
          <div className="relative border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
            <div className="relative flex items-center justify-center p-6">
              <div className="flex items-center gap-3 bg-white rounded p-2 text-black">
               <img src="https://visiondata.in/wp-content/uploads/2023/09/WhatsApp_Image_2023-09-14_at_12.56.23_PM-removebg-preview-e1695032684224.png" alt="Vision Data Logo" className="h-10 w-10" />
                <div className="flex flex-col text-black">
                  <h1 className="text-xl font-bold text-black">Vision Data</h1>
                  <p className="text-xs text-black">Analytics Dashboard</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-black">
            <div className="mb-6">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Home className="h-3 w-3" />
                Main Navigation
              </div>
            </div>
            
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  {!item.subItems ? (
                    <NavLink 
                      to={item.href} 
                      className={({ isActive }) => `
                        group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }
                      `}
                    >
                      {item.icon && (
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      )}
                      <span className="transition-all duration-200">{item.label}</span>
                    </NavLink>
                  ) : (
                    <div>
                      <button 
                        onClick={() => toggleSection(item.label)} 
                        className={`
                          group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-left relative overflow-hidden
                          ${isLinkActive(item)
                            ? 'bg-slate-700/50 text-white' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          {item.icon && (
                            <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-200 ${
                              isLinkActive(item) ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                            }`} />
                          )}
                          <span className="transition-all duration-200">{item.label}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${
                          openSections[item.label] ? 'rotate-180' : ''
                        } ${isLinkActive(item) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                      </button>
                      
                      {/* Submenu */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openSections[item.label] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <ul className="mt-2 ml-4 space-y-1 border-l border-slate-700/50 pl-4">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.label}>
                              <NavLink 
                                to={subItem.href} 
                                className={({ isActive }) => `
                                  group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 relative
                                  ${isActive 
                                    ? 'text-blue-400 bg-blue-500/10 border-l-2 border-blue-400' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                                  }
                                `}
                              >
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-3 transition-all duration-200 ${
                                    location.pathname === subItem.href ? 'bg-blue-400' : 'bg-slate-600 group-hover:bg-slate-400'
                                  }`} />
                                  <span className="transition-all duration-200">{subItem.label}</span>
                                </div>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center justify-center">
              <div className="text-xs text-slate-500">
                © 2024 Vision Data
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;