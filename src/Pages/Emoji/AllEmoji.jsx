import React, { useState, useMemo, useEffect } from 'react';
import { Home, ChevronRight, CheckCircle2, AlertTriangle, Edit, Trash2, X, Plus, ChevronLeft, Eye, Sparkles, Grid3X3, Activity } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

// ===================================================================================
// MODERN UI COMPONENTS (Unchanged from original)
// ===================================================================================

const StatCard = ({ icon: Icon, title, value, gradient, iconColor }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
        <div className="relative z-10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-8 w-8 text-white`} />
                </div>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
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
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (currentPage <= 3) {
            return [1, 2, 3, '...', totalPages];
        }
        if (currentPage > totalPages - 3) {
            return [1, '...', totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
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
    
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
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

// ===================================================================================
// HELPER FUNCTION
// ===================================================================================

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

// ===================================================================================
// MAIN AllEmoji COMPONENT (WITH BULK DELETE VIA /delete-emojis)
// ===================================================================================

const AllEmoji = () => {
    const navigate = useNavigate();

    const [emojis, setEmojis] = useState([]);
    const [selectedEmojiIds, setSelectedEmojiIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // For modals

    const ITEMS_PER_PAGE = 10;
    
    const fetchEmojis = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await VisionBase.get('/emojis');
            const formattedData = response.data.data.rows.map(item => ({
                id: item.emoji_id,
                title: item.title,
                emojiUrl: item.img,
                status: item.status ? 'Active' : 'Inactive',
            }));
            setEmojis(formattedData.sort((a, b) => b.id - a.id));
        } catch (err) {
            console.error("Failed to fetch emojis:", err);
            setError("Could not load emojis. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmojis();
    }, []);

    const stats = useMemo(() => ({
        total: emojis.length,
        active: emojis.filter(u => u.status === 'Active').length,
        inactive: emojis.filter(u => u.status === 'Inactive').length,
    }), [emojis]);

    const paginatedEmojis = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return emojis.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [emojis, currentPage]);

    const totalPages = Math.ceil(emojis.length / ITEMS_PER_PAGE);

    const handleSelectAll = (e) => setSelectedEmojiIds(e.target.checked ? paginatedEmojis.map(e => e.id) : []);
    const handleSelectOne = (id) => setSelectedEmojiIds(prev => prev.includes(id) ? prev.filter(emojiId => emojiId !== id) : [...prev, id]);
    
    const closeModal = () => setModalState({ type: null, data: null });
    const handleAdd = () => navigate('/addemoji');
    const handleView = (emoji) => setModalState({ type: 'view', data: emoji });
    const handleEdit = (emoji) => setModalState({ type: 'edit', data: emoji });
    const handleDelete = (emoji) => setModalState({ type: 'delete', data: emoji });
    
    const handleUpdateSubmit = async (e, emojiId) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formElements = e.target.elements;
        const updatedTitle = formElements.title.value;
        const imageFile = formElements.img.files[0];
        
        const originalEmoji = modalState.data;
        const payload = {};

        if (updatedTitle && updatedTitle !== originalEmoji.title) {
            payload.title = updatedTitle;
        }
        
        if (imageFile) {
            try {
                const base64Image = await toBase64(imageFile);
                payload.img = base64Image;
            } catch (error) {
                console.error("Error converting file to Base64:", error);
                setError("Failed to process the uploaded image.");
                setIsSubmitting(false);
                return;
            }
        }
        
        if (Object.keys(payload).length === 0) {
            closeModal();
            setIsSubmitting(false);
            return;
        }
        
        try {
            await VisionBase.put(`/emoji/${emojiId}`, payload);
            closeModal();
            await fetchEmojis();
        } catch (err) {
            console.error("Failed to update emoji:", err);
            setError("An error occurred while updating the emoji.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async (emojiId) => {
        setIsLoading(true);
        try {
            await VisionBase.delete(`/emoji/${emojiId}`);
            setEmojis(prev => prev.filter(em => em.id !== emojiId));
            setSelectedEmojiIds(prev => prev.filter(id => id !== emojiId));
            closeModal();
        } catch (err) {
            console.error(`Failed to delete emoji #${emojiId}:`, err);
            setError("Failed to delete emoji.");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ UPDATED BULK DELETE: Uses /delete-emojis endpoint with { ids: [...] } in body
    const handleBulkDelete = () => {
        if (selectedEmojiIds.length > 0) {
            setModalState({ type: 'delete-emojis' });
        }
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedEmojiIds.length === 0) return;
        setIsLoading(true);
        try {
            // Send selected IDs in the body of DELETE request
            await VisionBase.delete('/delete-emojis', { 
                data: { ids: selectedEmojiIds } 
            });
            // Optimistically update UI
            setEmojis(prev => prev.filter(em => !selectedEmojiIds.includes(em.id)));
            setSelectedEmojiIds([]);
            closeModal();
        } catch (err) {
            console.error("Failed to bulk delete emojis:", err);
            setError(err.response?.data?.message || "An error occurred while deleting emojis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8 font-sans">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Emoji Studio
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your emoji collection</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
                
                <nav aria-label="breadcrumb" className="mt-6">
                    <ol className="flex items-center space-x-2 text-sm bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/20 w-fit">
                        <li><a href="#" className="flex items-center text-violet-600 hover:text-violet-800 transition-colors"><Home className="h-4 w-4 mr-1.5" /> Home</a></li>
                        <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
                        <li><span className="text-violet-600 font-semibold">Emoji Collection</span></li>
                    </ol>
                </nav>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={Grid3X3} title="Total Emojis" value={stats.total} gradient="from-blue-500 to-blue-600" />
                <StatCard icon={CheckCircle2} title="Active" value={stats.active} gradient="from-emerald-500 to-emerald-600" />
                <StatCard icon={AlertTriangle} title="Inactive" value={stats.inactive} gradient="from-orange-500 to-orange-600" />
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center"><Grid3X3 className="h-5 w-5 mr-2 text-violet-600" />Emoji Collection</h2>
                        <p className="text-sm text-gray-600 mt-1">Total: {stats.total} emojis</p>
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600 transition-all duration-200"><Plus className="h-4 w-4 mr-2" /> Add New Emoji</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left"><input type="checkbox" onChange={handleSelectAll} checked={selectedEmojiIds.length === paginatedEmojis.length && paginatedEmojis.length > 0} className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2" /></th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Emoji</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500"><div className="flex justify-center items-center space-x-2"><Activity className="h-5 w-5 animate-spin text-violet-500" /><span>Loading emojis...</span></div></td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="text-center py-10 text-red-500 font-medium">{error}</td></tr>
                            ) : paginatedEmojis.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">No emojis found.</td></tr>
                            ) : (
                                paginatedEmojis.map(emoji => (
                                    <tr key={emoji.id} className="hover:bg-violet-50/50 transition-colors">
                                        <td className="px-6 py-4"><input type="checkbox" checked={selectedEmojiIds.includes(emoji.id)} onChange={() => handleSelectOne(emoji.id)} className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2" /></td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{emoji.id}</td>
                                        <td className="px-6 py-4"><div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm"><img src={emoji.emojiUrl} alt={emoji.title} className="h-8 w-8" /></div></td>
                                        <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={emoji.title}>{emoji.title}</div></td>
                                        <td className="px-6 py-4"><StatusBadge status={emoji.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleView(emoji)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => handleEdit(emoji)} className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Edit"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(emoji)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="h-4 w-4" /></button>
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

            {/* Bulk Action Button (now opens confirmation modal) */}
            {selectedEmojiIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-red-400/20 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{selectedEmojiIds.length} emoji{selectedEmojiIds.length !== 1 ? 's' : ''} selected</span>
                        <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-xl text-sm font-medium transition-all">Delete Selected</button>
                        <button onClick={() => setSelectedEmojiIds([])} className="p-2 hover:bg-red-600 rounded-xl transition-all"><X className="h-4 w-4"/></button>
                    </div>
                </div>
            )}

            {/* View Modal */}
            <Modal isOpen={modalState.type === 'view'} onClose={closeModal} title="Emoji Details" size="md">
                {modalState.data && (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto"><img src={modalState.data.emojiUrl} alt={modalState.data.title} className="h-16 w-16" /></div>
                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-1">ID</p><p className="font-semibold text-gray-900">#{modalState.data.id}</p></div>
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-1">Title</p><p className="font-semibold text-gray-900">{modalState.data.title}</p></div>
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600 mb-2">Status</p><StatusBadge status={modalState.data.status} /></div>
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* Edit Modal */}
            <Modal isOpen={modalState.type === 'edit'} onClose={closeModal} title="Edit Emoji" size="lg">
                {modalState.data && (
                    <form onSubmit={(e) => handleUpdateSubmit(e, modalState.data.id)}>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">Current Image</label>
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm p-2 flex-shrink-0">
                                        <img src={modalState.data.emojiUrl} alt={modalState.data.title} className="h-full w-full object-contain" />
                                    </div>
                                    <p className="text-sm text-gray-500">This is the current image. Upload a new file below to replace it.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label htmlFor="edit-title" className="block text-sm font-semibold text-gray-700">Title</label>
                                <input id="edit-title" name="title" defaultValue={modalState.data.title} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm transition-all placeholder-gray-400" required />
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="edit-img" className="block text-sm font-semibold text-gray-700">Upload New Image (optional)</label>
                                <input id="edit-img" type="file" name="img" accept="image/*" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>
            
            {/* Single Delete Modal */}
            <Modal isOpen={modalState.type === 'delete'} onClose={closeModal} title="Confirm Deletion" size="sm">
                {modalState.data && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"><Trash2 className="h-8 w-8 text-red-600" /></div>
                        <div>
                            <p className="text-gray-900 mb-2">Are you sure you want to delete this emoji?</p>
                            <p className="text-sm text-gray-600">"<strong>{modalState.data.title}</strong>" will be permanently removed.</p>
                        </div>
                        <div className="flex justify-center space-x-3">
                            <button onClick={closeModal} className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={() => handleDeleteConfirm(modalState.data.id)} disabled={isLoading} className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200">{isLoading ? 'Deleting...' : 'Delete Emoji'}</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ✅ NEW: Bulk Delete Confirmation Modal */}
            <Modal isOpen={modalState.type === 'delete-emojis'} onClose={closeModal} title="Confirm Bulk Deletion" size="md">
                <div className="py-4">
                    <p className="text-gray-700 mb-4">
                        Are you sure you want to delete <span className="font-bold text-red-600">{selectedEmojiIds.length} emoji(s)</span>?
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
                            disabled={isLoading}
                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <span>Delete Emojis</span>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AllEmoji;