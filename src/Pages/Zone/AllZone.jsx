import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisionBase } from '@/utils/axiosInstance';
import { toast, Toaster } from 'sonner';
import {
  Home, ChevronRight, FileText, CheckSquare, Eye, Pencil, X, Trash2, Plus, Loader2, Search, Filter, RotateCcw
} from 'lucide-react';

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

const AllZones = () => {
    const navigate = useNavigate();
    
    // State for data, loading, and errors
    const [zonesData, setZonesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for UI interactions
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null, bulkDelete: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    
    // State for edit form
    const [editFormData, setEditFormData] = useState({ 
        zone_name: '',
        range: '',
        survey_limit: ''
    });

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
            toast.error('Failed to fetch Zones data');
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
                zone.zone_id?.toString().includes(searchTerm) ||
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
        setSelectedRows([]);
    };

    // Update filter
    const updateFilter = (key, value) => {
        const filterValue = value === "all" ? "" : value;
        setFilters(prev => ({ ...prev, [key]: filterValue }));
        setSelectedRows([]);
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
            setEditFormData({ 
                zone_name: data.zone_name,
                range: data.range || '',
                survey_limit: data.survey_limit || ''
            });
        }
        setModalData(prev => ({ ...prev, [type]: data }));
    };

    const closeModal = (type) => {
        if (isSubmitting || isBulkDeleting) return;
        setModalData(prev => ({ ...prev, [type]: null }));
    };
    
    const handleAddNew = () => {
        navigate('/addbooth');
    };
    
    const confirmDelete = async () => {
        if (!modalData.delete) return;
        setIsSubmitting(true);
        try {
            await VisionBase.delete(`/zone/${modalData.delete.zone_id}`);
            setZonesData(prev => prev.filter(item => item.zone_id !== modalData.delete.zone_id));
            toast.success(`Zone "${modalData.delete.zone_name}" deleted successfully!`);
            closeModal('delete');
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.message || 'Failed to delete zone. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!modalData.edit || !editFormData.zone_name.trim()) {
            toast.error("Zone name cannot be empty.");
            return;
        }

        // Validate range if provided
        if (editFormData.range && (isNaN(editFormData.range) || editFormData.range < 0)) {
            toast.error("Please enter a valid range (must be a positive number).");
            return;
        }

        // Validate survey_limit if provided
        if (editFormData.survey_limit && (isNaN(editFormData.survey_limit) || editFormData.survey_limit < 0 || !Number.isInteger(Number(editFormData.survey_limit)))) {
            toast.error("Please enter a valid survey survey_limit (must be a positive whole number).");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { 
                zone_name: editFormData.zone_name,
               range: editFormData.range ? Number(editFormData.range) : null,
                survey_limit: editFormData.survey_limit ? Number(editFormData.survey_limit) : null
            };
            await VisionBase.put(`/zone/${modalData.edit.zone_id}`, payload);
            
            setZonesData(prev => prev.map(item => 
                item.zone_id === modalData.edit.zone_id ? { ...item, ...payload } : item
            ));
            toast.success('Zone updated successfully!');
            closeModal('edit');
        } catch (err) {
            console.error("Update failed:", err);
            toast.error(err.response?.data?.message || 'Failed to update zone. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one zone to delete.");
            return;
        }
        
        const zonesToDelete = zonesData.filter(zone => selectedRows.includes(zone.zone_id));
        openModal('bulkDelete', zonesToDelete);
    };

    const confirmBulkDelete = async () => {
        if (!modalData.bulkDelete || modalData.bulkDelete.length === 0) return;
        
        setIsBulkDeleting(true);
        try {
            const idsToDelete = modalData.bulkDelete.map(zone => zone.zone_id);
            
            await VisionBase.delete('/delete-zones', {
                data: { ids: idsToDelete }
            });

            setZonesData(prev => prev.filter(zone => !idsToDelete.includes(zone.zone_id)));
            setSelectedRows([]);
            toast.success(`Successfully deleted ${idsToDelete.length} zone(s).`);
            closeModal('bulkDelete');
        } catch (err) {
            console.error("Bulk delete failed:", err);
            toast.error(err.response?.data?.message || "Failed to delete zones. Please try again.");
        } finally {
            setIsBulkDeleting(false);
        }
    };
    
    if (loading) {
        return (
            <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading zones data...</p>
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
                    <Button onClick={fetchZones} className="bg-blue-600 hover:bg-blue-700">
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
                                placeholder="Search by ID, zone name, vidhan sabha, loksabha, or state..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {searchTerm && (
                            <p className="text-sm text-gray-600">
                                Found {filteredZones.length} result(s) for "{searchTerm}"
                            </p>
                        )}

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
                                        <TableHead>Range (km)</TableHead>
                                        <TableHead>Survey limit</TableHead>
                                        <TableHead>Surveys Filled</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredZones.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                                {searchTerm || filters.vidhan_name || filters.lok_name || filters.state 
                                                    ? "No zones found matching your search criteria." 
                                                    : "No zones available."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredZones.map((zone) => {
                                            const surveyFilled = zone.surveyfilled || 0;
                                            const surveysurvey_limit = zone.survey_limit || 0;
                                            const isAtsurvey_limit = surveysurvey_limit > 0 && surveyFilled >= surveysurvey_limit;
                                            const progressPercent = surveysurvey_limit > 0 ? Math.min((surveyFilled / surveysurvey_limit) * 100, 100) : 0;

                                            return (
                                                <TableRow key={zone.zone_id}>
                                                    <TableCell className="px-4">
                                                        <Checkbox 
                                                            onCheckedChange={() => handleSelectRow(zone.zone_id)} 
                                                            checked={selectedRows.includes(zone.zone_id)} 
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{zone.zone_id}</TableCell>
                                                    <TableCell className="whitespace-normal">{zone.zone_name}</TableCell>
                                                    <TableCell className="whitespace-normal">{zone.vidhan_name}</TableCell>
                                                    <TableCell className="whitespace-normal">{zone.lok_name}</TableCell>
                                                    <TableCell>{zone.state}</TableCell>
                                                    <TableCell>{zone.range ? `${zone.range} km` : 'N/A'}</TableCell>
                                                    <TableCell>{zone.survey_limit || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-medium ${isAtsurvey_limit ? 'text-red-600' : 'text-gray-700'}`}>
                                                                {surveyFilled}
                                                            </span>
                                                            {surveysurvey_limit > 0 && (
                                                                <>
                                                                    <span className="text-gray-400">/</span>
                                                                    <span className="text-gray-600">{surveysurvey_limit}</span>
                                                                    <Badge 
                                                                        variant="secondary" 
                                                                        className={`text-xs ${
                                                                            isAtsurvey_limit 
                                                                                ? 'bg-red-100 text-red-700' 
                                                                                : progressPercent >= 75 
                                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                                : 'bg-green-100 text-green-700'
                                                                        }`}
                                                                    >
                                                                        {progressPercent.toFixed(0)}%
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
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
                                            );
                                        })
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
                                <PaginationItem className="pointer-events-none text-gray-400"><PaginationPrevious /></PaginationItem>
                                <PaginationItem><PaginationLink isActive>{currentPage}</PaginationLink></PaginationItem>
                                <PaginationItem className="pointer-events-none text-gray-400"><PaginationNext /></PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </Card>
            </div>

            {/* View Modal */}
            <Dialog open={!!modalData.view} onOpenChange={() => closeModal('view')}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>View Booth (ID: {modalData.view?.zone_id})</DialogTitle>
                        <DialogDescription>
                            View detailed information for this booth record.
                        </DialogDescription>
                    </DialogHeader>
                    {modalData.view && (
                        <div className="py-4 space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-semibold text-gray-700">Booth Name:</span>
                                <span className="text-gray-900">{modalData.view.zone_name}</span>
                                
                                <span className="font-semibold text-gray-700">Vidhan Sabha:</span>
                                <span className="text-gray-900">{modalData.view.vidhan_name}</span>
                                
                                <span className="font-semibold text-gray-700">Loksabha:</span>
                                <span className="text-gray-900">{modalData.view.lok_name}</span>
                                
                                <span className="font-semibold text-gray-700">State:</span>
                                <span className="text-gray-900">{modalData.view.state}</span>
                                
                                <span className="font-semibold text-gray-700">Latitude:</span>
                                <span className="text-gray-900">{modalData.view.lat || 'N/A'}</span>
                                
                                <span className="font-semibold text-gray-700">Longitude:</span>
                                <span className="text-gray-900">{modalData.view.lon || 'N/A'}</span>
                                
                                <span className="font-semibold text-gray-700">Range:</span>
                                <span className="text-gray-900">{modalData.view.range ? `${modalData.view.range} km` : 'N/A'}</span>
                                
                                <span className="font-semibold text-gray-700">Survey survey_limit:</span>
                                <span className="text-gray-900">{modalData.view.survey_limit || 'N/A'}</span>
                                
                                <span className="font-semibold text-gray-700">Surveys Filled:</span>
                                <span className="text-gray-900">{modalData.view.surveyfilled || 0}</span>
                            </div>

                            {modalData.view.survey_limit > 0 && (
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{((modalData.view.surveyfilled || 0) / modalData.view.survey_limit * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                (modalData.view.surveyfilled || 0) >= modalData.view.survey_limit 
                                                    ? 'bg-red-500' 
                                                    : ((modalData.view.surveyfilled || 0) / modalData.view.survey_limit) >= 0.75
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(((modalData.view.surveyfilled || 0) / modalData.view.survey_limit * 100), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => closeModal('view')}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!modalData.edit} onOpenChange={() => closeModal('edit')}>
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Booth (ID: {modalData.edit?.zone_id})</DialogTitle>
                        <DialogDescription>Update the details for this Zone.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <label className="block text-sm font-medium">
                            Booth Name
                            <Input 
                                className="mt-1" 
                                value={editFormData.zone_name} 
                                onChange={(e) => setEditFormData({...editFormData, zone_name: e.target.value})} 
                                disabled={isSubmitting}
                            />
                        </label>
                        
                        <label className="block text-sm font-medium">
                            Range (in kilometers)
                            <Input 
                                className="mt-1" 
                                type="number"
                                step="any"
                                min="0"
                                value={editFormData.range} 
                                onChange={(e) => setEditFormData({...editFormData, range: e.target.value})} 
                                disabled={isSubmitting}
                                placeholder="Enter range in km"
                            />
                        </label>

                        <label className="block text-sm font-medium">
                            Survey per Booth
                            <Input 
                                className="mt-1" 
                                type="number"
                                step="1"
                                min="0"
                                value={editFormData.survey_limit} 
                                onChange={(e) => setEditFormData({...editFormData, survey_limit: e.target.value})} 
                                disabled={isSubmitting}
                                placeholder="Enter survey survey_limit"
                            />
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

            {/* Bulk Delete Confirmation Modal */}
            <Dialog open={!!modalData.bulkDelete} onOpenChange={() => closeModal('bulkDelete')}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Trash2 className="mr-2 text-red-600"/>
                            Delete Multiple Zones
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete {modalData.bulkDelete?.length} zone(s).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto py-4">
                        <h4 className="font-semibold mb-3 text-gray-700">Zones to be deleted:</h4>
                        <ul className="space-y-2">
                            {modalData.bulkDelete?.map((zone, index) => (
                                <li key={zone.zone_id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="font-medium text-gray-600 min-w-[30px]">{index + 1}.</span>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800">{zone.zone_name}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 text-xs">
                                                {zone.vidhan_name}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-0 text-xs">
                                                {zone.lok_name}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-0 text-xs">
                                                {zone.state}
                                            </Badge>
                                            <span className="text-xs text-gray-500">ID: {zone.zone_id}</span>
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
                            {isBulkDeleting ? 'Deleting...' : `Delete ${modalData.bulkDelete?.length} Zone(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllZones;