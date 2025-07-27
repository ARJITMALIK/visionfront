import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Home, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Plus,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Calendar,
  Vote,
  Users,
  Activity,
  Sparkles,
  ChevronLeft,
  MoreHorizontal,
  Trophy,
  Clock
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

// ===================================================================================
// DUMMY DATA & API SIMULATION (REMOVED)
// All data operations are now handled via axios API calls.
// ===================================================================================

// ===================================================================================
// MODERN UI COMPONENTS (Unchanged)
// ===================================================================================
const StatCard = ({ icon: Icon, title, value, gradient, description }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
        <div className="relative z-10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white mb-1">{value}</p>
                    {description && <p className="text-white/70 text-xs">{description}</p>}
                </div>
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-white" />
                </div>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
    </div>
);

const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
        status === 'Active' 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-gray-100 text-gray-700 border border-gray-200'
    }`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
        {status}
    </span>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;
        
        range.push(1);
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i < totalPages && i > 1) {
                range.push(i);
            }
        }
        range.push(totalPages);
        
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

    return (
        <nav className="flex items-center justify-center space-x-2">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
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
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </button>
        </nav>
    );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    
    const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full ${sizeClasses[size]} animate-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, height = 200 }) => {
    const editorRef = useRef(null);
    const executeCommand = (command, value = null) => { document.execCommand(command, false, value); editorRef.current?.focus(); handleEditorChange(); };
    const handleEditorChange = () => { if (editorRef.current && onChange) { onChange(editorRef.current.innerHTML); } };
    useEffect(() => { if (editorRef.current && content !== editorRef.current.innerHTML) { editorRef.current.innerHTML = content || ''; } }, [content]);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <button type="button" onClick={() => executeCommand('bold')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Bold"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => executeCommand('italic')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Italic"><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => executeCommand('underline')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Underline"><Underline className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Bullet List"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => executeCommand('insertOrderedList')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button type="button" onClick={() => executeCommand('justifyLeft')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => executeCommand('justifyCenter')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
                <button type="button" onClick={() => executeCommand('justifyRight')} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-gray-800" title="Align Right"><AlignRight className="w-4 h-4" /></button>
            </div>
            <div ref={editorRef} contentEditable onInput={handleEditorChange} className="p-4 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white rounded-b-xl" style={{ minHeight: `${height}px`, maxHeight: `${height * 2}px`, overflowY: 'auto', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: content || '' }} />
        </div>
    );
};

// ===================================================================================
// MAIN AllElections COMPONENT
// ===================================================================================

const AllElections = () => {
    // Mock navigation function for demo purposes
    const navigate = (path) => {
        console.log(`Would navigate to: ${path}`);
        alert(`Navigation to ${path} - In a real app, this would use React Router`);
    };

    const [elections, setElections] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState({ type: null, data: null, originalData: null });
    const [isLoading, setIsLoading] = useState(false); // For actions like save, delete
    const [isFetching, setIsFetching] = useState(true); // For initial table data load
    
    // Fetch data on component mount
    useEffect(() => {
        const fetchElections = async () => {
            setIsFetching(true);
            try {
                const response = await VisionBase.get('/elections');
                const mappedData = response.data.data.rows.map(e => ({
                    id: e.election_id,
                    name: e.election_name,
                    date: e.election_date,
                    description: e.election_desc,
                    state: e.state,
                    status: e.status,
                }));
                setElections(mappedData);
            } catch (error) {
                console.error("Failed to fetch elections:", error);
                // In a real app, you might set an error state to show a toast or message
            } finally {
                setIsFetching(false);
            }
        };
        fetchElections();
    }, []);

    const ITEMS_PER_PAGE = 10;

    const stats = useMemo(() => ({
        total: elections.length,
        active: elections.filter(e => e.status === 'Active').length,
        inactive: elections.filter(e => e.status === 'Inactive').length,
    }), [elections]);

    const paginatedElections = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return elections.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [elections, currentPage]);

    const totalPages = Math.ceil(elections.length / ITEMS_PER_PAGE);

    const handleSelectAll = (e) => setSelectedIds(e.target.checked ? paginatedElections.map(el => el.id) : []);
    const handleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(elId => elId !== id) : [...prev, id]);
    
    const closeModal = () => setModalState({ type: null, data: null, originalData: null });
    const handleAdd = () => navigate('/addelection');
    const handleView = (election) => setModalState({ type: 'view', data: election });
    const handleEdit = (election) => setModalState({ type: 'edit', data: { ...election }, originalData: election });
    const handleDelete = (election) => setModalState({ type: 'delete', data: election });
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { data: currentData, originalData } = modalState;
        const payload = {};

        // Compare and build payload with only changed fields
        if (currentData.name !== originalData.name) payload.election_name = currentData.name;
        if (currentData.date !== originalData.date) payload.election_date = currentData.date;
        if (currentData.description !== originalData.description) payload.election_desc = currentData.description;
        if (currentData.state !== originalData.state) payload.state = currentData.state;
        if (currentData.status !== originalData.status) payload.status = currentData.status;

        if (Object.keys(payload).length > 0) {
            try {
                await VisionBase.put(`/election/${currentData.id}`, payload);
                setElections(prev => prev.map(el => (el.id === currentData.id ? currentData : el)));
                closeModal();
            } catch (error) {
                console.error("Failed to update election:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
            closeModal();
        }
    };

    const handleDeleteConfirm = async (electionId) => {
        setIsLoading(true);
        try {
            await VisionBase.delete(`/election/${electionId}`);
            setElections(prev => prev.filter(el => el.id !== electionId));
            setSelectedIds(prev => prev.filter(id => id !== electionId));
            closeModal();
        } catch (error) {
            console.error(`Failed to delete election with ID ${electionId}:`, error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBulkDelete = async () => {
        setIsLoading(true);
        const deletePromises = selectedIds.map(id => VisionBase.delete(`/election/${id}`));
        try {
            await Promise.all(deletePromises);
            setElections(prev => prev.filter(el => !selectedIds.includes(el.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error("Failed to bulk delete elections:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <header className="relative mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Election Hub</h1>
                        <p className="text-gray-600 mt-1">Manage elections and democratic processes</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"><Vote className="h-6 w-6 text-white" /></div>
                </div>
                <nav aria-label="breadcrumb" className="mt-6">
                    <ol className="flex items-center space-x-2 text-sm bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/20 w-fit">
                        <li><a href="#" className="flex items-center text-violet-600 hover:text-violet-800 transition-colors"><Home className="h-4 w-4 mr-1.5" /> Home</a></li>
                        <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
                        <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Election</a></li>
                        <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
                        <li><span className="text-violet-600 font-semibold">All Elections</span></li>
                    </ol>
                </nav>
            </header>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={Trophy} title="Total Elections" value={stats.total} gradient="from-blue-500 to-blue-600" description="All registered elections" />
                <StatCard icon={Activity} title="Active Elections" value={stats.active} gradient="from-emerald-500 to-emerald-600" description="Currently running" />
                <StatCard icon={Clock} title="Inactive/Completed" value={stats.inactive} gradient="from-orange-500 to-orange-600" description="Finished elections" />
            </div>

            <div className="relative bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center"><Vote className="h-5 w-5 mr-2 text-violet-600" />Elections Management</h2>
                        <p className="text-sm text-gray-600 mt-1">Total: {stats.total} elections</p>
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600 transition-all duration-200"><Plus className="h-4 w-4 mr-2" /> Create Election</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === paginatedElections.length && paginatedElections.length > 0} className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2" /></th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Election Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isFetching ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-10 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                    </tr>
                                ))
                            ) : paginatedElections.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-10 text-gray-500">No elections found.</td></tr>
                            ) : (
                                paginatedElections.map((election) => (
                                    <tr key={election.id} className="hover:bg-violet-50/50 transition-colors">
                                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(election.id)} onChange={() => handleSelectOne(election.id)} className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2" /></td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{election.id}</td>
                                        <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={election.name}>{election.name}</div></td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{election.state}</td>
                                        <td className="px-6 py-4"><span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full border border-blue-200"><Calendar className="h-3 w-3 mr-1" />{formatDate(election.date)}</span></td>
                                        <td className="px-6 py-4"><StatusBadge status={election.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleView(election)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View Details"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => handleEdit(election)} className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Edit Election"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(election)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Election"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-red-400/20 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{selectedIds.length} election{selectedIds.length !== 1 ? 's' : ''} selected</span>
                        <button onClick={handleBulkDelete} disabled={isLoading} className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-xl text-sm font-medium transition-all disabled:opacity-50">{isLoading ? 'Deleting...' : 'Delete Selected'}</button>
                        <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-red-600 rounded-xl transition-all"><X className="h-4 w-4"/></button>
                    </div>
                </div>
            )}
            
            <Modal isOpen={modalState.type === 'view'} onClose={closeModal} title="Election Details" size="lg">
                {modalState.data && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-1">Election ID</p><p className="font-semibold text-gray-900">#{modalState.data.id}</p></div>
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-1">State</p><p className="font-semibold text-gray-900">{modalState.data.state}</p></div>
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-1">Election Date</p><p className="font-semibold text-gray-900">{formatDate(modalState.data.date)}</p></div>
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-1">Status</p><StatusBadge status={modalState.data.status} /></div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-2">Election Name</p><p className="font-semibold text-gray-900 text-lg">{modalState.data.name}</p></div>
                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-3">Description</p><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: modalState.data.description }} /></div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={modalState.type === 'edit'} onClose={closeModal} title="Edit Election" size="xl">
                {modalState.data && (
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3"><label className="block text-sm font-semibold text-gray-700">Election Name</label><input name="name" value={modalState.data.name} onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm transition-all" required /></div>
                            <div className="space-y-3"><label className="block text-sm font-semibold text-gray-700">Election Date</label><input type="date" name="date" value={modalState.data.date} onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, date: e.target.value } }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm transition-all" required /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3"><label className="block text-sm font-semibold text-gray-700">State</label><input name="state" value={modalState.data.state || ''} onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, state: e.target.value } }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm transition-all" required /></div>
                            <div className="space-y-3"><label className="block text-sm font-semibold text-gray-700">Status</label><select name="status" value={modalState.data.status} onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, status: e.target.value } }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm transition-all" required><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                        </div>
                        <div className="space-y-3"><label className="block text-sm font-semibold text-gray-700">Election Description</label><RichTextEditor content={modalState.data.description} onChange={(content) => setModalState(prev => ({ ...prev, data: { ...prev.data, description: content } }))} height={250}/></div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                            <button type="submit" disabled={isLoading} className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200">{isLoading ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </form>
                )}
            </Modal>
            
            <Modal isOpen={modalState.type === 'delete'} onClose={closeModal} title="Confirm Deletion" size="sm">
                {modalState.data && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"><Trash2 className="h-8 w-8 text-red-600" /></div>
                        <div>
                            <p className="text-gray-900 mb-2">Are you sure you want to delete this election?</p>
                            <p className="text-sm text-gray-600">"<strong>{modalState.data.name}</strong>" will be permanently removed.</p>
                        </div>
                        <div className="flex justify-center space-x-3">
                            <button onClick={closeModal} className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={() => handleDeleteConfirm(modalState.data.id)} disabled={isLoading} className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200">{isLoading ? 'Deleting...' : 'Delete Election'}</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AllElections;