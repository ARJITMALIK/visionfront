import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisionBase } from '@/utils/axiosInstance';
import { toast, Toaster } from 'sonner';
import {
  Home, ChevronRight, FileText, CheckSquare, Eye, Pencil, X, Trash2, Plus, Loader2, Search, Filter, RotateCcw
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, iconBgClass, textColorClass }) => (
    <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
            <div className={`p-3 rounded-md ${iconBgClass}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
                <p className={`text-2xl font-bold ${textColorClass}`}>{value}</p>
                <p className="text-sm text-gray-500">{title}</p>
            </div>
        </CardContent>
    </Card>
);

const AllDistricts = () => {
    const navigate = useNavigate();
    
    // State for data, loading, and errors
    const [vidhanSabhaData, setVidhanSabhaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for UI interactions
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null, bulkDelete: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    
    // State for edit form
    const [editFormData, setEditFormData] = useState({ vidhan_name: '' });

    // State for filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        lok_name: '',
        state: ''
    });

    // Fetch data from API
    const fetchVidhanSabhas = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await VisionBase.get('/vidhans');
            if (response.data && response.data.data && response.data.data.rows) {
                setVidhanSabhaData(response.data.data.rows);
            } else {
                setVidhanSabhaData([]);
            }
        } catch (err) {
            setError('Failed to fetch Vidhan Sabha data. Please try again.');
            toast.error('Failed to fetch Vidhan Sabha data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVidhanSabhas();
    }, []);

    // Get unique values for filter dropdowns
    const filterOptions = useMemo(() => {
        const lokOptions = [...new Set(vidhanSabhaData.map(vs => vs.lok_name).filter(Boolean))].sort();
        const stateOptions = [...new Set(vidhanSabhaData.map(vs => vs.state).filter(Boolean))].sort();
        
        return {
            lok_name: lokOptions,
            state: stateOptions
        };
    }, [vidhanSabhaData]);

    // Filter and search logic
    const filteredVidhanSabhas = useMemo(() => {
        let filtered = vidhanSabhaData;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(vs =>
                vs.vidhan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vs.vidhan_id?.toString().includes(searchTerm) ||
                vs.lok_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vs.state?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply dropdown filters
        if (filters.lok_name) {
            filtered = filtered.filter(vs => vs.lok_name === filters.lok_name);
        }
        if (filters.state) {
            filtered = filtered.filter(vs => vs.state === filters.state);
        }

        return filtered;
    }, [vidhanSabhaData, searchTerm, filters]);

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilters({
            lok_name: '',
            state: ''
        });
        setSelectedRows([]);
    };

    // Update filter
    const updateFilter = (key, value) => {
        const filterValue = value === "all" ? "" : value;
        setFilters(prev => ({ ...prev, [key]: filterValue }));
        setSelectedRows([]);
    };

    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? filteredVidhanSabhas.map(d => d.vidhan_id) : []);
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const openModal = (type, data) => {
        if (type === 'edit') {
            setEditFormData({ vidhan_name: data.vidhan_name });
        }
        setModalData(prev => ({ ...prev, [type]: data }));
    };

    const closeModal = (type) => {
        if (isSubmitting || isBulkDeleting) return;
        setModalData(prev => ({ ...prev, [type]: null }));
    };
    
    const handleAddNew = () => {
        navigate('/add-vidhan');
    };
    
    const confirmDelete = async () => {
        if (!modalData.delete) return;
        setIsSubmitting(true);
        try {
            await VisionBase.delete(`/vidhan/${modalData.delete.vidhan_id}`);
            setVidhanSabhaData(prev => prev.filter(item => item.vidhan_id !== modalData.delete.vidhan_id));
            toast.success(`Vidhan Sabha "${modalData.delete.vidhan_name}" deleted successfully!`);
            closeModal('delete');
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.message || 'Failed to delete. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!modalData.edit || !editFormData.vidhan_name.trim()) {
            toast.error("Vidhan Sabha name cannot be empty.");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { vidhan_name: editFormData.vidhan_name };
            await VisionBase.put(`/vidhan/${modalData.edit.vidhan_id}`, payload);
            
            setVidhanSabhaData(prev => prev.map(item => 
                item.vidhan_id === modalData.edit.vidhan_id ? { ...item, ...payload } : item
            ));
            toast.success('Vidhan Sabha updated successfully!');
            closeModal('edit');
        } catch (err) {
            console.error("Update failed:", err);
            toast.error(err.response?.data?.message || 'Failed to update. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one Vidhan Sabha to delete.");
            return;
        }
        
        const vidhansToDelete = vidhanSabhaData.filter(vs => selectedRows.includes(vs.vidhan_id));
        openModal('bulkDelete', vidhansToDelete);
    };

    const confirmBulkDelete = async () => {
        if (!modalData.bulkDelete || modalData.bulkDelete.length === 0) return;
        
        setIsBulkDeleting(true);
        try {
            const idsToDelete = modalData.bulkDelete.map(vs => vs.vidhan_id);
            
            await VisionBase.delete('/delete-vidhans', {
                data: { ids: idsToDelete }
            });

            setVidhanSabhaData(prev => prev.filter(vs => !idsToDelete.includes(vs.vidhan_id)));
            setSelectedRows([]);
            toast.success(`Successfully deleted ${idsToDelete.length} Vidhan Sabha(s).`);
            closeModal('bulkDelete');
        } catch (err) {
            console.error("Bulk delete failed:", err);
            toast.error(err.response?.data?.message || "Failed to delete Vidhan Sabhas. Please try again.");
        } finally {
            setIsBulkDeleting(false);
        }
    };
    
    if (loading) {
        return (
            <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading Vidhan Sabha data...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
                    <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg text-red-700 mb-4">{error}</p>
                    <Button onClick={fetchVidhanSabhas} className="bg-blue-600 hover:bg-blue-700">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
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
                        <h1 className="text-2xl font-bold text-gray-800">Vidhan Sabha</h1>
                        <p className="text-sm text-gray-500">Manage Vidhan Sabha Records</p>
                    </div>
                    <div className="p-2 bg-gray-200 rounded-md">
                       <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Home className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>Masters</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">Vidhan Sabha</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard title="Total Vidhan Sabhas" value={vidhanSabhaData.length} icon={FileText} iconBgClass="bg-blue-500" textColorClass="text-blue-500" />
                    <StatCard title="Filtered Results" value={filteredVidhanSabhas.length} icon={Filter} iconBgClass="bg-purple-500" textColorClass="text-purple-500" />
                    <StatCard title="Active" value={vidhanSabhaData.length} icon={CheckSquare} iconBgClass="bg-green-500" textColorClass="text-green-500" />
                </div>

                {/* Search and Filters Section */}
                <Card className="shadow-sm mb-6">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Search & Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by ID, vidhan sabha, loksabha, or state..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {searchTerm && (
                            <p className="text-sm text-gray-600">
                                Found {filteredVidhanSabhas.length} result(s) for "{searchTerm}"
                            </p>
                        )}

                        {/* Filter Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loksabha</label>
                                <Select value={filters.lok_name || "all"} onValueChange={(value) => updateFilter('lok_name', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Loksabha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Loksabha</SelectItem>
                                        {filterOptions.lok_name.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <Select value={filters.state || "all"} onValueChange={(value) => updateFilter('state', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All States" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All States</SelectItem>
                                        {filterOptions.state.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button 
                                    variant="outline" 
                                    onClick={resetFilters}
                                    className="w-full"
                                    disabled={!searchTerm && !filters.lok_name && !filters.state}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset Filters
                                </Button>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || filters.lok_name || filters.state) && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        Search: {searchTerm}
                                        <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-600">×</button>
                                    </span>
                                )}
                                {filters.lok_name && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                        Loksabha: {filters.lok_name}
                                        <button onClick={() => updateFilter('lok_name', '')} className="ml-1 hover:text-purple-600">×</button>
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

                {/* Main Table Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <CardTitle className="text-lg font-semibold">
                            Vidhan Sabha List (Showing: {filteredVidhanSabhas.length} of {vidhanSabhaData.length})
                        </CardTitle>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddNew}>
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
                                                checked={selectedRows.length === filteredVidhanSabhas.length && filteredVidhanSabhas.length > 0} 
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-black">ID</TableHead>
                                        <TableHead>Vidhan Sabha Name</TableHead>
                                        <TableHead>Loksabha Name</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVidhanSabhas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {searchTerm || filters.lok_name || filters.state 
                                                    ? "No Vidhan Sabha found matching your search criteria." 
                                                    : "No Vidhan Sabha available."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredVidhanSabhas.map((vs) => (
                                            <TableRow key={vs.vidhan_id}>
                                                <TableCell className="px-4">
                                                    <Checkbox 
                                                        onCheckedChange={() => handleSelectRow(vs.vidhan_id)} 
                                                        checked={selectedRows.includes(vs.vidhan_id)} 
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{vs.vidhan_id}</TableCell>
                                                <TableCell className="whitespace-normal">{vs.vidhan_name}</TableCell>
                                                <TableCell className="whitespace-normal">{vs.lok_name}</TableCell>
                                                <TableCell>{vs.state}</TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center space-x-1">
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal('view', vs)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" className="h-8 w-8 bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => openModal('edit', vs)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white" onClick={() => openModal('delete', vs)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
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
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={handleBulkDeleteClick}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Selected
                                     </Button>
                                </div>
                            )}
                        </div>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem className="pointer-events-none text-gray-400"><PaginationPrevious href="#" /></PaginationItem>
                                <PaginationItem><PaginationLink href="#" isActive>{currentPage}</PaginationLink></PaginationItem>
                                <PaginationItem className="pointer-events-none text-gray-400"><PaginationNext href="#" /></PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </Card>
            </div>

            {/* View Modal */}
            <Dialog open={!!modalData.view} onOpenChange={() => closeModal('view')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>View Vidhan Sabha (ID: {modalData.view?.vidhan_id})</DialogTitle>
                        <DialogDescription>
                            View detailed information for this Vidhan Sabha record.
                        </DialogDescription>
                    </DialogHeader>
                    {modalData.view && <div className="py-4 space-y-2 text-sm">
                        <p><span className="font-semibold">Vidhan Sabha Name:</span> {modalData.view.vidhan_name}</p>
                        <p><span className="font-semibold">Loksabha:</span> {modalData.view.lok_name}</p>
                        <p><span className="font-semibold">State:</span> {modalData.view.state}</p>
                    </div>}
                    <DialogFooter><Button variant="outline" onClick={() => closeModal('view')}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!modalData.edit} onOpenChange={() => closeModal('edit')}>
                 <DialogContent>
                    <DialogHeader><DialogTitle>Edit Vidhan Sabha (ID: {modalData.edit?.vidhan_id})</DialogTitle><DialogDescription>Update the details for this Vidhan Sabha.</DialogDescription></DialogHeader>
                    <div className="py-4 space-y-4">
                        <label className="block text-sm font-medium">Vidhan Sabha Name
                          <Input className="mt-1" value={editFormData.vidhan_name} onChange={(e) => setEditFormData({...editFormData, vidhan_name: e.target.value})} disabled={isSubmitting}/>
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('edit')} disabled={isSubmitting}>Cancel</Button>
                        <Button className="bg-blue-600 text-white" onClick={handleUpdate} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Modal */}
            <Dialog open={!!modalData.delete} onOpenChange={() => closeModal('delete')}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="flex items-center"><Trash2 className="mr-2 text-red-500"/>Are you sure?</DialogTitle><DialogDescription>This will permanently delete the record for "{modalData.delete?.vidhan_name}". This action cannot be undone.</DialogDescription></DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('delete')} disabled={isSubmitting}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Confirm Delete
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
                            Delete Multiple Vidhan Sabhas
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete {modalData.bulkDelete?.length} Vidhan Sabha(s).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto py-4">
                        <h4 className="font-semibold mb-3 text-gray-700">Vidhan Sabhas to be deleted:</h4>
                        <ul className="space-y-2">
                            {modalData.bulkDelete?.map((vs, index) => (
                                <li key={vs.vidhan_id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="font-medium text-gray-600 min-w-[30px]">{index + 1}.</span>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800">{vs.vidhan_name}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-0 text-xs">
                                                {vs.lok_name}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-0 text-xs">
                                                {vs.state}
                                            </Badge>
                                            <span className="text-xs text-gray-500">ID: {vs.vidhan_id}</span>
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
                            {isBulkDeleting ? 'Deleting...' : `Delete ${modalData.bulkDelete?.length} Vidhan Sabha(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllDistricts;