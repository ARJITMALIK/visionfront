import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
    Home, ChevronRight, Search, Edit, Trash2, X, Plus, Users, 
    UserCheck, UserX, Upload, FileImage, Eye, Filter, ClipboardList, 
    MapPin, Phone, Calendar, Clock, ChevronDown, CornerDownRight 
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance'; // Ensure this path matches your project

// ===================================================================================
// 1. CONSTANTS & HELPER FUNCTIONS
// ===================================================================================

const ROLE_MAP = { 0: 'Admin', 1: 'QC', 2: 'ZC', 3: 'OT' };
const ROLE_TO_NUMERIC = { 'Admin': 0, 'QC': 1, 'ZC': 2, 'OT': 3 };
const DEFAULT_AVATAR_URL = 'https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=';

// Transform API data to usable format
const transformUserData = (rawUsers) => {
    if (!Array.isArray(rawUsers)) return [];
    const userMap = new Map(rawUsers.map(user => [user.user_id, user.name]));
    return rawUsers.map(user => ({
        ...user,
        parentName: user.parent ? userMap.get(user.parent) || 'Unknown Parent' : 'Admin',
        role: ROLE_MAP[user.role] || 'Unknown Role',
        avatar: user.name ? user.name.substring(0, 2).toUpperCase() : 'UN',
        image: user.profile || null,
        status: user.status
    }));
};

// Recursive function to build the Tree structure (Admin -> QC -> ZC -> OT)
const buildHierarchy = (users) => {
    if (!users.length) return [];
    
    // 1. Create a map of all users with an empty children array
    const userMap = {};
    users.forEach(u => {
        userMap[u.user_id] = { ...u, children: [] };
    });

    const roots = [];

    // 2. Populate children arrays
    users.forEach(u => {
        if (u.parent && u.parent !== 0 && userMap[u.parent]) {
            userMap[u.parent].children.push(userMap[u.user_id]);
        } else {
            // It is a root node (Admin or Top-level QC)
            roots.push(userMap[u.user_id]);
        }
    });

    // 3. Sort roots by Role priority then Name
    const sortFn = (a, b) => {
        const rolePriority = { 'Admin': 0, 'QC': 1, 'ZC': 2, 'OT': 3 };
        const diff = (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
    };

    return roots.sort(sortFn);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    });
};

// ===================================================================================
// 2. UI HELPER COMPONENTS
// ===================================================================================

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
    const imageUrl = image && !imageError ? image : DEFAULT_AVATAR_URL;

    return (
        <div className="relative flex-shrink-0">
            <img
                src={imageUrl}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 bg-white"
                onError={() => setImageError(true)}
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${status ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
        </div>
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
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
);

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
            className={`relative group border-2 border-dashed rounded-full w-28 h-28 mx-auto transition-all duration-300 cursor-pointer overflow-hidden ${isDragOver ? 'border-blue-400 bg-blue-50/50 scale-105' : 'border-gray-300 hover:border-blue-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
        >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && onFileChange(e.target.files[0])} className="hidden" disabled={disabled} />
            {preview ? (
                <>
                    <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" disabled={disabled}><X className="h-3 w-3" /></button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-2">
                    <FileImage className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-[10px] text-gray-400">Upload</p>
                </div>
            )}
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => { 
    if (!isOpen) return null; 
    return ( 
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div> 
    ); 
};

// ===================================================================================
// 3. COMPLEX SUB-COMPONENTS (Tree Row, Forms, Details Modals)
// ===================================================================================

const UserTreeRow = ({ user, depth = 0, selectedUserIds, onSelect, onToggleStatus, onEdit, onDelete, onViewTeam, onViewSurveys }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = user.children && user.children.length > 0;
    const isSelected = selectedUserIds.includes(user.user_id);

    // Calculate indentation
    const paddingLeft = `${depth * 32 + 12}px`;

    return (
        <React.Fragment>
            <tr className={`group transition-colors border-b border-gray-50 hover:bg-gray-50 ${isSelected ? 'bg-blue-50/50' : 'bg-white'}`}>
                <td className="p-4 w-12">
                    <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => onSelect(user.user_id)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        disabled={user.role === 'Admin'}
                    />
                </td>
                <td className="p-3">
                    <div className="flex items-center relative" style={{ paddingLeft }}>
                        {/* Visual Guide Lines for Hierarchy */}
                        {depth > 0 && (
                            <span 
                                className="absolute border-l-2 border-dashed border-gray-200 h-full top-0" 
                                style={{ left: `${(depth * 32) - 14}px` }}
                            ></span>
                        )}
                        {depth > 0 && <CornerDownRight className="w-4 h-4 text-gray-300 mr-2 -ml-2" />}

                        {/* Toggle Button */}
                        <div className="mr-2 w-6 flex-shrink-0 flex justify-center">
                            {hasChildren ? (
                                <button 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-0.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            ) : (
                                <div className="w-4" /> 
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                            <Avatar name={user.name} status={user.status} image={user.image} />
                            <div>
                                <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                                <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                            </div>
                        </div>
                    </div>
                </td>
                
                <td className="p-3 text-sm text-gray-500 hidden md:table-cell">{user.parentName}</td>
                <td className="p-3"><RoleBadge role={user.role} /></td>
                <td className="p-3 text-sm text-gray-600 hidden sm:table-cell">{user.mobile || '-'}</td>
                <td className="p-3 text-sm text-gray-600 font-semibold text-center">{user.survey_count || 0}</td>
                <td className="p-3">
                    <ToggleSwitch 
                        checked={user.status} 
                        onChange={() => onToggleStatus(user)}
                        disabled={user.role === 'Admin'}
                    />
                </td>
                <td className="p-3">
                    <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         {(user.role === 'QC' || user.role === 'ZC') && (
                            <ActionButton onClick={() => onViewTeam(user)} icon={Users} className="bg-blue-50 text-blue-600" tooltip="View Team" />
                        )}
                        {user.role === 'OT' && (
                            <ActionButton onClick={() => onViewSurveys(user)} icon={ClipboardList} className="bg-purple-50 text-purple-600" tooltip="View Surveys" />
                        )}
                        <ActionButton onClick={() => onEdit(user)} icon={Edit} className="bg-emerald-50 text-emerald-600" tooltip="Edit" disabled={user.role === 'Admin'} />
                        <ActionButton onClick={() => onDelete(user)} icon={Trash2} className="bg-red-50 text-red-600" tooltip="Delete" disabled={user.role === 'Admin'} />
                    </div>
                </td>
            </tr>
            {/* Render Children recursively if expanded */}
            {isExpanded && hasChildren && user.children.map(child => (
                <UserTreeRow
                    key={child.user_id}
                    user={child}
                    depth={depth + 1}
                    selectedUserIds={selectedUserIds}
                    onSelect={onSelect}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewTeam={onViewTeam}
                    onViewSurveys={onViewSurveys}
                />
            ))}
        </React.Fragment>
    );
};

const UserForm = ({ initialUser, onSubmit, onClose, isLoading, allUsers, elections }) => { 
    const [formData, setFormData] = useState({ ...initialUser, parent: initialUser.parent || null, election_id: initialUser.election_id || '' }); 
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialUser.image || null);

    useEffect(() => { 
        if (formData.role === 'QC') { 
            setFormData(prev => ({ ...prev, parent: 0 })); 
        } else if (initialUser.role !== formData.role) { 
            // Reset parent if role changes to something requiring a different parent type
            if(!initialUser.user_id) setFormData(prev => ({ ...prev, parent: '', election_id: '' })); 
        } 
    }, [formData.role, initialUser.role, initialUser.user_id]); 
    
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
    
    const handleSubmit = () => { onSubmit(formData, imageFile); }; 
    
    // Dynamic filtering of parent dropdown
    const parentOptions = useMemo(() => { 
        if (formData.role === 'ZC') return allUsers.filter(u => u.role === 'QC'); 
        if (formData.role === 'OT') return allUsers.filter(u => u.role === 'ZC'); 
        return []; 
    }, [formData.role, allUsers]); 
    
    return ( 
        <div className="space-y-4">
            <div className="flex justify-center">
                <ProfileImageUpload
                    onFileChange={handleImageChange}
                    preview={imagePreview}
                    onRemove={handleRemoveImage}
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" required />
                </div>
                
                <div>
                    <label className="text-xs font-medium text-gray-700">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" required>
                        <option value="">Select Role</option>
                        <option value="QC">QC</option>
                        <option value="ZC">ZC</option>
                        <option value="OT">OT</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-700">Mobile</label>
                    <input name="mobile" value={formData.mobile || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {formData.role === 'QC' && (
                <div>
                    <label className="text-xs font-medium text-gray-700">Election</label>
                    <select name="election_id" value={formData.election_id || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Election</option>
                        {elections.map(election => ( <option key={election.election_id} value={election.election_id}>{election.election_name}</option> ))}
                    </select>
                </div>
            )}
            
            <div>
                <label className="text-xs font-medium text-gray-700">Reports To (Parent)</label>
                {formData.role === 'QC' ? (
                    <input value="Admin (Root)" className="w-full mt-1 px-3 py-2 border bg-gray-100 rounded-lg text-sm text-gray-500" readOnly />
                ) : (
                    <select name="parent" value={formData.parent || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" required disabled={!formData.role || formData.role === 'QC'}>
                        <option value="">{ !formData.role ? "Select a role first" : "Select Parent" }</option>
                        {parentOptions.map(p => (<option key={p.user_id} value={p.user_id}>{p.name} ({p.role})</option>))}
                    </select>
                )}
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                    {isLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Save User
                </button>
            </div>
        </div> 
    ); 
};

// Modal to show surveys for an OT
const SurveyDetailsModal = ({ isOpen, onClose, user }) => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            const fetch = async () => {
                setLoading(true);
                try {
                    const res = await VisionBase.get(`/surveys?ot_id=${user.user_id}`);
                    const data = Array.isArray(res.data) ? res.data : (res.data?.data?.rows || []);
                    // Normalize single object response
                    setSurveys(Array.isArray(data) ? data : [res.data]);
                } catch(e) { console.error(e); setSurveys([]); }
                finally { setLoading(false); }
            };
            fetch();
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Surveys by {user?.name}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500"/></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
                    {loading ? (
                        <div className="text-center p-8 text-gray-500">Loading surveys...</div>
                    ) : surveys.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No surveys found.</div>
                    ) : (
                        <div className="space-y-4">
                            {surveys.map((survey, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <img src={survey.citizen_image || DEFAULT_AVATAR_URL} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <div className="font-medium">{survey.citizen_name}</div>
                                                <div className="text-xs text-gray-500">{formatDate(survey.date)} • {formatTime(survey.date)}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Booth: {survey.booth_id}</span>
                                    </div>
                                    {/* Collapsible Details */}
                                    <details className="text-sm group">
                                        <summary className="cursor-pointer text-blue-600 font-medium list-none flex items-center gap-1">
                                            View Answers <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform"/>
                                        </summary>
                                        <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded">
                                            {survey.sur_data && survey.sur_data.map((qa, idx) => (
                                                <div key={idx}>
                                                    <p className="font-medium text-gray-700">{qa.question}</p>
                                                    <p className="text-gray-600">{qa.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Modal to show Team Members (Direct Reports)
const TeamMembersModal = ({ isOpen, onClose, parentUser, teamMembers, onViewSurveys }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl h-[70vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{parentUser?.name}'s Team</h3>
                        <p className="text-sm text-gray-500">{teamMembers.length} Members</p>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500"/></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teamMembers.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-10">No team members found.</div>
                    ) : (
                        teamMembers.map(member => (
                            <div key={member.user_id} className="border p-3 rounded-lg flex flex-col gap-2 hover:shadow-md bg-white">
                                <div className="flex items-center gap-3">
                                    <Avatar name={member.name} status={member.status} image={member.image} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{member.name}</div>
                                        <RoleBadge role={member.role} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>Surveys: {member.survey_count}</span>
                                    <span>{member.mobile}</span>
                                </div>
                                {member.role === 'OT' && (
                                    <button onClick={() => onViewSurveys(member)} className="mt-1 text-xs bg-blue-50 text-blue-600 py-1 rounded hover:bg-blue-100 w-full">
                                        View Surveys
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ===================================================================================
// 4. MAIN PAGE COMPONENT
// ===================================================================================

const AllUsers = () => {
    // --- State ---
    const [users, setUsers] = useState([]);
    const [elections, setElections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // UI State
    const [modalState, setModalState] = useState({ type: null, user: null });
    const [teamModalState, setTeamModalState] = useState({ isOpen: false, parentUser: null, teamMembers: [] });
    const [surveyModalState, setSurveyModalState] = useState({ isOpen: false, user: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [filterElection, setFilterElection] = useState('all');
    
    const ITEMS_PER_PAGE = 10;

    // --- API Calls ---
    const fetchUsers = useCallback(async (electionId = null) => {
        setIsLoading(true);
        try {
            let url = '/users';
            if (electionId && electionId !== 'all') url += `?election_id=${electionId}`;
            const response = await VisionBase.get(url);
            // Handle potential different API responses
            const rows = response.data.data?.rows || response.data || [];
            const transformed = transformUserData(rows);
            setUsers(transformed);
            setError(null);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Failed to load users.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchElections = useCallback(async () => {
        try {
            const response = await VisionBase.get('/elections');
            setElections(response.data.data.rows || []);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { fetchElections(); fetchUsers(); }, [fetchElections, fetchUsers]);
    useEffect(() => { fetchUsers(filterElection); setCurrentPage(1); }, [filterElection, fetchUsers]);

    // --- Data Processing ---

    // 1. Logic to switch between Hierarchy (Tree) and Flat (Search) view
    const isFiltering = searchTerm !== '' || filterRole !== 'all' || filterStatus !== 'all';

    // 2. Filtered Flat List (for search/filter mode)
    const filteredFlatList = useMemo(() => users.filter(user => 
        (user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         user?.parentName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || (user.status ? 'active' : 'inactive') === filterStatus) &&
        (filterRole === 'all' || user.role === filterRole)
    ), [users, searchTerm, filterStatus, filterRole]);

    // 3. Hierarchical Roots (for default view)
    const hierarchyRoots = useMemo(() => buildHierarchy(users), [users]);

    // 4. Pagination Logic
    // If filtering: paginate the flat list
    // If tree view: paginate the ROOT items only
    const datasetToPaginate = isFiltering ? filteredFlatList : hierarchyRoots;
    const totalPages = Math.ceil(datasetToPaginate.length / ITEMS_PER_PAGE);
    
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return datasetToPaginate.slice(start, start + ITEMS_PER_PAGE);
    }, [datasetToPaginate, currentPage]);

    // --- Handlers ---

    const generatePassword = (name, mobile) => {
        const namePrefix = (name || '').replace(/[^a-zA-Z]/g, '').substring(0, 4);
        const mobileStr = (mobile || '').toString();
        const mobileSuffix = mobileStr.length >= 2 ? mobileStr.slice(-2) : mobileStr.padStart(2, '0');
        return namePrefix + mobileSuffix;
    };

    const handleFormSubmit = async (formData, imageFile) => {
        setIsSubmitting(true);
        try {
            // 1. Upload Image if exists
            let finalImageUrl = formData.image;
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                const uploadResult = await VisionBase.post('/uploads', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                finalImageUrl = uploadResult.data.data.fileUrl;
            }

            // 2. Prepare Payload
            const payload = {
                name: formData.name,
                mobile: formData.mobile,
                role: ROLE_TO_NUMERIC[formData.role],
                parent: formData.role === 'QC' ? 0 : (formData.parent ? parseInt(formData.parent, 10) : null),
                profile: finalImageUrl || null,
                password: generatePassword(formData.name, formData.mobile),
            };

            if (formData.election_id) payload.election_id = parseInt(formData.election_id, 10);

            // 3. Send Request (Post or Put)
            if (formData.user_id) {
                // Editing
                await VisionBase.put(`/user/${formData.user_id}`, payload);
            } else {
                // Adding
                await VisionBase.post('/add-user', payload);
            }

            // 4. Refresh
            await fetchUsers(filterElection);
            setModalState({ type: null, user: null });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
        try {
            await VisionBase.delete(`/user/${user.user_id}`);
            fetchUsers(filterElection);
        } catch (err) { console.error(err); alert("Delete failed"); }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedUserIds.length} users?`)) return;
        try {
            await VisionBase.delete('/delete-users', { data: { ids: selectedUserIds } });
            setSelectedUserIds([]);
            fetchUsers(filterElection);
        } catch (err) { console.error(err); alert("Bulk delete failed"); }
    };

    const handleToggleStatus = async (user) => {
        try {
            await VisionBase.put(`/user/${user.user_id}`, { status: !user.status });
            setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, status: !user.status } : u));
        } catch(err) { console.error(err); }
    };

    const handleViewTeam = (user) => {
        const teamMembers = users.filter(u => u.parent === user.user_id);
        setTeamModalState({ isOpen: true, parentUser: user, teamMembers });
    };

    // Stats Calculation
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status).length,
        inactive: users.filter(u => !u.status).length,
    }), [users]);

    // ===================================================================================
    // 5. RENDER UI
    // ===================================================================================
    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Home className="w-4 h-4"/> <ChevronRight className="w-4 h-4"/> <span>All Users</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    {selectedUserIds.length > 0 && (
                        <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm">
                            <Trash2 size={16} /> Delete ({selectedUserIds.length})
                        </button>
                    )}
                    <button onClick={() => setModalState({ type: 'add', user: { name:'', role:'', status:true } })} className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        <Plus size={18} /> Add User
                    </button>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Users', val: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Users', val: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Inactive Users', val: stats.inactive, icon: UserX, color: 'text-gray-600', bg: 'bg-gray-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div><p className="text-sm text-gray-500 font-medium">{stat.label}</p><p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.val}</p></div>
                        <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}><stat.icon size={24}/></div>
                    </div>
                ))}
            </div>

            {/* MAIN TABLE CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* FILTERS */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"/>
                        <input 
                            type="text" 
                            placeholder="Search by name, parent..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto">
                            <select value={filterElection} onChange={e => setFilterElection(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200">
                            <option value="all">All Elections</option>
                            {elections.map(e => <option key={e.election_id} value={e.election_id}>{e.election_name}</option>)}
                            </select>
                            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200">
                            <option value="all">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="QC">QC</option>
                            <option value="ZC">ZC</option>
                            <option value="OT">OT</option>
                            </select>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            </select>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            Loading data...
                        </div>
                    ) : error ? (
                        <div className="text-center p-10 text-red-500">{error}</div>
                    ) : currentItems.length === 0 ? (
                        <div className="text-center p-10 text-gray-500">No users found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                                    <th className="p-4 w-12">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" 
                                            onChange={(e) => setSelectedUserIds(e.target.checked ? currentItems.map(u => u.user_id) : [])}
                                            checked={selectedUserIds.length > 0 && currentItems.every(u => selectedUserIds.includes(u.user_id))}
                                            />
                                    </th>
                                    <th className="p-3">User Profile</th>
                                    <th className="p-3 hidden md:table-cell">Reports To</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3 hidden sm:table-cell">Mobile</th>
                                    <th className="p-3 text-center">Surveys</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {currentItems.map(user => (
                                    <UserTreeRow 
                                        key={user.user_id} 
                                        user={user} 
                                        depth={isFiltering ? 0 : 0} // If searching, flatten the view
                                        selectedUserIds={selectedUserIds}
                                        onSelect={(id) => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                                        onToggleStatus={handleToggleStatus}
                                        onEdit={(u) => setModalState({ type: 'edit', user: u })}
                                        onDelete={handleDelete}
                                        onViewTeam={handleViewTeam}
                                        onViewSurveys={(u) => setSurveyModalState({ isOpen: true, user: u })}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINATION */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages} ({datasetToPaginate.length} {isFiltering ? 'results' : 'root users'})
                    </span>
                    <div className="flex gap-1">
                        <button disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-medium">Prev</button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            // Simple logic to show first 5 pages or sliding window could be added
                            let p = i + 1;
                            return (
                                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 border rounded text-xs font-medium ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>{p}</button>
                            )
                        })}
                        <button disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-medium">Next</button>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <Modal 
                isOpen={!!modalState.type} 
                onClose={() => setModalState({ type: null, user: null })} 
                title={modalState.type === 'add' ? 'Add New User' : 'Edit User'}
            >
                {modalState.user && (
                    <UserForm 
                        initialUser={modalState.user} 
                        allUsers={users} 
                        elections={elections}
                        isLoading={isSubmitting}
                        onSubmit={handleFormSubmit}
                        onClose={() => setModalState({ type: null, user: null })}
                    />
                )}
            </Modal>

            <SurveyDetailsModal 
                isOpen={surveyModalState.isOpen} 
                onClose={() => setSurveyModalState({ isOpen: false, user: null })} 
                user={surveyModalState.user} 
            />

            <TeamMembersModal 
                isOpen={teamModalState.isOpen} 
                onClose={() => setTeamModalState({ isOpen: false, parentUser: null, teamMembers: [] })} 
                parentUser={teamModalState.parentUser} 
                teamMembers={teamModalState.teamMembers} 
                onViewSurveys={(u) => setSurveyModalState({ isOpen: true, user: u })}
            />
        </div>
    );
};

export default AllUsers;