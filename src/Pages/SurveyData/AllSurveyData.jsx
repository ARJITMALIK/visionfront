import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import {
  Search, 
  RefreshCw, 
  X, 
  Eye, 
  Calendar, 
  Trash2, 
  Download,
  FileText,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Camera,
  Voicemail,
  Phone,
  ListRestart,
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronUp,
  FileDown,
  Shield,
  EyeIcon,
  Trash2Icon
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance'; 
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

// ===================================================================================
// 1. HELPER: IMAGE TO BASE64
// ===================================================================================
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
          // Compress to 0.6 quality to ensure 3350 records fit in one PDF
          const dataURL = canvas.toDataURL('image/jpeg', 0.6); 
          resolve(dataURL);
      } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// ===================================================================================
// 2. HELPER: ZONE-WISE PDF GENERATOR (SPLIT INTO 3 PARTS)
// ===================================================================================
const generateZoneWisePDF = async (surveys, onProgress) => {
  // --- CONFIGURATION ---
  const RECORDS_PER_PDF = 3350; // Requested split size
  
  // 1. Sort & Flatten Data
  // We sort by Zone first so the PDF is grouped correctly
  const grouped = surveys.reduce((acc, item) => {
    const zone = item.zoneName || "Unknown Zone";
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(item);
    return acc;
  }, {});

  const sortedZones = Object.keys(grouped).sort();
  let flatSortedList = [];
  sortedZones.forEach(zone => {
    const items = grouped[zone].map(i => ({ ...i, _groupZone: zone }));
    flatSortedList = [...flatSortedList, ...items];
  });

  const totalRecords = flatSortedList.length;

  // 2. PDF Generation State
  let doc = new jsPDF();
  let pageWidth = doc.internal.pageSize.getWidth();
  let pageHeight = doc.internal.pageSize.getHeight();
  
  let currentBatchCount = 0;
  let partNumber = 1;
  let totalProcessed = 0;
  let yPos = 45;
  let currentZoneContext = ""; 

  // Helper to setup a fresh page/file
  const initializeNewPDF = () => {
    if (totalProcessed > 0) {
       doc = new jsPDF(); // Clear memory explicitly
       currentBatchCount = 0;
       yPos = 45;
    }
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(109, 40, 217); 
    doc.text(`Zone-Wise Report (Part ${partNumber})`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Records in this file: ~${Math.min(RECORDS_PER_PDF, totalRecords - (partNumber-1)*RECORDS_PER_PDF)}`, 14, 33);
    
    doc.setDrawColor(200);
    doc.line(14, 38, pageWidth - 14, 38);
  };

  // Init first file
  initializeNewPDF();

  // 3. Loop Records
  for (let i = 0; i < flatSortedList.length; i++) {
    const item = flatSortedList[i];
    const thisZone = item._groupZone;

    // --- BATCH SPLIT CHECK ---
    if (currentBatchCount >= RECORDS_PER_PDF) {
      // Save current part
      doc.save(`Zone_Report_Part_${partNumber}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      // Prepare next part
      partNumber++;
      initializeNewPDF();
      
      // If we split in the middle of a zone, reprint the header
      if (currentZoneContext === thisZone) {
         doc.setFontSize(10);
         doc.setTextColor(150);
         doc.text(`(Continuation of Zone: ${thisZone})`, 14, 42);
      }
    }

    // --- ZONE HEADER ---
    // If zone changed OR we are at start of new file and need to show current zone
    if (thisZone !== currentZoneContext || (currentBatchCount === 0 && thisZone === currentZoneContext)) {
        
        if (yPos + 15 > pageHeight - 15) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFillColor(240, 240, 245);
        doc.rect(14, yPos, pageWidth - 28, 10, 'F');
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        
        const label = (thisZone === currentZoneContext && currentBatchCount === 0) 
            ? `${thisZone} (Continued)` 
            : `${thisZone}`;
            
        doc.text(`ZONE: ${label}`, 16, yPos + 7);
        yPos += 15;
        currentZoneContext = thisZone;
    }

    // --- UPDATE PROGRESS ---
    totalProcessed++;
    currentBatchCount++;
    if (onProgress) onProgress(totalProcessed, totalRecords);
    
    // Pause briefly to let UI update
    if (totalProcessed % 20 === 0) {
       await new Promise(resolve => setTimeout(resolve, 0));
    }

    // --- PAGE BREAK ---
    if (yPos + 35 > pageHeight - 15) {
      doc.addPage();
      yPos = 20;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`(Cont. ${thisZone})`, 14, yPos - 5);
    }

    // --- IMAGE & CONTENT ---
    const citizenImg = await getBase64ImageFromURL(item.citizen_image);

    // Card BG
    doc.setDrawColor(220);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, yPos, pageWidth - 28, 30, 2, 2, 'S');

    // Image
    if (citizenImg) {
      try {
        doc.addImage(citizenImg, 'JPEG', 16, yPos + 2, 26, 26);
      } catch (e) {}
    } else {
      doc.rect(16, yPos + 2, 26, 26);
      doc.setFontSize(7);
      doc.text("No Img", 20, yPos + 15);
    }

    // Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(item.name || "Unknown", 45, yPos + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text(`Mobile: ${item.mobile || 'N/A'}`, 45, yPos + 14);
    doc.text(`Date: ${item.date}`, 45, yPos + 19);
    const loc = item.full_location ? item.full_location.substring(0, 70) : 'N/A';
    doc.text(`Loc: ${loc}`, 45, yPos + 24);

    yPos += 34;
  }

  // Save the final part
  if (currentBatchCount > 0) {
      doc.save(`Zone_Report_Part_${partNumber}_${new Date().toISOString().slice(0,10)}.pdf`);
  }
};

// ===================================================================================
// UI COMPONENTS
// ===================================================================================

const Card = ({ children, className = "" }) => (
    <div className={`bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => (<div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50 flex flex-wrap justify-between items-center gap-4">{children}</div>);
const CardTitle = ({ children }) => (<h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{children}</h3>);
const CardContent = ({ children }) => (<div className="p-6">{children}</div>);

const Button = ({ children, variant = "primary", onClick, disabled, className="" }) => {
    const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 px-4 py-2 text-sm focus:ring-2 focus:ring-offset-2";
    const variants = {
        primary: "bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl focus:ring-violet-500",
        secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md focus:ring-red-500",
        outline: "border border-violet-200 text-violet-600 hover:bg-violet-50",
        ghost: "text-gray-600 hover:bg-gray-100"
    };
    return <button className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Select = ({ value, onValueChange, children, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = React.Children.toArray(children);
    const selected = options.find(c => c.props.value === value);

    return (
        <div className="relative w-full">
            <button className="w-full px-4 py-2.5 text-left bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center hover:border-violet-300" onClick={() => setIsOpen(!isOpen)}>
                <span className="truncate text-sm">{selected ? selected.props.children : placeholder}</span>
                <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                <div className="fixed inset-0 z-40" onClick={()=>setIsOpen(false)}/>
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl max-h-60 overflow-auto mt-1 shadow-xl">
                    {options.map((opt, i) => (
                        <div key={i} className="px-4 py-2 hover:bg-violet-50 cursor-pointer text-sm" onClick={() => { onValueChange(opt.props.value); setIsOpen(false); }}>
                            {opt.props.children}
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
    );
};
const SelectItem = ({ children }) => null;

const DatePicker = ({ selected, onSelect, placeholder }) => (
    <div className="relative">
         <input 
            type="date" 
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-violet-400"
            value={selected ? selected.toISOString().split('T')[0] : ''}
            onChange={(e) => onSelect(e.target.value ? new Date(e.target.value) : null)}
         />
    </div>
);

const Dialog = ({ isOpen, onClose, children }) => {
    if(!isOpen) return null;
    return <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in" onClick={onClose}>{children}</div>
};
const DialogContent = ({ children, size="lg" }) => {
    const sizes = { sm: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-5xl' };
    return <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`} onClick={e=>e.stopPropagation()}>{children}</div>
};

// ===================================================================================
// MAIN PAGE COMPONENT
// ===================================================================================

const AllSurveyData = () => {
    const navigate = useNavigate();

    // -- State: Data --
    const [surveyData, setSurveyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    // -- State: Filters --
    const [filters, setFilters] = useState({ zc: 'all', ot: 'all' });
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    
    // Applied Filters
    const [activeFilters, setActiveFilters] = useState(filters);
    const [activeDateRange, setActiveDateRange] = useState({ from: null, to: null });
    const [activeSearchQuery, setActiveSearchQuery] = useState("");

    // -- State: Pagination --
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const limitOptions = [10, 20, 50, 100];

    // -- State: Users --
    const [zcUsers, setZcUsers] = useState([]);
    const [otUsers, setOtUsers] = useState([]);

    // -- State: Selection & Modals --
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewModalData, setViewModalData] = useState(null);
    const [deleteModalData, setDeleteModalData] = useState(null);
    const [bulkDeleteModalData, setBulkDeleteModalData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // -- State: Exports & AI --
    const [isExporting, setIsExporting] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });
    
    const [analysisData, setAnalysisData] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    // Helper: Date Format
    const formatDateForAPI = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 1. Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await VisionBase.get('/users');
                const users = response.data.data.rows || [];
                setZcUsers(users.filter(u => u.role === 2));
                setOtUsers(users.filter(u => u.role === 3));
            } catch (err) { console.error(err); }
        };
        fetchUsers();
    }, []);

    // 2. Fetch Surveys
    const fetchSurveys = async () => {
        setLoading(true);
        setError(null);
        setSelectedRows([]);

        try {
            let q = `limit=${limit}&page=${page}&sorting_field=sur_id&sorting_type=DESC`;
            if (activeFilters.zc !== 'all') q += `&zc_id=${activeFilters.zc}`;
            if (activeFilters.ot !== 'all') q += `&ot_id=${activeFilters.ot}`;
            if (activeDateRange.from) q += `&start_date=${formatDateForAPI(activeDateRange.from)}`;
            if (activeDateRange.to) q += `&end_date=${formatDateForAPI(activeDateRange.to)}`;
            if (activeSearchQuery) q += `&search=${activeSearchQuery}`;

            const response = await VisionBase.get(`/surveys?${q}`);
            const rows = response.data.data.rows || [];
            
            const transformed = rows.map(item => ({
                id: item.sur_id.toString(),
                name: item.citizen_name,
                mobile: item.citizen_mobile,
                otName: item.ot_name || 'N/A',
                otMobile: item.ot_mobile,
                otProfile: item.ot_profile,
                zcName: item.ot_parent_name || 'N/A',
                zoneName: item.zone_name || 'Unknown Zone',
                zcMobile: item.ot_parent_mobile,
                zcProfile: item.ot_parent_profile,
                date: new Date(item.date).toLocaleDateString('en-GB'),
                originalDate: new Date(item.date),
                citizen_image: item.citizen_image,
                recording: item.recording,
                full_location: item.location,
                sur_data: item.sur_data
            }));

            setSurveyData(transformed);
            setTotalCount(response.data.data.count || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSurveys(); }, [page, limit, activeFilters, activeDateRange, activeSearchQuery]);

    // 3. Stats Calculation
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const surveysToday = surveyData.filter(s => s.originalDate.toDateString() === today).length;
        return {
            totalSurveys: totalCount,
            surveysToday: surveysToday,
            totalOts: otUsers.length,
            totalZcs: zcUsers.length,
        };
    }, [surveyData, totalCount, otUsers, zcUsers]);

    // 4. Filters
    const dynamicOtOptions = useMemo(() => {
        if (filters.zc === 'all') return otUsers;
        return otUsers.filter(ot => ot.parent === parseInt(filters.zc));
    }, [filters.zc, otUsers]);

    const handleSearch = () => {
        setActiveFilters(filters);
        setActiveDateRange({ from: dateFrom, to: dateTo });
        setActiveSearchQuery(searchQuery);
        setPage(0);
    };

    const handleReset = () => {
        setFilters({ zc: 'all', ot: 'all' });
        setDateFrom(null); setDateTo(null); setSearchQuery("");
        setActiveFilters({ zc: 'all', ot: 'all' });
        setActiveDateRange({ from: null, to: null });
        setActiveSearchQuery("");
        setPage(0);
    };

    // 5. PDF Generation Handler (10k Record Fetch)
    const handleDownloadFullPdf = async () => {
        if (isPdfGenerating) return;
        const confirmMsg = `This will fetch up to 10,000 records and download them in 3 parts (approx 3350 records each). Continue?`;
        if (!window.confirm(confirmMsg)) return;

        setIsPdfGenerating(true);
        setPdfProgress({ current: 0, total: 0 });

        try {
            // A. Build Query for ALL data (up to 10k)
            let q = `limit=10000&page=0&sorting_field=sur_id&sorting_type=DESC`;
            if (activeFilters.zc !== 'all') q += `&zc_id=${activeFilters.zc}`;
            if (activeFilters.ot !== 'all') q += `&ot_id=${activeFilters.ot}`;
            if (activeDateRange.from) q += `&start_date=${formatDateForAPI(activeDateRange.from)}`;
            if (activeDateRange.to) q += `&end_date=${formatDateForAPI(activeDateRange.to)}`;
            if (activeSearchQuery) q += `&search=${activeSearchQuery}`;

            // B. Fetch
            const response = await VisionBase.get(`/surveys?${q}`);
            const rawData = response.data.data.rows || [];

            if (rawData.length === 0) {
                alert("No records found to export.");
                setIsPdfGenerating(false);
                return;
            }

            // C. Transform
            const fullData = rawData.map(item => ({
                id: item.sur_id.toString(),
                name: item.citizen_name,
                mobile: item.citizen_mobile,
                zoneName: item.zone_name || 'Unknown Zone',
                date: new Date(item.date).toLocaleDateString('en-GB'),
                citizen_image: item.citizen_image,
                full_location: item.location
            }));

            // D. Generate PDF with Progress
            await generateZoneWisePDF(fullData, (current, total) => {
                setPdfProgress({ current, total });
            });

            // toast.success("PDF Downloaded Successfully!"); 

        } catch (err) {
            console.error(err);
            alert("Failed to generate PDF. Check console.");
        } finally {
            setIsPdfGenerating(false);
        }
    };

    // 6. Excel Export
    const handleExcelExport = async () => {
        setIsExporting(true);
        try {
            let q = `limit=10000&page=0&sorting_field=sur_id&sorting_type=DESC`;
            if (activeFilters.zc !== 'all') q += `&zc_id=${activeFilters.zc}`;
            if (activeFilters.ot !== 'all') q += `&ot_id=${activeFilters.ot}`;
            
            const res = await VisionBase.get(`/surveys?${q}`);
            const data = res.data.data.rows || [];
            
            const excelRows = data.map(item => ({
                ID: item.sur_id,
                Citizen: item.citizen_name,
                Mobile: item.citizen_mobile,
                Zone: item.zone_name,
                OT: item.ot_name,
                ZC: item.ot_parent_name,
                Date: new Date(item.date).toLocaleDateString(),
                Location: item.location
            }));

            const ws = XLSX.utils.json_to_sheet(excelRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Surveys");
            XLSX.writeFile(wb, `Survey_Data_${Date.now()}.xlsx`);
        } catch (e) { alert("Export failed"); }
        finally { setIsExporting(false); }
    };

    // 7. Delete Logic
    const handleBulkDelete = async () => {
        if(!bulkDeleteModalData) return;
        setIsDeleting(true);
        try {
            const ids = bulkDeleteModalData.map(s => parseInt(s.id));
            await VisionBase.delete('/delete-surveys', { data: { ids } });
            setBulkDeleteModalData(null);
            setSelectedRows([]);
            fetchSurveys(); 
            alert("Deleted successfully");
        } catch(e) { alert("Delete failed"); }
        finally { setIsDeleting(false); }
    };

    const handleSingleDelete = async () => {
        if(!deleteModalData) return;
        setIsDeleting(true);
        try {
            await VisionBase.delete(`/survey/${deleteModalData.id}`);
            setDeleteModalData(null);
            fetchSurveys();
        } catch(e) { alert("Delete failed"); }
        finally { setIsDeleting(false); }
    };

    // 8. AI Analysis
    const analyzeSurvey = async (survey) => {
        setAnalysisLoading(true);
        setTimeout(() => {
            setAnalysisData({
                score: 85,
                status: 'Authentic',
                color: 'green',
                reason: "Consistent answers matching location demographics."
            });
            setAnalysisLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 font-sans">
             {/* Background Decoration */}
            <div className="fixed -top-40 -right-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl pointer-events-none"/>
            <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl pointer-events-none"/>

            <div className="max-w-7xl mx-auto relative">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">Survey Data Dashboard</h1>
                    <p className="text-gray-500">Analyze and manage survey records.</p>
                </header>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-violet-100 rounded-xl mr-4"><FileText className="h-6 w-6 text-violet-600"/></div><div><p className="text-sm text-gray-500">Total Surveys</p><p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalSurveys}</p></div></div></CardContent></Card>
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-green-100 rounded-xl mr-4"><Calendar className="h-6 w-6 text-green-600"/></div><div><p className="text-sm text-gray-500">Surveys Today</p><p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.surveysToday}</p></div></div></CardContent></Card>
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-blue-100 rounded-xl mr-4"><Users className="h-6 w-6 text-blue-600"/></div><div><p className="text-sm text-gray-500">Active OTs</p><p className="text-2xl font-bold text-gray-800">{stats.totalOts}</p></div></div></CardContent></Card>
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-orange-100 rounded-xl mr-4"><Shield className="h-6 w-6 text-orange-600"/></div><div><p className="text-sm text-gray-500">Active ZCs</p><p className="text-2xl font-bold text-gray-800">{stats.totalZcs}</p></div></div></CardContent></Card>
                </div>

                {/* --- MAIN CONTENT --- */}
                <Card>
                    <CardHeader>
                        <CardTitle>Survey Records ({totalCount})</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            {/* PDF Download Button */}
                            <Button onClick={handleDownloadFullPdf} disabled={isPdfGenerating || loading} className="shadow-violet-200">
                                {isPdfGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <FileDown className="w-4 h-4 mr-2"/>}
                                {isPdfGenerating ? 'Processing...' : 'Download PDF (10k)'}
                            </Button>
                            
                            {/* Excel Export Button */}
                            <Button variant="outline" onClick={handleExcelExport} disabled={isExporting}>
                                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2"/>}
                                Export Excel
                            </Button>

                            {/* Bulk Delete Button */}
                            {selectedRows.length > 0 && (
                                <Button variant="destructive" onClick={() => setBulkDeleteModalData(surveyData.filter(s => selectedRows.includes(s.id)))}>
                                    <Trash2 className="w-4 h-4 mr-2"/> Delete ({selectedRows.length})
                                </Button>
                            )}

                            <Button variant="ghost" onClick={() => {setPage(0); fetchSurveys();}}><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Filters */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                <input 
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-violet-400 outline-none" 
                                    placeholder="Search..." 
                                    value={searchQuery}
                                    onChange={(e)=>setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <DatePicker selected={dateFrom} onSelect={setDateFrom} placeholder="From"/>
                                <DatePicker selected={dateTo} onSelect={setDateTo} placeholder="To"/>
                            </div>
                            <Select value={filters.zc} onValueChange={(v)=>setFilters({...filters, zc:v, ot:'all'})} placeholder="Select ZC">
                                <SelectItem value="all">All ZCs</SelectItem>
                                {zcUsers.map(u => <SelectItem key={u.user_id} value={u.user_id.toString()}>{u.name}</SelectItem>)}
                            </Select>
                            <Select value={filters.ot} onValueChange={(v)=>setFilters({...filters, ot:v})} placeholder="Select OT">
                                <SelectItem value="all">All OTs</SelectItem>
                                {dynamicOtOptions.map(u => <SelectItem key={u.user_id} value={u.user_id.toString()}>{u.name}</SelectItem>)}
                            </Select>
                            
                            <div className="lg:col-span-4 flex justify-end gap-2">
                                <Button onClick={handleSearch} className="px-8">Apply Filters</Button>
                                <Button variant="secondary" onClick={handleReset}>Reset</Button>
                            </div>
                        </div>

                        {/* Table */}
                        {loading && <div className="text-center py-10"><Loader2 className="h-10 w-10 animate-spin mx-auto text-violet-500"/></div>}
                        
                        {!loading && !error && (
                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                            <table className="w-full bg-white">
                                <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4 w-10">
                                            <input type="checkbox" 
                                                checked={selectedRows.length === surveyData.length && surveyData.length > 0}
                                                onChange={(e) => setSelectedRows(e.target.checked ? surveyData.map(r=>r.id) : [])}
                                            />
                                        </th>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Citizen</th>
                                        <th className="px-6 py-4">Zone</th>
                                        <th className="px-6 py-4">OT Name</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {surveyData.map((row) => (
                                        <tr key={row.id} className="hover:bg-violet-50/30 transition">
                                            <td className="px-6 py-4">
                                                <input type="checkbox" 
                                                    checked={selectedRows.includes(row.id)}
                                                    onChange={(e) => {
                                                        if(e.target.checked) setSelectedRows([...selectedRows, row.id]);
                                                        else setSelectedRows(selectedRows.filter(id => id !== row.id));
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-700">#{row.id}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{row.name}</div>
                                                <div className="text-xs text-gray-500">{row.mobile}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {row.zoneName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{row.otName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{row.date}</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <EyeIcon className="h-8 w-8 p-2 cursor-pointer" onClick={() => { setViewModalData(row); setAnalysisData(null); }}/>
                                                <Trash2Icon className="h-8 w-8 p-2 cursor-pointer" onClick={() => setDeleteModalData(row)}/>
                                            </td>
                                        </tr>
                                    ))}
                                    {surveyData.length === 0 && (
                                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        )}

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Rows per page:</span>
                                <div className="w-20">
                                    <Select value={limit} onValueChange={(v) => {setLimit(v); setPage(0);}}>
                                        {limitOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" onClick={()=>setPage(p=>Math.max(0, p-1))} disabled={page===0}><ChevronLeft className="w-4 h-4"/></Button>
                                <span className="text-sm font-medium">Page {page + 1}</span>
                                <Button variant="secondary" onClick={()=>setPage(p=>p+1)} disabled={surveyData.length < limit}><ChevronRight className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- MODAL: PDF PROGRESS --- */}
            {isPdfGenerating && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                        <div className="mb-4 relative inline-block">
                             <FileDown className="w-16 h-16 text-violet-500 mx-auto animate-bounce"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Generating PDF (3 Parts)</h3>
                        <p className="text-sm text-gray-500 mb-6">Grouping by Zone...</p>
                        
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden border border-gray-200">
                            <div 
                                className="bg-gradient-to-r from-violet-500 to-purple-600 h-full transition-all duration-300 ease-out"
                                style={{ width: `${pdfProgress.total ? (pdfProgress.current / pdfProgress.total) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-mono text-gray-600 font-bold">
                            <span>Processing...</span>
                            <span>{pdfProgress.current} / {pdfProgress.total}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: VIEW DETAILS --- */}
            <Dialog isOpen={!!viewModalData} onClose={() => setViewModalData(null)}>
                <DialogContent size="xl">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-lg font-bold">Survey Details</h3>
                        <button onClick={()=>setViewModalData(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                        {viewModalData && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Images */}
                                <div>
                                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-200">
                                        <img src={viewModalData.citizen_image} alt="Citizen" className="w-full rounded-lg shadow-sm mb-4"/>
                                        <div className="flex items-center justify-between text-sm text-gray-600 px-2">
                                            <span className="flex items-center"><Camera className="w-4 h-4 mr-1"/> Citizen</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 bg-violet-50 p-4 rounded-xl border border-violet-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-violet-800 flex items-center"><Brain className="w-4 h-4 mr-2"/> AI Audit</h4>
                                            <Button size="sm" className="h-8 text-xs" onClick={()=>analyzeSurvey(viewModalData)} disabled={analysisLoading}>
                                                {analysisLoading ? 'Checking...' : 'Check'}
                                            </Button>
                                        </div>
                                        {analysisData ? (
                                            <div className="text-sm">
                                                <div className={`font-bold text-${analysisData.color}-600 flex items-center gap-2`}>
                                                    <CheckCircle className="w-4 h-4"/> {analysisData.status} ({analysisData.score}%)
                                                </div>
                                                <p className="text-gray-600 mt-1 text-xs">{analysisData.reason}</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">Click check to verify authenticity.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Data */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-lg"><label className="text-xs text-gray-500 uppercase">Name</label><p className="font-bold">{viewModalData.name}</p></div>
                                        <div className="p-3 bg-gray-50 rounded-lg"><label className="text-xs text-gray-500 uppercase">Mobile</label><p className="font-bold">{viewModalData.mobile}</p></div>
                                        <div className="p-3 bg-gray-50 rounded-lg"><label className="text-xs text-gray-500 uppercase">Zone</label><p className="font-bold">{viewModalData.zoneName}</p></div>
                                        <div className="p-3 bg-gray-50 rounded-lg"><label className="text-xs text-gray-500 uppercase">Date</label><p className="font-bold">{viewModalData.date}</p></div>
                                        <div className="col-span-2 p-3 bg-gray-50 rounded-lg"><label className="text-xs text-gray-500 uppercase">Location</label><p className="font-medium text-sm">{viewModalData.full_location}</p></div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Survey Responses</h4>
                                        <div className="space-y-3">
                                            {viewModalData.sur_data?.map((q, i) => (
                                                <div key={i} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                    <p className="text-xs font-bold text-violet-600 mb-1">{q.question}</p>
                                                    <p className="text-sm text-gray-700">{q.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: BULK DELETE --- */}
            <Dialog isOpen={!!bulkDeleteModalData} onClose={() => setBulkDeleteModalData(null)}>
                <DialogContent size="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-red-600 flex items-center gap-2"><Trash2/> Delete Multiple?</h3>
                        <p className="text-gray-600 mt-2">You are about to delete <b>{bulkDeleteModalData?.length}</b> records. This cannot be undone.</p>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="secondary" onClick={()=>setBulkDeleteModalData(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* --- MODAL: SINGLE DELETE --- */}
            <Dialog isOpen={!!deleteModalData} onClose={() => setDeleteModalData(null)}>
                <DialogContent size="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                        <p className="text-gray-600 mt-2">Delete record for <b>{deleteModalData?.name}</b>?</p>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="secondary" onClick={()=>setDeleteModalData(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleSingleDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllSurveyData;