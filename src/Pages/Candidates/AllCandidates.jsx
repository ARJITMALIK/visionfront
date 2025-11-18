import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, ChevronRight, FileText, CheckSquare, AlertTriangle, Eye, Pencil, X, Circle, MoreHorizontal, Plus, Trash2, Search, Loader2
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';
import { toast, Toaster } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, iconBgClass, textColorClass }) => (
    <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
            <div className={`p-3 rounded-full ${iconBgClass}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
                <p className={`text-lg font-semibold ${textColorClass}`}>{title}</p>
                <p className="text-sm text-gray-500">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const AllCandidates = () => {
    const navigate = useNavigate();
    
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [elections, setElections] = useState([]);
    const [parties, setParties] = useState([]);
    const [vidhans, setVidhans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null, bulkDelete: null });
    const [editFormData, setEditFormData] = useState({
        candidate_name: '',
        party_id: '',
        vidhan_id: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
    const currentCandidates = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Fetch Candidates
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setIsLoading(true);
                const response = await VisionBase.get('/candidates');
                if (response.data && response.data.data && response.data.data.rows) {
                    setCandidates(response.data.data.rows);
                    setFilteredCandidates(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Candidates:", error);
                toast.error("Could not load Candidate data. Please try refreshing the page.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCandidates(candidates);
            setCurrentPage(1);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = candidates.filter(candidate => {
            return (
                candidate.candidate_name?.toLowerCase().includes(query) ||
                candidate.candidate_id?.toString().includes(query) ||
                candidate.party_name?.toLowerCase().includes(query) ||
                candidate.vidhan_name?.toLowerCase().includes(query) ||
                candidate.lok_name?.toLowerCase().includes(query) ||
                candidate.state?.toLowerCase().includes(query)
            );
        });

        setFilteredCandidates(filtered);
        setCurrentPage(1);
    }, [searchQuery, candidates]);

    // Fetch Elections for edit modal
    useEffect(() => {
        const fetchElections = async () => {
            try {
                const response = await VisionBase.get('/elections');
                if (response.data && response.data.data && response.data.data.rows) {
                    setElections(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Elections:", error);
            }
        };

        fetchElections();
    }, []);

    // Fetch Parties for edit modal
    useEffect(() => {
        const fetchParties = async () => {
            try {
                const response = await VisionBase.get('/parties');
                if (response.data && response.data.data && response.data.data.rows) {
                    setParties(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Parties:", error);
            }
        };

        fetchParties();
    }, []);

    // Fetch Vidhan Sabhas for edit modal
    useEffect(() => {
        const fetchVidhans = async () => {
            try {
                const response = await VisionBase.get('/vidhans');
                if (response.data && response.data.data && response.data.data.rows) {
                    setVidhans(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Vidhan Sabhas:", error);
            }
        };

        fetchVidhans();
    }, []);

    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? currentCandidates.map(c => c.candidate_id) : []);
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const openModal = (type, data) => {
        if (type === 'edit' && data) {
            setEditFormData({
                candidate_name: data.candidate_name,
                party_id: data.party_id?.toString() || '',
                vidhan_id: data.vidhan_id?.toString() || ''
            });
        }
        setModalData(prev => ({ ...prev, [type]: data }));
    };

    const closeModal = (type) => {
        setModalData(prev => ({ ...prev, [type]: null }));
        if (type === 'edit') {
            setEditFormData({ candidate_name: '', party_id: '', vidhan_id: '' });
        }
    };

    const handleAddNew = () => {
        navigate('/addcandidates');
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSelectChange = (name, value) => {
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateCandidate = async () => {
        if (!editFormData.candidate_name.trim() || !editFormData.party_id || !editFormData.vidhan_id) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsUpdating(true);
        try {
            const candidateId = modalData.edit.candidate_id;
            const updateData = {
                candidate_name: editFormData.candidate_name,
                party_id: parseInt(editFormData.party_id),
                vidhan_id: parseInt(editFormData.vidhan_id)
            };

            await VisionBase.put(`/candidate/${candidateId}`, updateData);

            // Refresh candidates list
            const response = await VisionBase.get('/candidates');
            if (response.data && response.data.data && response.data.data.rows) {
                setCandidates(response.data.data.rows);
            }

            closeModal('edit');
            toast.success("Candidate updated successfully!");
        } catch (error) {
            console.error("Error updating candidate:", error);
            toast.error(error.response?.data?.message || 'Failed to update candidate. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const candidateId = modalData.delete.candidate_id;
            await VisionBase.delete(`/candidate/${candidateId}`);

            // Refresh candidates list
            const response = await VisionBase.get('/candidates');
            if (response.data && response.data.data && response.data.data.rows) {
                setCandidates(response.data.data.rows);
            }

            closeModal('delete');
            toast.success("Candidate deleted successfully!");
        } catch (error) {
            console.error("Error deleting candidate:", error);
            toast.error(error.response?.data?.message || 'Failed to delete candidate. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one candidate to delete.");
            return;
        }
        const selectedCandidates = candidates.filter(c => selectedRows.includes(c.candidate_id));
        openModal('bulkDelete', selectedCandidates);
    };

    const confirmBulkDelete = async () => {
        if (!modalData.bulkDelete || modalData.bulkDelete.length === 0) return;
        
        setIsBulkDeleting(true);
        try {
            const idsToDelete = modalData.bulkDelete.map(c => c.candidate_id);
            
            await VisionBase.delete('/delete-candidates', {
                data: { ids: idsToDelete }
            });

            // Refresh candidates list
            const response = await VisionBase.get('/candidates');
            if (response.data && response.data.data && response.data.data.rows) {
                setCandidates(response.data.data.rows);
            }

            setSelectedRows([]);
            closeModal('bulkDelete');
            toast.success(`Successfully deleted ${idsToDelete.length} candidate(s).`);
        } catch (error) {
            console.error("Failed to delete candidates:", error);
            toast.error(error.response?.data?.message || "Failed to delete candidates. Please try again.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    // Calculate stats
    const totalCandidates = candidates.length;
    const activeCandidates = candidates.filter(c => c.status === 'Active').length;
    const inactiveCandidates = totalCandidates - activeCandidates;

    if (isLoading) {
        return (
            <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading candidates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <Toaster richColors position="top-right" />
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Candidate</h1>
                        <p className="text-sm text-gray-500">Manage all candidates</p>
                    </div>
                    <div className="p-2 bg-gray-200 rounded-md">
                       <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Home className="h-4 w-4 text-brand-secondary" />
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-brand-secondary">Candidate</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">All Candidates</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total" value={totalCandidates.toString()} icon={FileText} iconBgClass="bg-brand-primary" textColorClass="text-brand-primary" />
                    <StatCard title="Active" value={activeCandidates.toString()} icon={CheckSquare} iconBgClass="bg-brand-green" textColorClass="text-brand-green" />
                    <StatCard title="Inactive" value={inactiveCandidates.toString()} icon={AlertTriangle} iconBgClass="bg-brand-orange" textColorClass="text-brand-orange" />
                </div>

                {/* Search Bar */}
                <Card className="shadow-sm mb-6">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search candidates by name, party, vidhan sabha, lok sabha, or state..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {searchQuery && (
                            <p className="text-sm text-gray-600 mt-2">
                                Found {filteredCandidates.length} result(s) for "{searchQuery}"
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Main Table Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <CardTitle className="text-lg font-semibold">
                            Candidates (Total: {totalCandidates})
                            {searchQuery && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    - Showing {filteredCandidates.length} filtered
                                </span>
                            )}
                        </CardTitle>
                        <Button className="bg-brand-primary hover:bg-brand-primary-dark" onClick={handleAddNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-100">
                                        <TableHead className="w-[50px] px-4">
                                            <Checkbox 
                                                onCheckedChange={handleSelectAll} 
                                                checked={currentCandidates.length > 0 && selectedRows.length === currentCandidates.length} 
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-black">Id</TableHead>
                                        <TableHead>Candidate Name</TableHead>
                                        <TableHead>Party</TableHead>
                                        <TableHead>Vidhan Sabha</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentCandidates.length > 0 ? (
                                        currentCandidates.map((c) => (
                                            <TableRow key={c.candidate_id}>
                                                <TableCell className="px-4">
                                                    <Checkbox 
                                                        onCheckedChange={() => handleSelectRow(c.candidate_id)} 
                                                        checked={selectedRows.includes(c.candidate_id)} 
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{c.candidate_id}</TableCell>
                                                <TableCell className="whitespace-normal">{c.candidate_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {c.party_logo && (
                                                            <img 
                                                                src={c.party_logo} 
                                                                alt={c.party_name || 'Party logo'} 
                                                                className="w-8 h-8 rounded-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <span>{c.party_name || c.party_id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-normal">{c.vidhan_name || c.vidhan_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal('view', c)}><Eye className="h-4 w-4" /></Button>
                                                        <Button size="icon" className="h-8 w-8 bg-action-blue hover:bg-action-blue-dark text-white" onClick={() => openModal('edit', c)}><Pencil className="h-4 w-4" /></Button>
                                                        <Button size="icon" className="h-8 w-8 bg-brand-primary hover:bg-brand-primary-dark text-white" onClick={() => openModal('delete', c)}><X className="h-4 w-4" /></Button>
                                                        <Button size="icon" className="h-8 w-8 bg-brand-green hover:bg-brand-green-dark text-white" onClick={() => toast.info(`Status toggle for ID: ${c.candidate_id} - Not implemented`)}><Circle className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                                {searchQuery ? `No candidates found matching "${searchQuery}"` : 'No candidates found'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    {/* Footer with Bulk Actions and Pagination */}
                    <div className="px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-t">
                        <div>
                            {selectedRows.length > 0 && (
                                <div className="flex items-center space-x-2">
                                     <span className="text-sm text-gray-600">{selectedRows.length} selected</span>
                                     <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="h-8 bg-red-600 hover:bg-red-700" 
                                        onClick={handleBulkDeleteClick}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete Selected
                                    </Button>
                                </div>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            href="#" 
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                setCurrentPage(p => Math.max(1, p - 1)); 
                                            }}
                                        />
                                    </PaginationItem>
                                    {[...Array(totalPages).keys()].map(p => (
                                        <PaginationItem key={p + 1}>
                                            <PaginationLink 
                                                href="#" 
                                                isActive={currentPage === p + 1} 
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    setCurrentPage(p + 1); 
                                                }}
                                            >
                                                {p + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext 
                                            href="#" 
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                setCurrentPage(p => Math.min(totalPages, p + 1)); 
                                            }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </Card>
            </div>

            {/* View Modal */}
            <Dialog open={!!modalData.view} onOpenChange={() => closeModal('view')}>
                <DialogContent>
                    <DialogHeader><DialogTitle>View Candidate Details (ID: {modalData.view?.candidate_id})</DialogTitle></DialogHeader>
                    {modalData.view && (
                        <div className="py-4 space-y-2 text-sm">
                            <p><span className="font-semibold">Name:</span> {modalData.view.candidate_name}</p>
                            <p><span className="font-semibold">Party:</span> {modalData.view.party_name || modalData.view.party_id}</p>
                            <p><span className="font-semibold">Vidhan Sabha:</span> {modalData.view.vidhan_name || modalData.view.vidhan_id}</p>
                            {modalData.view.lok_name && (
                                <p><span className="font-semibold">Lok Sabha:</span> {modalData.view.lok_name}</p>
                            )}
                            {modalData.view.state && (
                                <p><span className="font-semibold">State:</span> {modalData.view.state}</p>
                            )}
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => closeModal('view')}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!modalData.edit} onOpenChange={() => closeModal('edit')}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Candidate (ID: {modalData.edit?.candidate_id})</DialogTitle>
                        <DialogDescription>This form allows you to edit the candidate details.</DialogDescription>
                    </DialogHeader>
                    {modalData.edit && (
                        <div className="py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Candidate Name *</label>
                                <Input 
                                    name="candidate_name"
                                    value={editFormData.candidate_name}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter candidate name"
                                    disabled={isUpdating}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Party *</label>
                                <Select 
                                    onValueChange={(value) => handleEditSelectChange('party_id', value)} 
                                    value={editFormData.party_id}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Party" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.map((party) => (
                                            <SelectItem key={party.party_id} value={party.party_id.toString()}>
                                                {party.party_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Vidhan Sabha *</label>
                                <Select 
                                    onValueChange={(value) => handleEditSelectChange('vidhan_id', value)} 
                                    value={editFormData.vidhan_id}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Vidhan Sabha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vidhans.map((vidhan) => (
                                            <SelectItem key={vidhan.vidhan_id} value={vidhan.vidhan_id.toString()}>
                                                {vidhan.vidhan_name} - {vidhan.lok_name} ({vidhan.state})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('edit')} disabled={isUpdating}>Cancel</Button>
                        <Button 
                            className="bg-brand-primary text-white" 
                            onClick={handleUpdateCandidate}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Modal */}
            <Dialog open={!!modalData.delete} onOpenChange={() => closeModal('delete')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Trash2 className="mr-2 text-brand-primary"/> 
                            Are you sure?
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete the candidate "{modalData.delete?.candidate_name}" (ID: {modalData.delete?.candidate_id}). This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('delete')} disabled={isDeleting}>Cancel</Button>
                        <Button 
                            className="bg-brand-primary text-white" 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Modal */}
            <Dialog open={!!modalData.bulkDelete} onOpenChange={() => closeModal('bulkDelete')}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Trash2 className="mr-2 text-red-600"/>
                            Delete Multiple Candidates
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete {modalData.bulkDelete?.length} candidate(s).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto py-4">
                        <h4 className="font-semibold mb-3 text-gray-700">Candidates to be deleted:</h4>
                        <ul className="space-y-2">
                            {modalData.bulkDelete?.map((c, index) => (
                                <li key={c.candidate_id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="font-medium text-gray-600 min-w-[30px]">{index + 1}.</span>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800">{c.candidate_name}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0 text-xs">
                                                {c.party_name || `Party ID: ${c.party_id}`}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-0 text-xs">
                                                {c.vidhan_name || `Vidhan ID: ${c.vidhan_id}`}
                                            </Badge>
                                            <span className="text-xs text-gray-500">ID: {c.candidate_id}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('bulkDelete')} disabled={isBulkDeleting}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-red-600 text-white hover:bg-red-700" 
                            onClick={confirmBulkDelete}
                            disabled={isBulkDeleting}
                        >
                            {isBulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isBulkDeleting ? 'Deleting...' : `Delete ${modalData.bulkDelete?.length} Candidate(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllCandidates;