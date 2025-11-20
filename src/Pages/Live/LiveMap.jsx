import React, { useEffect, useRef, useState } from 'react';
import { VisionBase } from '@/utils/axiosInstance';
import { Loader2, MapPin, Users, TrendingUp, AlertCircle } from 'lucide-react';

// UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800"
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const LiveMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [surveyData, setSurveyData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch survey data from API
  const fetchSurveys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await VisionBase.get('/surveys');
      const apiData = response.data.data.rows;
      
      // Transform API data
      const transformedData = apiData.map(item => {
        // Parse coordinates from location string
        // Expected format: "Zone Name, latitude, longitude" or just "latitude, longitude"
        let latitude = null;
        let longitude = null;
        
        if (item.location) {
          const parts = item.location.split(',').map(p => p.trim());
          
          // Try to parse coordinates from the location string
          if (parts.length >= 2) {
            // Last two parts should be coordinates
            const potentialLat = parseFloat(parts[parts.length - 2]);
            const potentialLng = parseFloat(parts[parts.length - 1]);
            
            if (!isNaN(potentialLat) && !isNaN(potentialLng)) {
              latitude = potentialLat;
              longitude = potentialLng;
            }
          }
        }
        
        return {
          id: item.sur_id,
          name: item.citizen_name,
          mobile: item.citizen_mobile,
          otName: item.ot_name || 'N/A',
          zcName: item.ot_parent_name || 'N/A',
          zoneName: item.zone_name || 'N/A',
          location: item.location,
          date: new Date(item.date).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
          duration: item.duration,
          latitude,
          longitude,
          surData: item.sur_data
        };
      }).filter(item => item.latitude !== null && item.longitude !== null); // Only include items with valid coordinates
      
      setSurveyData(transformedData);
      
      if (transformedData.length === 0) {
        setError('No survey data with valid coordinates found.');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to fetch survey data. Please check your API endpoint.');
      console.error('Error fetching surveys:', err);
    }
  };

  // Process survey data by grouping by OT or Zone
  const processData = () => {
    if (surveyData.length === 0) return [];

    // Group surveys by OT (Operator)
    const groupedByOT = surveyData.reduce((acc, survey) => {
      const key = survey.otName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(survey);
      return acc;
    }, {});

    const processedData = [];
    let colorIndex = 0;

    Object.entries(groupedByOT).forEach(([otName, surveys]) => {
      const coordinates = surveys.map((survey, index) => ({
        lat: survey.latitude,
        lng: survey.longitude,
        surveyId: survey.id,
        citizenName: survey.name,
        citizenMobile: survey.mobile,
        date: survey.date,
        duration: survey.duration,
        zoneName: survey.zoneName,
        zcName: survey.zcName,
        location: survey.location,
        rowIndex: index + 1
      }));

      processedData.push({
        groupName: otName,
        type: 'OT',
        coordinates: coordinates,
        color: getColorForGroup(otName, colorIndex)
      });
      colorIndex++;
    });

    return processedData;
  };

  const getColorForGroup = (name, index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D5A6BD',
      '#FF8C00', '#19AAED', '#8B0000', '#DC2626', '#1E40AF'
    ];
    
    return colors[index % colors.length];
  };

  const initializeMap = (data) => {
    if (data.length === 0) {
      setIsLoading(false);
      return;
    }

    // Load Leaflet dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);

      // Calculate center of all coordinates
      const allCoords = data.flatMap(group => group.coordinates);
      const avgLat = allCoords.reduce((sum, coord) => sum + coord.lat, 0) / allCoords.length;
      const avgLng = allCoords.reduce((sum, coord) => sum + coord.lng, 0) / allCoords.length;

      // Initialize map
      const leafletMap = window.L.map(mapRef.current).setView([avgLat, avgLng], 8);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(leafletMap);

      const bounds = [];
      
      // Add survey points as colored markers
      data.forEach((groupData) => {
        const { groupName, coordinates, color, type } = groupData;
        
        coordinates.forEach((coord) => {
          bounds.push([coord.lat, coord.lng]);
          
          const marker = window.L.circleMarker([coord.lat, coord.lng], {
            color: '#ffffff',
            fillColor: color,
            fillOpacity: 0.8,
            radius: 7,
            stroke: true,
            weight: 2
          });

          // Create detailed popup
          const popupContent = `
            <div style="min-width: 280px; max-width: 320px;">
              <div style="background: linear-gradient(135deg, ${color}22 0%, ${color}11 100%); padding: 12px; border-radius: 8px 8px 0 0; margin: -12px -12px 12px -12px; border-bottom: 2px solid ${color};">
                <strong style="color: ${color}; font-size: 16px; display: block; margin-bottom: 4px;">📍 Survey #${coord.surveyId}</strong>
                <div style="font-size: 12px; color: #666;">${coord.date} • ${coord.duration || 'N/A'}</div>
              </div>
              
              <div style="margin-bottom: 10px;">
                <div style="font-size: 13px; color: #333; margin-bottom: 6px;">
                  <strong>👤 Citizen:</strong> ${coord.citizenName}
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
                  <strong>📞 Mobile:</strong> ${coord.citizenMobile}
                </div>
              </div>
              
              <div style="background: #f9fafb; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                  <strong>🏢 ${type}:</strong> ${groupName}
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                  <strong>🛡️ ZC:</strong> ${coord.zcName}
                </div>
                <div style="font-size: 12px; color: #666;">
                  <strong>🏛️ Zone:</strong> ${coord.zoneName}
                </div>
              </div>
              
              <div style="margin-bottom: 10px; font-size: 11px; color: #888; padding: 6px; background: #f3f4f6; border-radius: 4px;">
                <strong>📍 Coordinates:</strong><br>
                Lat: ${coord.lat.toFixed(6)}, Lng: ${coord.lng.toFixed(6)}
              </div>
              
              <button 
                onclick="window.open('https://www.google.com/maps?q=${coord.lat},${coord.lng}', '_blank')"
                style="
                  background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%);
                  color: white;
                  border: none;
                  padding: 10px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 13px;
                  font-weight: 600;
                  width: 100%;
                  box-shadow: 0 2px 4px rgba(66, 133, 244, 0.3);
                  transition: all 0.2s;
                "
                onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(66, 133, 244, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(66, 133, 244, 0.3)'"
              >
                🗺️ Open in Google Maps
              </button>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 350,
            className: 'custom-popup'
          });

          // Add hover effect
          marker.on('mouseover', function() {
            this.setStyle({
              radius: 10,
              fillOpacity: 1,
              weight: 3
            });
          });

          marker.on('mouseout', function() {
            this.setStyle({
              radius: 7,
              fillOpacity: 0.8,
              weight: 2
            });
          });

          marker.addTo(leafletMap);
        });
      });

      // Fit map to show all points with padding
      if (bounds.length > 0) {
        leafletMap.fitBounds(bounds, { padding: [50, 50] });
      }

      setMap(leafletMap);
      setIsLoading(false);
    };

    script.onerror = () => {
      setError('Failed to load map library. Please check your internet connection.');
      setIsLoading(false);
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    if (surveyData.length > 0) {
      const data = processData();
      setMapData(data);
      
      setTimeout(() => {
        initializeMap(data);
      }, 100);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [surveyData]);

  // Calculate statistics
  const totalPoints = mapData.reduce((sum, item) => sum + item.coordinates.length, 0);
  const totalOTs = mapData.length;
  const totalZones = new Set(surveyData.map(s => s.zoneName)).size;
  const totalZCs = new Set(surveyData.map(s => s.zcName)).size;

  return (
    <div className="min-h-screen ">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
       

        <Card>
       
          
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800">Error Loading Data</h4>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {!error && (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className=" text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">
                        {isLoading ? '...' : totalPoints}
                      </div>
                      <div className="text-sm text-gray-600">Survey Points</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className=" text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">
                        {isLoading ? '...' : totalOTs}
                      </div>
                      <div className="text-sm text-gray-600">Field Operators</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className=" text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">
                        {isLoading ? '...' : totalZones}
                      </div>
                      <div className="text-sm text-gray-600">Total Zones</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className=" text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold text-orange-600">
                        {isLoading ? '...' : totalZCs}
                      </div>
                      <div className="text-sm text-gray-600">Zone Coordinators</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Legend */}
                {!isLoading && mapData.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                      {mapData.map((item) => {
                        return (
                          <div key={item.groupName} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium truncate flex-1">{item.groupName}</span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {item.coordinates.length}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 Click on any marker to view survey details and get directions
                    </p>
                  </div>
                )}

                {/* Map Container */}
                <Card>
                  <CardContent className="p-4">
                    <div className="relative">
                      {isLoading && (
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold">Loading survey data...</p>
                            <p className="text-gray-500 text-sm mt-1">Please wait while we fetch the latest records</p>
                          </div>
                        </div>
                      )}
                      <div 
                        ref={mapRef} 
                        className="w-full rounded-xl border-2 border-gray-200 shadow-lg" 
                        style={{ height: '600px', minHeight: '400px' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px;
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default LiveMap;