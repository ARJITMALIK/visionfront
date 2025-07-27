import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';

// DUMMY DATA
const surveyData = [
    { id: '10029', name: 'Sumon', mobile: '9190793656', qtName: 'Suman shekher', zcName: 'Ajit Kumar Singh', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '11 Jul, 2025' },
    { id: '10028', name: 'Bikram Ambani', mobile: '8812820712', qtName: 'Bikram Deka', zcName: 'Ajit Kumar Singh', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10027', name: 'Riajul ali', mobile: '7638079496', qtName: 'Rahul ali', zcName: 'Manish Kumar', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10026', name: 'Ambika kalita', mobile: '8822545692', qtName: 'Jyotisman deka', zcName: 'Manish Kumar', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10025', name: 'Babul kalita', mobile: '969570013', qtName: 'Jyotisman deka', zcName: 'Manish Kumar', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10024', name: 'Bakhanti kalita', mobile: '8855416265', qtName: 'Jyotisman deka', zcName: 'Manish Kumar', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10023', name: 'Bijoni kalita', mobile: '8822545869', qtName: 'Jyotisman deka', zcName: 'Manish Kumar', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10022', name: 'Khoru Rajbongsi', mobile: '9394243860', qtName: 'Prasanta boro', zcName: 'Ajit Kumar Singh', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10021', name: 'Jintu kalita', mobile: '6001233345', qtName: 'Jyotisman deka', zcName: 'Manish Kumar', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
    { id: '10020', name: 'Lakhi bala kalita', mobile: '8011536978', qtName: 'Jyotisman deka', zcName: 'Manish Kumar', qcName: 'Suman Sheikhar', zone: 'Goreshwar', date: '07 Jul, 2025' },
];

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
        ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
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
                    <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto">
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

const SelectItem = ({ value, children }) => null; // This is just for structure

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
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
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
        const startingDay = firstDay.getDay();
        
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
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
                    <div className="absolute z-50 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 min-w-[280px]">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <h3 className="font-semibold text-sm">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`p-2 text-sm text-center rounded hover:bg-violet-100 ${
                                        day && selected && day.toDateString() === selected.toDateString()
                                            ? 'bg-violet-500 text-white'
                                            : day
                                                ? 'text-gray-700'
                                                : 'text-transparent cursor-default'
                                    }`}
                                    onClick={() => {
                                        if (day) {
                                            onSelect(day);
                                            setIsOpen(false);
                                        }
                                    }}
                                    disabled={!day}
                                >
                                    {day ? day.getDate() : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full ${sizeClasses[size]} animate-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }
        
        rangeWithDots.push(...range);
        
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }
        
        return rangeWithDots;
    };

    return (
        <nav className="flex items-center justify-center space-x-2">
            <button 
                onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </button>
            
            <div className="flex space-x-1">
                {getVisiblePages().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                            currentPage === page
                                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                                : typeof page === 'number'
                                    ? 'text-gray-700 hover:bg-gray-100'
                                    : 'text-gray-400 cursor-default'
                        }`}
                        disabled={typeof page !== 'number'}
                    >
                        {page}
                    </button>
                ))}
            </div>
            
            <button 
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages} 
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </button>
        </nav>
    );
};

// ===================================================================================
// MAIN COMPONENT
// ===================================================================================

const AllSurveyData = () => {
    // State for form filters
    const [filters, setFilters] = useState({
        zone: 'all-zones',
        ot: 'all-ot',
        zc: 'all-zc',
        qc: 'all-qc',
    });
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);

    // State for table selections
    const [selectedRows, setSelectedRows] = useState([]);

    // State for modals
    const [viewModalData, setViewModalData] = useState(null);
    const [deleteModalData, setDeleteModalData] = useState(null);

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRows(surveyData.map(row => row.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (date) => {
        if (!date) return null;
        return date.toISOString().split('T')[0];
    };

    const handleSearch = () => {
        const formData = {
            ...filters,
            dateFrom: formatDate(dateFrom),
            dateTo: formatDate(dateTo),
        };
        console.log("Searching with data:", JSON.stringify(formData, null, 2));
        alert("Search data has been logged to the console. Ready for backend API integration.");
    };

    const handleResetFilters = () => {
        setFilters({ zone: 'all-zones', ot: 'all-ot', zc: 'all-zc', qc: 'all-qc' });
        setDateFrom(null);
        setDateTo(null);
        console.log("Filters reset!");
    };
    
    const handleExport = (type) => {
        console.log(`Exporting ${type} CSV with selected rows:`, selectedRows);
        alert(`Exporting ${type} CSV... (check console)`);
    };

    const handleBulkAction = (action) => {
        console.log(`Performing bulk action "${action}" on rows:`, selectedRows);
        alert(`Bulk action "${action}" triggered for selected rows. Check console.`);
    };

    const handleViewClick = (rowData) => {
        setViewModalData(rowData);
    };

    const handleDeleteClick = (rowData) => {
        setDeleteModalData(rowData);
    };

    const confirmDelete = () => {
        console.log("Deleting record:", deleteModalData);
        alert(`Record with ID ${deleteModalData.id} deleted! (simulated)`);
        setDeleteModalData(null);
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8 font-sans">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                Survey Analytics
                            </h1>
                            <p className="text-gray-600 mt-1">Comprehensive survey data management</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb" className="mt-6">
                        <ol className="flex items-center space-x-2 text-sm bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/20 w-fit">
                            <li>
                                <a href="#" className="flex items-center text-violet-600 hover:text-violet-800 transition-colors">
                                    <Home className="h-4 w-4 mr-1.5" /> Home
                                </a>
                            </li>
                            <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Survey Data</a></li>
                            <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
                            <li><span className="text-violet-600 font-semibold">All Records</span></li>
                        </ol>
                    </nav>
                </header>

                {/* Main Content Card */}
                <Card>
                    {/* Header with Export Buttons */}
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <Database className="h-5 w-5 mr-2 text-violet-600" />
                                    Survey Data Collection
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">Total Records: 10,025</p>
                            </div>
                            <div className="flex space-x-3">
                                <Button variant="outline" onClick={() => handleExport('Normal')} className="flex items-center">
                                    <Download className="h-4 w-4 mr-2" />
                                    Normal CSV
                                </Button>
                                <Button onClick={() => handleExport('Standard')} className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Advanced Search */}
                    <CardContent>
                        <Card className="shadow-md mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <Filter className="h-5 w-5 mr-2 text-violet-600" />
                                        Advanced Search
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="icon" onClick={handleResetFilters} className="h-8 w-8 rounded-full">
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleResetFilters} className="h-8 w-8 rounded-full">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
                                    <div className="space-y-2 xl:col-span-1">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            Filter By Zone
                                        </label>
                                        <Select value={filters.zone} onValueChange={(v) => handleFilterChange('zone', v)}>
                                            <SelectItem value="all-zones">All Zones</SelectItem>
                                            <SelectItem value="goreshwar">Goreshwar</SelectItem>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 xl:col-span-1">
                                        <label className="text-sm font-semibold text-gray-700">Filter By OT</label>
                                        <Select value={filters.ot} onValueChange={(v) => handleFilterChange('ot', v)}>
                                            <SelectItem value="all-ot">All OT</SelectItem>
                                            <SelectItem value="ot-1">OT 1</SelectItem>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 xl:col-span-1">
                                        <label className="text-sm font-semibold text-gray-700">Filter By ZC</label>
                                        <Select value={filters.zc} onValueChange={(v) => handleFilterChange('zc', v)}>
                                            <SelectItem value="all-zc">All ZC</SelectItem>
                                            <SelectItem value="ajit-kumar-singh">Ajit Kumar Singh</SelectItem>
                                            <SelectItem value="manish-kumar">Manish Kumar</SelectItem>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 xl:col-span-1">
                                        <label className="text-sm font-semibold text-gray-700">Filter By QC</label>
                                        <Select value={filters.qc} onValueChange={(v) => handleFilterChange('qc', v)}>
                                            <SelectItem value="all-qc">All QC</SelectItem>
                                            <SelectItem value="suman-sheikhar">Suman Sheikhar</SelectItem>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 xl:col-span-1">
                                        <label className="text-sm font-semibold text-gray-700">Date From</label>
                                        <DatePicker selected={dateFrom} onSelect={setDateFrom} placeholder="dd-mm-yyyy" />
                                    </div>
                                    <div className="space-y-2 xl:col-span-1">
                                        <label className="text-sm font-semibold text-gray-700">Date To</label>
                                        <DatePicker selected={dateTo} onSelect={setDateTo} placeholder="dd-mm-yyyy" />
                                    </div>
                                    <div className="xl:col-span-1">
                                        <Button onClick={handleSearch} className="w-full flex items-center justify-center">
                                            <Search className="mr-2 h-4 w-4"/> 
                                            Search
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Table */}
                        <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left w-[50px]">
                                                <Checkbox
                                                    onCheckedChange={handleSelectAll}
                                                    checked={surveyData.length > 0 && selectedRows.length === surveyData.length}
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">QT Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ZC Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">QC Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Zone</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {surveyData.map((row, index) => (
                                            <tr key={row.id} className="hover:bg-violet-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Checkbox
                                                        onCheckedChange={() => handleSelectRow(row.id)}
                                                        checked={selectedRows.includes(row.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{row.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{row.mobile}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{row.qtName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{row.zcName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{row.qcName}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full border border-blue-200">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {row.zone}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full border border-orange-200">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {row.date}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="icon" onClick={() => handleViewClick(row)} className="h-8 w-8">
                                                            <Eye className="h-4 w-4"/>
                                                        </Button>
                                                        <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(row)} className="h-8 w-8">
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer with Bulk Actions and Pagination */}
                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                                <div>
                                    {selectedRows.length > 0 && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-600 font-medium">
                                                {selectedRows.length} selected
                                            </span>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="icon" onClick={() => handleBulkAction('action_circle')} className="h-8 w-8 rounded-full">
                                                    <Circle className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleBulkAction('action_more')} className="h-8 w-8 rounded-full">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleBulkAction('delete')} className="h-8 w-8 rounded-full">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* View Modal */}
            <Modal 
                isOpen={!!viewModalData} 
                onClose={() => setViewModalData(null)} 
                title={`Survey Details (ID: ${viewModalData?.id})`}
                size="lg"
            >
                {viewModalData && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <span className="text-sm text-gray-600">Name</span>
                                <p className="font-semibold text-gray-900">{viewModalData.name}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <span className="text-sm text-gray-600">Mobile</span>
                                <p className="font-semibold text-gray-900">{viewModalData.mobile}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <span className="text-sm text-gray-600">Zone</span>
                                <p className="font-semibold text-gray-900">{viewModalData.zone}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <span className="text-sm text-gray-600">Date</span>
                                <p className="font-semibold text-gray-900">{viewModalData.date}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                                <span className="text-sm text-gray-600">QT Name</span>
                                <p className="font-semibold text-gray-900">{viewModalData.qtName}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                                <span className="text-sm text-gray-600">ZC Name</span>
                                <p className="font-semibold text-gray-900">{viewModalData.zcName}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                                <span className="text-sm text-gray-600">QC Name</span>
                                <p className="font-semibold text-gray-900">{viewModalData.qcName}</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={() => setViewModalData(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={!!deleteModalData} 
                onClose={() => setDeleteModalData(null)} 
                title="Confirm Deletion"
                size="sm"
            >
                {deleteModalData && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <p className="text-gray-900 mb-2">Are you sure you want to delete this record?</p>
                            <p className="text-sm text-gray-600">
                                This will permanently delete the survey record for <strong>{deleteModalData.name}</strong> (ID: {deleteModalData.id}).
                            </p>
                        </div>
                        <div className="flex justify-center space-x-3">
                            <Button variant="secondary" onClick={() => setDeleteModalData(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Confirm Delete
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AllSurveyData;