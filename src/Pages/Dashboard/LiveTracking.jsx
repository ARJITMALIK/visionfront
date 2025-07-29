import React, { useEffect, useRef, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Phone, MapPin, User, Users, Search, X, ArrowLeft, Maximize, Menu
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

// --- Helper Constants and Functions ---

const roleMap = {
  0: 'Admin',
  1: 'QC',
  2: 'ZC',
  3: 'OT',
};
const getRoleName = (role) => roleMap[role] || 'Unknown';

const getStatusClass = (status) => {
  switch (status) {
    case 'Moving': return 'bg-green-500 hover:bg-green-600 border-green-600';
    case 'Idle': return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
    default: return 'bg-gray-400 hover:bg-gray-500 border-gray-500';
  }
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// --- Main Component ---

const LiveTracking = () => {
  // --- State Management ---
  const [users, setUsers] = useState([]);
  const [usersById, setUsersById] = useState(new Map());
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile drawer

  // --- Refs ---
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // --- Data Fetching and Processing ---
  const fetchData = async () => {
    try {
      const res = await VisionBase.get('/users');
      if (res.data?.data?.rows) {
        const processedUsers = res.data.data.rows.map(user => ({
          ...user,
          status: user.status || (Math.random() > 0.5 ? 'Moving' : 'Idle'),
        }));
        setUsers(processedUsers);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error("Invalid data structure received from API.");
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError("Could not load user data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userMap = new Map(users.map(user => [user.user_id, user]));
    setUsersById(userMap);
  }, [users]);


  // --- Map Initialization and Management ---
  useEffect(() => {
    const loadLeaflet = async () => {
      // Ensure Leaflet is loaded only once
      if (window.L) {
        initializeMap();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (mapInstanceRef.current || !mapRef.current) return;
      const map = window.L.map(mapRef.current).setView([28.4831, 77.5245], 12);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    };

    loadLeaflet();

    // Cleanup map instance on component unmount
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Effect to update markers when users change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    users.forEach(user => {
      if (user.latitude && user.longitude) {
        const statusColor = user.status === 'Moving' ? '#10b981' : '#3b82f6';
        const customIcon = window.L.divIcon({
          className: 'custom-avatar-marker',
          html: `<div style="position: relative; width: 36px; height: 36px;">
                   <img src="${user.profile}" style="width: 100%; height: 100%; border-radius: 50%; border: 3px solid ${statusColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"/>
                   <div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background-color: ${statusColor}; border: 2px solid white; border-radius: 50%; ${user.status === 'Moving' ? 'animation: pulse 2s infinite;' : ''}"></div>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = window.L.marker([user.latitude, user.longitude], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => {
            setSelectedUser(user);
            setIsSidebarOpen(true); // Open sidebar on mobile when marker is clicked
          })
          .bindTooltip(user.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -18]
          });
        markersRef.current.push(marker);
      }
    });

  }, [users]);

  // Effect to pan map to selected user
  useEffect(() => {
    if (selectedUser && mapInstanceRef.current && selectedUser.latitude && selectedUser.longitude) {
      mapInstanceRef.current.flyTo([selectedUser.latitude, selectedUser.longitude], 15, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedUser]);


  // --- Event Handlers ---
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm(''); // Clear search on selection
  };
  
  const handleBackToList = () => {
    setSelectedUser(null);
  };
  
  const fitAllMarkers = () => {
    if (!mapInstanceRef.current || users.length === 0) return;
    const validCoords = users
      .filter(u => u.latitude && u.longitude)
      .map(u => [u.latitude, u.longitude]);

    if (validCoords.length > 0) {
      mapInstanceRef.current.flyToBounds(validCoords, { padding: [50, 50] });
    }
  };

  // --- Render Logic ---
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentUser = selectedUser ? usersById.get(selectedUser.parent) : null;

  return (
    <div className="w-full h-screen flex bg-gray-100 font-sans">
      {/* --- Map Container --- */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Map Overlays */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
           {/* Mobile Sidebar Toggle */}
           <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="bg-white rounded-full p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-800">Live</span>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={fitAllMarkers} title="Fit all users on map">
              <Maximize className="w-5 h-5"/>
          </Button>
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">{users.length} Users Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sidebar --- */}
      <aside className={`
        absolute top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-[1001]
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0 lg:max-w-sm
      `}>
         <div className="flex flex-col h-full">
            {selectedUser ? (
              // --- User Details View ---
              <UserDetailsPanel 
                user={selectedUser} 
                parent={parentUser} 
                onBack={handleBackToList}
                onClose={() => setIsSidebarOpen(false)}
              />
            ) : (
              // --- User List View ---
              <UserListPanel
                users={filteredUsers}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSelectUser={handleSelectUser}
                isLoading={isLoading}
                error={error}
                lastUpdated={lastUpdated}
                onClose={() => setIsSidebarOpen(false)}
              />
            )}
        </div>
      </aside>

      {/* Overlay for mobile */}
       {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/30 z-[1000] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};


// --- Sub-components for better organization ---

const UserListPanel = ({ users, searchTerm, onSearchChange, onSelectUser, isLoading, error, lastUpdated, onClose }) => (
  <>
    <div className="p-4 border-b">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Online Users</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => <UserSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : users.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No users found.</div>
      ) : (
        users.map(user => (
          <UserListItem key={user.user_id} user={user} onSelect={onSelectUser} />
        ))
      )}
    </div>

    <div className="p-3 border-t text-center text-xs text-gray-500">
      Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
    </div>
  </>
);

const UserDetailsPanel = ({ user, parent, onBack, onClose }) => (
  <>
    <div className="p-4 border-b flex items-center justify-between">
       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      <h2 className="text-xl font-bold text-gray-800">User Details</h2>
      <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}>
          <X className="h-5 w-5" />
      </Button>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
      <Card className="shadow-none border-0">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4" style={{ borderColor: user.status === 'Moving' ? '#10b981' : '#3b82f6' }}>
              <AvatarImage src={user.profile} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="text-md text-gray-500">{getRoleName(user.role)}</p>
              <Badge className={`${getStatusClass(user.status)} text-white mt-2 text-xs`}>
                {user.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <Separator className="my-4" />
        
        <CardContent className="p-0 space-y-4 text-sm">
          <InfoRow icon={Phone} label="Contact" value={user.mobile} />
          <InfoRow icon={MapPin} label="Location" value={`${user.latitude?.toFixed(5)}, ${user.longitude?.toFixed(5)}`} />
          
          {parent && (
            <>
              <Separator className="my-4" />
              <h4 className="font-semibold text-md text-gray-800">Reports To</h4>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={parent.profile} alt={parent.name}/>
                        <AvatarFallback>{getInitials(parent.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900">{parent.name}</p>
                      <p className="text-xs text-gray-500">{getRoleName(parent.role)}</p>
                    </div>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center gap-3 text-xs text-gray-600 pl-1">
                  <Phone className="w-3.5 h-3.5" />
                  {parent.mobile}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    <div className="p-4 border-t">
       <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Phone className="w-4 h-4 mr-2" />
          Call User
        </Button>
    </div>
  </>
);

const UserListItem = ({ user, onSelect }) => (
  <div 
    className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer border-b"
    onClick={() => onSelect(user)}
  >
    <Avatar className="w-10 h-10">
      <AvatarImage src={user.profile} alt={user.name} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-semibold text-gray-800">{user.name}</p>
      <p className="text-sm text-gray-500">{getRoleName(user.role)}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'Moving' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
      <span className="text-sm text-gray-600">{user.status}</span>
    </div>
  </div>
);

const UserSkeleton = () => (
  <div className="flex items-center gap-4 p-3">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-4 w-1/4" />
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <div className="flex items-center gap-3 font-medium text-gray-800">
      <Icon className="w-4 h-4 text-gray-400" />
      <span>{value}</span>
    </div>
  </div>
);


export default LiveTracking;