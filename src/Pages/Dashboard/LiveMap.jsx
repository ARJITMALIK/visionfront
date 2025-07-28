import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data representing survey coordinates for different political parties across Assam districts
const mockSurveyData = {
  'BJP': [
    '26.1445, 91.7362', // Guwahati (Kamrup Metro)
    '27.4728, 94.9120', // Dibrugarh 
    '26.6336, 92.7933', // Tezpur (Sonitpur)
    '26.7509, 94.2037', // Jorhat
    '26.3484, 92.6931', // Nagaon
    '25.5788, 94.9094', // Margherita (Tinsukia)
    '26.1584, 89.8519'  // Dhubri
  ],
  'INC': [
    '24.8333, 92.7789', // Silchar (Cachar)
    '25.1689, 93.9222', // Haflong (Dima Hasao)
    '24.8697, 92.3542', // Karimganj
    '26.0050, 94.6189', // Sivasagar
    '26.7041, 93.2551', // Golaghat
    '25.0961, 94.3617'  // Hailakandi
  ],
  'AGP': [
    '26.2006, 92.9376', // Morigaon
    '26.6469, 92.2831', // Mangaldoi (Darrang)
    '26.3775, 93.7150', // Golaghat
    '27.0844, 94.6291', // Majuli
    '26.9500, 94.7833'  // Lakhimpur
  ],
  'CPI(M)': [
    '24.8006, 92.5842', // Hailakandi
    '24.9531, 92.8661', // Cachar (rural)
    '25.3247, 93.3169', // North Cachar Hills
    '26.0667, 94.5778'  // Sivasagar (rural)
  ],
  'BPF': [
    '26.4547, 90.3564', // Kokrajhar
    '26.3958, 90.1292', // Gossaigaon (Kokrajhar)
    '26.7833, 90.3167', // Chirang
    '26.6417, 90.6389'  // Bongaigaon
  ],
  'UPPL': [
    '26.3958, 90.1292', // Kokrajhar (BTAD area)
    '26.5436, 89.8622', // Goalpara
    '26.1667, 90.7667'  // Barpeta
  ],
  'OTH': [
    '27.2833, 95.3167', // Tinsukia
    '26.9031, 95.1364', // Sadiya (Tinsukia)
    '25.8361, 93.9286', // Lumding (Hojai)
    '26.0167, 93.9500', // Hojai
    '27.5167, 95.1167'  // Margherita area
  ]
};

const LiveMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process mock data into the format expected by the map
  const processData = () => {
    const processedData = [];
    let colIndex = 0;

    Object.entries(mockSurveyData).forEach(([partyName, coordinates]) => {
      const partyCoordinates = [];
      
      coordinates.forEach((coordString, rowIndex) => {
        const coordMatch = coordString.trim().match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
            partyCoordinates.push({ lat, lng, rowIndex: rowIndex + 1 });
          }
        }
      });

      if (partyCoordinates.length > 0) {
        processedData.push({
          party: partyName,
          coordinates: partyCoordinates,
          color: getPartyColor(partyName, colIndex)
        });
      }
      colIndex++;
    });

    return processedData;
  };

  const getPartyColor = (partyName, index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D5A6BD'
    ];
    
    const partyColorMap = {
      'BJP': '#FF8C00',
      'INC': '#19AAED',
      'OTH': '#6B7280',
      'AGP': '#8B0000',
      'CPI(M)': '#DC2626',
      'BPF': '#1E40AF',
      'UPPL': '#EAB308'
    };
    
    return partyColorMap[partyName] || colors[index % colors.length];
  };

  const initializeMap = (data) => {
    // Load Leaflet dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);

      // Initialize map centered on Assam
      const leafletMap = window.L.map(mapRef.current).setView([26.2006, 92.9376], 8);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);

      const bounds = [];
      
      // Add individual survey points as colored dots
      data.forEach((partyData) => {
        const { party, coordinates, color } = partyData;
        
        coordinates.forEach((coord, index) => {
          bounds.push([coord.lat, coord.lng]);
          
          const marker = window.L.circleMarker([coord.lat, coord.lng], {
            color: '#ffffff',
            fillColor: color,
            fillOpacity: 0.8,
            radius: 6,
            stroke: true,
            weight: 2
          });

          // Create popup with details and Google Maps button
          const popupContent = `
            <div style="min-width: 200px;">
              <div style="margin-bottom: 8px;">
                <strong style="color: ${color}; font-size: 16px;">${party}</strong>
              </div>
              <div style="margin-bottom: 8px; font-size: 14px;">
                <strong>Survey Point #${index + 1}</strong>
              </div>
              <div style="margin-bottom: 8px; font-size: 13px; color: #666;">
                <strong>Coordinates:</strong><br>
                Latitude: ${coord.lat}<br>
                Longitude: ${coord.lng}
              </div>
              <button 
                onclick="window.open('https://www.google.com/maps?q=${coord.lat},${coord.lng}', '_blank')"
                style="
                  background-color: #4285f4;
                  color: white;
                  border: none;
                  padding: 8px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  width: 100%;
                  margin-top: 5px;
                "
                onmouseover="this.style.backgroundColor='#3367d6'"
                onmouseout="this.style.backgroundColor='#4285f4'"
              >
                📍 Open in Google Maps
              </button>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
          });

          // Add hover effect
          marker.on('mouseover', function() {
            this.setStyle({
              radius: 8,
              fillOpacity: 1
            });
          });

          marker.on('mouseout', function() {
            this.setStyle({
              radius: 6,
              fillOpacity: 0.8
            });
          });

          marker.addTo(leafletMap);
        });
      });

      // Fit map to show all points
      if (bounds.length > 0) {
        leafletMap.fitBounds(bounds, { padding: [20, 20] });
      }

      setMap(leafletMap);
      setIsLoading(false);
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    const data = processData();
    setMapData(data);
    
    // Initialize map after component mounts
    setTimeout(() => {
      initializeMap(data);
    }, 100);

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Calculate statistics
  const totalPoints = mapData.reduce((sum, item) => sum + item.coordinates.length, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Political Survey Map Viewer</CardTitle>
          <p className="text-gray-600">Interactive map showing survey points across Assam by political party</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Legend */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Party Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {mapData.map((item) => {
                const percentage = totalPoints > 0 ? ((item.coordinates.length / totalPoints) * 100).toFixed(1) : 0;
                return (
                  <div key={item.party} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.party}</span>
                    <Badge variant="secondary" className="text-xs">
                      {percentage}%
                    </Badge>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Click on any dot to see details and get directions • Total survey points: {totalPoints}
            </p>
          </div>

          {/* Map Container */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Loading map...</p>
                    </div>
                  </div>
                )}
                <div 
                  ref={mapRef} 
                  className="w-full rounded-lg border-2 border-gray-200" 
                  style={{ height: '600px', minHeight: '400px' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{mapData.length}</div>
                <div className="text-sm text-gray-600">Political Parties</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
                <div className="text-sm text-gray-600">Survey Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {mapData.length > 0 ? Math.round(totalPoints / mapData.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg. Points/Party</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">Assam</div>
                <div className="text-sm text-gray-600">Coverage Area</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </div>
  );
};

export default LiveMap;