import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, ChevronRight, FileText, CheckSquare, AlertTriangle, Eye, Pencil, X, Circle, MoreHorizontal, Plus, Trash2
} from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance'; // Assuming your axios instance is here

// Assuming you have shadcn/ui components in these paths
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
    const [elections, setElections] = useState([]);
    const [parties, setParties] = useState([]);
    const [zones, setZones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null });
    const [editFormData, setEditFormData] = useState({
        candidate_name: '',
        party_id: '',
        zone_id: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const totalPages = Math.ceil(candidates.length / 10);

    // Fetch Candidates
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setIsLoading(true);
                const response = await VisionBase.get('/candidates');
                if (response.data && response.data.data && response.data.data.rows) {
                    setCandidates(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Candidates:", error);
                alert("Could not load Candidate data. Please try refreshing the page.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

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

    // Fetch Zones for edit modal
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const response = await VisionBase.get('/zones');
                if (response.data && response.data.data && response.data.data.rows) {
                    setZones(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Zones:", error);
            }
        };

        fetchZones();
    }, []);

    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? candidates.map(c => c.candidate_id) : []);
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
                zone_id: data.zone_id?.toString() || ''
            });
        }
        setModalData(prev => ({ ...prev, [type]: data }));
    };

    const closeModal = (type) => {
        setModalData(prev => ({ ...prev, [type]: null }));
        if (type === 'edit') {
            setEditFormData({ candidate_name: '', party_id: '', zone_id: '' });
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
        if (!editFormData.candidate_name.trim() || !editFormData.party_id || !editFormData.zone_id) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsUpdating(true);
        try {
            const candidateId = modalData.edit.candidate_id;
            const updateData = {
                candidate_name: editFormData.candidate_name,
                party_id: parseInt(editFormData.party_id),
                zone_id: parseInt(editFormData.zone_id)
            };

            await VisionBase.put(`/candidate/${candidateId}`, updateData);

            // Refresh candidates list
            const response = await VisionBase.get('/candidates');
            if (response.data && response.data.data && response.data.data.rows) {
                setCandidates(response.data.data.rows);
            }

            closeModal('edit');
            alert("Candidate updated successfully!");
        } catch (error) {
            console.error("Error updating candidate:", error);
            alert(`Failed to update candidate. ${error.response?.data?.message || 'Please try again.'}`);
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
            alert("Candidate deleted successfully!");
        } catch (error) {
            console.error("Error deleting candidate:", error);
            alert(`Failed to delete candidate. ${error.response?.data?.message || 'Please try again.'}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkAction = (action) => {
        if (selectedRows.length === 0) {
            alert("Please select rows to perform a bulk action.");
            return;
        }
        console.log(`Performing bulk action "${action}" on rows:`, selectedRows);
        alert(`Bulk action "${action}" triggered for selected rows. Check console.`);
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
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Candidate</h1>
                        <p className="text-sm text-gray-500">Candidate</p>
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
                    <span className="text-gray-700 font-medium">Candidate</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total" value={totalCandidates.toString()} icon={FileText} iconBgClass="bg-brand-primary" textColorClass="text-brand-primary" />
                    <StatCard title="Active" value={activeCandidates.toString()} icon={CheckSquare} iconBgClass="bg-brand-green" textColorClass="text-brand-green" />
                    <StatCard title="Inactive" value={inactiveCandidates.toString()} icon={AlertTriangle} iconBgClass="bg-brand-orange" textColorClass="text-brand-orange" />
                </div>

                {/* Main Table Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <CardTitle className="text-lg font-semibold">Candidate (Total Record: {totalCandidates})</CardTitle>
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
                                        <TableHead className="w-[50px] px-4"><Checkbox onCheckedChange={handleSelectAll} checked={selectedRows.length === candidates.length && candidates.length > 0} /></TableHead>
                                        <TableHead className="font-bold text-black">Id</TableHead>
                                        <TableHead>Candidate Name</TableHead>
                                        <TableHead>Party</TableHead>
                                        <TableHead>Zone</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.map((c) => (
                                        <TableRow key={c.candidate_id}>
                                            <TableCell className="px-4"><Checkbox onCheckedChange={() => handleSelectRow(c.candidate_id)} checked={selectedRows.includes(c.candidate_id)} /></TableCell>
                                            <TableCell className="font-medium">{c.candidate_id}</TableCell>
                                            <TableCell>{c.candidate_name}</TableCell>
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
                                            <TableCell>{c.zone_name || c.zone_id}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal('view', c)}><Eye className="h-4 w-4" /></Button>
                                                    <Button size="icon" className="h-8 w-8 bg-action-blue hover:bg-action-blue-dark text-white" onClick={() => openModal('edit', c)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button size="icon" className="h-8 w-8 bg-brand-primary hover:bg-brand-primary-dark text-white" onClick={() => openModal('delete', c)}><X className="h-4 w-4" /></Button>
                                                    <Button size="icon" className="h-8 w-8 bg-brand-green hover:bg-brand-green-dark text-white" onClick={() => alert(`Toggling status for ID: ${c.candidate_id}`)}><Circle className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    {/* Footer with Bulk Actions and Pagination */}
                    <div className="px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
                        <div>
                            {selectedRows.length > 0 && (
                                <div className="flex items-center space-x-2">
                                     <span className="text-sm text-gray-600">{selectedRows.length} selected</span>
                                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleBulkAction('action_circle')}><Circle className="h-4 w-4 p-0.5" /></Button>
                                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleBulkAction('action_more')}><MoreHorizontal className="h-4 w-4" /></Button>
                                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleBulkAction('delete')}><X className="h-4 w-4" /></Button>
                                </div>
                            )}
                        </div>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}/></PaginationItem>
                                {[...Array(totalPages).keys()].map(p => (
                                    <PaginationItem key={p + 1}><PaginationLink href="#" isActive={currentPage === p + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(p + 1); }}>{p + 1}</PaginationLink></PaginationItem>
                                ))}
                                <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}/></PaginationItem>
                            </PaginationContent>
                        </Pagination>
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
                            <p><span className="font-semibold">Zone:</span> {modalData.view.zone_name || modalData.view.zone_id}</p>
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
                                <label className="block text-sm font-medium mb-1">Zone *</label>
                                <Select 
                                    onValueChange={(value) => handleEditSelectChange('zone_id', value)} 
                                    value={editFormData.zone_id}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zones.map((zone) => (
                                            <SelectItem key={zone.zone_id} value={zone.zone_id.toString()}>
                                                {zone.zone_name} - {zone.vidhan_name} <b>{zone.lok_name}</b> ({zone.state})
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

            {/* Delete Confirmation Modal */}
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
                            {isDeleting ? 'Deleting..' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllCandidates;