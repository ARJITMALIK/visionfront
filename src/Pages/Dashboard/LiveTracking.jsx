import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, MapPin, User, Users } from 'lucide-react';

const LiveTracking = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Mock data for 10 users near Goreswar district, Assam
  const initialUsers = [
    {
      id: 1,
      name: "Rahul Sharma",
      mobile: "+91 9876543210",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      lat: 26.2156,
      lng: 90.6234,
      zcName: "Priya Singh",
      zcMobile: "+91 9876543201",
      status: "Active"
    },
    {
      id: 2,
      name: "Anita Das",
      mobile: "+91 9876543211",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      lat: 26.2089,
      lng: 90.6456,
      zcName: "Rajesh Kumar",
      zcMobile: "+91 9876543202",
      status: "Active"
    },
    {
      id: 3,
      name: "Suresh Patel",
      mobile: "+91 9876543212",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      lat: 26.2267,
      lng: 90.6123,
      zcName: "Sunita Devi",
      zcMobile: "+91 9876543203",
      status: "Active"
    },
    {
      id: 4,
      name: "Kavya Reddy",
      mobile: "+91 9876543213",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      lat: 26.1998,
      lng: 90.6378,
      zcName: "Amit Gupta",
      zcMobile: "+91 9876543204",
      status: "Moving"
    },
    {
      id: 5,
      name: "Vikram Singh",
      mobile: "+91 9876543214",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      lat: 26.2345,
      lng: 90.6567,
      zcName: "Meera Joshi",
      zcMobile: "+91 9876543205",
      status: "Active"
    },
    {
      id: 6,
      name: "Pooja Agarwal",
      mobile: "+91 9876543215",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      lat: 26.2012,
      lng: 90.6012,
      zcName: "Ravi Sharma",
      zcMobile: "+91 9876543206",
      status: "Moving"
    },
    {
      id: 7,
      name: "Arjun Nair",
      mobile: "+91 9876543216",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      lat: 26.2423,
      lng: 90.6289,
      zcName: "Deepika Shah",
      zcMobile: "+91 9876543207",
      status: "Active"
    },
    {
      id: 8,
      name: "Sneha Iyer",
      mobile: "+91 9876543217",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      lat: 26.1876,
      lng: 90.6445,
      zcName: "Kiran Rao",
      zcMobile: "+91 9876543208",
      status: "Moving"
    },
    {
      id: 9,
      name: "Manoj Kumar",
      mobile: "+91 9876543218",
      avatar: "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=150&h=150&fit=crop&crop=face",
      lat: 26.2134,
      lng: 90.6678,
      zcName: "Swati Mishra",
      zcMobile: "+91 9876543209",
      status: "Active"
    },
    {
      id: 10,
      name: "Divya Jain",
      mobile: "+91 9876543219",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      lat: 26.2289,
      lng: 90.5987,
      zcName: "Rohit Verma",
      zcMobile: "+91 9876543210",
      status: "Moving"
    }
  ];

  useEffect(() => {
    setUsers(initialUsers);
  }, []);

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map centered on Goreswar district
      const map = window.L.map(mapRef.current).setView([26.2156, 90.6234], 12);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      addMarkersToMap();
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && users.length > 0) {
      addMarkersToMap();
    }
  }, [users]);

  const addMarkersToMap = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for each user
    users.forEach(user => {
      const avatarIcon = window.L.divIcon({
        className: 'custom-avatar-marker',
        html: `
          <div style="
            width: 50px; 
            height: 50px; 
            border-radius: 50%; 
            border: 3px solid ${user.status === 'Moving' ? '#10b981' : '#3b82f6'}; 
            background-image: url('${user.avatar}'); 
            background-size: cover; 
            background-position: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            width: 12px;
            height: 12px;
            background-color: ${user.status === 'Moving' ? '#10b981' : '#3b82f6'};
            border: 2px solid white;
            border-radius: 50%;
            animation: ${user.status === 'Moving' ? 'pulse 2s infinite' : 'none'};
          "></div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      });

      const marker = window.L.marker([user.lat, user.lng], { icon: avatarIcon })
        .addTo(mapInstanceRef.current)
        .on('click', () => setSelectedUser(user));

      markersRef.current.push(marker);
    });
  };

  // Simulate live tracking by moving users slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          lat: user.lat + (Math.random() - 0.5) * 0.002,
          lng: user.lng + (Math.random() - 0.5) * 0.002
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    return status === 'Moving' ? 'bg-green-500' : 'bg-blue-500';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full h-screen flex">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Live indicator */}
        <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Tracking</span>
          </div>
        </div>

        {/* User count */}
        <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{users.length} Users Online</span>
          </div>
        </div>
      </div>

      {/* User Details Panel */}
      {selectedUser && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">User Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                  <Badge className={`${getStatusColor(selectedUser.status)} text-white`}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{selectedUser.mobile}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {selectedUser.lat.toFixed(4)}, {selectedUser.lng.toFixed(4)}
                </span>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Zone Controller
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="font-medium">{selectedUser.zcName}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3" />
                    {selectedUser.zcMobile}
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4">
                <Phone className="w-4 h-4 mr-2" />
                Call User
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        .custom-avatar-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default LiveTracking;