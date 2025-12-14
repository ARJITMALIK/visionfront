import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import { 
  BarChart3, Activity, 
  MapPin, Table as TableIcon, Layers, Filter, Trash2, PlusCircle,
  Settings2, Database, Loader2, AlertTriangle, CheckCircle,
  Maximize2, Minimize2, X 
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

const Master_report = () => {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  
  // Data States
  const [surveys, setSurveys] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Loading & Progress States
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [loadingStatus, setLoadingStatus] = useState(''); 
  const [error, setError] = useState(null);

  // Configuration States
  const [groupingDimensions, setGroupingDimensions] = useState([]); 
  const [targetDimension, setTargetDimension] = useState('');       

  // Computed Analysis Data
  const [chartData, setChartData] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]); 
  
  // Diagnostics
  const [diagnostics, setDiagnostics] = useState({
    totalLoaded: 0,
    matched: 0,
    missing: 0,
    serverTotal: 0
  });

  // UI States
  const [activeTab, setActiveTab] = useState('chart'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChartFullScreen, setIsChartFullScreen] = useState(false);
  
  // Pagination / Limit Config
  const [targetLimit, setTargetLimit] = useState(10000); 
  
  // Map States
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [is3DView, setIs3DView] = useState(false);

  // Constants
  const COLORS = [
    '#2563eb', '#dc2626', '#16a34a', '#d97706', 
    '#7c3aed', '#db2777', '#0891b2', '#4b5563',
    '#84cc16', '#f59e0b', '#6366f1', '#14b8a6'
  ];

  const limitOptions = [1000, 2000, 5000, 10000, 20000];

  // ==========================================
  // 2. SMART DATA FETCHING (BATCH LOADER)
  // ==========================================

  useEffect(() => {
    fetchSurveysBatch();
  }, [targetLimit]);

  const fetchSurveysBatch = async () => {
    try {
      setLoading(true);
      setError(null);
      setSurveys([]); 
      
      let allRows = [];
      let currentPage = 0;
      let hasMore = true;
      let totalAvailableInDB = 0;
      
      const BATCH_SIZE = 500; 

      setLoadingStatus(`Initializing data stream...`);

      while (hasMore && allRows.length < targetLimit) {
        const percentage = Math.round((allRows.length / targetLimit) * 100);
        setProgress(percentage);
        setLoadingStatus(`Fetching records ${allRows.length} to ${Math.min(allRows.length + BATCH_SIZE, targetLimit)}...`);

        const response = await VisionBase.get(
          `/surveys?limit=${BATCH_SIZE}&page=${currentPage}&sorting_field=sur_id&sorting_type=DESC`
        );

        const rows = response.data.data.rows || [];
        totalAvailableInDB = response.data.data.count || 0;

        if (rows.length === 0) {
          hasMore = false; 
        } else {
          allRows = [...allRows, ...rows];
          currentPage++; 
        }

        if (allRows.length >= totalAvailableInDB) {
            hasMore = false;
        }
      }

      setSurveys(allRows);
      
      setDiagnostics({
          totalLoaded: allRows.length,
          serverTotal: totalAvailableInDB,
          matched: 0, 
          missing: 0
      });

      if (allRows.length > 0) {
        processQuestions(allRows.slice(0, 100));
      }

      setProgress(100);
      setLoadingStatus('Processing Analysis...');
      setTimeout(() => setLoading(false), 800);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to stream data');
      setLoading(false);
    }
  };

  const processQuestions = (sampleRows) => {
    const systemFields = [
      { label: '🏛️ Zone Name', value: 'system_zone_name', type: 'system' },
      { label: '🔢 Booth ID', value: 'system_booth_id', type: 'system' },
      { label: '👤 Surveyor (OT)', value: 'system_ot_name', type: 'system' },
      { label: '👥 Community', value: 'system_community', type: 'system' }
    ];

    const discoveredQuestions = new Map();
    sampleRows.forEach(s => {
        if(s.sur_data) {
            s.sur_data.forEach(q => {
                if(!discoveredQuestions.has(q.question)) {
                    discoveredQuestions.set(q.question, {
                        // CHANGED: Removed substring truncation to show full text
                        label: q.question, 
                        fullLabel: q.question,
                        value: q.question,
                        type: 'question'
                    });
                }
            });
        }
    });

    const allOptions = [...systemFields, ...Array.from(discoveredQuestions.values())];
    setQuestions(allOptions);
  };

  // ==========================================
  // 3. ROBUST ANSWER EXTRACTION
  // ==========================================

  const normalize = (str) => str ? str.toString().trim().toLowerCase() : '';

  const getAnswerValue = (survey, questionValue) => {
    if (!questionValue) return 'Unknown';

    if (questionValue === 'system_zone_name') return survey.zone_name || 'Unknown Zone';
    if (questionValue === 'system_booth_id') return survey.booth_id ? `Booth ${survey.booth_id}` : 'Unknown Booth';
    if (questionValue === 'system_ot_name') return survey.ot_name || 'Unknown OT';
    if (questionValue === 'system_community') {
      if (survey.community) return survey.community;
      const comQ = survey.sur_data?.find(q => normalize(q.question).includes('community'));
      return comQ ? comQ.answer : 'Unknown';
    }

    if (survey.sur_data && Array.isArray(survey.sur_data)) {
      let qData = survey.sur_data.find(q => q.question === questionValue);
      if (!qData) qData = survey.sur_data.find(q => normalize(q.question) === normalize(questionValue));
      if (qData && qData.answer) return qData.answer.trim();
    }
    return 'No Answer';
  };

  // ==========================================
  // 4. CALCULATION ENGINE
  // ==========================================

  useEffect(() => {
    if (surveys.length === 0 || !targetDimension || groupingDimensions.length === 0) {
      setChartData([]);
      setTargetKeys([]);
      return;
    }

    const matrix = {};
    const uniqueTargetKeys = new Set();
    let matchCount = 0;
    let missCount = 0;

    surveys.forEach(s => {
      const hasTarget = getAnswerValue(s, targetDimension) !== 'No Answer';
      const hasGroup = groupingDimensions.every(dim => getAnswerValue(s, dim) !== 'No Answer');
      
      if (hasTarget && hasGroup) matchCount++;
      else missCount++;

      const groupSegments = groupingDimensions.map(dim => getAnswerValue(s, dim));
      const groupKey = groupSegments.join(' | ');
      const targetVal = getAnswerValue(s, targetDimension);
      
      if (!matrix[groupKey]) {
        matrix[groupKey] = { name: groupKey, segments: groupSegments, total: 0 };
      }

      if (!matrix[groupKey][targetVal]) matrix[groupKey][targetVal] = 0;
      matrix[groupKey][targetVal]++;
      matrix[groupKey].total++;

      uniqueTargetKeys.add(targetVal);
    });

    setDiagnostics(prev => ({ ...prev, matched: matchCount, missing: missCount }));
    const processedData = Object.values(matrix).sort((a, b) => b.total - a.total);

    setChartData(processedData);
    setTargetKeys(Array.from(uniqueTargetKeys)); 

  }, [surveys, groupingDimensions, targetDimension]);

  // ==========================================
  // 5. MAP LOGIC & FULL SCREEN UTILS
  // ==========================================
  
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setIsChartFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'map' || !mapRef.current || !window.L) return;
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }

    const map = window.L.map(mapRef.current).setView([26.2006, 92.9376], 7); 
    const tileUrl = is3DView 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    window.L.tileLayer(tileUrl, { attribution: 'Map data', maxZoom: 19 }).addTo(map);

    const bounds = [];
    const validSurveys = surveys.filter(s => s.location);
    const mapData = validSurveys.slice(0, 3000); 

    mapData.forEach(s => {
      const coords = s.location.split(',').map(c => parseFloat(c.trim()));
      if (coords.length !== 2 || isNaN(coords[0])) return;
      const [lat, lng] = coords;
      
      const targetVal = getAnswerValue(s, targetDimension);
      const colorIndex = targetKeys.indexOf(targetVal);
      const color = colorIndex >= 0 ? COLORS[colorIndex % COLORS.length] : '#9ca3af';

      const marker = window.L.circleMarker([lat, lng], {
        radius: 6, fillColor: color, color: '#fff', weight: 1, fillOpacity: 0.8
      });
      marker.bindPopup(`<b>${s.citizen_name || 'Citizen'}</b><br/>${targetVal}`);
      marker.addTo(map);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50] });
    mapInstanceRef.current = map;
  }, [activeTab, is3DView, surveys, targetDimension, groupingDimensions, targetKeys]);

  const renderChart = () => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize:11}}/>
            <YAxis/>
            <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            {targetKeys.map((k,i) => <Bar key={k} dataKey={k} stackId="a" fill={COLORS[i%COLORS.length]} radius={[2, 2, 0, 0]}/>)}
        </BarChart>
    </ResponsiveContainer>
  );

  // ==========================================
  // 6. UI RENDER
  // ==========================================

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      
      {/* --- FULL SCREEN CHART MODAL --- */}
      {isChartFullScreen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in fade-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shadow-sm bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Detailed Analysis Chart</h2>
                    <p className="text-sm text-gray-500">
                        Comparing <span className="font-semibold text-blue-600">{questions.find(q=>q.value===targetDimension)?.label || targetDimension}</span> by Grouping
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsChartFullScreen(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center gap-2 text-gray-600 font-medium"
                    >
                        <Minimize2 size={20} /> <span className="hidden sm:inline">Exit Full Screen</span>
                    </button>
                    <button 
                        onClick={() => setIsChartFullScreen(false)}
                        className="p-2 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>
            <div className="flex-1 p-8 bg-white">
                {renderChart()}
            </div>
        </div>
      )}

      {/* --- FULL SCREEN LOADING OVERLAY --- */}
      {loading && (
        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-96 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <svg className="animate-spin w-full h-full text-blue-100" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 text-xl">
                        {progress}%
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dataset</h2>
                <p className="text-blue-600 font-medium animate-pulse mb-4">{loadingStatus}</p>
                
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">
                    Fetching {surveys.length.toLocaleString()} of {targetLimit.toLocaleString()} records
                </p>
            </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><Activity size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Analytics Pro</h1>
            <div className="text-xs text-gray-500 font-medium">Batch Data Processor</div>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-gray-600 bg-gray-100 rounded">
            <Settings2 size={20}/>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR */}
        <aside className={`absolute md:relative z-20 h-full w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
              <Filter size={14} /> Configuration
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            {/* Limit Config */}
            <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">1. Dataset Size</label>
                 <select 
                    className="w-full mt-1 text-sm border border-gray-300 rounded-lg py-2 px-3 bg-blue-50/50 text-blue-800 font-medium"
                    value={targetLimit}
                    onChange={(e) => setTargetLimit(Number(e.target.value))}
                >
                    {limitOptions.map(o => <option key={o} value={o}>Analyze {o.toLocaleString()} Records</option>)}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Larger datasets take longer to load.</p>
            </div>

            {/* Grouping */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">2. Group By (Rows)</label>
              <div className="relative mb-3">
                <select 
                  onChange={(e) => {
                      if(e.target.value && !groupingDimensions.includes(e.target.value)) 
                        setGroupingDimensions([...groupingDimensions, e.target.value]);
                      e.target.value = '';
                  }}
                  className="w-full text-sm border border-gray-300 rounded-lg py-2 pl-3 pr-8 shadow-sm"
                >
                  <option value="">+ Add Grouping</option>
                  <optgroup label="System"><option value="system_zone_name">Zone</option><option value="system_booth_id">Booth</option></optgroup>
                  <optgroup label="Questions">{questions.filter(q=>q.type==='question').map(q=><option key={q.value} value={q.value}>{q.label}</option>)}</optgroup>
                </select>
                <PlusCircle className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
              <div className="space-y-2">
                {groupingDimensions.map((dim, i) => (
                    <div key={dim} className="flex justify-between bg-blue-50 px-3 py-2 rounded-md text-sm border border-blue-100">
                        <span className="truncate w-10/12">{questions.find(q=>q.value===dim)?.label || dim}</span>
                        <button onClick={()=>setGroupingDimensions(groupingDimensions.filter(d=>d!==dim))}><Trash2 size={14} className="text-red-400"/></button>
                    </div>
                ))}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">3. Compare (Columns)</label>
              <select 
                value={targetDimension}
                onChange={(e) => setTargetDimension(e.target.value)}
                className="w-full text-sm border border-orange-200 bg-orange-50/50 rounded-lg py-2 px-3 shadow-sm"
              >
                <option value="">-- Select Target --</option>
                <optgroup label="Questions">{questions.filter(q=>q.type==='question').map(q=><option key={q.value} value={q.value}>{q.label}</option>)}</optgroup>
              </select>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 relative">
          
          {/* DIAGNOSTIC PANEL */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-6 items-center">
             <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                 <div className="p-2 rounded-lg bg-green-100 text-green-700">
                     <Database size={20}/>
                 </div>
                 <div>
                     <div className="text-xs text-gray-500 uppercase font-bold">In Memory</div>
                     <div className="text-lg font-bold text-gray-900">
                        {diagnostics.totalLoaded.toLocaleString()} 
                     </div>
                 </div>
             </div>

             <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                 <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><CheckCircle size={20} /></div>
                 <div>
                     <div className="text-xs text-gray-500 uppercase font-bold">Valid Matches</div>
                     <div className="text-lg font-bold text-gray-900">{diagnostics.matched.toLocaleString()}</div>
                 </div>
             </div>

             <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-red-100 text-red-700"><AlertTriangle size={20} /></div>
                 <div>
                     <div className="text-xs text-gray-500 uppercase font-bold">Missing Data</div>
                     <div className="text-lg font-bold text-gray-900">{diagnostics.missing.toLocaleString()}</div>
                 </div>
             </div>
          </div>

          {/* CHARTS / TABS */}
          {(!targetDimension || groupingDimensions.length === 0) ? (
            <div className="text-center p-12 text-gray-400">
                <Layers size={48} className="mx-auto mb-4 opacity-50"/>
                <p>Select configuration to view report</p>
            </div>
          ) : (
            <div className="space-y-6">
                <div className="flex gap-2">
                    {['chart', 'table', 'map'].map(t => (
                        <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${activeTab===t ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>{t}</button>
                    ))}
                </div>

                {activeTab === 'chart' && (
                    <div className="relative bg-white p-6 rounded-xl shadow-sm border h-[500px] group">
                        {/* --- WIDE/MAXIMIZE BUTTON --- */}
                        <button 
                            onClick={() => setIsChartFullScreen(true)}
                            className="absolute top-4 right-4 z-10 p-2 bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 border border-transparent hover:border-blue-200"
                            title="Full Screen Mode"
                        >
                            <Maximize2 size={18} />
                        </button>
                        
                        {renderChart()}
                    </div>
                )}

                {activeTab === 'table' && (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-xs">
                                <tr>
                                    {groupingDimensions.map(d=><th key={d} className="px-6 py-4">{questions.find(q=>q.value===d)?.label||d}</th>)}
                                    {targetKeys.map(k=><th key={k} className="px-6 py-4 text-blue-600">{k}</th>)}
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row,i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        {row.segments.map((s,si)=><td key={si} className="px-6 py-4 font-medium">{s}</td>)}
                                        {targetKeys.map(k=><td key={k} className="px-6 py-4 text-gray-600">{row[k]||0}</td>)}
                                        <td className="px-6 py-4 text-right font-bold">{row.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {activeTab === 'map' && <div ref={mapRef} className="h-[600px] w-full rounded-xl border bg-white"/>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Master_report;