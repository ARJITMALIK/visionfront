import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Home, ChevronRight, Search, Edit, Trash2, X, Plus, Users, UserCheck, UserX } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

// ===================================================================================
// API & DATA HELPERS
// ===================================================================================

const ROLE_MAP = { 0: 'Admin', 1: 'QC', 2: 'ZC', 3: 'OT' };
const ROLE_TO_NUMERIC = { 'Admin': 0, 'QC': 1, 'ZC': 2, 'OT': 3 };
const DEFAULT_AVATAR_URL = 'https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=';

const transformUserData = (rawUsers) => {
    if (!Array.isArray(rawUsers)) return [];
    const userMap = new Map(rawUsers.map(user => [user.user_id, user.name]));
    return rawUsers.map(user => ({
        ...user,
        parentName: user.parent ? userMap.get(user.parent) || 'Unknown Parent' : 'Admin',
        role: ROLE_MAP[user.role] || 'Unknown Role',
        avatar: user.name.substring(0, 2).toUpperCase(),
        image: user.profile || null
    }));
};

// ===================================================================================
// MODERN UI COMPONENTS
// ===================================================================================
const StatCard = ({ icon: Icon, title, value, colorClass, bgClass, trend }) => ( 
    <div className={`relative overflow-hidden rounded-xl ${bgClass} backdrop-blur-sm border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
                {trend && <p className="text-xs text-white/60 mt-1">{trend}</p>}
            </div>
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Icon className="h-8 w-8 text-white" />
            </div>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-10 translate-x-10"></div>
    </div> 
);

const StatusBadge = ({ status }) => { 
    const styles = status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50' : 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100/50'; 
    return ( 
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${styles}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
            {status}
        </span> 
    ); 
};

const RoleBadge = ({ role }) => { 
    const roleStyles = { 
        'Admin': 'bg-purple-50 text-purple-700 border-purple-200', 
        'QC': 'bg-blue-50 text-blue-700 border-blue-200', 
        'ZC': 'bg-orange-50 text-orange-700 border-orange-200', 
        'OT': 'bg-gray-50 text-gray-700 border-gray-200' 
    }; 
    return ( 
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${roleStyles[role] || roleStyles['OT']}`}>
            {role}
        </span> 
    ); 
};

const Avatar = ({ name, status, image }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    // Use the provided image, or default avatar, or fallback to initials
    const imageUrl = image && !imageError ? image : DEFAULT_AVATAR_URL;
    const showInitials = imageError && !image;

    if (showInitials) {
        return (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${status === 'Active' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`}>
                {name}
            </div>
        );
    }

    return (
        <div className="relative w-10 h-10">
            {imageLoading && (
                <div className={`absolute inset-0 rounded-full flex items-center justify-center text-sm font-semibold text-white ${status === 'Active' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`}>
                    {name}
                </div>
            )}
            <img
                src={imageUrl}
                alt={`${name}'s avatar`}
                className={`w-10 h-10 rounded-full object-cover border-2 ${status === 'Active' ? 'border-blue-200' : 'border-gray-300'} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>
    );
};

const ActionButton = ({ onClick, icon: Icon, className, tooltip, disabled = false }) => ( 
    <button 
        onClick={onClick} 
        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${className} ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`} 
        title={tooltip} 
        disabled={disabled}
    >
        <Icon className="h-4 w-4" />
    </button> 
);

const Pagination = ({ currentPage, totalPages, onPageChange, totalResults, itemsPerPage }) => { 
    if (totalPages <= 1) return null; 
    const startItem = totalResults > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0; 
    const endItem = Math.min(currentPage * itemsPerPage, totalResults); 
    return ( 
        <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {startItem} to {endItem} of {totalResults} results</p>
            <nav className="flex items-center space-x-1">
                <button 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                {[...Array(totalPages).keys()].map(i => i + 1).map(page => (
                    <button 
                        key={page} 
                        onClick={() => onPageChange(page)} 
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${ currentPage === page ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {page}
                    </button>
                ))}
                <button 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </nav>
        </div> 
    ); 
};

const Modal = ({ isOpen, onClose, title, children }) => { 
    if (!isOpen) return null; 
    return ( 
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div> 
    ); 
};

const UserForm = ({ initialUser, onSubmit, onClose, isLoading, allUsers, elections }) => { 
    const [formData, setFormData] = useState({ ...initialUser, parent: initialUser.parent || null, election_id: initialUser.election_id || '' }); 
    
    useEffect(() => { 
        if (formData.role === 'QC') { 
            setFormData(prev => ({ ...prev, parent: 0 })); 
        } else if (initialUser.role !== formData.role) { 
            setFormData(prev => ({ ...prev, parent: '', election_id: '' })); 
        } 
    }, [formData.role, initialUser.role]); 
    
    const handleChange = (e) => { 
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: value })); 
    }; 
    
    const handleSubmit = () => { 
        onSubmit(formData); 
    }; 
    
    const parentOptions = useMemo(() => { 
        if (formData.role === 'ZC') return allUsers.filter(u => u.role === 'QC'); 
        if (formData.role === 'OT') return allUsers.filter(u => u.role === 'ZC'); 
        return []; 
    }, [formData.role, allUsers]); 
    
    return ( 
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
                <input 
                    name="image" 
                    value={formData.image || ''} 
                    onChange={handleChange} 
                    placeholder="Enter image URL (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use default avatar</p>
                {formData.image && (
                    <div className="mt-2 flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Preview:</span>
                        <Avatar name={formData.name?.substring(0, 2).toUpperCase() || 'NA'} status="Active" image={formData.image} />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                >
                    <option value="">Select Role</option>
                    <option value="QC">QC</option>
                    <option value="ZC">ZC</option>
                    <option value="OT">OT</option>
                </select>
            </div>

            {/* Election dropdown - only show for QC role */}
            {formData.role === 'QC' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Election</label>
                    <select 
                        name="election_id" 
                        value={formData.election_id || ''} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required
                    >
                        <option value="">Select Election</option>
                        {elections.map(election => (
                            <option key={election.election_id} value={election.election_id}>
                                {election.election_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Name</label>
                {formData.role === 'QC' ? (
                    <input 
                        value="Admin" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" 
                        readOnly 
                    />
                ) : (
                    <select 
                        name="parent" 
                        value={formData.parent || ''} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required 
                        disabled={!formData.role || formData.role === 'QC'}
                    >
                        <option value="">
                            { !formData.role ? "Select a role first" : "Select Parent" }
                        </option>
                        {parentOptions.map(p => (
                            <option key={p.user_id} value={p.user_id}>{p.name}</option>
                        ))}
                    </select>
                )}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                <input 
                    name="mobile" 
                    value={formData.mobile || ''} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
            </div>
            
            { formData.user_id && 
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div> 
            }
            
            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit} 
                    disabled={isLoading} 
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <span>Save Changes</span>
                    )}
                </button>
            </div>
        </div> 
    ); 
};

// ===================================================================================
// MAIN AllUsers COMPONENT
// ===================================================================================
const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [elections, setElections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState({ type: null, user: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [filterElection, setFilterElection] = useState('all'); // New election filter state
    
    const ITEMS_PER_PAGE = 10;
    
    const fetchUsers = useCallback(async (electionId = null) => {
        setIsLoading(true);
        setError(null);
        try {
            let url = '/users';
            const params = {};
            
            // Add election_id as parameter if selected and not 'all'
            if (electionId && electionId !== 'all') {
                params.election_id = electionId;
            }
            
            // Build URL with parameters
            if (Object.keys(params).length > 0) {
                const searchParams = new URLSearchParams(params);
                url += `?${searchParams.toString()}`;
            }
            
            const response = await VisionBase.get(url);
            const transformed = transformUserData(response.data.data.rows);
            setUsers(transformed);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Could not load user data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchElections = useCallback(async () => {
        try {
            const response = await VisionBase.get('/elections');
            setElections(response.data.data.rows || []);
        } catch (err) {
            console.error("Failed to fetch elections:", err);
            setElections([]);
        }
    }, []);

    useEffect(() => {
        fetchElections();
    }, [fetchElections]);

    // Fetch users when election filter changes
    useEffect(() => {
        fetchUsers(filterElection);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [fetchUsers, filterElection]);

    const filteredUsers = useMemo(() => users.filter(user => 
        (user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user?.parentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || user.status.toLowerCase() === filterStatus) &&
        (filterRole === 'all' || user.role === filterRole)
    ), [users, searchTerm, filterStatus, filterRole]);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        inactive: users.filter(u => u.status === 'Inactive').length,
    }), [users]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const closeModal = () => setModalState({ type: null, user: null });
    const handleAdd = () => setModalState({ type: 'add', user: { name: '', parent: null, role: '', mobile: '', status: 'Active', image: '', election_id: '' } });
    const handleEdit = (user) => setModalState({ type: 'edit', user });
    const handleDelete = (user) => setModalState({ type: 'delete', user });
    const handleBulkDelete = () => setModalState({ type: 'bulk-delete' });
    
    // ===================================================================================
    //  ENHANCED API HANDLERS
    // ===================================================================================

    const generatePassword = (name, mobile) => {
        const namePrefix = (name || '').replace(/[^a-zA-Z]/g, '').substring(0, 4);
        const mobileStr = (mobile || '').toString();
        const mobileSuffix = mobileStr.length >= 2 ? mobileStr.slice(-2) : mobileStr.padStart(2, '0');
        return namePrefix + mobileSuffix;
    };

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        const isEditing = !!formData.user_id;

        try {
            if (isEditing) {
                const originalUser = modalState.user;
                const changes = {};

                if (formData.name !== originalUser.name) {
                    changes.name = formData.name;
                }
                if (formData.mobile !== originalUser.mobile) {
                    changes.mobile = formData.mobile || null;
                }
                if (formData.status !== originalUser.status) {
                    changes.status = formData.status;
                }
                if (formData.image !== originalUser.image) {
                    changes.profile = formData.image || null;
                }

                const newNumericRole = ROLE_TO_NUMERIC[formData.role];
                if (newNumericRole !== originalUser.role) {
                    changes.role = newNumericRole;
                }

                let newParentId;
                if (formData.role === 'QC') {
                    newParentId = 0;
                } else {
                    newParentId = formData.parent ? parseInt(formData.parent, 10) : null;
                }
                
                if (newParentId !== originalUser.parent) {
                    changes.parent = newParentId;
                }

                // Handle election_id for QC users
                if (formData.role === 'QC' && formData.election_id !== originalUser.election_id) {
                    changes.election_id = parseInt(formData.election_id, 10);
                }

                // Handle election_id inheritance for ZC and OT users
                if ((formData.role === 'ZC' || formData.role === 'OT') && formData.parent) {
                    const parentUser = users.find(u => u.user_id === parseInt(formData.parent, 10));
                    if (parentUser && parentUser.election_id && parentUser.election_id !== originalUser.election_id) {
                        changes.election_id = parentUser.election_id;
                    }
                }

                if (changes.name || changes.mobile) {
                    changes.password = generatePassword(formData.name, formData.mobile);
                }
                
                if (Object.keys(changes).length === 0) {
                    console.log("No changes detected. Skipping API call.");
                    closeModal();
                    return;
                }
                
                await VisionBase.put(`/user/${formData.user_id}`, changes);

            } else {
                // Adding new user
                let parentValue;
                if (formData.role === 'QC') {
                    parentValue = 0;
                } else {
                    parentValue = formData.parent ? parseInt(formData.parent, 10) : null;
                }

                const payload = {
                    name: formData.name,
                    mobile: formData.mobile,
                    role: ROLE_TO_NUMERIC[formData.role],
                    parent: parentValue,
                    profile: formData.image || null,
                    password: generatePassword(formData.name, formData.mobile)
                };

                // Add election_id for QC users
                if (formData.role === 'QC' && formData.election_id) {
                    payload.election_id = parseInt(formData.election_id, 10);
                }

                // Add election_id for ZC and OT users (inherit from parent)
                if ((formData.role === 'ZC' || formData.role === 'OT') && formData.parent) {
                    const parentUser = users.find(u => u.user_id === parseInt(formData.parent, 10));
                    if (parentUser && parentUser.election_id) {
                        payload.election_id = parentUser.election_id;
                    }
                }

                await VisionBase.post('/add-user', payload);
            }

            await fetchUsers(filterElection); // Refresh with current election filter
            closeModal();

        } catch (err) {
            console.error("Failed to save user:", err);
            setError(err.response?.data?.message || "An error occurred while saving the user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async (userId) => {
        setIsSubmitting(true);
        try {
            await VisionBase.delete(`/user/${userId}`);
            await fetchUsers(filterElection); // Refresh with current election filter
            closeModal();
        } catch (err) {
            console.error("Failed to delete user:", err);
            setError(err.response?.data?.message || "An error occurred while deleting the user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        setIsSubmitting(true);
        try {
            await VisionBase.delete('/users', { data: { ids: selectedUserIds } });
            await fetchUsers(filterElection); // Refresh with current election filter
            setSelectedUserIds([]);
            closeModal();
        } catch (err) {
            console.error("Failed to bulk delete users:", err);
            setError(err.response?.data?.message || "An error occurred while deleting users.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="p-6 lg:p-8">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                            <nav className="flex items-center space-x-2 text-sm text-gray-600">
                                <Home className="h-4 w-4" /> 
                                <ChevronRight className="h-4 w-4" />
                                <span>Users</span> 
                                <ChevronRight className="h-4 w-4" />
                                <span className="text-blue-600 font-medium">All Users</span>
                            </nav>
                        </div>
                        <button 
                            onClick={handleAdd} 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium"
                        >
                            <Plus className="h-5 w-5" /> 
                            <span>Add User</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        icon={Users} 
                        title="Total Users" 
                        value={stats.total} 
                        bgClass="bg-gradient-to-r from-blue-500 to-blue-600" 
                    />
                    <StatCard 
                        icon={UserCheck} 
                        title="Active Users" 
                        value={stats.active} 
                        bgClass="bg-gradient-to-r from-emerald-500 to-emerald-600" 
                    />
                    <StatCard 
                        icon={UserX} 
                        title="Inactive Users" 
                        value={stats.inactive} 
                        bgClass="bg-gradient-to-r from-slate-500 to-slate-600" 
                    />
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-white/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            {selectedUserIds.length > 0 ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-blue-700">{selectedUserIds.length} selected</span>
                                    <button 
                                        onClick={handleBulkDelete} 
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50" 
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete Selected</span>
                                    </button>
                                </div>
                            ) : (
                                <h2 className="text-xl font-semibold text-gray-900">
                                    All Users <span className="text-gray-500 font-normal">({filteredUsers.length})</span>
                                </h2>
                            )}
                            <div className="flex items-center space-x-4 flex-wrap">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search users..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm" 
                                    />
                                </div>
                                
                                {/* Election Filter Dropdown */}
                                <select 
                                    value={filterElection} 
                                    onChange={(e) => setFilterElection(e.target.value)} 
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                >
                                    <option value="all">All Elections</option>
                                    {elections.map(election => (
                                        <option key={election.election_id} value={election.election_id}>
                                            {election.election_name}
                                        </option>
                                    ))}
                                </select>
                                
                                <select 
                                    value={filterRole} 
                                    onChange={(e) => setFilterRole(e.target.value)} 
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="QC">QC</option>
                                    <option value="ZC">ZC</option>
                                    <option value="OT">OT</option>
                                </select>
                                <select 
                                    value={filterStatus} 
                                    onChange={(e) => setFilterStatus(e.target.value)} 
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                >
                                    <option value="all">All Status</option> 
                                    <option value="active">Active</option> 
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {isLoading ? ( 
                            <div className="p-10 text-center text-gray-500">Loading users...</div>
                        ) : 
                        error ? ( 
                            <div className="p-10 text-center text-red-500">{error}</div>
                        ) :
                        paginatedUsers.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">No users found.</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50/80 backdrop-blur-sm">
                                    <tr>
                                        <th className="p-4 text-left">
                                            <input 
                                                type="checkbox" 
                                                onChange={(e) => e.target.checked ? setSelectedUserIds(paginatedUsers.map(u => u.user_id)) : setSelectedUserIds([])} 
                                                checked={selectedUserIds.length > 0 && selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0} 
                                                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                                            />
                                        </th>
                                        <th className="p-4 text-left font-semibold text-gray-700">User</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Parent</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Role</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Mobile</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedUsers.map(user => (
                                        <tr key={user.user_id} className={`transition-colors ${selectedUserIds.includes(user.user_id) ? 'bg-blue-50' : 'hover:bg-gray-50/50'}`}>
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedUserIds.includes(user.user_id)} 
                                                    onChange={() => setSelectedUserIds(p => p.includes(user.user_id) ? p.filter(id => id !== user.user_id) : [...p, user.user_id])} 
                                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar name={user.avatar} status={user.status} image={user.image} />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">ID: {user.user_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-700">{user?.parentName}</td>
                                            <td className="p-4"><RoleBadge role={user.role} /></td>
                                            <td className="p-4 text-gray-600">{user.mobile || 'N/A'}</td>
                                            <td className="p-4"><StatusBadge status={user.status} /></td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <ActionButton 
                                                        onClick={() => handleEdit(user)} 
                                                        icon={Edit} 
                                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600" 
                                                        tooltip={user.role === 'Admin' ? 'Cannot edit Admins' : 'Edit User'} 
                                                        disabled={user.role === 'Admin'} 
                                                    />
                                                    <ActionButton 
                                                        onClick={() => handleDelete(user)} 
                                                        icon={Trash2} 
                                                        className="bg-red-50 hover:bg-red-100 text-red-600" 
                                                        tooltip={user.role === 'Admin' ? 'Cannot delete Admins' : 'Delete User'} 
                                                        disabled={user.role === 'Admin'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-white/50">
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                            totalResults={filteredUsers.length} 
                            itemsPerPage={ITEMS_PER_PAGE} 
                        />
                    </div>
                </div>

                <Modal 
                    isOpen={modalState.type === 'add' || modalState.type === 'edit'} 
                    onClose={closeModal} 
                    title={modalState.type === 'add' ? 'Add New User' : 'Edit User'}
                >
                    {modalState.user && (
                        <UserForm 
                            initialUser={modalState.user} 
                            onSubmit={handleFormSubmit} 
                            onClose={closeModal} 
                            isLoading={isSubmitting} 
                            allUsers={users}
                            elections={elections}
                        />
                    )}
                </Modal>

                <Modal 
                    isOpen={modalState.type === 'delete'} 
                    onClose={closeModal} 
                    title="Confirm Deletion"
                >
                    {modalState.user && ( 
                        <div className="text-center"> 
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"> 
                                <Trash2 className="h-6 w-6 text-red-600" /> 
                            </div> 
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete User</h3> 
                            <p className="text-sm text-gray-500 mb-6"> 
                                Are you sure you want to delete <strong>{modalState.user.name}</strong>? This action cannot be undone. 
                            </p> 
                            <div className="flex justify-center space-x-3"> 
                                <button 
                                    onClick={closeModal} 
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                > 
                                    Cancel 
                                </button> 
                                <button 
                                    onClick={() => handleDeleteConfirm(modalState.user.user_id)} 
                                    disabled={isSubmitting} 
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                > 
                                    {isSubmitting ? ( 
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Deleting...</span>
                                        </> 
                                    ) : ( 
                                        <span>Delete</span> 
                                    )} 
                                </button> 
                            </div> 
                        </div> 
                    )}
                </Modal>

                <Modal 
                    isOpen={modalState.type === 'bulk-delete'} 
                    onClose={closeModal} 
                    title="Confirm Bulk Deletion"
                >
                    <div className="text-center"> 
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"> 
                            <Trash2 className="h-6 w-6 text-red-600" /> 
                        </div> 
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Users</h3> 
                        <p className="text-sm text-gray-500 mb-6"> 
                            Are you sure you want to delete <strong>{selectedUserIds.length} selected users</strong>? This action cannot be undone. 
                        </p> 
                        <div className="flex justify-center space-x-3"> 
                            <button 
                                onClick={closeModal} 
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            > 
                                Cancel 
                            </button> 
                            <button 
                                onClick={handleBulkDeleteConfirm} 
                                disabled={isSubmitting} 
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            > 
                                {isSubmitting ? ( 
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                    </> 
                                ) : ( 
                                    <span>Delete</span> 
                                )} 
                            </button> 
                        </div> 
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AllUsers;