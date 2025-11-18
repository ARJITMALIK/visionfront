import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, ChevronRight, FileText, CheckSquare, AlertTriangle, Eye, Pencil, X, Circle, MoreHorizontal, Plus, Trash2, Loader2, Search
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

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
import { VisionBase } from '@/utils/axiosInstance';

// Reusable Stat Card Component - Styled to perfectly match the image
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

const AllParty = () => {
    const navigate = useNavigate();
    const [partyData, setPartyData] = useState([]);
    const [filteredParties, setFilteredParties] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null, bulkDelete: null });
    const [editFormData, setEditFormData] = useState({ party_name: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
    const currentParties = filteredParties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Fetch party data from API
    const fetchPartyData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await VisionBase.get('/parties');
            const parties = response.data.data.rows;
            
            setPartyData(parties);
            setFilteredParties(parties);
        } catch (err) {
            console.error('Error fetching party data:', err);
            setError('Failed to load party data');
            toast.error('Failed to load party data');
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchPartyData();
    }, []);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredParties(partyData);
            setCurrentPage(1);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = partyData.filter(party => {
            return (
                party.party_name?.toLowerCase().includes(query) ||
                party.party_id?.toString().includes(query)
            );
        });

        setFilteredParties(filtered);
        setCurrentPage(1);
    }, [searchQuery, partyData]);

    // Calculate stats
    const totalParties = partyData.length;
    const activeParties = totalParties; // Assuming all are active since there's no status in API
    const inactiveParties = 0;
    
    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? currentParties.map(p => p.party_id) : []);
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const openModal = (type, data) => {
        setModalData(prev => ({ ...prev, [type]: data }));
        if (type === 'edit' && data) {
            setEditFormData({ party_name: data.party_name });
        }
    };

    const closeModal = (type) => {
        setModalData(prev => ({ ...prev, [type]: null }));
        if (type === 'edit') {
            setEditFormData({ party_name: '' });
        }
    };

    const handleAddNew = () => {
        navigate('/addparty');
    };
    
    const handleEditSubmit = async () => {
        if (!editFormData.party_name.trim()) {
            toast.error('Party name is required');
            return;
        }

        try {
            setIsUpdating(true);
            
            const payload = {
                party_name: editFormData.party_name.trim(),
                party_logo: modalData.edit.party_logo
            };

            await VisionBase.put(`/party/${modalData.edit.party_id}`, payload);
            
            toast.success('Party updated successfully!');
            closeModal('edit');
            fetchPartyData(); // Refresh the data
        } catch (error) {
            console.error('Error updating party:', error);
            toast.error(error.response?.data?.message || 'Failed to update party. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            
            await VisionBase.delete(`/party/${modalData.delete.party_id}`);
            
            toast.success(`Party "${modalData.delete.party_name}" deleted successfully!`);
            closeModal('delete');
            fetchPartyData(); // Refresh the data
        } catch (error) {
            console.error('Error deleting party:', error);
            toast.error(error.response?.data?.message || 'Failed to delete party. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one party to delete.");
            return;
        }
        const selectedParties = partyData.filter(p => selectedRows.includes(p.party_id));
        openModal('bulkDelete', selectedParties);
    };

    const confirmBulkDelete = async () => {
        if (!modalData.bulkDelete || modalData.bulkDelete.length === 0) return;
        
        setIsBulkDeleting(true);
        try {
            const idsToDelete = modalData.bulkDelete.map(p => p.party_id);
            
            await VisionBase.delete('/delete-parties', {
                data: { ids: idsToDelete }
            });

            setSelectedRows([]);
            closeModal('bulkDelete');
            toast.success(`Successfully deleted ${idsToDelete.length} party/parties.`);
            fetchPartyData(); // Refresh the data
        } catch (error) {
            console.error("Failed to delete parties:", error);
            toast.error(error.response?.data?.message || "Failed to delete parties. Please try again.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleRefresh = () => {
        fetchPartyData();
    };

    if (loading) {
        return (
            <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
                            <span className="text-gray-600">Loading parties...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button onClick={handleRefresh} className="bg-brand-primary hover:bg-brand-primary-dark">
                                Try Again
                            </Button>
                        </div>
                    </div>
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
                        <h1 className="text-2xl font-bold text-gray-800">Party</h1>
                        <p className="text-sm text-gray-500">Manage all parties</p>
                    </div>
                    <div className="p-2 bg-gray-200 rounded-md">
                       <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Home className="h-4 w-4 text-brand-secondary" />
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-brand-secondary">Party</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">All Parties</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total" value={totalParties.toString()} icon={FileText} iconBgClass="bg-brand-primary" textColorClass="text-brand-primary" />
                    <StatCard title="Active" value={activeParties.toString()} icon={CheckSquare} iconBgClass="bg-brand-green" textColorClass="text-brand-green" />
                    <StatCard title="Inactive" value={inactiveParties.toString()} icon={AlertTriangle} iconBgClass="bg-brand-orange" textColorClass="text-brand-orange" />
                </div>

                {/* Search Bar */}
                <Card className="shadow-sm mb-6">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search parties by name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {searchQuery && (
                            <p className="text-sm text-gray-600 mt-2">
                                Found {filteredParties.length} result(s) for "{searchQuery}"
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Main Table Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <CardTitle className="text-lg font-semibold">
                            Parties (Total: {totalParties})
                            {searchQuery && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    - Showing {filteredParties.length} filtered
                                </span>
                            )}
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={handleRefresh}>
                                <Loader2 className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button className="bg-brand-primary hover:bg-brand-primary-dark" onClick={handleAddNew}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add New
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-100">
                                        <TableHead className="w-[50px] px-4">
                                            <Checkbox 
                                                onCheckedChange={handleSelectAll} 
                                                checked={currentParties.length > 0 && selectedRows.length === currentParties.length} 
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-black">Id</TableHead>
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentParties.length > 0 ? (
                                        currentParties.map((party) => (
                                            <TableRow key={party.party_id}>
                                                <TableCell className="px-4">
                                                    <Checkbox 
                                                        onCheckedChange={() => handleSelectRow(party.party_id)} 
                                                        checked={selectedRows.includes(party.party_id)} 
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{party.party_id}</TableCell>
                                                <TableCell>
                                                    {party.party_logo ? (
                                                        <img 
                                                            src={party.party_logo} 
                                                            alt={`${party.party_name} logo`} 
                                                            className="h-8 w-8 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-normal">{party.party_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal('view', party)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" className="h-8 w-8 bg-action-blue hover:bg-action-blue-dark text-white" onClick={() => openModal('edit', party)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" className="h-8 w-8 bg-brand-primary hover:bg-brand-primary-dark text-white" onClick={() => openModal('delete', party)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                                {searchQuery ? `No parties found matching "${searchQuery}"` : 'No parties found'}
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
                    <DialogHeader>
                        <DialogTitle>View Party Details (ID: {modalData.view?.party_id})</DialogTitle>
                    </DialogHeader>
                    {modalData.view && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center space-x-4">
                                {modalData.view.party_logo ? (
                                    <img 
                                        src={modalData.view.party_logo} 
                                        alt={`${modalData.view.party_name} logo`} 
                                        className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                    />
                                ) : (
                                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm"><span className="font-semibold">Name:</span> {modalData.view.party_name}</p>
                                    <p className="text-sm"><span className="font-semibold">ID:</span> {modalData.view.party_id}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('view')}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!modalData.edit} onOpenChange={() => closeModal('edit')}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Party (ID: {modalData.edit?.party_id})</DialogTitle>
                        <DialogDescription>Update the party information.</DialogDescription>
                    </DialogHeader>
                    {modalData.edit && (
                        <div className="py-4 space-y-4">
                            <label className="block text-sm font-medium">
                                Party Name *
                                <Input 
                                    className="mt-1" 
                                    value={editFormData.party_name}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, party_name: e.target.value }))}
                                    placeholder="Enter party name"
                                    disabled={isUpdating}
                                />
                            </label>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('edit')} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-brand-primary text-white" 
                            onClick={handleEditSubmit}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Modal */}
            <Dialog open={!!modalData.delete} onOpenChange={() => closeModal('delete')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Trash2 className="mr-2 text-brand-primary"/> Are you sure?
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete the party "{modalData.delete?.party_name}" (ID: {modalData.delete?.party_id}). This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('delete')} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-brand-primary text-white" 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Confirm Delete'
                            )}
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
                            Delete Multiple Parties
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete {modalData.bulkDelete?.length} party/parties.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto py-4">
                        <h4 className="font-semibold mb-3 text-gray-700">Parties to be deleted:</h4>
                        <ul className="space-y-2">
                            {modalData.bulkDelete?.map((party, index) => (
                                <li key={party.party_id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="font-medium text-gray-600 min-w-[30px]">{index + 1}.</span>
                                    <div className="flex items-center gap-3 flex-grow">
                                        {party.party_logo ? (
                                            <img 
                                                src={party.party_logo} 
                                                alt={party.party_name} 
                                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium text-gray-800">{party.party_name}</p>
                                            <span className="text-xs text-gray-500">ID: {party.party_id}</span>
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
                            {isBulkDeleting ? 'Deleting...' : `Delete ${modalData.bulkDelete?.length} Party/Parties`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllParty;