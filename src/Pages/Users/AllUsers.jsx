import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Home, ChevronRight, Search, Edit, Trash2, X, Plus, Users, UserCheck, UserX, Upload, FileImage } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

// ===================================================================================
// API & DATA HELPERS (Unchanged)
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
        image: user.profile || null,
        status: user.status
    }));
};

// ===================================================================================
// NEW PROFILE IMAGE UPLOAD COMPONENT
// ===================================================================================
const ProfileImageUpload = ({ onFileChange, preview, onRemove, disabled }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }, [disabled]);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragOver(false); }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled) return;
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            onFileChange(files[0]);
        }
    }, [onFileChange, disabled]);
    const handleClick = () => { if (!disabled) fileInputRef.current?.click(); };

    return (
        <div
            className={`relative group border-2 border-dashed rounded-full w-32 h-32 mx-auto transition-all duration-300 cursor-pointer overflow-hidden ${isDragOver ? 'border-blue-400 bg-blue-50/50 scale-105' : 'border-gray-300 hover:border-blue-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
        >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && onFileChange(e.target.files[0])} className="hidden" disabled={disabled} />
            {preview ? (
                <>
                    <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" disabled={disabled}><X className="h-3 w-3" /></button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full flex items-center justify-center"><div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-2"><Upload className="h-5 w-5 text-gray-700" /></div></div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-2">
                    <FileImage className="h-8 w-8 text-gray-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-600">Upload Photo</p>
                    <p className="text-xs text-gray-400">or drag</p>
                </div>
            )}
        </div>
    );
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
    const handleImageError = () => setImageError(true);
    const imageUrl = image && !imageError ? image : DEFAULT_AVATAR_URL;

    return (
        <img
            src={imageUrl}
            alt={`${name}'s avatar`}
            className={`w-10 h-10 rounded-full object-cover border-2 ${status ? 'border-blue-200' : 'border-gray-300'}`}
            onError={handleImageError}
        />
    );
};

const ActionButton = ({ onClick, icon: Icon, className, tooltip, disabled = false }) => ( 
    <button onClick={onClick} className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${className} ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`} title={tooltip} disabled={disabled}>
        <Icon className="h-4 w-4" />
    </button> 
);

const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}
        title={disabled ? 'Cannot change Admin status' : checked ? 'Status: Active' : 'Status: Inactive'}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
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
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                {[...Array(totalPages).keys()].map(i => i + 1).map(page => (
                    <button key={page} onClick={() => onPageChange(page)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${ currentPage === page ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>{page}</button>
                ))}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
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
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div> 
    ); 
};

// ===================================================================================
// UPDATED UserForm COMPONENT
// ===================================================================================
const UserForm = ({ initialUser, onSubmit, onClose, isLoading, allUsers, elections }) => { 
    const [formData, setFormData] = useState({ ...initialUser, parent: initialUser.parent || null, election_id: initialUser.election_id || '' }); 
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialUser.image || null);

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

    const handleImageChange = (file) => {
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: null }));
    };
    
    const handleSubmit = () => { 
        onSubmit(formData, imageFile); 
    }; 
    
    const parentOptions = useMemo(() => { 
        if (formData.role === 'ZC') return allUsers.filter(u => u.role === 'QC'); 
        if (formData.role === 'OT') return allUsers.filter(u => u.role === 'ZC'); 
        return []; 
    }, [formData.role, allUsers]); 
    
    return ( 
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm text-center font-medium text-gray-700 mb-2">Profile Photo</label>
                <ProfileImageUpload
                    onFileChange={handleImageChange}
                    preview={imagePreview}
                    onRemove={handleRemoveImage}
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    <option value="">Select Role</option>
                    <option value="QC">QC</option>
                    <option value="ZC">ZC</option>
                    <option value="OT">OT</option>
                </select>
            </div>

            {formData.role === 'QC' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Election</label>
                    <select name="election_id" value={formData.election_id || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                        <option value="">Select Election</option>
                        {elections.map(election => ( <option key={election.election_id} value={election.election_id}>{election.election_name}</option> ))}
                    </select>
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Name</label>
                {formData.role === 'QC' ? (
                    <input value="Admin" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" readOnly />
                ) : (
                    <select name="parent" value={formData.parent || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={!formData.role || formData.role === 'QC'}>
                        <option value="">{ !formData.role ? "Select a role first" : "Select Parent" }</option>
                        {parentOptions.map(p => (<option key={p.user_id} value={p.user_id}>{p.name}</option>))}
                    </select>
                )}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                <input name="mobile" value={formData.mobile || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            
            { formData.user_id && 
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                    </select>
                </div> 
            }
            
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSubmit} disabled={isLoading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2">
                    {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Saving...</span></>) : (<span>Save Changes</span>)}
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
    const [filterElection, setFilterElection] = useState('all');
    
    const ITEMS_PER_PAGE = 10;
    
    const fetchUsers = useCallback(async (electionId = null) => {
        setIsLoading(true);
        setError(null);
        try {
            let url = '/users';
            if (electionId && electionId !== 'all') {
                url += `?election_id=${electionId}`;
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
        fetchUsers();
    }, [fetchElections, fetchUsers]);

    useEffect(() => {
        fetchUsers(filterElection);
        setCurrentPage(1);
    }, [filterElection, fetchUsers]);

    const filteredUsers = useMemo(() => users.filter(user => 
        (user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user?.parentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || (user.status ? 'active' : 'inactive') === filterStatus) &&
        (filterRole === 'all' || user.role === filterRole)
    ), [users, searchTerm, filterStatus, filterRole]);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status).length,
        inactive: users.filter(u => !u.status).length,
    }), [users]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const closeModal = () => setModalState({ type: null, user: null });
    const handleAdd = () => setModalState({ type: 'add', user: { name: '', parent: null, role: '', mobile: '', status: true, image: '', election_id: '' } });
    const handleEdit = (user) => setModalState({ type: 'edit', user });
    const handleDelete = (user) => setModalState({ type: 'delete', user });
    const handleBulkDelete = () => {
        if (selectedUserIds.length > 0) {
            setModalState({ type: 'delete-users' });
        }
    };
    
    // ===================================================================================
    //  ENHANCED API HANDLERS
    // ===================================================================================

    const generatePassword = (name, mobile) => {
        const namePrefix = (name || '').replace(/[^a-zA-Z]/g, '').substring(0, 4);
        const mobileStr = (mobile || '').toString();
        const mobileSuffix = mobileStr.length >= 2 ? mobileStr.slice(-2) : mobileStr.padStart(2, '0');
        return namePrefix + mobileSuffix;
    };

    const handleFormSubmit = async (formData, imageFile) => {
        setIsSubmitting(true);
        let finalImageUrl = formData.image;

        try {
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                const uploadResult = await VisionBase.post('/uploads', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                finalImageUrl = uploadResult.data.data.fileUrl;
                if (!finalImageUrl) throw new Error("Image upload succeeded but no URL was returned.");
            }

            const isEditing = !!formData.user_id;
            let payload = {};

            if (isEditing) {
                const originalUser = modalState.user;
                if (formData.name !== originalUser.name) payload.name = formData.name;
                if (formData.mobile !== originalUser.mobile) payload.mobile = formData.mobile || null;
                if (formData.status !== originalUser.status) payload.status = formData.status;
                if (finalImageUrl !== originalUser.image) payload.profile = finalImageUrl || null;
                
                const newNumericRole = ROLE_TO_NUMERIC[formData.role];
                if (newNumericRole !== originalUser.role) payload.role = newNumericRole;

                const newParentId = formData.role === 'QC' ? 0 : (formData.parent ? parseInt(formData.parent, 10) : null);
                if (newParentId !== originalUser.parent) payload.parent = newParentId;

                if (formData.role === 'QC' && formData.election_id !== originalUser.election_id) {
                    payload.election_id = parseInt(formData.election_id, 10);
                }
                
                if ((formData.role === 'ZC' || formData.role === 'OT') && formData.parent) {
                    const parentUser = users.find(u => u.user_id === parseInt(formData.parent, 10));
                    if (parentUser && parentUser.election_id && parentUser.election_id !== originalUser.election_id) {
                        payload.election_id = parentUser.election_id;
                    }
                }

                if (payload.name || payload.mobile) {
                    payload.password = generatePassword(formData.name, formData.mobile);
                }

                if (Object.keys(payload).length === 0) {
                    closeModal();
                    return;
                }
                
                await VisionBase.put(`/user/${formData.user_id}`, payload);
            } else {
                payload = {
                    name: formData.name,
                    mobile: formData.mobile,
                    role: ROLE_TO_NUMERIC[formData.role],
                    parent: formData.role === 'QC' ? 0 : (formData.parent ? parseInt(formData.parent, 10) : null),
                    profile: finalImageUrl || null,
                    password: generatePassword(formData.name, formData.mobile)
                };
                
                if (formData.role === 'QC' && formData.election_id) {
                    payload.election_id = parseInt(formData.election_id, 10);
                }

                if ((formData.role === 'ZC' || formData.role === 'OT') && formData.parent) {
                    const parentUser = users.find(u => u.user_id === parseInt(formData.parent, 10));
                    if (parentUser && parentUser.election_id) {
                        payload.election_id = parentUser.election_id;
                    }
                }

                await VisionBase.post('/add-user', payload);
            }

            await fetchUsers(filterElection);
            closeModal();
        } catch (err) {
            console.error("Failed to save user:", err);
            const errorMessage = err.response?.data?.message || err.message || "An error occurred while saving the user.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async (userId) => {
        setIsSubmitting(true);
        try {
            await VisionBase.delete(`/user/${userId}`);
            await fetchUsers(filterElection);
            closeModal();
        } catch (err) {
            console.error("Failed to delete user:", err);
            setError(err.response?.data?.message || "An error occurred while deleting the user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ BULK DELETE WITH /delete-users ENDPOINT
    const handleBulkDeleteConfirm = async () => {
        if (selectedUserIds.length === 0) return;

        setIsSubmitting(true);
        try {
            // Send selected IDs in the body of DELETE request
            await VisionBase.delete('/delete-users', { 
              data: { ids: selectedUserIds } 
            });

            await fetchUsers(filterElection);
            setSelectedUserIds([]);
            closeModal();
        } catch (err) {
            console.error("Failed to bulk delete users:", err);
            setError(err.response?.data?.message || "An error occurred while deleting users.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (user) => {
        if (user.role === 'Admin') return;
        
        const newStatus = !user.status;
        
        try {
            await VisionBase.put(`/user/${user.user_id}`, { status: newStatus });
            setUsers(prevUsers => prevUsers.map(u => u.user_id === user.user_id ? { ...u, status: newStatus } : u));
        } catch (err) {
            console.error("Failed to update user status:", err);
            setError(err.response?.data?.message || "An error occurred while updating user status.");
            await fetchUsers(filterElection);
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
                                <Home className="h-4 w-4" /> <ChevronRight className="h-4 w-4" />
                                <span>Users</span> <ChevronRight className="h-4 w-4" />
                                <span className="text-blue-600 font-medium">All Users</span>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-3">
                            {selectedUserIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors flex items-center space-x-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete ({selectedUserIds.length})</span>
                                </button>
                            )}
                            <button onClick={handleAdd} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium">
                                <Plus className="h-5 w-5" /> <span>Add User</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={Users} title="Total Users" value={stats.total} bgClass="bg-gradient-to-r from-blue-500 to-blue-600" />
                    <StatCard icon={UserCheck} title="Active Users" value={stats.active} bgClass="bg-gradient-to-r from-emerald-500 to-emerald-600" />
                    <StatCard icon={UserX} title="Inactive Users" value={stats.inactive} bgClass="bg-gradient-to-r from-slate-500 to-slate-600" />
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-white/50">
                        {/* Optional: Add filter/search UI here if needed */}
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {isLoading ? ( 
                            <div className="p-10 text-center text-gray-500">Loading users...</div>
                        ) : error ? ( 
                            <div className="p-10 text-center text-red-500">{error}</div>
                        ) : paginatedUsers.length === 0 ? ( 
                            <div className="p-10 text-center text-gray-500">No users found.</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50/80 backdrop-blur-sm">
                                    <tr>
                                        <th className="p-4 text-left">
                                            <input 
                                                type="checkbox" 
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUserIds(paginatedUsers.map(u => u.user_id));
                                                    } else {
                                                        setSelectedUserIds([]);
                                                    }
                                                }} 
                                                checked={selectedUserIds.length > 0 && selectedUserIds.length === paginatedUsers.length} 
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
                                                    onChange={() => {
                                                        setSelectedUserIds(prev => 
                                                            prev.includes(user.user_id)
                                                                ? prev.filter(id => id !== user.user_id)
                                                                : [...prev, user.user_id]
                                                        );
                                                    }} 
                                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                                                    disabled={user.role === 'Admin'}
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
                                            <td className="p-4">
                                                <ToggleSwitch 
                                                    checked={user.status} 
                                                    onChange={() => handleToggleStatus(user)}
                                                    disabled={user.role === 'Admin'}
                                                />
                                            </td>
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

                {/* Modals */}
                <Modal isOpen={modalState.type === 'add' || modalState.type === 'edit'} onClose={closeModal} title={modalState.type === 'add' ? 'Add New User' : 'Edit User'}>
                    {modalState.user && <UserForm initialUser={modalState.user} onSubmit={handleFormSubmit} onClose={closeModal} isLoading={isSubmitting} allUsers={users} elections={elections} />}
                </Modal>

                <Modal isOpen={modalState.type === 'delete'} onClose={closeModal} title="Confirm Deletion">
                    <div className="py-4">
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete <span className="font-bold">{modalState.user?.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteConfirm(modalState.user?.user_id)}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Delete User</span>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={modalState.type === 'delete-users'} onClose={closeModal} title="Confirm Bulk Deletion">
                    <div className="py-4">
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete <span className="font-bold text-red-600">{selectedUserIds.length} user(s)</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDeleteConfirm}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Delete Users</span>
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