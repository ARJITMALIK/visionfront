import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, ChevronRight, FileText, CheckSquare, AlertTriangle, Eye, Pencil, X, Circle, MoreHorizontal, Plus, Trash2
} from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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

// DUMMY DATA mimicking the image content and structure
const notificationsData = [
    { id: 11, title: 'Pending Data', detail: 'This is the detail for pending data.', status: 'Active', updatedOn: '2024-08-13 09:17:55' },
    { id: 8, title: '"फोटो पासपोर्ट साइजचा काढा."', detail: 'Detailed instructions about the photo.', status: 'Active', updatedOn: '2024-08-12 08:48:32' },
];

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

const AllNotifications = () => {
    const navigate = useNavigate(); // This is correctly set up
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalData, setModalData] = useState({ view: null, edit: null, delete: null });
    
    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? notificationsData.map(n => n.id) : []);
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const openModal = (type, data) => {
        setModalData(prev => ({ ...prev, [type]: data }));
    };

    const closeModal = (type) => {
        setModalData(prev => ({ ...prev, [type]: null }));
    };

    // --- THIS IS THE CHANGE ---
    // Update this function to navigate to the correct route
    const handleAddNew = () => {
        navigate('/addnotification');
    };
    
    const confirmDelete = () => {
        console.log("Deleting notification:", modalData.delete);
        alert(`Notification with ID ${modalData.delete.id} deleted! (simulated)`);
        closeModal('delete');
    };

    const handleBulkAction = (action) => {
        if (selectedRows.length === 0) {
            alert("Please select rows to perform a bulk action.");
            return;
        }
        console.log(`Performing bulk action "${action}" on rows:`, selectedRows);
        alert(`Bulk action "${action}" triggered for selected rows. Check console.`);
    };
    
    const handleSaveChanges = (editedData) => {
        console.log("Saving changes for notification:", editedData);
        alert(`Changes for notification ID ${editedData.id} saved! (simulated)`);
        closeModal('edit');
    };

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Notification</h1>
                        <p className="text-sm text-gray-500">Notification</p>
                    </div>
                    <div className="p-2 bg-gray-200 rounded-md">
                       <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Home className="h-4 w-4 text-brand-secondary" />
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-brand-secondary">Notification</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">Notification</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total" value="2" icon={FileText} iconBgClass="bg-brand-primary" textColorClass="text-brand-primary" />
                    <StatCard title="Active" value="2" icon={CheckSquare} iconBgClass="bg-brand-green" textColorClass="text-brand-green" />
                    <StatCard title="Inactive" value="0" icon={AlertTriangle} iconBgClass="bg-brand-orange" textColorClass="text-brand-orange" />
                </div>

                {/* Main Table Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <CardTitle className="text-lg font-semibold">Notification (Total Record: 2)</CardTitle>
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
                                        <TableHead className="w-[50px] px-4"><Checkbox onCheckedChange={handleSelectAll} checked={selectedRows.length === notificationsData.length && notificationsData.length > 0} /></TableHead>
                                        <TableHead className="font-bold text-black">Id</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Updated On</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notificationsData.map((n) => (
                                        <TableRow key={n.id}>
                                            <TableCell className="px-4"><Checkbox onCheckedChange={() => handleSelectRow(n.id)} checked={selectedRows.includes(n.id)} /></TableCell>
                                            <TableCell className="font-medium">{n.id}</TableCell>
                                            <TableCell>{n.title}</TableCell>
                                            <TableCell>{n.status}</TableCell>
                                            <TableCell><Badge className="bg-brand-orange text-white hover:bg-brand-orange">{n.updatedOn}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal('view', n)}><Eye className="h-4 w-4" /></Button>
                                                    <Button size="icon" className="h-8 w-8 bg-action-blue hover:bg-action-blue-dark text-white" onClick={() => openModal('edit', n)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button size="icon" className="h-8 w-8 bg-brand-primary hover:bg-brand-primary-dark text-white" onClick={() => openModal('delete', n)}><X className="h-4 w-4" /></Button>
                                                    <Button size="icon" className="h-8 w-8 bg-brand-green hover:bg-brand-green-dark text-white" onClick={() => alert(`Toggling status for ID: ${n.id}`)}><Circle className="h-4 w-4" /></Button>
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
                    <DialogHeader><DialogTitle>View Notification Details (ID: {modalData.view?.id})</DialogTitle></DialogHeader>
                    {modalData.view && <div className="py-4 space-y-2 text-sm"><p><span className="font-semibold">Title:</span> {modalData.view.title}</p><div className="prose max-w-none"><span className="font-semibold">Detail:</span><div dangerouslySetInnerHTML={{ __html: modalData.view.detail }} /></div><p><span className="font-semibold">Status:</span> {modalData.view.status}</p><p><span className="font-semibold">Last Updated:</span> {modalData.view.updatedOn}</p></div>}
                    <DialogFooter><Button variant="outline" onClick={() => closeModal('view')}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!modalData.edit} onOpenChange={() => closeModal('edit')}>
                 <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader><DialogTitle>Edit Notification (ID: {modalData.edit?.id})</DialogTitle><DialogDescription>This form allows you to edit the notification details.</DialogDescription></DialogHeader>
                    {modalData.edit && <EditNotificationForm data={modalData.edit} onSave={handleSaveChanges} onCancel={() => closeModal('edit')} />}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!modalData.delete} onOpenChange={() => closeModal('delete')}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="flex items-center"><Trash2 className="mr-2 text-brand-primary"/> Are you sure?</DialogTitle><DialogDescription>This will permanently delete the notification "{modalData.delete?.title}" (ID: {modalData.delete?.id}). This action cannot be undone.</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => closeModal('delete')}>Cancel</Button><Button className="bg-brand-primary text-white" onClick={confirmDelete}>Confirm Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// A separate form component for the edit modal to manage its own state
const EditNotificationForm = ({ data, onSave, onCancel }) => {
    const [title, setTitle] = useState(data.title);
    const [detail, setDetail] = useState(data.detail);

    const handleSubmit = () => {
        onSave({ ...data, title, detail });
    };

    return (
        <div className="py-4 space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Detail</label>
                <CKEditor
                    editor={ClassicEditor}
                    data={detail}
                    onChange={(event, editor) => setDetail(editor.getData())}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button className="bg-brand-primary text-white" onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};

export default AllNotifications;