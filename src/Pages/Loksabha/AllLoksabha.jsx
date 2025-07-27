import { VisionBase } from '@/utils/axiosInstance';
import React, { useState, useMemo, useEffect } from 'react';
// In a real application, you would install and import react-router-dom
// npm install react-router-dom
import { useNavigate } from 'react-router-dom';

// --- Start of Mocked Icons (No changes needed) ---
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const FileText = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M16 13H8"></path><path d="M10 9H8"></path><path d="M16 17H8"></path></svg>;
const CheckCircle2 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const AlertTriangle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>;
const Search = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
const Pencil = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>;
const X = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>;
const ChevronLeft = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>;
const ChevronRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>;
const RefreshCw = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
const Eye = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const Filter = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const RotateCcw = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
// --- End of Mocked Icons ---

// --- Start of Mocked UI Components (No changes needed) ---
const Card = ({ children, className = "" }) => <div className={`bg-white border border-gray-200/90 rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-4 sm:p-5 border-b border-gray-200/90 ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
const CardFooter = ({ children, className = "" }) => <div className={`p-4 sm:p-5 border-t border-gray-200/90 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold leading-none tracking-tight text-[#495057] ${className}`}>{children}</h3>;
// --- End of Mocked UI Components ---

// --- Start of Reusable Components ---
const StatCard = ({ icon, label, value, colorClass, iconBgClass }) => (
    <Card className="flex items-center p-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconBgClass}`}>{icon}</div>
        <div className="ml-4 text-right flex-1">
            <p className={`text-2xl font-bold ${colorClass}`}>{label}</p>
            <p className="text-lg text-gray-600">{value}</p>
        </div>
    </Card>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, recordName, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{message} <strong className="text-gray-800">"{recordName}"</strong>?</p>
                    <p className="text-xs text-red-600 mt-2">This action cannot be undone.</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button onClick={onConfirm} disabled={isLoading} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? (<div className="flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Deleting...</div>) : 'Delete'}
                    </button>
                    <button onClick={onClose} disabled={isLoading} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const ViewModal = ({ isOpen, onClose, record }) => {
    if (!isOpen || !record) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Loksabha Details</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID</label>
                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{record.lok_id}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{record.lok_name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{record.state}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end rounded-b-lg">
                    <button onClick={onClose} type="button" className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:text-sm transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

const EditModal = ({ isOpen, onClose, onConfirm, record, isLoading }) => {
    const [formData, setFormData] = useState({ lok_name: '', state: '' });

    useEffect(() => {
        if (record) {
            setFormData({ lok_name: record.lok_name, state: record.state });
        }
    }, [record]);

    if (!isOpen || !record) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onConfirm(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Edit Loksabha</h3>
                        <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID</label>
                            <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded">{record.lok_id}</p>
                        </div>
                        <div>
                            <label htmlFor="lok_name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="lok_name" id="lok_name" value={formData.lok_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" name="state" id="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end rounded-b-lg space-x-3">
                    <button onClick={onClose} disabled={isLoading} type="button" className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={isLoading} type="button" className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? (<div className="flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</div>) : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- End of Reusable Components ---

const AllLoksabha = () => {
    const navigate = useNavigate();
    
    // State management
    const [loksabhaData, setLoksabhaData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [recordToView, setRecordToView] = useState(null);
    const [recordToEdit, setRecordToEdit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        state: ''
    });

    // Fetch Loksabha data
    const fetchLoksabhaData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await VisionBase.get(`/loksabhas`);
            if (response.data && response.data.data && response.data.data.rows) {
                setLoksabhaData(response.data.data.rows);
            } else {
                setLoksabhaData([]);
            }
        } catch (err) {
            console.error('Error fetching Loksabha data:', err);
            setError('Failed to fetch Loksabha data. Please try again.');
            setLoksabhaData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchLoksabhaData();
    }, []);

    // Get unique values for filter dropdowns
    const filterOptions = useMemo(() => {
        const stateOptions = [...new Set(loksabhaData.map(item => item.state).filter(Boolean))].sort();
        return { state: stateOptions };
    }, [loksabhaData]);

    // Filter and search logic
    const filteredLoksabhaData = useMemo(() => {
        let filtered = loksabhaData;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.lok_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.state?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply dropdown filters
        if (filters.state) {
            filtered = filtered.filter(item => item.state === filters.state);
        }

        return filtered;
    }, [loksabhaData, searchTerm, filters]);

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilters({ state: '' });
        setSelectedRows([]); // Clear selections when resetting filters
    };

    // Update filter
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setSelectedRows([]); // Clear selections when changing filters
    };

    const counts = useMemo(() => ({
        total: loksabhaData.length,
        filtered: filteredLoksabhaData.length,
        active: loksabhaData.length, // Assuming all are active
        inactive: 0,
    }), [loksabhaData, filteredLoksabhaData]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(filteredLoksabhaData.map(item => item.lok_id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const handleAction = (action, record) => {
        if (action === 'delete') {
            setRecordToDelete(record);
            setDeleteModalOpen(true);
        } else if (action === 'edit') {
            setRecordToEdit(record);
            setEditModalOpen(true);
        } else if (action === 'view') {
            setRecordToView(record);
            setViewModalOpen(true);
        }
    };

    // --- START OF FIX: Corrected single record delete function ---
    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        setDeleteLoading(true);
        try {
            // Make the actual API call to delete the record from the backend.
            // The endpoint '/lok/{id}' is inferred from other functions in the component.
            await VisionBase.delete(`/lok/${recordToDelete.lok_id}`);

            // After a successful API call, update the local state to reflect the change.
            // This is an "optimistic update" because we assume success.
            setLoksabhaData(prev => prev.filter(item => item.lok_id !== recordToDelete.lok_id));
            setSelectedRows(prev => prev.filter(id => id !== recordToDelete.lok_id));
            
            alert(`Successfully deleted Loksabha: ${recordToDelete.lok_name}`);
        } catch (err) {
            console.error("Error deleting record:", err);
            // Provide more specific feedback to the user on failure.
            alert(`Failed to delete record: ${err.response?.data?.message || err.message || 'Unknown error'}`);
            // Since the optimistic update didn't happen on failure, no state rollback is needed here.
        } finally {
            setDeleteLoading(false);
            setDeleteModalOpen(false);
            setRecordToDelete(null);
        }
    };
    // --- END OF FIX ---
    
    const handleUpdateConfirm = async (updatedData) => {
        if (!recordToEdit) return;
        setUpdateLoading(true);
        try {
            // Example:
            await VisionBase.put(`/lok/${recordToEdit.lok_id}`, updatedData);

            setLoksabhaData(prev => prev.map(item => 
                item.lok_id === recordToEdit.lok_id ? { ...item, ...updatedData } : item
            ));
            alert(`Successfully updated Loksabha: ${updatedData.lok_name}`);
            setEditModalOpen(false);
            setRecordToEdit(null);
        } catch (err) {
            console.error("Error updating record:", err);
            alert(`Failed to update record: ${err.message || 'Unknown error'}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    // --- START OF FIX: Corrected bulk delete function ---
    const handleBulkDelete = async () => {
        const numToDelete = selectedRows.length;
        if (numToDelete === 0) {
            alert("Please select at least one record to delete.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete ${numToDelete} record(s)?`)) {
            return;
        }

        // Keep a copy of original data for rollback in case of failure.
        const originalData = [...loksabhaData];
        const originalSelectedRows = [...selectedRows];

        // Optimistic UI update: Remove items from view immediately.
        setLoksabhaData(prev => prev.filter(item => !originalSelectedRows.includes(item.lok_id)));
        setSelectedRows([]);
        
        try {
            // Correctly iterate over the selected row IDs and call the delete API for each.
            // A single bulk delete endpoint would be more efficient, but this works.
            await Promise.all(originalSelectedRows.map(id => VisionBase.delete(`/lok/${id}`)));

            alert(`Successfully deleted ${numToDelete} record(s).`);
        } catch (err) {
            console.error("Error in bulk delete:", err);
            alert(`Failed to delete one or more records. Reverting changes.`);
            // Rollback on failure: restore the previous state.
            setLoksabhaData(originalData);
            setSelectedRows(originalSelectedRows); // Also restore selection for user convenience.
        }
    };
    // --- END OF FIX ---

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FEFBFB] p-4 sm:p-6 lg:p-8 font-sans">
                <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
                    <div className="flex items-center space-x-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#EE4B4B]" />
                        <span className="text-lg text-gray-600">Loading Loksabha data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FEFBFB] p-4 sm:p-6 lg:p-8 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col justify-center items-center h-64 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-lg text-red-700 mb-4">{error}</p>
                    <button onClick={fetchLoksabhaData} className="px-4 py-2 bg-[#EE4B4B] text-white rounded-md hover:bg-red-600 transition-colors">Retry</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#FEFBFB] p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl sm:text-3xl text-[#5a5a5a]">
                        Loksabha <span className="font-light text-[#6c757d]">Management</span>
                    </h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={fetchLoksabhaData} className="p-3 bg-gray-200/70 rounded-md hover:bg-gray-300 transition-colors" title="Refresh data">
                            <RefreshCw className="h-5 w-5 text-gray-500" />
                        </button>
                        <div className="p-3 bg-gray-200/70 rounded-md"><FileText className="h-6 w-6 text-gray-500" /></div>
                    </div>
                </header>

                <nav className="text-sm mb-6 text-[#986A6A]" aria-label="Breadcrumb">
                    <ol className="list-none p-0 inline-flex items-center flex-wrap space-x-2">
                        <li className="flex items-center"><Home className="h-4 w-4 mr-2" /><a href="#" className="hover:underline">Home</a></li>
                        <li><span className="text-gray-400">›</span></li>
                        <li><a href="#" className="hover:underline">Loksabha</a></li>
                        <li><span className="text-gray-400">›</span></li>
                        <li className="font-semibold">All Loksabhas</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard icon={<FileText className="w-8 h-8 text-white"/>} label="Total" value={counts.total} colorClass="text-[#EE4B4B]" iconBgClass="bg-[#EE4B4B]" />
                    <StatCard icon={<Filter className="w-8 h-8 text-white"/>} label="Filtered" value={counts.filtered} colorClass="text-[#9B59B6]" iconBgClass="bg-[#9B59B6]" />
                    <StatCard icon={<CheckCircle2 className="w-8 h-8 text-white"/>} label="Active" value={counts.active} colorClass="text-[#3B8D61]" iconBgClass="bg-[#3B8D61]" />
                    <StatCard icon={<AlertTriangle className="w-8 h-8 text-white" strokeWidth="1.5" />} label="Inactive" value={counts.inactive} colorClass="text-[#EC971F]" iconBgClass="bg-[#EC971F]" />
                </div>

                {/* Search and Filters Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Search & Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search loksabha name or state..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#EE4B4B] focus:border-[#EE4B4B] sm:text-sm"
                            />
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <select
                                    value={filters.state}
                                    onChange={(e) => updateFilter('state', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#EE4B4B] focus:border-[#EE4B4B] sm:text-sm"
                                >
                                    <option value="">All States</option>
                                    {filterOptions.state.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button 
                                    onClick={resetFilters}
                                    disabled={!searchTerm && !filters.state}
                                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset Filters
                                </button>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || filters.state) && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        Search: {searchTerm}
                                        <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-600">×</button>
                                    </span>
                                )}
                                {filters.state && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                        State: {filters.state}
                                        <button onClick={() => updateFilter('state', '')} className="ml-1 hover:text-orange-600">×</button>
                                    </span>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-wrap items-center justify-between gap-4">
                        <CardTitle>Loksabha (Showing: {counts.filtered} of {counts.total})</CardTitle>
                        <button onClick={() => navigate('/addloksabha')} className="px-4 py-2 bg-[#EE4B4B] text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors">Add New</button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="p-4">
                                            <input type="checkbox" onChange={handleSelectAll} checked={filteredLoksabhaData.length > 0 && selectedRows.length === filteredLoksabhaData.length} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500" />
                                        </th>
                                        <th scope="col" className="px-6 py-3 font-bold">ID</th>
                                        <th scope="col" className="px-6 py-3 font-bold">Name</th>
                                        <th scope="col" className="px-6 py-3 font-bold">State</th>
                                        <th scope="col" className="px-6 py-3 font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLoksabhaData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                {searchTerm || filters.state 
                                                    ? "No Loksabha records found matching your search criteria." 
                                                    : "No Loksabha records found"}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLoksabhaData.map(item => (
                                            <tr key={item.lok_id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="w-4 p-4">
                                                    <input type="checkbox" onChange={() => handleSelectRow(item.lok_id)} checked={selectedRows.includes(item.lok_id)} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"/>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.lok_id}</td>
                                                <td className="px-6 py-4">{item.lok_name}</td>
                                                <td className="px-6 py-4">{item.state}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button onClick={() => handleAction('view', item)} className="p-1.5 bg-blue-500 rounded hover:bg-blue-600 transition-colors" title="View"><Eye className="w-4 h-4 text-white" /></button>
                                                        <button onClick={() => handleAction('edit', item)} className="p-1.5 bg-[#5BC0DE] rounded hover:bg-cyan-400 transition-colors" title="Edit"><Pencil className="w-4 h-4 text-white" /></button>
                                                        <button onClick={() => handleAction('delete', item)} className="p-1.5 bg-[#D9534F] rounded hover:bg-red-600 transition-colors" title="Delete"><X className="w-4 h-4 text-white" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            {selectedRows.length > 0 && (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">{selectedRows.length} selected</span>
                                    <button onClick={handleBulkDelete} className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Delete Selected">
                                        <X className="w-4 h-4 mr-1" /> Delete Selected
                                    </button>
                                </div>
                            )}
                        </div>
                        <nav>
                            <ul className="inline-flex items-center -space-x-px">
                                <li><a href="#" className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100"><ChevronLeft className="w-4 h-4"/></a></li>
                                <li><a href="#" aria-current="page" className="px-3 py-2 leading-tight text-white bg-[#EE4B4B] border border-[#EE4B4B]">1</a></li>
                                <li><a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100"><ChevronRight className="w-4 h-4"/></a></li>
                            </ul>
                        </nav>
                    </CardFooter>
                </Card>
            </div>
            
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => { setDeleteModalOpen(false); setRecordToDelete(null); }} onConfirm={handleDeleteConfirm} title="Delete Loksabha Record" message="Are you sure you want to delete" recordName={recordToDelete?.lok_name} isLoading={deleteLoading}/>
            <ViewModal isOpen={isViewModalOpen} onClose={() => { setViewModalOpen(false); setRecordToView(null); }} record={recordToView} />
            <EditModal isOpen={isEditModalOpen} onClose={() => { setEditModalOpen(false); setRecordToEdit(null); }} onConfirm={handleUpdateConfirm} record={recordToEdit} isLoading={updateLoading}/>
        </div>
    );
};

export default AllLoksabha;