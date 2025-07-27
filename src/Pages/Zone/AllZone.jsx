import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisionBase } from '@/utils/axiosInstance'; // Assuming your axios instance is here
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

const AllZones = () => {
    const navigate = useNavigate();
    
    // State for data, loading, and errors
    const [zonesData, setZonesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for UI interactions
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for edit form
    const [editFormData, setEditFormData] = useState({ zone_name: '' });

    // State for filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        vidhan_name: '',
        lok_name: '',
        state: ''
    });

    // Fetch data from API
    const fetchZones = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await VisionBase.get('/zones');
            if (response.data && response.data.data && response.data.data.rows) {
                setZonesData(response.data.data.rows);
            } else {
                setZonesData([]);
            }
        } catch (err) {
            setError('Failed to fetch Zones data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchZones();
    }, []);

    // Get unique values for filter dropdowns
    const filterOptions = useMemo(() => {
        const vidhanOptions = [...new Set(zonesData.map(zone => zone.vidhan_name).filter(Boolean))].sort();
        const lokOptions = [...new Set(zonesData.map(zone => zone.lok_name).filter(Boolean))].sort();
        const stateOptions = [...new Set(zonesData.map(zone => zone.state).filter(Boolean))].sort();
        
        return {
            vidhan_name: vidhanOptions,
            lok_name: lokOptions,
            state: stateOptions
        };
    }, [zonesData]);

    // Filter and search logic
    const filteredZones = useMemo(() => {
        let filtered = zonesData;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(zone =>
                zone.zone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                zone.vidhan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                zone.lok_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                zone.state?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply dropdown filters
        if (filters.vidhan_name) {
            filtered = filtered.filter(zone => zone.vidhan_name === filters.vidhan_name);
        }
        if (filters.lok_name) {
            filtered = filtered.filter(zone => zone.lok_name === filters.lok_name);
        }
        if (filters.state) {
            filtered = filtered.filter(zone => zone.state === filters.state);
        }

        return filtered;
    }, [zonesData, searchTerm, filters]);

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilters({
            vidhan_name: '',
            lok_name: '',
            state: ''
        });
        setSelectedRows([]); // Clear selections when resetting filters
    };

    // Update filter
    const updateFilter = (key, value) => {
        // Convert "all" back to empty string for filtering logic
        const filterValue = value === "all" ? "" : value;
        setFilters(prev => ({ ...prev, [key]: filterValue }));
        setSelectedRows([]); // Clear selections when changing filters
    };

    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? filteredZones.map(d => d.zone_id) : []);
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const openModal = (type, data) => {
        if (type === 'edit') {
            setEditFormData({ zone_name: data.zone_name });
        }
        setModalData(prev => ({ ...prev, [type]: data }));
    };

    const closeModal = (type) => {
        if (isSubmitting) return;
        setModalData(prev => ({ ...prev, [type]: null }));
    };
    
    const handleAddNew = () => {
        navigate('/addzone'); // Navigate to add zone page
    };
    
    const confirmDelete = async () => {
        if (!modalData.delete) return;
        setIsSubmitting(true);
        try {
            await VisionBase.delete(`/zone/${modalData.delete.zone_id}`);
            setZonesData(prev => prev.filter(item => item.zone_id !== modalData.delete.zone_id));
            alert(`Zone "${modalData.delete.zone_name}" deleted successfully!`);
            closeModal('delete');
        } catch (err) {
            console.error("Delete failed:", err);
            alert(`Failed to delete. ${err.response?.data?.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!modalData.edit || !editFormData.zone_name.trim()) {
            alert("Zone name cannot be empty.");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { zone_name: editFormData.zone_name };
            await VisionBase.put(`/zone/${modalData.edit.zone_id}`, payload);
            
            setZonesData(prev => prev.map(item => 
                item.zone_id === modalData.edit.zone_id ? { ...item, ...payload } : item
            ));
            alert(`Zone updated successfully!`);
            closeModal('edit');
        } catch (err) {
            console.error("Update failed:", err);
            alert(`Failed to update. ${err.response?.data?.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            alert("Please select rows to delete.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} record(s)?`)) return;

        const originalData = [...zonesData];
        // Optimistic UI update
        setZonesData(prev => prev.filter(item => !selectedRows.includes(item.zone_id)));
        
        try {
            await Promise.all(selectedRows.map(id => VisionBase.delete(`/zone/${id}`)));
            alert(`Successfully deleted ${selectedRows.length} records.`);
            setSelectedRows([]);
        } catch (err) {
            console.error("Bulk delete failed:", err);
            alert("Failed to delete some records. Reverting changes.");
            setZonesData(originalData); // Rollback on failure
        }
    };
    
    if (loading) {
        return <div className="p-8 text-center">Loading data...</div>;
    }
    
    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Zone</h1>
                        <p className="text-sm text-gray-500">Manage Booth Records</p>
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
                    <span className="text-gray-700 font-medium">Booth</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard title="Total Zones" value={zonesData.length} icon={FileText} iconBgClass="bg-blue-500" textColorClass="text-blue-500" />
                    <StatCard title="Filtered Results" value={filteredZones.length} icon={Filter} iconBgClass="bg-purple-500" textColorClass="text-purple-500" />
                    <StatCard title="Active" value={zonesData.length} icon={CheckSquare} iconBgClass="bg-green-500" textColorClass="text-green-500" />
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
                                placeholder="Search zones, vidhan sabha, loksabha, or state..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vidhan Sabha</label>
                                <Select value={filters.vidhan_name || "all"} onValueChange={(value) => updateFilter('vidhan_name', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Vidhan Sabha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Vidhan Sabha</SelectItem>
                                        {filterOptions.vidhan_name.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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
                                    disabled={!searchTerm && !filters.vidhan_name && !filters.lok_name && !filters.state}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset Filters
                                </Button>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || filters.vidhan_name || filters.lok_name || filters.state) && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        Search: {searchTerm}
                                        <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-600">×</button>
                                    </span>
                                )}
                                {filters.vidhan_name && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                        Vidhan Sabha: {filters.vidhan_name}
                                        <button onClick={() => updateFilter('vidhan_name', '')} className="ml-1 hover:text-green-600">×</button>
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
                            Booth List (Showing: {filteredZones.length} of {zonesData.length})
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
                                                checked={selectedRows.length === filteredZones.length && filteredZones.length > 0} 
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-black">ID</TableHead>
                                        <TableHead>Zone Name</TableHead>
                                        <TableHead>Vidhan Sabha</TableHead>
                                        <TableHead>Loksabha Name</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead>Latitude</TableHead>
                                        <TableHead>Longitude</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredZones.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                {searchTerm || filters.vidhan_name || filters.lok_name || filters.state 
                                                    ? "No zones found matching your search criteria." 
                                                    : "No zones available."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredZones.map((zone) => (
                                            <TableRow key={zone.zone_id}>
                                                <TableCell className="px-4">
                                                    <Checkbox 
                                                        onCheckedChange={() => handleSelectRow(zone.zone_id)} 
                                                        checked={selectedRows.includes(zone.zone_id)} 
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{zone.zone_id}</TableCell>
                                                <TableCell>{zone.zone_name}</TableCell>
                                                <TableCell>{zone.vidhan_name}</TableCell>
                                                <TableCell>{zone.lok_name}</TableCell>
                                                <TableCell>{zone.state}</TableCell>
                                                <TableCell>{zone.lat || 'N/A'}</TableCell>
                                                <TableCell>{zone.lon || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center space-x-1">
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal('view', zone)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" className="h-8 w-8 bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => openModal('edit', zone)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white" onClick={() => openModal('delete', zone)}>
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
                    <div className="px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
                        <div>
                            {selectedRows.length > 0 && (
                                <div className="flex items-center space-x-2">
                                     <span className="text-sm text-gray-600">{selectedRows.length} selected</span>
                                     <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
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
                        <DialogTitle>View Booth (ID: {modalData.view?.zone_id})</DialogTitle>
                        <DialogDescription>
                            View detailed information for this booth record.
                        </DialogDescription>
                    </DialogHeader>
                    {modalData.view && <div className="py-4 space-y-2 text-sm">
                        <p><span className="font-semibold">Booth Name:</span> {modalData.view.zone_name}</p>
                        <p><span className="font-semibold">Vidhan Sabha:</span> {modalData.view.vidhan_name}</p>
                        <p><span className="font-semibold">Loksabha:</span> {modalData.view.lok_name}</p>
                        <p><span className="font-semibold">State:</span> {modalData.view.state}</p>
                        <p><span className="font-semibold">Latitude:</span> {modalData.view.lat || 'N/A'}</p>
                        <p><span className="font-semibold">Longitude:</span> {modalData.view.lon || 'N/A'}</p>
                    </div>}
                    <DialogFooter><Button variant="outline" onClick={() => closeModal('view')}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!modalData.edit} onOpenChange={() => closeModal('edit')}>
                 <DialogContent>
                    <DialogHeader><DialogTitle>Edit Booth (ID: {modalData.edit?.zone_id})</DialogTitle><DialogDescription>Update the details for this Zone.</DialogDescription></DialogHeader>
                    <div className="py-4 space-y-4">
                        <label className="block text-sm font-medium">Booth Name
                          <Input className="mt-1" value={editFormData.zone_name} onChange={(e) => setEditFormData({...editFormData, zone_name: e.target.value})} disabled={isSubmitting}/>
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

            {/* Delete Confirmation Modal */}
            <Dialog open={!!modalData.delete} onOpenChange={() => closeModal('delete')}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="flex items-center"><Trash2 className="mr-2 text-red-500"/>Are you sure?</DialogTitle><DialogDescription>This will permanently delete the record for "{modalData.delete?.zone_name}". This action cannot be undone.</DialogDescription></DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => closeModal('delete')} disabled={isSubmitting}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Confirm Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllZones;