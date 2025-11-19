import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, 
  ChevronRight, 
  Search, 
  RefreshCw, 
  X, 
  Eye, 
  Calendar, 
  MoreHorizontal, 
  Trash2, 
  Circle,
  Download,
  FileText,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ChevronLeft,
  Filter,
  Settings,
  Database,
  BarChart3,
  Loader2,
  Camera,
  Voicemail,
  User,
  Shield,
  Phone,
  ListRestart,
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

// ===================================================================================
// MODERN UI COMPONENTS
// ===================================================================================

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

const Button = ({ children, className = "", variant = "primary", size = "md", onClick, disabled, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
        primary: "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600 focus:ring-violet-500",
        secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        outline: "border border-violet-200 text-violet-600 hover:bg-violet-50 focus:ring-violet-500",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 focus:ring-red-500",
        ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 focus:ring-green-500"
    };
    
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2"
    };
    
    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

const Select = ({ value, onValueChange, children, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = React.Children.toArray(children);
    const selectedOption = options.find(child => child.props.value === value);
    
    return (
        <div className="relative">
            <button
                type="button"
                className="w-full px-4 py-2.5 text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-400 focus:ring-opacity-20 transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="block truncate text-sm">
                    {selectedOption ? selectedOption.props.children : placeholder}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </span>
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                type="button"
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-violet-50 focus:bg-violet-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                onClick={() => {
                                    onValueChange(option.props.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.props.children}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const SelectItem = ({ value, children }) => null;

const Checkbox = ({ checked, onCheckedChange, className = "" }) => (
    <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={`w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2 ${className}`}
    />
);

const DatePicker = ({ selected, onSelect, placeholder = "Select date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selected || new Date());
    
    const formatDate = (date) => {
        if (!date) return null;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = (firstDay.getDay() === 0) ? 6 : firstDay.getDay() -1;
        
        const days = [];
        for (let i = 0; i < startingDay; i++) { days.push(null); }
        for (let day = 1; day <= daysInMonth; day++) { days.push(new Date(year, month, day)); }
        return days;
    };
    
    const days = getDaysInMonth(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return (
        <div className="relative">
            <button
                type="button"
                className="w-full px-4 py-2.5 text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-400 focus:ring-opacity-20 transition-all flex items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-700">
                    {selected ? formatDate(selected) : placeholder}
                </span>
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 min-w-[280px]">
                        <div className="flex items-center justify-between mb-4">
                            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="h-4 w-4" /></button>
                            <h3 className="font-semibold text-sm">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`p-2 text-sm text-center rounded hover:bg-violet-100 ${day && selected && day.toDateString() === selected.toDateString() ? 'bg-violet-500 text-white' : day ? 'text-gray-700' : 'text-transparent cursor-default'}`}
                                    onClick={() => { if (day) { onSelect(day); setIsOpen(false); } }}
                                    disabled={!day}
                                >{day ? day.getDate() : ''}</button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// ===================================================================================
// DIALOG COMPONENTS
// ===================================================================================

const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            {children}
        </div>
    );
};

const DialogContent = ({ children, className = "", size = 'lg' }) => {
    const sizeClasses = {
        sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl',
        xl: 'max-w-4xl', '3xl': 'max-w-6xl'
    };
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${className}`}
        >
            {children}
        </div>
    );
};

const DialogHeader = ({ children, onClose }) => (
    <div className="flex justify-between items-center p-6 border-b border-gray-200/50 flex-shrink-0">
        {children}
        {onClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <X className="h-5 w-5" />
            </button>
        )}
    </div>
);

const DialogTitle = ({ children, className = "" }) => (
    <h3 className={`text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent ${className}`}>
        {children}
    </h3>
);

const DialogBody = ({ children, className = "" }) => (
    <div className={`p-6 overflow-y-auto flex-grow ${className}`}>
        {children}
    </div>
);

const DialogFooter = ({ children, className = "" }) => (
    <div className={`p-6 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl flex-shrink-0 flex justify-end space-x-3 ${className}`}>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getVisiblePages = () => {
        const delta = 1, range = [], rangeWithDots = [];
        let left = currentPage - delta, right = currentPage + delta;
        
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) rangeWithDots.push(i);
            return rangeWithDots;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                range.push(i);
            }
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };
    if (totalPages <= 1) return null;
    return (
        <nav className="flex items-center justify-center space-x-2">
            <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronLeft className="h-4 w-4 mr-1" />Previous</button>
            <div className="flex space-x-1">
                {getVisiblePages().map((page, index) => (
                    <button key={index} onClick={() => typeof page === 'number' && onPageChange(page)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${currentPage === page ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg' : typeof page === 'number' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-default'}`} disabled={typeof page !== 'number'}>{page}</button>
                ))}
            </div>
            <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next<ChevronRight className="h-4 w-4 ml-1" /></button>
        </nav>
    );
};

// ===================================================================================
// TOAST NOTIFICATION
// ===================================================================================
const toast = {
    success: (message) => alert(message),
    error: (message) => alert(message),
    info: (message) => alert(message)
};

// ===================================================================================
// MAIN COMPONENT
// ===================================================================================

const AllSurveyData = () => {
    // State for API data
    const [surveyData, setSurveyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for form filters
    const [filters, setFilters] = useState({ zone: 'all', ot: 'all', zc: 'all' });
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [activeFilters, setActiveFilters] = useState(filters);
    const [activeDateRange, setActiveDateRange] = useState({ from: null, to: null });

    // State for table selections
    const [selectedRows, setSelectedRows] = useState([]);

    // State for modals/dialogs
    const [viewModalData, setViewModalData] = useState(null);
    const [deleteModalData, setDeleteModalData] = useState(null);
    const [bulkDeleteModalData, setBulkDeleteModalData] = useState(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // State for derived filter options
    const [filterOptions, setFilterOptions] = useState({ zones: [], ots: [], zcs: [] });

    // State for AI analysis
    const [analysisData, setAnalysisData] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);

    // AI Analysis function
    const analyzeSurveyAuthenticity = async (surveyData) => {
        setAnalysisLoading(true);
        setAnalysisError(null);
        
        try {
            const payload = {
                context: surveyData,
                prompt: "The provided data is survey taken by our team member, to know data authenticity i want to know how much the data is correctly filled(correctness in percentage) , to know fake survey data there may be illogical answer choosed , example for question:who will you vote for and the answer choosed is BJP and then next question is which candidate you will choose and you choosed rahul gandhi but it is from congress means the data is incorrect and filled by team member on his own. Please analyze the survey responses for logical consistency and provide a detailed authenticity report with percentage score. only give percentage as single answer so that i can directly store it in a variable"
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAQ9Tir9iFm0YJESYMrOGJpcDklwn8WUBM`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: JSON.stringify(payload) }] }],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            const analysisResult = parseAnalysisResponse(responseText);
            setAnalysisData(analysisResult);
            
        } catch (error) {
            console.error('Analysis error:', error);
            setAnalysisError(error.message);
        } finally {
            setAnalysisLoading(false);
        }
    };

    // Helper function to parse AI response
    const parseAnalysisResponse = (responseText) => {
        try {
            const percentageMatch = responseText.match(/(\d+(?:\.\d+)?)\s*%/);
            const authenticity = percentageMatch ? parseFloat(percentageMatch[1]) : null;
            
            let status = 'unknown';
            let statusColor = 'gray';
            let statusIcon = AlertTriangle;
            
            if (authenticity !== null) {
                if (authenticity >= 80) {
                    status = 'authentic';
                    statusColor = 'green';
                    statusIcon = CheckCircle;
                } else if (authenticity >= 60) {
                    status = 'questionable';
                    statusColor = 'yellow';
                    statusIcon = AlertTriangle;
                } else {
                    status = 'suspicious';
                    statusColor = 'red';
                    statusIcon = XCircle;
                }
            }
            
            return {
                authenticity,
                status,
                statusColor,
                statusIcon,
                fullResponse: responseText,
                analysisDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing analysis response:', error);
            return {
                authenticity: null,
                status: 'error',
                statusColor: 'red',
                statusIcon: XCircle,
                fullResponse: responseText,
                analysisDate: new Date().toISOString()
            };
        }
    };

    const fetchSurveys = async () => {
        setLoading(true);
        setError(null);
        setSelectedRows([]);
        try {
            const response = await VisionBase.get('/surveys');
            const apiData = response.data.data.rows;
            
            const transformedData = apiData.map(item => ({ 
                id: item.sur_id.toString(), 
                name: item.citizen_name, 
                mobile: item.citizen_mobile, 
                otName: item.ot_name || 'N/A',
                otMobile: item.ot_mobile,
                otProfile: item.ot_profile,
                zcName: item.ot_parent_name || 'N/A',
                zoneName: item.zone_name || 'N/A',
                zcMobile: item.ot_parent_mobile,
                zcProfile: item.ot_parent_profile,
                zone: item.location ? item.location.split(',')[0].trim() : 'Unknown', 
                date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 
                originalDate: new Date(item.date), 
                duration: item.duration, 
                recording: item.recording, 
                citizen_image: item.citizen_image, 
                sur_data: item.sur_data, 
                ot_id: item.ot_id, 
                booth_id: item.booth_id, 
                election_id: item.election_id, 
                full_location: item.location 
            }));
            
            // Sort surveys by ID in ascending order
            const sortedData = transformedData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            setSurveyData(sortedData);
        } catch (err) {
            setError(err.message || 'Failed to fetch survey data. Please check your API endpoint.');
            console.error('Error fetching surveys:', err);
            setSurveyData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSurveys(); }, []);
    
    // Effect to derive filter options from data
    useEffect(() => {
        if (surveyData.length > 0) {
            const zones = [...new Set(surveyData.map(d => d.zone).filter(Boolean))].sort();
            const ots = [...new Set(surveyData.map(d => d.otName).filter(Boolean))].sort();
            const zcs = [...new Set(surveyData.map(d => d.zcName).filter(Boolean))].sort();
            setFilterOptions({ zones, ots, zcs });
        }
    }, [surveyData]);
    
    // Memoized filtered data
    const filteredData = useMemo(() => {
        return surveyData.filter(item => {
            const { zone, ot, zc } = activeFilters;
            const { from, to } = activeDateRange;

            const itemDate = item.originalDate;
            const dateMatch = (!from || itemDate >= from) && (!to || itemDate <= to);
            
            const zoneMatch = zone === 'all' || item.zone === zone;
            const otMatch = ot === 'all' || item.otName === ot;
            const zcMatch = zc === 'all' || item.zcName === zc;

            return dateMatch && zoneMatch && otMatch && zcMatch;
        });
    }, [surveyData, activeFilters, activeDateRange]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData, rowsPerPage]);

    const handleSelectAll = (checked) => setSelectedRows(checked ? paginatedData.map(row => row.id) : []);
    const handleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    const handleFilterChange = (name, value) => setFilters(prev => ({ ...prev, [name]: value }));
    
    // Search and Reset handlers
    const handleSearch = () => {
        setActiveFilters(filters);
        const toDateWithTime = dateTo ? new Date(dateTo.setHours(23, 59, 59, 999)) : null;
        setActiveDateRange({ from: dateFrom, to: toDateWithTime });
    };

    const handleResetFilters = () => {
        const initialFilters = { zone: 'all', ot: 'all', zc: 'all' };
        setFilters(initialFilters);
        setDateFrom(null); 
        setDateTo(null);
        setActiveFilters(initialFilters);
        setActiveDateRange({ from: null, to: null });
    };
    
    const handleExport = (type) => { console.log(`Exporting ${type} CSV with selected rows:`, selectedRows); };
    const handleViewClick = (rowData) => {
        setViewModalData(rowData);
        setAnalysisData(null);
    };
    const handleDeleteClick = (rowData) => setDeleteModalData(rowData);

    // Bulk delete handlers
    const handleBulkDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one survey to delete.");
            return;
        }
        const selectedSurveys = surveyData.filter(s => selectedRows.includes(s.id));
        setBulkDeleteModalData(selectedSurveys);
    };

    const confirmBulkDelete = async () => {
        if (!bulkDeleteModalData || bulkDeleteModalData.length === 0) return;
        
        setIsBulkDeleting(true);
        try {
            const idsToDelete = bulkDeleteModalData.map(s => parseInt(s.id));
            
            await VisionBase.delete('/delete-surveys', {
                data: { ids: idsToDelete }
            });

            setSurveyData(prev => prev.filter(s => !idsToDelete.includes(parseInt(s.id))));
            setSelectedRows([]);
            setBulkDeleteModalData(null);
            toast.success(`Successfully deleted ${idsToDelete.length} survey(s).`);
        } catch (err) {
            console.error("Failed to delete surveys:", err);
            toast.error(err.response?.data?.message || "Failed to delete surveys. Please try again.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    // Individual delete handler
    const confirmDelete = async () => {
        if (!deleteModalData) return;
        
        setIsDeleting(true);
        try {
            await VisionBase.delete(`/survey/${deleteModalData.id}`);

            setSurveyData(prev => prev.filter(s => s.id !== deleteModalData.id));
            setSelectedRows(prev => prev.filter(id => id !== deleteModalData.id));
            setDeleteModalData(null);
            toast.success(`Successfully deleted survey #${deleteModalData.id}.`);
        } catch (err) {
            console.error("Failed to delete survey:", err);
            toast.error(err.response?.data?.message || "Failed to delete survey. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRefresh = () => fetchSurveys();
    
    // Stats calculation
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const surveysToday = surveyData.filter(s => s.originalDate.toDateString() === today).length;
        const totalOts = new Set(surveyData.map(s => s.otName)).size;
        const totalZcs = new Set(surveyData.map(s => s.zcName)).size;
        return {
            totalSurveys: surveyData.length,
            surveysToday,
            totalOts,
            totalZcs,
        };
    }, [surveyData]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-1">Survey Data Dashboard</h1>
                    <p className="text-gray-500">Analyze and manage all survey records with AI-powered authenticity verification.</p>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-violet-100 rounded-xl mr-4"><FileText className="h-6 w-6 text-violet-600"/></div><div><p className="text-sm text-gray-500">Total Surveys</p><p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalSurveys}</p></div></div></CardContent></Card>
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-green-100 rounded-xl mr-4"><Calendar className="h-6 w-6 text-green-600"/></div><div><p className="text-sm text-gray-500">Surveys Today</p><p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.surveysToday}</p></div></div></CardContent></Card>
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-blue-100 rounded-xl mr-4"><Users className="h-6 w-6 text-blue-600"/></div><div><p className="text-sm text-gray-500">Active OTs</p><p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalOts}</p></div></div></CardContent></Card>
                    <Card><CardContent><div className="flex items-center"><div className="p-3 bg-orange-100 rounded-xl mr-4"><Shield className="h-6 w-6 text-orange-600"/></div><div><p className="text-sm text-gray-500">Active ZCs</p><p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalZcs}</p></div></div></CardContent></Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-wrap justify-between items-center gap-4">
                        <CardTitle>All Survey Records ({filteredData.length} matches)</CardTitle>
                        <div className="flex items-center space-x-2">
                           <Button onClick={() => handleExport('all')} variant="outline" size="md" disabled={loading}><Download className="h-4 w-4 mr-2"/>Export All</Button>
                           <Button onClick={() => handleExport('selected')} variant="outline" size="md" disabled={selectedRows.length === 0}><Download className="h-4 w-4 mr-2"/>Export Selected</Button>
                           {selectedRows.length > 0 && (
                               <Button 
                                   onClick={handleBulkDeleteClick} 
                                   variant="destructive" 
                                   size="md"
                               >
                                   <Trash2 className="h-4 w-4 mr-2"/>
                                   Delete Selected ({selectedRows.length})
                               </Button>
                           )}
                           <Button onClick={handleRefresh} variant="ghost" size="icon" disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filter Card */}
                        <div className="bg-gray-50/70 border border-gray-200/50 rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                               <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <DatePicker selected={dateFrom} onSelect={setDateFrom} placeholder="Date From"/>
                                  <DatePicker selected={dateTo} onSelect={setDateTo} placeholder="Date To"/>
                               </div>
                               <Select value={filters.zone} onValueChange={(v) => handleFilterChange('zone', v)} placeholder="All Zones"><SelectItem value="all">All Zones</SelectItem>{filterOptions.zones.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</Select>
                               <Select value={filters.ot} onValueChange={(v) => handleFilterChange('ot', v)} placeholder="All OTs"><SelectItem value="all">All OTs</SelectItem>{filterOptions.ots.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</Select>
                               <Select value={filters.zc} onValueChange={(v) => handleFilterChange('zc', v)} placeholder="All ZCs"><SelectItem value="all">All ZCs</SelectItem>{filterOptions.zcs.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</Select>
                               <div className="flex items-center space-x-2">
                                  <Button onClick={handleSearch} className="w-full"><Search className="h-4 w-4 mr-2"/>Search</Button>
                                  <Button onClick={handleResetFilters} variant="ghost" size="icon"><ListRestart className="h-4 w-4"/></Button>
                               </div>
                            </div>
                        </div>

                        {error && <Card className="mb-6 border-red-200"><CardContent className="text-center py-8"><div className="text-red-600 mb-4"><X className="h-12 w-12 mx-auto mb-2" /><h3 className="text-lg font-semibold">Error Loading Data</h3><p className="text-sm text-red-500 mt-1">{error}</p></div><Button onClick={handleRefresh} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Try Again</Button></CardContent></Card>}
                        {loading && <Card className="mb-6"><CardContent className="text-center py-12"><Loader2 className="h-12 w-12 animate-spin mx-auto text-violet-500 mb-4" /><h3 className="text-lg font-semibold text-gray-700">Loading Survey Data</h3><p className="text-sm text-gray-500 mt-1">Please wait while we fetch the latest records...</p></CardContent></Card>}
                        
                        {!loading && !error && (
                        <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left w-[50px]"><Checkbox onCheckedChange={handleSelectAll} checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length} /></th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Citizen Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">OT Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ZC Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedData.length > 0 ? paginatedData.map((row) => (
                                            <tr key={row.id} className={`hover:bg-violet-50/50 transition-colors ${selectedRows.includes(row.id) ? 'bg-violet-100' : ''}`}>
                                                <td className="px-6 py-4"><Checkbox onCheckedChange={() => handleSelectRow(row.id)} checked={selectedRows.includes(row.id)}/></td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{row.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{row.otName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{row.zcName}</td>
                                                <td className="px-6 py-4"><span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full border border-blue-200"><MapPin className="h-3 w-3 mr-1" />{row.zone}</span></td>
                                                <td className="px-6 py-4"><span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full border border-orange-200"><Clock className="h-3 w-3 mr-1" />{row.date}</span></td>
                                                <td className="px-6 py-4"><div className="flex space-x-2"><Button variant="outline" size="icon" onClick={() => handleViewClick(row)} className="h-8 w-8"><Eye className="h-4 w-4"/></Button><Button variant="destructive" size="icon" onClick={() => handleDeleteClick(row)} className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button></div></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="8" className="text-center py-12 px-6"><h4 className="text-lg font-semibold text-gray-700">No Records Found</h4><p className="text-sm text-gray-500 mt-1">Try adjusting your filters or check back later.</p></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm text-gray-600">Rows per page:</p>
                                  <div className="w-20">
                                    <Select value={rowsPerPage} onValueChange={(v) => setRowsPerPage(Number(v))}>
                                        <SelectItem value={5}>5</SelectItem>
                                        <SelectItem value={10}>10</SelectItem>
                                        <SelectItem value={20}>20</SelectItem>
                                        <SelectItem value={50}>50</SelectItem>
                                    </Select>
                                  </div>
                                </div>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                <p className="text-sm text-gray-600 hidden md:block">
                                    Page {currentPage} of {totalPages}
                                </p>
                            </div>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced View Details Dialog with AI Analysis */}
            <Dialog isOpen={!!viewModalData} onClose={() => setViewModalData(null)}>
                <DialogContent size="3xl">
                    <DialogHeader onClose={() => setViewModalData(null)}>
                        <DialogTitle>Survey Details (ID: #{viewModalData?.id})</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        {viewModalData && (
                            <div className="space-y-6">
                                {/* AI Analysis Section */}
                                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-md font-semibold text-gray-800 flex items-center">
                                            <Brain className="h-5 w-5 mr-2 text-violet-600"/>
                                            AI Authenticity Analysis
                                        </h4>
                                        <Button 
                                            onClick={() => analyzeSurveyAuthenticity(viewModalData)}
                                            disabled={analysisLoading}
                                            variant="success"
                                            size="sm"
                                        >
                                            {analysisLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-4 w-4 mr-2"/>
                                                    Analyze Survey
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    
                                    {analysisError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center">
                                                <XCircle className="h-5 w-5 text-red-500 mr-2"/>
                                                <p className="text-sm text-red-700">Analysis Error: {analysisError}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {analysisData && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white rounded-lg p-3 border">
                                                    <div className="flex items-center">
                                                        <analysisData.statusIcon className={`h-6 w-6 mr-3 text-${analysisData.statusColor}-500`}/>
                                                        <div>
                                                            <p className="text-sm text-gray-600">Authenticity Score</p>
                                                            <p className="text-xl font-bold text-gray-900">
                                                                {analysisData.authenticity !== null ? `${analysisData.authenticity}%` : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border">
                                                    <div className="flex items-center">
                                                        <Shield className="h-6 w-6 mr-3 text-gray-500"/>
                                                        <div>
                                                            <p className="text-sm text-gray-600">Status</p>
                                                            <p className={`text-xl font-bold capitalize text-${analysisData.statusColor}-600`}>
                                                                {analysisData.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!analysisData && !analysisLoading && !analysisError && (
                                        <div className="text-center py-4">
                                            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-2"/>
                                            <p className="text-sm text-gray-500">Click "Analyze Survey" to check authenticity</p>
                                        </div>
                                    )}
                                </div>

                                {/* Original Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center"><Camera className="h-4 w-4 mr-2 text-violet-600"/>Citizen Image</h4>
                                            <img src={viewModalData.citizen_image} alt={`Citizen ${viewModalData.name}`} className="w-full h-auto rounded-lg object-cover shadow-md border border-gray-200"/>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center"><Voicemail className="h-4 w-4 mr-2 text-violet-600"/>Audio Recording</h4>
                                            <audio controls src={viewModalData.recording} className="w-full">Your browser does not support the audio element.</audio>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center"><Users className="h-4 w-4 mr-2 text-violet-600"/>Team Information</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">OT (Operator)</p>
                                                    <div className="flex items-center space-x-3">
                                                        <img src={viewModalData.otProfile} alt={viewModalData.otName} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"/>
                                                        <div><p className="font-semibold text-gray-800">{viewModalData.otName}</p><p className="text-sm text-gray-600 flex items-center"><Phone className="h-3 w-3 mr-1.5"/>{viewModalData.otMobile}</p></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">ZC (Zonal Coordinator)</p>
                                                    <div className="flex items-center space-x-3">
                                                        <img src={viewModalData.zcProfile} alt={viewModalData.zcName} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"/>
                                                        <div><p className="font-semibold text-gray-800">{viewModalData.zcName}</p><p className="text-sm text-gray-600 flex items-center"><Phone className="h-3 w-3 mr-1.5"/>{viewModalData.zcMobile}</p></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100"><span className="text-sm text-gray-600">Citizen Name</span><p className="font-semibold text-gray-900">{viewModalData.name}</p></div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100"><span className="text-sm text-gray-600">Citizen Mobile</span><p className="font-semibold text-gray-900">{viewModalData.mobile}</p></div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100"><span className="text-sm text-gray-600">Duration</span><p className="font-semibold text-gray-900">{viewModalData.duration}</p></div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100"><span className="text-sm text-gray-600">Date</span><p className="font-semibold text-gray-900">{viewModalData.date}</p></div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100"><span className="text-sm text-gray-600">OT</span><p className="font-semibold text-gray-900">{viewModalData.otName}</p></div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100"><span className="text-sm text-gray-600">ZC</span><p className="font-semibold text-gray-900">{viewModalData.zcName}</p></div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100"><span className="text-sm text-gray-600">Booth </span><p className="font-semibold text-gray-900">{viewModalData.zoneName}</p></div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2"><span className="text-sm text-gray-600">Full Location</span><p className="font-semibold text-gray-900 text-sm">{viewModalData.full_location}</p></div>
                                        </div>
                                        {viewModalData.sur_data?.length > 0 && (
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <h4 className="text-md font-semibold text-gray-800 mb-3">Survey Responses</h4>
                                                <div className="space-y-3 max-h-[500px] overflow-y-auto p-1 pr-2">
                                                    {viewModalData.sur_data.map((item, index) => (
                                                        <div key={index} className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100/80"><p className="text-sm font-semibold text-violet-700">Q: {item.question}</p><p className="text-sm text-gray-800 mt-1">A: {item.answer}</p></div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setViewModalData(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog isOpen={!!deleteModalData} onClose={() => setDeleteModalData(null)}>
                 <DialogContent size="sm">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <div className="flex items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4 text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Survey Record?</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete the record for <strong className="text-gray-700">{deleteModalData?.name}</strong> (ID: #{deleteModalData?.id})? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setDeleteModalData(null)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Modal */}
            <Dialog isOpen={!!bulkDeleteModalData} onClose={() => setBulkDeleteModalData(null)}>
                <DialogContent size="xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Trash2 className="mr-2 text-red-600"/>
                            Delete Multiple Surveys
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <p className="text-gray-600 mb-4">
                            This action cannot be undone. This will permanently delete {bulkDeleteModalData?.length} survey(s).
                        </p>
                        <div className="max-h-[400px] overflow-y-auto py-4">
                            <h4 className="font-semibold mb-3 text-gray-700">Surveys to be deleted:</h4>
                            <ul className="space-y-2">
                                {bulkDeleteModalData?.map((survey, index) => (
                                    <li key={survey.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                                        <span className="font-medium text-gray-600 min-w-[30px]">{index + 1}.</span>
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium text-gray-800">{survey.name}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge variant="default">ID: {survey.id}</Badge>
                                                <Badge variant="default">OT: {survey.otName}</Badge>
                                                <Badge variant="default">{survey.zone}</Badge>
                                                <span className="text-xs text-gray-500">{survey.date}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setBulkDeleteModalData(null)} disabled={isBulkDeleting}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={confirmBulkDelete}
                            disabled={isBulkDeleting}
                        >
                            {isBulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isBulkDeleting ? 'Deleting...' : `Delete ${bulkDeleteModalData?.length} Survey(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllSurveyData;