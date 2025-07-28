import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, ChevronRight, FileText, CheckSquare, AlertTriangle, Eye, Pencil, X, Circle, MoreHorizontal, Plus, Trash2, Loader2
} from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { VisionBase } from '@/utils/axiosInstance';

// Import your VisionBase - adjust the path as needed
// import { VisionBase } from '@/api/base'; // Uncomment and adjust path

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null });
    const [editFormData, setEditFormData] = useState({ party_name: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch party data from API
    const fetchPartyData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Uncomment when VisionBase is available
            const response = await VisionBase.get('/parties');
            const parties = response.data.data.rows;
            
         
            
            setPartyData(parties);
        } catch (err) {
            console.error('Error fetching party data:', err);
            setError('Failed to load party data');
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchPartyData();
    }, []);

    // Calculate stats
    const totalParties = partyData.length;
    const activeParties = totalParties; // Assuming all are active since there's no status in API
    const inactiveParties = 0;
    
    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? partyData.map(p => p.party_id) : []);
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
            alert('Party name is required');
            return;
        }

        try {
            setIsUpdating(true);
            
            const payload = {
                party_name: editFormData.party_name.trim(),
                party_logo: modalData.edit.party_logo
            };

            // Uncomment when VisionBase is available
            await VisionBase.put(`/parties/${modalData.edit.party_id}`, payload);
            
            // Simulate API call
            
            alert('Party updated successfully!');
            closeModal('edit');
            fetchPartyData(); // Refresh the data
        } catch (error) {
            console.error('Error updating party:', error);
            alert('Failed to update party. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            
            // Uncomment when VisionBase is available
            await VisionBase.delete(`/party/${modalData.delete.party_id}`);
            
            // Simulate API call
            
            alert(`Party "${modalData.delete.party_name}" deleted successfully!`);
            closeModal('delete');
            fetchPartyData(); // Refresh the data
        } catch (error) {
            console.error('Error deleting party:', error);
            alert('Failed to delete party. Please try again.');
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
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Party</h1>
                        <p className="text-sm text-gray-500">Party</p>
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
                    <span className="text-gray-700 font-medium">Party</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total" value={totalParties.toString()} icon={FileText} iconBgClass="bg-brand-primary" textColorClass="text-brand-primary" />
                    <StatCard title="Active" value={activeParties.toString()} icon={CheckSquare} iconBgClass="bg-brand-green" textColorClass="text-brand-green" />
                    <StatCard title="Inactive" value={inactiveParties.toString()} icon={AlertTriangle} iconBgClass="bg-brand-orange" textColorClass="text-brand-orange" />
                </div>

                {/* Main Table Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <CardTitle className="text-lg font-semibold">Party (Total Record: {totalParties})</CardTitle>
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
                                                checked={selectedRows.length === partyData.length && partyData.length > 0} 
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-black">Id</TableHead>
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partyData.map((party) => (
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
                                            <TableCell>{party.party_name}</TableCell>
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
                                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleBulkAction('action_circle')}>
                                         <Circle className="h-4 w-4 p-0.5" />
                                     </Button>
                                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleBulkAction('action_more')}>
                                         <MoreHorizontal className="h-4 w-4" />
                                     </Button>
                                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleBulkAction('delete')}>
                                         <X className="h-4 w-4" />
                                     </Button>
                                </div>
                            )}
                        </div>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem className="pointer-events-none text-gray-400">
                                    <PaginationPrevious href="#" />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
                                </PaginationItem>
                                <PaginationItem className="pointer-events-none text-gray-400">
                                    <PaginationNext href="#" />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
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

            {/* Delete Confirmation Modal */}
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
        </div>
    );
};

export default AllParty;