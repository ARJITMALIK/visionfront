import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, ChevronRight, FileText, CheckCircle2, AlertTriangle, Plus, Eye, Pencil, X, Circle, MoreHorizontal, Trash2, GripVertical, PlusCircle, Loader2, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ~~~ IMPORTS (shadcn/ui & form libraries) ~~~
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster, toast } from 'sonner';

// ~~~ IMPORTS (form & dnd-kit) ~~~
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { VisionBase } from '@/utils/axiosInstance'; // Assuming this is your configured axios instance


// =================================================================================
// Helper function to get question type display
// =================================================================================
const getQuestionTypeDisplay = (queType) => {
  switch (queType) {
    case 0:
      return { label: 'Single Answer', color: 'bg-blue-100 text-blue-800' };
    case 1:
      return { label: 'Multiple Answer', color: 'bg-green-100 text-green-800' };
    case 2:
      return { label: 'Emoji Based', color: 'bg-yellow-100 text-yellow-800' };
    case 3:
      return { label: 'Dynamic', color: 'bg-purple-100 text-purple-800' };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  }
};

// =================================================================================
// Edit Dialog Component and its helpers
// =================================================================================

const editFormSchema = z.object({
  question_title: z.string().min(10, "Question title must be at least 10 characters long."),
});

// Sortable item for Drag-and-Drop options with image support
function SortableOptionItem({ id, text, img, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform?.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 mb-2 bg-slate-100 dark:bg-slate-800 rounded-md">
      <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab p-1">
        <GripVertical className="h-5 w-5 text-slate-500" />
      </button>
      {img && (
        <img src={img} alt={text} className="w-6 h-6 object-contain flex-shrink-0" />
      )}
      <span className="flex-grow">{text}</span>
      <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(id)} aria-label="Delete option">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}

const EditQuestionDialog = ({ questionData, onOpenChange, onUpdateSuccess }) => {
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialOptions, setInitialOptions] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  
  const form = useForm({
    resolver: zodResolver(editFormSchema),
    defaultValues: { question_title: "" },
  });

  // Populate form when questionData changes
  useEffect(() => {
    if (questionData) {
      form.reset({ question_title: questionData.question });
      const loadedOptions = Object.values(questionData.options || {}).sort((a,b) => a.order - b.order).map(opt => ({
        id: `option-${opt.order}-${Math.random()}`, // Create a unique ID for dnd-kit
        text: opt.option,
        img: opt.img || null // Include image if it exists
      }));
      setOptions(loadedOptions);
      setInitialOptions(loadedOptions); // Store initial state for comparison
    }
  }, [questionData, form]);

  const handleAddOption = () => {
    if (newOptionText.trim() === "") return;
    setOptions(prev => [...prev, { id: `option-${Date.now()}`, text: newOptionText.trim(), img: null }]);
    setNewOptionText("");
  };

  const handleDeleteOption = (idToDelete) => {
    setOptions(prev => prev.filter(option => option.id !== idToDelete));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const onSubmit = async (values) => {
    if (options.length < 2) {
      toast.error("Please provide at least two options.");
      return;
    }
    
    setIsLoading(true);
    const payload = {};

    // 1. Check if question title has changed
    if (values.question_title !== questionData.question) {
      payload.question = values.question_title;
    }

    // 2. Check if options have changed (order, content, count, images)
    const newOptionsArray = options.map(o => ({ text: o.text, img: o.img }));
    const initialOptionsArray = initialOptions.map(o => ({ text: o.text, img: o.img }));
    if (JSON.stringify(newOptionsArray) !== JSON.stringify(initialOptionsArray)) {
      payload.options = newOptionsArray.reduce((acc, opt, index) => {
        const optionData = { option: opt.text, order: index + 1 };
        if (opt.img) {
          optionData.img = opt.img;
        }
        acc[`option_${index}`] = optionData;
        return acc;
      }, {});
    }

    // If nothing changed, just close the modal.
    if (Object.keys(payload).length === 0) {
      toast.info("No changes were made.");
      onOpenChange(false); // Close modal
      setIsLoading(false);
      return;
    }

    try {
      await VisionBase.put(`/question/${questionData.que_id}`, payload);
      toast.success("Question updated successfully!");
      // Construct the fully updated question object to pass back to the parent
      const updatedQuestionForState = {
        ...questionData,
        question: payload.question || questionData.question,
        options: payload.options || questionData.options,
      };
      onUpdateSuccess(updatedQuestionForState);
    } catch (error) {
      console.error("API Error on update:", error);
      toast.error(error.response?.data?.message || "Failed to update question.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!questionData} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Modify the question title and manage its options. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField control={form.control} name="question_title" render={({ field }) => (
              <FormItem>
                <FormLabel>Question Title</FormLabel>
                <FormControl><Input placeholder="e.g., Who is your preferred candidate?" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-4">
              <FormLabel>Options</FormLabel>
              <div className="flex gap-2">
                <Input placeholder="Add a new option" value={newOptionText} onChange={(e) => setNewOptionText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }} />
                <Button type="button" onClick={handleAddOption} variant="outline"><PlusCircle className="h-4 w-4 mr-2" />Add</Button>
              </div>
              <div className="p-4 border rounded-md min-h-[100px] bg-slate-50 dark:bg-slate-900">
                {options.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
                      {options.map(option => <SortableOptionItem key={option.id} id={option.id} text={option.text} img={option.img} onDelete={handleDeleteOption} />)}
                    </SortableContext>
                  </DndContext>
                ) : <p className="text-sm text-center text-slate-500">No options added.</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


// =================================================================================
// Main AllQuestions Component
// =================================================================================
const StatCard = ({ icon, title, value, colorClass }) => {
    const IconComponent = icon;
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${colorClass.bg}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className={`text-lg font-bold ${colorClass.text}`}>{title}</p>
                    <p className="text-gray-500 font-medium">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const AllQuestions = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('all');
    const [loading, setLoading] = useState(true);
    const [electionsLoading, setElectionsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleteModalData, setDeleteModalData] = useState(null);
    const [previewModalData, setPreviewModalData] = useState(null);
    const [editModalData, setEditModalData] = useState(null); // State for edit dialog

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch elections on component mount
    useEffect(() => {
        const fetchElections = async () => {
            try {
                setElectionsLoading(true);
                const response = await VisionBase.get('/elections');
                console.log('Elections API Response:', response.data); // Debug log
                setElections(response.data.data?.rows || response.data.data || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch elections:", err);
                toast.error('Failed to fetch elections. Please try again.');
            } finally {
                setElectionsLoading(false);
            }
        };
        fetchElections();
    }, []);

    // Fetch questions when component mounts or when selected election changes
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                // Build the API URL with election_id parameter if an election is selected
                let url = '/questions';
                if (selectedElection && selectedElection !== 'all') {
                    url += `?election_id=${selectedElection}`;
                }
                
                console.log('Fetching questions with URL:', url); // Debug log
                console.log('Selected election ID:', selectedElection); // Debug log
                
                const response = await VisionBase.get(url);
                console.log('Questions API Response:', response.data); // Debug log
                setQuestions(response.data.data.rows || []);
                setError(null);
                // Reset to first page when filter changes
                setCurrentPage(1);
                // Clear selected rows when filter changes
                setSelectedRows([]);
            } catch (err) {
                setError('Failed to fetch questions. Please ensure the API is running and accessible.');
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [selectedElection]);

    const totalPages = Math.ceil(questions.length / itemsPerPage);
    const currentQuestions = useMemo(() => questions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [questions, currentPage]);
    const handleSelectAll = (checked) => setSelectedRows(checked ? currentQuestions.map(q => q.que_id) : []);
    const handleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);

    const handleAddNew = () => navigate('/addquestions');
    const handleEditClick = (question) => setEditModalData(question);
    const handleDeleteClick = (question) => setDeleteModalData(question);

    const handleElectionChange = (electionId) => {
        console.log('Election changed to:', electionId); // Debug log
        setSelectedElection(electionId);
    };

    const handleUpdateSuccess = (updatedQuestion) => {
        setQuestions(prev => prev.map(q => q.que_id === updatedQuestion.que_id ? updatedQuestion : q));
        setEditModalData(null); // Close the modal
    };

    const confirmDelete = async () => {
        if (!deleteModalData) return;
        try {
            await VisionBase.delete(`question/${deleteModalData.que_id}`);
            setQuestions(prev => prev.filter(q => q.que_id !== deleteModalData.que_id));
            setDeleteModalData(null);
            toast.success("Question deleted successfully.");
        } catch (err) {
            console.error("Failed to delete question:", err);
            toast.error("Failed to delete question. Please try again.");
        }
    };
    
    const handleToggleStatus = (question) => alert(`Toggling status for question ID: ${question.que_id} (API call not implemented)`);
    const handleBulkAction = (action) => alert(`Bulk action "${action}" triggered for selected rows: ${selectedRows.join(', ')}`);
    const statCounts = useMemo(() => ({
        total: questions.length,
        active: questions.filter(q => q.status).length,
        inactive: questions.filter(q => !q.status).length,
    }), [questions]);

    // Fixed: Use consistent field names for finding the selected election
    const selectedElectionName = elections.find(election => 
        (election.id && election.id.toString() === selectedElection) || 
        (election.election_id && election.election_id.toString() === selectedElection)
    )?.election_name || elections.find(election => 
        (election.id && election.id.toString() === selectedElection) || 
        (election.election_id && election.election_id.toString() === selectedElection)
    )?.name || 'All Elections';

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <Toaster richColors position="top-right" />
            <div className="max-w-7xl mx-auto">
                {/* Header & Breadcrumbs */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Questions</h1>
                        <p className="text-sm text-gray-500">Manage all survey questions</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-md">
                       <FileText className="h-6 w-6 text-brand-primary" />
                    </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Home className="h-4 w-4 text-brand-secondary" />
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-brand-secondary">Question</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">All Questions</span>
                </div>

                {/* Election Filter */}
                <Card className="shadow-sm mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-brand-primary" />
                                <span className="font-medium text-gray-700">Filter by Election:</span>
                            </div>
                            <div className="min-w-[250px]">
                                <Select value={selectedElection} onValueChange={handleElectionChange} disabled={electionsLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={electionsLoading ? "Loading elections..." : "Select an election"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Elections</SelectItem>
                                        {elections.map((election) => {
                                            // Use the correct field names - try multiple possibilities for ID and name
                                            const electionId = election.id || election.election_id || election.selectedElection;
                                            const electionName = election.election_name || election.name;
                                            
                                            return (
                                                <SelectItem key={electionId} value={electionId?.toString()}>
                                                    {electionName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedElection && selectedElection !== 'all' && (
                                <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary">
                                    Filtered: {selectedElectionName}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard icon={FileText} title="Total" value={loading ? '...' : statCounts.total} colorClass={{ bg: 'bg-brand-primary', text: 'text-brand-primary' }} />
                    <StatCard icon={CheckCircle2} title="Active" value={loading ? '...' : statCounts.active} colorClass={{ bg: 'bg-brand-green', text: 'text-brand-green' }} />
                    <StatCard icon={AlertTriangle} title="Inactive" value={loading ? '...' : statCounts.inactive} colorClass={{ bg: 'bg-brand-orange', text: 'text-brand-orange' }} />
                </div>

                {/* Main Table Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <CardTitle className="text-lg font-semibold">
                            Question List (Total: {questions.length})
                            {selectedElection && selectedElection !== 'all' && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    - {selectedElectionName}
                                </span>
                            )}
                        </CardTitle>
                        <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark" onClick={handleAddNew}>
                            <Plus className="h-4 w-4 mr-2" /> Add New
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-100">
                                        <TableHead className="w-[50px] px-4"><Checkbox onCheckedChange={handleSelectAll} checked={currentQuestions.length > 0 && selectedRows.length === currentQuestions.length} /></TableHead>
                                        <TableHead>Id</TableHead>
                                        <TableHead className="min-w-[300px]">Question</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? <TableRow><TableCell colSpan={6} className="text-center py-10">Loading questions...</TableCell></TableRow>
                                    : error ? <TableRow><TableCell colSpan={6} className="text-center py-10 text-red-500">{error}</TableCell></TableRow>
                                    : currentQuestions.length > 0 ? (
                                        currentQuestions.map(q => {
                                            const typeDisplay = getQuestionTypeDisplay(q.que_type);
                                            return (
                                                <TableRow key={q.que_id} className="hover:bg-gray-50">
                                                    <TableCell className="px-4"><Checkbox onCheckedChange={() => handleSelectRow(q.que_id)} checked={selectedRows.includes(q.que_id)}/></TableCell>
                                                    <TableCell>{q.que_id}</TableCell>
                                                    <TableCell className="max-w-md truncate font-medium">{q.question}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={`${typeDisplay.color} border-0`}>
                                                            {typeDisplay.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell><Badge variant={q.status ? 'default' : 'destructive'} className={q.status ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-brand-orange hover:bg-brand-orange/90'}>{q.status ? 'Active' : 'Inactive'}</Badge></TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-1">
                                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPreviewModalData(q)}><Eye className="h-4 w-4"/></Button>
                                                            <Button size="icon" className="h-8 w-8 bg-brand-blue hover:bg-brand-blue/90" onClick={() => handleEditClick(q)}><Pencil className="h-4 w-4"/></Button>
                                                            <Button size="icon" className="h-8 w-8 bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleDeleteClick(q)}><X className="h-4 w-4"/></Button>
                                                            <Button size="icon" className="h-8 w-8 bg-brand-green hover:bg-brand-green/90" onClick={() => handleToggleStatus(q)}><Circle className="h-4 w-4"/></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : <TableRow><TableCell colSpan={6} className="text-center py-10">
                                        {selectedElection && selectedElection !== 'all' ? 
                                            `No questions found for ${selectedElectionName}.` : 
                                            'No questions found.'
                                        }
                                    </TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <div className="px-4 py-4 flex flex-wrap gap-4 justify-between items-center border-t">
                        <div>
                            {selectedRows.length > 0 && (
                                <div className="flex items-center space-x-2">
                                     <span className="text-sm text-gray-600">{selectedRows.length} selected</span>
                                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-md bg-brand-primary" onClick={() => handleBulkAction('action_circle')}><Circle className="h-4 w-4"/></Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-md bg-brand-primary" onClick={() => handleBulkAction('action_more')}><MoreHorizontal className="h-4 w-4"/></Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-md bg-brand-primary" onClick={() => handleBulkAction('delete')}><X className="h-4 w-4"/></Button>
                                </div>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p-1)); }} /></PaginationItem>
                                    {[...Array(totalPages).keys()].map(i => (
                                        <PaginationItem key={i}><PaginationLink href="#" isActive={currentPage === i+1} onClick={(e) => {e.preventDefault(); setCurrentPage(i+1);}}>{i+1}</PaginationLink></PaginationItem>
                                    ))}
                                    <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p+1)); }} /></PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </Card>
            </div>

            {/* --- DIALOGS --- */}
            <EditQuestionDialog 
                questionData={editModalData} 
                onOpenChange={() => setEditModalData(null)}
                onUpdateSuccess={handleUpdateSuccess}
            />

            <Dialog open={!!previewModalData} onOpenChange={() => setPreviewModalData(null)}>
                <DialogContent className="sm:max-w-2xl sm:max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-brand-primary">Question Preview</DialogTitle>
                        <DialogDescription className="pt-2 text-lg text-gray-800">{previewModalData?.question}</DialogDescription>
                    </DialogHeader>
                    <div>
                        <div className="mb-4">
                            <span className="text-sm font-medium text-gray-600">Question Type: </span>
                            {previewModalData && (
                                <Badge variant="secondary" className={`${getQuestionTypeDisplay(previewModalData.que_type).color} border-0 ml-2`}>
                                    {getQuestionTypeDisplay(previewModalData.que_type).label}
                                </Badge>
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-700 mt-4 mb-2">Options:</h4>
                        {previewModalData?.options && Object.values(previewModalData.options).length > 0 ? (
                            <ul className="space-y-2">
                                {Object.values(previewModalData.options).sort((a, b) => a.order - b.order).map(opt => (
                                    <li key={opt.order} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                        {opt.img && (
                                            <img src={opt.img} alt={opt.option} className="w-6 h-6 object-contain flex-shrink-0" />
                                        )}
                                        <span className="text-gray-600">{opt.option}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500">No options available.</p>}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setPreviewModalData(null)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteModalData} onOpenChange={() => setDeleteModalData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center"><Trash2 className="mr-2 text-brand-primary"/>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>This action cannot be undone. This will permanently delete the question: <br/> <span className="font-semibold">"{deleteModalData?.question}"</span>.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalData(null)}>Cancel</Button>
                        <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark" onClick={confirmDelete}>Confirm Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllQuestions;