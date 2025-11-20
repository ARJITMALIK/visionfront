import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  Phone, MapPin, Users, Search, X, ArrowLeft, Maximize, Menu, 
  ChevronRight, ChevronDown, Clock, Calendar
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

// --- Helper Constants and Functions ---

const roleMap = {
  0: { label: 'Admin', color: '#7c3aed', bg: 'bg-violet-600' }, // Violet
  1: { label: 'QC', color: '#dc2626', bg: 'bg-red-600' },    // Red
  2: { label: 'ZC', color: '#2563eb', bg: 'bg-blue-600' },   // Blue
  3: { label: 'OT', color: '#059669', bg: 'bg-emerald-600' }, // Green
};

const getRoleInfo = (role) => roleMap[role] || { label: 'User', color: '#6b7280', bg: 'bg-gray-500' };

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

const formatLastUpdated = (dateString) => {
  if (!dateString) return 'Never updated';
  const date = parseISO(dateString);
  return isValid(date) ? `${formatDistanceToNow(date)} ago` : 'Invalid Date';
};

// --- Recursive Tree Node Component for Hierarchy ---
const UserTreeNode = ({ node, onSelect, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default open
  const hasChildren = node.children && node.children.length > 0;
  const roleInfo = getRoleInfo(node.role);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${depth > 0 ? 'border-l-2 border-l-gray-200' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={(e) => {
            // If clicking the toggle button, don't select the user
            if(e.target.closest('.toggle-btn')) return;
            onSelect(node);
        }}
      >
        {/* Expand/Collapse Toggle */}
        <div className="w-6 flex-shrink-0 toggle-btn">
            {hasChildren && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="p-1 hover:bg-gray-200 rounded-sm text-gray-500"
            >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            )}
        </div>

        {/* User Avatar */}
        <div className="relative mr-3">
            <Avatar className="w-8 h-8 border-2" style={{ borderColor: roleInfo.color }}>
                <AvatarImage src={node.profile} alt={node.name} />
                <AvatarFallback>{getInitials(node.name)}</AvatarFallback>
            </Avatar>
            {/* Online/Offline Dot */}
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${node.logged_in === 1 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">{node.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${roleInfo.bg}`}>
                {roleInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
             <span className={node.logged_in === 1 ? 'text-green-600' : 'text-gray-400'}>
                {node.logged_in === 1 ? 'Online' : 'Offline'}
             </span>
             {node.survey_count > 0 && (
                 <span className="bg-gray-100 px-1 rounded text-gray-600">
                    {node.survey_count} Surveys
                 </span>
             )}
          </div>
        </div>
      </div>

      {/* Recursive Children */}
      {hasChildren && isExpanded && (
        <div className="bg-gray-50/30">
          {node.children.map(child => (
            <UserTreeNode 
                key={child.user_id} 
                node={child} 
                onSelect={onSelect} 
                depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

const TeamTracking = () => {
  // --- State Management ---
  const [users, setUsers] = useState([]);
  const [usersById, setUsersById] = useState(new Map());
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Refs ---
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // --- Data Processing Logic ---
  
  // Convert flat list to hierarchy
  const hierarchyData = useMemo(() => {
    if (!users.length) return [];

    const userMap = {};
    // 1. Initialize map with all users and empty children array
    users.forEach(u => {
        userMap[u.user_id] = { ...u, children: [] };
    });

    const roots = [];

    // 2. Build tree
    users.forEach(u => {
        if (u.parent && u.parent !== 0 && userMap[u.parent]) {
            userMap[u.parent].children.push(userMap[u.user_id]);
        } else {
            roots.push(userMap[u.user_id]);
        }
    });

    // 3. Sort roots by role (Admin first)
    return roots.sort((a, b) => a.role - b.role);
  }, [users]);

  // --- Fetching ---
  const fetchData = async () => {
    try {
      const res = await VisionBase.get('/users');
      // Adapt to the structure provided in prompt: array of objects
      const data = Array.isArray(res.data) ? res.data : (res.data?.data?.rows || []);
      
      if (data) {
        setUsers(data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error("Invalid data structure.");
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError("Could not load user data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userMap = new Map(users.map(user => [user.user_id, user]));
    setUsersById(userMap);
  }, [users]);

  // --- Map Initialization ---
  useEffect(() => {
    const loadLeaflet = async () => {
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
      const map = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India view
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    };

    loadLeaflet();
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // --- Marker Management ---
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    users.forEach(user => {
      // Only show users with valid lat/long
      if (user.latitude && user.longitude) {
        const roleStyle = getRoleInfo(user.role);
        const isOnline = user.logged_in === 1;

        const customIcon = window.L.divIcon({
          className: 'custom-avatar-marker',
          html: `
            <div style="position: relative; width: 40px; height: 40px;">
               <img src="${user.profile || 'https://via.placeholder.com/40'}" 
                    style="width: 100%; height: 100%; border-radius: 50%; border: 3px solid ${roleStyle.color}; object-fit: cover; background: white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);"
               />
               ${isOnline ? `<div style="position: absolute; top: 0; right: 0; width: 12px; height: 12px; background-color: #22c55e; border: 2px solid white; border-radius: 50%;"></div>` : ''}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = window.L.marker([user.latitude, user.longitude], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => {
            setSelectedUser(user);
            setIsSidebarOpen(true);
          })
          .bindTooltip(`<b>${user.name}</b><br/>${roleStyle.label}`, {
            permanent: false,
            direction: 'top',
            offset: [0, -20]
          });
        markersRef.current.push(marker);
      }
    });
  }, [users]);

  // Fly to user
  useEffect(() => {
    if (selectedUser && mapInstanceRef.current && selectedUser.latitude && selectedUser.longitude) {
      mapInstanceRef.current.flyTo([selectedUser.latitude, selectedUser.longitude], 14, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedUser]);

  // --- Logic for List View ---
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsSidebarOpen(true);
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

  // If searching, use flat list. If not, use hierarchy.
  const isSearching = searchTerm.trim().length > 0;
  const filteredFlatList = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentUser = selectedUser ? usersById.get(selectedUser.parent) : null;

  return (
    <div className="w-full h-screen p-8 flex bg-gray-100 font-sans overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 relative h-full">
        <div ref={mapRef} className="w-full h-full z-0" />
        
        {/* Mobile Toggle */}
        <div className="absolute top-4 left-4 z-[500] lg:hidden">
           <Button variant="secondary" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="shadow-md">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Floating Stats */}
        <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={fitAllMarkers} title="Fit Map" className="shadow-md">
              <Maximize className="w-5 h-5"/>
          </Button>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {users.filter(u => u.logged_in === 1).length} Online
               </div>
               <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  {users.filter(u => u.logged_in === 0).length} Offline
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        absolute top-0 right-0 h-full w-full sm:max-w-md bg-white border-l border-gray-200 z-[1000] shadow-xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0 lg:max-w-sm lg:shadow-none
      `}>
        {selectedUser ? (
             <UserDetailsPanel 
                user={selectedUser} 
                parent={parentUser} 
                onBack={() => setSelectedUser(null)}
                onClose={() => setIsSidebarOpen(false)}
              />
        ) : (
            <>
                {/* Header */}
                <div className="p-4 border-b bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Team Structure</h2>
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9 bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">{error}</div>
                    ) : isSearching ? (
                        /* Flat List for Search Results */
                        filteredFlatList.length > 0 ? (
                            filteredFlatList.map(user => (
                                <div 
                                    key={user.user_id} 
                                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <Avatar className="w-9 h-9 mr-3">
                                        <AvatarImage src={user.profile} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500">{getRoleInfo(user.role).label}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">No users found</div>
                        )
                    ) : (
                        /* Hierarchical Tree View */
                        hierarchyData.length > 0 ? (
                            <div className="pb-4">
                                {hierarchyData.map(rootNode => (
                                    <UserTreeNode 
                                        key={rootNode.user_id} 
                                        node={rootNode} 
                                        onSelect={handleSelectUser} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">No hierarchy data available</div>
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t bg-gray-50 text-center text-[11px] text-gray-400 flex justify-center items-center gap-2">
                    <Clock className="w-3 h-3"/>
                    Last sync: {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
                </div>
            </>
        )}
      </aside>
    </div>
  );
};

// --- User Details Sub-Component ---

const UserDetailsPanel = ({ user, parent, onBack, onClose }) => {
    const roleInfo = getRoleInfo(user.role);
    const isOnline = user.logged_in === 1;

    return (
    <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-white">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">Profile</h2>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                <X className="h-5 w-5" />
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4 mb-3" style={{ borderColor: roleInfo.color }}>
                        <AvatarImage src={user.profile} alt={user.name} className="object-cover" />
                        <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                <Badge className={`${roleInfo.bg} mt-2`}>{roleInfo.label}</Badge>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Surveys</p>
                                <p className="text-xl font-bold text-gray-800">{user.survey_count}</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                                <p className={`text-sm font-bold mt-1 ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Details</h4>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Mobile</p>
                            <p className="font-medium">{user.mobile}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Last Location</p>
                            {user.latitude ? (
                                <p className="font-medium text-sm">
                                    {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Location not available</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Last Updated</p>
                            <p className="font-medium text-sm">{formatLastUpdated(user.last_updated)}</p>
                        </div>
                    </div>
                </div>

                {parent && (
                    <div className="pt-2">
                         <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reports To</h4>
                         <div className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm">
                            <Avatar>
                                <AvatarImage src={parent.profile} />
                                <AvatarFallback>{getInitials(parent.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{parent.name}</p>
                                <Badge variant="secondary" className="text-[10px] h-5">
                                    {getRoleInfo(parent.role).label}
                                </Badge>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={!user.mobile}>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
            </Button>
        </div>
    </div>
    );
};

export default TeamTracking;