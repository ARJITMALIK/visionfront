import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ChevronDown, Users, Smile, Vote, Database, 
  FileText, Briefcase, MapPin, Blocks, User, Bell, Landmark, Building2,
  Home,
  EarthIcon,
  NotepadTextIcon
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
   { label: 'Master Report', icon: NotepadTextIcon, href: '/master-report' },
  {
    label: 'Live Tracking',
    icon: EarthIcon,
    basePath: '/teamtrack',
    subItems: [{ label: 'Team tracking', href: '/teamtrack' },{ label: 'live survey map', href: '/livemap' }]
  },
  {
    label: 'Users',
    icon: Users,
    basePath: '/users',
    subItems: [{ label: 'All Users', href: '/allusers' },{ label: 'Assign Booths', href: '/assignbooth' }]
    
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
    subItems: [{ label: 'All Survey Data', href: '/allsurveydata' }]
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
  { label: 'Notification', icon: Bell, href: '/notification' },
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
    label: 'Booth',
    icon: MapPin,
    basePath: '/booth',
    subItems: [
      { label: 'Add Booth', href: '/addbooth' },
      { label: 'All Booth', href: '/allbooth' },
    ]
  },
];

const Sidebar = ({ isOpen, setOpen, isCollapsed, setCollapsed }) => {
  const [openSections, setOpenSections] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
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
    if (isCollapsed) {
      setCollapsed(false);
      setTimeout(() => {
        setOpenSections(prev => ({ ...prev, [label]: true }));
      }, 100);
    } else {
      setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
    }
  };

  const isLinkActive = (item) => {
    if (item.subItems) {
      return item.basePath && location.pathname.startsWith(item.basePath);
    }
    return location.pathname === item.href;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setOpen(false)} 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300" 
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative border-b border-gray-200 bg-white">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 transition-all duration-300`}>
              {!isCollapsed ? (
                <div className="flex items-center gap-3">
                  <img 
                    src="https://visiondata.in/wp-content/uploads/2023/09/WhatsApp_Image_2023-09-14_at_12.56.23_PM-removebg-preview-e1695032684224.png" 
                    alt="Vision Data Logo" 
                    className="h-10 w-10 object-contain" 
                  />
                  <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-gray-900">Vision Data</h1>
                    <p className="text-xs text-gray-500">Powered by Abhastra automation</p>
                  </div>
                </div>
              ) : (
                <img 
                  src="https://visiondata.in/wp-content/uploads/2023/09/WhatsApp_Image_2023-09-14_at_12.56.23_PM-removebg-preview-e1695032684224.png" 
                  alt="Vision Data Logo" 
                  className="h-8 w-8 object-contain" 
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-3 py-2 mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Home className="h-3.5 w-3.5" />
                Main Navigation
              </div>
            )}
            
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  {!item.subItems ? (
                    <div className="relative group">
                      <NavLink 
                        to={item.href} 
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={({ isActive }) => `
                          flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative
                          ${isCollapsed ? 'justify-center' : ''}
                          ${isActive 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        {item.icon && (
                          <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                            !isCollapsed ? 'mr-3' : ''
                          }`} />
                        )}
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && hoveredItem === item.label && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative group">
                      <button 
                        onClick={() => toggleSection(item.label)}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`
                          flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left
                          ${isCollapsed ? 'justify-center' : 'justify-between'}
                          ${isLinkActive(item)
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          {item.icon && (
                            <item.icon className={`h-5 w-5 flex-shrink-0 ${
                              !isCollapsed ? 'mr-3' : ''
                            }`} />
                          )}
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${
                            openSections[item.label] ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && hoveredItem === item.label && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                        </div>
                      )}
                      
                      {/* Submenu */}
                      {!isCollapsed && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openSections[item.label] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                            {item.subItems.map((subItem) => (
                              <li key={subItem.label}>
                                <NavLink 
                                  to={subItem.href} 
                                  className={({ isActive }) => `
                                    flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                                    ${isActive 
                                      ? 'text-indigo-600 bg-indigo-50' 
                                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <div className="flex items-center">
                                    <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-all duration-200 ${
                                      location.pathname === subItem.href ? 'bg-indigo-600' : 'bg-gray-400'
                                    }`} />
                                    <span>{subItem.label}</span>
                                  </div>
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && (
                <div className="text-xs text-gray-500">
                  © 2025 Vision Data
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;