import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, ChevronRight, FileText, CheckCircle2, AlertTriangle, Plus, Eye, Pencil, X, Circle, MoreHorizontal, Trash2, GripVertical, PlusCircle, Loader2, Filter, ChevronDown, ChevronRight as ChevronRightIcon, Users, Vote
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ~~~ IMPORTS (form & dnd-kit) ~~~
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { VisionBase } from '@/utils/axiosInstance';

// Helper function to remove apostrophes
const removeApostrophes = (text) => text.replace(/'/g, "");

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
    case 4:
      return { label: 'Multilevel', color: 'bg-pink-100 text-pink-800' };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  }
};

// =================================================================================
// Edit Dialog Component and its helpers
// =================================================================================

const editFormSchema = z.object({
  question_title: z.string().min(1, "Question title must be at least 1 characters long."),
});

// --- Emoji Selection Component for Edit ---
function EmojiSelectorEdit({ availableEmojis, selectedOptions, onSelectionChange }) {
  const handleEmojiToggle = (emoji, checked) => {
    if (checked) {
      const newOption = {
        id: `emoji-${emoji.title}-${Date.now()}`,
        text: removeApostrophes(emoji.title),
        img: emoji.img,
      };
      onSelectionChange([...selectedOptions, newOption]);
    } else {
      onSelectionChange(
        selectedOptions.filter((opt) => opt.text !== removeApostrophes(emoji.title))
      );
    }
  };

  const isSelected = (emoji) =>
    selectedOptions.some((opt) => opt.text === removeApostrophes(emoji.title));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900 max-h-60 overflow-y-auto">
      {availableEmojis.map((emoji, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
        >
          <Checkbox
            id={`emoji-edit-${index}`}
            checked={isSelected(emoji)}
            onCheckedChange={(checked) => handleEmojiToggle(emoji, checked)}
          />
          <img
            src={emoji.img}
            alt={emoji.title}
            className="w-6 h-6 object-contain"
          />
          <label
            htmlFor={`emoji-edit-${index}`}
            className="text-sm font-medium cursor-pointer truncate"
            title={emoji.title}
          >
            {emoji.title}
          </label>
        </div>
      ))}
    </div>
  );
}

// --- Dynamic Options Selector Component for Edit ---
function DynamicOptionSelectorEdit({
  parties,
  candidates,
  vidhans,
  selectedOptions,
  onSelectionChange,
}) {
  const [selectedVidhanId, setSelectedVidhanId] = useState("");

  const handlePartyToggle = (party, checked) => {
    if (checked) {
      const newOption = {
        id: `party-${party.party_id}-${Date.now()}`,
        text: removeApostrophes(party.party_name),
        img: party.party_logo,
        type: "party",
        originalId: party.party_id,
      };
      onSelectionChange([...selectedOptions, newOption]);
    } else {
      onSelectionChange(
        selectedOptions.filter(
          (opt) => !(opt.type === "party" && opt.originalId === party.party_id)
        )
      );
    }
  };

  const handleCandidateToggle = (candidate, checked) => {
    if (checked) {
      const newOption = {
        id: `candidate-${candidate.candidate_id}-${Date.now()}`,
        text: removeApostrophes(candidate.candidate_name),
        type: "candidate",
        originalId: candidate.candidate_id,
        partyName: removeApostrophes(candidate.party_name || ""),
        vidhanId: candidate.vidhan_id,
      };
      onSelectionChange([...selectedOptions, newOption]);
    } else {
      onSelectionChange(
        selectedOptions.filter(
          (opt) =>
            !(
              opt.type === "candidate" &&
              opt.originalId === candidate.candidate_id
            )
        )
      );
    }
  };

  const isPartySelected = (party) =>
    selectedOptions.some(
      (opt) => opt.type === "party" && opt.originalId === party.party_id
    );

  const isCandidateSelected = (candidate) =>
    selectedOptions.some(
      (opt) =>
        opt.type === "candidate" && opt.originalId === candidate.candidate_id
    );

  const filteredCandidates = selectedVidhanId
    ? candidates.filter(
        (candidate) => candidate.vidhan_id?.toString() === selectedVidhanId
      )
    : [];

  return (
    <Tabs defaultValue="parties" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="parties" className="flex items-center gap-2">
          <Vote className="h-4 w-4" />
          Parties ({parties.length})
        </TabsTrigger>
        <TabsTrigger
          value="candidates"
          className="flex items-center gap-2"
          onClick={() => setSelectedVidhanId("")}
        >
          <Users className="h-4 w-4" />
          Candidates ({candidates.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="parties">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900 max-h-60 overflow-y-auto">
          {parties.map((party) => (
            <div
              key={party.party_id}
              className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              <Checkbox
                id={`party-edit-${party.party_id}`}
                checked={isPartySelected(party)}
                onCheckedChange={(checked) => handlePartyToggle(party, checked)}
              />
              {party.party_logo && (
                <img
                  src={party.party_logo}
                  alt={party.party_name}
                  className="w-8 h-8 object-contain rounded"
                />
              )}
              <label
                htmlFor={`party-edit-${party.party_id}`}
                className="text-sm font-medium cursor-pointer truncate flex-grow"
                title={party.party_name}
              >
                {party.party_name}
              </label>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="candidates">
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
            <label className="block text-sm font-medium mb-2">
              Select Vidhan Sabha *
            </label>
            <Select value={selectedVidhanId} onValueChange={setSelectedVidhanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a Vidhan Sabha" />
              </SelectTrigger>
              <SelectContent>
                {vidhans.map((vidhan) => (
                  <SelectItem
                    key={vidhan.vidhan_id}
                    value={vidhan.vidhan_id.toString()}
                  >
                    {vidhan.vidhan_name} - {vidhan.lok_name} ({vidhan.state})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVidhanId ? (
            filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 p-4 border rounded-md bg-slate-50 dark:bg-slate-900 max-h-60 overflow-y-auto">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.candidate_id}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                  >
                    <Checkbox
                      id={`candidate-edit-${candidate.candidate_id}`}
                      checked={isCandidateSelected(candidate)}
                      onCheckedChange={(checked) =>
                        handleCandidateToggle(candidate, checked)
                      }
                    />
                    <div className="flex-grow">
                      <label
                        htmlFor={`candidate-edit-${candidate.candidate_id}`}
                        className="text-sm font-medium cursor-pointer block"
                      >
                        {candidate.candidate_name}
                      </label>
                      {candidate.party_name && (
                        <span className="text-xs text-slate-500">
                          Party: {candidate.party_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                <p className="text-sm text-center text-slate-500">
                  No candidates found for the selected Vidhan Sabha.
                </p>
              </div>
            )
          ) : (
            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
              <p className="text-sm text-center text-slate-500">
                Please select a Vidhan Sabha to view candidates.
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Sortable child option item
function SortableChildOptionItem({ id, text, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform?.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 mb-2 bg-slate-200 dark:bg-slate-700 rounded-md ml-8">
      <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab p-1">
        <GripVertical className="h-4 w-4 text-slate-500" />
      </button>
      <span className="flex-grow text-sm">{text}</span>
      <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(id)} aria-label="Delete child option">
        <Trash2 className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  );
}

// Sortable parent option with children
function SortableParentOptionItem({ id, text, children, onDelete, onAddChild, onDeleteChild, onReorderChildren }) {
  const [isOpen, setIsOpen] = useState(true);
  const [childText, setChildText] = useState("");
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform?.toString(transform), transition };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddChild = () => {
    if (childText.trim() === "") {
      toast.error("Child option text cannot be empty.");
      return;
    }
    onAddChild(id, removeApostrophes(childText.trim()));
    setChildText("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = children.findIndex((item) => item.id === active.id);
      const newIndex = children.findIndex((item) => item.id === over.id);
      onReorderChildren(id, oldIndex, newIndex);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
      <div className="flex items-center gap-2">
        <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab p-1">
          <GripVertical className="h-5 w-5 text-slate-500" />
        </button>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-grow">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <span className="font-medium">{text}</span>
              <span className="text-xs text-slate-500">({children.length} children)</span>
            </div>
          </div>
          <CollapsibleContent className="mt-3 space-y-2">
            {children.length > 0 && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={children.map((child) => child.id)} strategy={verticalListSortingStrategy}>
                  {children.map((child) => (
                    <SortableChildOptionItem key={child.id} id={child.id} text={child.text} onDelete={() => onDeleteChild(id, child.id)} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            <div className="flex gap-2 ml-8 mt-2">
              <Input placeholder="Add child option" value={childText} onChange={(e) => setChildText(removeApostrophes(e.target.value))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddChild(); } }} className="text-sm h-8" />
              <Button type="button" onClick={handleAddChild} variant="outline" size="sm" className="h-8">
                <PlusCircle className="h-3 w-3 mr-1" />Add
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(id)} aria-label="Delete parent option">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

// Sortable item for Drag-and-Drop options with image support
function SortableOptionItem({ id, text, img, onDelete, type }) {
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
      {type && (
        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
          {type}
        </span>
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
  const [questionType, setQuestionType] = useState(null);

  // State for dynamic data
  const [availableEmojis, setAvailableEmojis] = useState([]);
  const [parties, setParties] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [vidhans, setVidhans] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  
  const form = useForm({
    resolver: zodResolver(editFormSchema),
    defaultValues: { question_title: "" },
  });

  // Fetch data for emoji and dynamic questions
  useEffect(() => {
    const fetchData = async () => {
      if (!questionData) return;
      
      const queType = questionData.que_type;
      
      // Fetch emojis for emoji-based questions
      if (queType === 2) {
        try {
          setIsLoadingData(true);
          const emojisResponse = await VisionBase.get("/emojis");
          if (emojisResponse.data?.data?.rows) {
            setAvailableEmojis(emojisResponse.data.data.rows);
          }
        } catch (error) {
          console.error("Failed to fetch emojis:", error);
        } finally {
          setIsLoadingData(false);
        }
      }

      // Fetch parties, candidates, and vidhans for dynamic questions
      if (queType === 3) {
        try {
          setIsLoadingData(true);
          const [partiesRes, candidatesRes, vidhansRes] = await Promise.all([
            VisionBase.get("/parties"),
            VisionBase.get("/candidates"),
            VisionBase.get("/vidhans"),
          ]);

          if (partiesRes.data?.data?.rows) {
            setParties(partiesRes.data.data.rows);
          }
          if (candidatesRes.data?.data?.rows) {
            setCandidates(candidatesRes.data.data.rows);
          }
          if (vidhansRes.data?.data?.rows) {
            setVidhans(vidhansRes.data.data.rows);
          }
        } catch (error) {
          console.error("Failed to fetch dynamic data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [questionData]);

  // Populate form when questionData changes
  useEffect(() => {
    if (questionData) {
      form.reset({ question_title: questionData.question });
      const queType = questionData.que_type;
      setQuestionType(queType);

      if (queType === 4) {
        // Multilevel questions
        const loadedOptions = Object.values(questionData.options || {})
          .sort((a, b) => a.order - b.order)
          .map(opt => ({
            id: `parent-${opt.order}-${Math.random()}`,
            text: opt.option,
            children: (opt.children || []).map((child, childIndex) => ({
              id: `child-${opt.order}-${childIndex}-${Math.random()}`,
              text: child.option,
            })),
          }));
        setOptions(loadedOptions);
        setInitialOptions(JSON.parse(JSON.stringify(loadedOptions)));
      } else if (queType === 2) {
        // Emoji-based questions
        const loadedOptions = Object.values(questionData.options || {})
          .sort((a, b) => a.order - b.order)
          .map(opt => ({
            id: `emoji-${opt.option}-${Math.random()}`,
            text: opt.option,
            img: opt.img || null,
          }));
        setOptions(loadedOptions);
        setInitialOptions(loadedOptions);
      } else if (queType === 3) {
        // Dynamic questions
        const loadedOptions = Object.values(questionData.options || {})
          .sort((a, b) => a.order - b.order)
          .map(opt => ({
            id: `${opt.type || 'option'}-${opt.originalId || Date.now()}-${Math.random()}`,
            text: opt.option,
            img: opt.img || null,
            type: opt.type || null,
            originalId: opt.originalId || null,
            partyName: opt.partyName || null,
            vidhanId: opt.vidhanId || null,
          }));
        setOptions(loadedOptions);
        setInitialOptions(loadedOptions);
      } else {
        // Regular questions
        const loadedOptions = Object.values(questionData.options || {})
          .sort((a, b) => a.order - b.order)
          .map(opt => ({
            id: `option-${opt.order}-${Math.random()}`,
            text: opt.option,
            img: opt.img || null,
          }));
        setOptions(loadedOptions);
        setInitialOptions(loadedOptions);
      }
    }
  }, [questionData, form]);

  const handleAddOption = () => {
    if (newOptionText.trim() === "") {
      toast.error("Option text cannot be empty.");
      return;
    }

    if (questionType === 4) {
      const newOption = {
        id: `parent-${Date.now()}`,
        text: removeApostrophes(newOptionText.trim()),
        children: [],
      };
      setOptions((prev) => [...prev, newOption]);
    } else {
      setOptions(prev => [...prev, { id: `option-${Date.now()}`, text: removeApostrophes(newOptionText.trim()), img: null }]);
    }
    setNewOptionText("");
  };

  const handleDeleteOption = (idToDelete) => {
    setOptions(prev => prev.filter(option => option.id !== idToDelete));
  };

  const handleAddChild = (parentId, childText) => {
    setOptions((prev) =>
      prev.map((option) => {
        if (option.id === parentId) {
          return {
            ...option,
            children: [
              ...option.children,
              { id: `child-${Date.now()}-${Math.random()}`, text: childText },
            ],
          };
        }
        return option;
      })
    );
  };

  const handleDeleteChild = (parentId, childId) => {
    setOptions((prev) =>
      prev.map((option) => {
        if (option.id === parentId) {
          return {
            ...option,
            children: option.children.filter((child) => child.id !== childId),
          };
        }
        return option;
      })
    );
  };

  const handleReorderChildren = (parentId, oldIndex, newIndex) => {
    setOptions((prev) =>
      prev.map((option) => {
        if (option.id === parentId) {
          return {
            ...option,
            children: arrayMove(option.children, oldIndex, newIndex),
          };
        }
        return option;
      })
    );
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

  const handleEmojiSelectionChange = (newSelectedOptions) => {
    setOptions(newSelectedOptions);
  };

  const handleDynamicSelectionChange = (newSelectedOptions) => {
    setOptions(newSelectedOptions);
  };

  const onSubmit = async (values) => {
    if (options.length < 2) {
      toast.error("Please provide at least two options.");
      return;
    }

    // Validate multilevel questions have children
    if (questionType === 4) {
      const hasInvalidParent = options.some(opt => !opt.children || opt.children.length === 0);
      if (hasInvalidParent) {
        toast.error("Each parent option must have at least one child option for multilevel questions.");
        return;
      }
    }
    
    setIsLoading(true);
    const payload = {};

    // 1. Check if question title has changed
    if (values.question_title !== questionData.question) {
      payload.question = values.question_title;
    }

    // 2. Check if options have changed
    let optionsChanged = false;
    
    if (questionType === 4) {
      // For multilevel, compare structure including children
      const currentStructure = JSON.stringify(options.map(o => ({
        text: o.text,
        children: o.children.map(c => c.text)
      })));
      const initialStructure = JSON.stringify(initialOptions.map(o => ({
        text: o.text,
        children: o.children.map(c => c.text)
      })));
      
      optionsChanged = currentStructure !== initialStructure;
      
      if (optionsChanged) {
        payload.options = options.reduce((acc, opt, index) => {
          acc[`option_${index}`] = {
            option: opt.text,
            order: index + 1,
            children: opt.children.map((child, childIndex) => ({
              option: child.text,
              order: childIndex + 1,
            })),
          };
          return acc;
        }, {});
      }
    } else if (questionType === 2) {
      // For emoji-based questions
      const newOptionsArray = options.map(o => ({ text: o.text, img: o.img }));
      const initialOptionsArray = initialOptions.map(o => ({ text: o.text, img: o.img }));
      optionsChanged = JSON.stringify(newOptionsArray) !== JSON.stringify(initialOptionsArray);
      
      if (optionsChanged) {
        payload.options = options.reduce((acc, opt, index) => {
          acc[`option_${index}`] = {
            option: opt.text,
            order: index + 1,
            img: opt.img,
          };
          return acc;
        }, {});
      }
    } else if (questionType === 3) {
      // For dynamic questions
      const newOptionsArray = options.map(o => ({ 
        text: o.text, 
        img: o.img,
        type: o.type,
        originalId: o.originalId,
        partyName: o.partyName,
        vidhanId: o.vidhanId,
      }));
      const initialOptionsArray = initialOptions.map(o => ({ 
        text: o.text, 
        img: o.img,
        type: o.type,
        originalId: o.originalId,
        partyName: o.partyName,
        vidhanId: o.vidhanId,
      }));
      optionsChanged = JSON.stringify(newOptionsArray) !== JSON.stringify(initialOptionsArray);
      
      if (optionsChanged) {
        payload.options = options.reduce((acc, opt, index) => {
          const optionData = {
            option: opt.text,
            order: index + 1,
          };
          if (opt.img) optionData.img = opt.img;
          if (opt.type) optionData.type = opt.type;
          if (opt.originalId) optionData.originalId = opt.originalId;
          if (opt.partyName) optionData.partyName = opt.partyName;
          if (opt.vidhanId) optionData.vidhanId = opt.vidhanId;
          
          acc[`option_${index}`] = optionData;
          return acc;
        }, {});
      }
    } else {
      // For regular options
      const newOptionsArray = options.map(o => ({ text: o.text, img: o.img }));
      const initialOptionsArray = initialOptions.map(o => ({ text: o.text, img: o.img }));
      optionsChanged = JSON.stringify(newOptionsArray) !== JSON.stringify(initialOptionsArray);
      
      if (optionsChanged) {
        payload.options = options.reduce((acc, opt, index) => {
          const optionData = { option: opt.text, order: index + 1 };
          if (opt.img) {
            optionData.img = opt.img;
          }
          acc[`option_${index}`] = optionData;
          return acc;
        }, {});
      }
    }

    // If nothing changed, just close the modal
    if (Object.keys(payload).length === 0) {
      toast.info("No changes were made.");
      onOpenChange(false);
      setIsLoading(false);
      return;
    }

    try {
      await VisionBase.put(`/question/${questionData.que_id}`, payload);
      toast.success("Question updated successfully!");
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

  const isMultilevel = questionType === 4;
  const isEmojiBased = questionType === 2;
  const isDynamic = questionType === 3;

  return (
    <Dialog open={!!questionData} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <FormLabel>{isMultilevel ? "Parent Question" : "Question Title"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={isMultilevel ? "e.g., Caste" : "e.g., Who is your preferred candidate?"} 
                    {...field} 
                    onChange={(e) => field.onChange(removeApostrophes(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-4">
              <FormLabel>{isMultilevel ? "Parent Options" : "Options"}</FormLabel>
              
              {isEmojiBased ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Select emoji options from the available choices below:
                  </p>
                  {isLoadingData ? (
                    <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                      <p className="text-sm text-center text-slate-500">Loading emoji options...</p>
                    </div>
                  ) : availableEmojis.length > 0 ? (
                    <EmojiSelectorEdit
                      availableEmojis={availableEmojis}
                      selectedOptions={options}
                      onSelectionChange={handleEmojiSelectionChange}
                    />
                  ) : (
                    <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                      <p className="text-sm text-center text-slate-500">No emoji options available.</p>
                    </div>
                  )}
                </div>
              ) : isDynamic ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Select parties and candidates from the available options below:
                  </p>
                  {isLoadingData ? (
                    <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                      <p className="text-sm text-center text-slate-500">Loading parties and candidates...</p>
                    </div>
                  ) : parties.length > 0 || candidates.length > 0 ? (
                    <DynamicOptionSelectorEdit
                      parties={parties}
                      candidates={candidates}
                      vidhans={vidhans}
                      selectedOptions={options}
                      onSelectionChange={handleDynamicSelectionChange}
                    />
                  ) : (
                    <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                      <p className="text-sm text-center text-slate-500">No parties or candidates available.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder={isMultilevel ? "Add a parent option (e.g., OBC)" : "Add a new option"} 
                    value={newOptionText} 
                    onChange={(e) => setNewOptionText(removeApostrophes(e.target.value))} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }} 
                  />
                  <Button type="button" onClick={handleAddOption} variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />Add
                  </Button>
                </div>
              )}

              <div className="p-4 border rounded-md min-h-[100px] bg-slate-50 dark:bg-slate-900">
                {options.length > 0 ? (
                  isMultilevel ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
                        {options.map(option => (
                          <SortableParentOptionItem
                            key={option.id}
                            id={option.id}
                            text={option.text}
                            children={option.children}
                            onDelete={handleDeleteOption}
                            onAddChild={handleAddChild}
                            onDeleteChild={handleDeleteChild}
                            onReorderChildren={handleReorderChildren}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
                        {options.map(option => (
                          <SortableOptionItem 
                            key={option.id} 
                            id={option.id} 
                            text={option.text} 
                            img={option.img} 
                            type={option.type}
                            onDelete={handleDeleteOption} 
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )
                ) : (
                  <p className="text-sm text-center text-slate-500">
                    {isMultilevel 
                      ? "No parent options added yet. Add parent options and then add child options to each." 
                      : isEmojiBased
                      ? "No emoji options selected yet. Choose from the options above."
                      : isDynamic
                      ? "No parties or candidates selected yet. Choose from the options above."
                      : "No options added."
                    }
                  </p>
                )}
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
    const [bulkDeleteModalData, setBulkDeleteModalData] = useState(null);
    const [previewModalData, setPreviewModalData] = useState(null);
    const [editModalData, setEditModalData] = useState(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch elections on component mount
    useEffect(() => {
        const fetchElections = async () => {
            try {
                setElectionsLoading(true);
                const response = await VisionBase.get('/elections');
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
// Fetch questions when component mounts or when selected election changes
useEffect(() => {
    const fetchQuestions = async () => {
        try {
            setLoading(true);
            let url = '/questions';
            if (selectedElection && selectedElection !== 'all') {
                url += `?election_id=${selectedElection}`;
            }
            
            const response = await VisionBase.get(url);
            // Sort questions by que_id in ascending order
            const sortedQuestions = (response.data.data.rows || []).sort((a, b) => a.que_id - b.que_id);
            setQuestions(sortedQuestions);
            setError(null);
            setCurrentPage(1);
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
        setSelectedElection(electionId);
    };

    const handleUpdateSuccess = (updatedQuestion) => {
        setQuestions(prev => prev.map(q => q.que_id === updatedQuestion.que_id ? updatedQuestion : q));
        setEditModalData(null);
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

    const handleBulkDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one question to delete.");
            return;
        }
        const selectedQuestions = questions.filter(q => selectedRows.includes(q.que_id));
        setBulkDeleteModalData(selectedQuestions);
    };

    const confirmBulkDelete = async () => {
        if (!bulkDeleteModalData || bulkDeleteModalData.length === 0) return;
        
        setIsBulkDeleting(true);
        try {
            const idsToDelete = bulkDeleteModalData.map(q => q.que_id);
            
            await VisionBase.delete('/delete-questions', {
                data: { ids: idsToDelete }
            });

            setQuestions(prev => prev.filter(q => !idsToDelete.includes(q.que_id)));
            setSelectedRows([]);
            setBulkDeleteModalData(null);
            toast.success(`Successfully deleted ${idsToDelete.length} question(s).`);
        } catch (err) {
            console.error("Failed to delete questions:", err);
            toast.error(err.response?.data?.message || "Failed to delete questions. Please try again.");
        } finally {
            setIsBulkDeleting(false);
        }
    };
    
    const handleToggleStatus = (question) => alert(`Toggling status for question ID: ${question.que_id} (API call not implemented)`);
    
    const statCounts = useMemo(() => ({
        total: questions.length,
        active: questions.filter(q => q.status).length,
        inactive: questions.filter(q => !q.status).length,
    }), [questions]);

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
                                                    <TableCell className="max-w-md font-medium whitespace-normal">{q.question}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={`${typeDisplay.color} border-0`}>
                                                            {typeDisplay.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell><Badge variant={q.status ? 'default' : 'destructive'} className={q.status ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-brand-orange hover:bg-brand-orange/90'}>{q.status ? 'Active' : 'Inactive'}</Badge></TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-1">
                                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPreviewModalData(q)}><Eye className="h-4 w-4"/></Button>
                                                            <Button size="icon" className="h-8 w-8 bg-brand-primary hover:bg-brand-primary-dark" onClick={() => handleEditClick(q)}><Pencil className="h-4 w-4"/></Button>
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
                            previewModalData.que_type === 4 ? (
                                // Multilevel preview
                                <div className="space-y-3">
                                    {Object.values(previewModalData.options).sort((a, b) => a.order - b.order).map(opt => (
                                        <div key={opt.order} className="border rounded-md p-3 bg-slate-50">
                                            <div className="flex items-center gap-2 font-medium text-gray-800 mb-2">
                                                <span>{opt.option}</span>
                                                {opt.children && opt.children.length > 0 && (
                                                    <span className="text-xs text-slate-500">({opt.children.length} children)</span>
                                                )}
                                            </div>
                                            {opt.children && opt.children.length > 0 && (
                                                <ul className="ml-6 space-y-1 mt-2">
                                                    {opt.children.sort((a, b) => a.order - b.order).map(child => (
                                                        <li key={child.order} className="flex items-center gap-2 p-2 bg-slate-100 rounded text-sm text-gray-600">
                                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                                            {child.option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Regular options preview
                                <ul className="space-y-2">
                                    {Object.values(previewModalData.options).sort((a, b) => a.order - b.order).map(opt => (
                                        <li key={opt.order} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                            {opt.img && (
                                                <img src={opt.img} alt={opt.option} className="w-6 h-6 object-contain flex-shrink-0" />
                                            )}
                                            {opt.type && (
                                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                                    {opt.type}
                                                </span>
                                            )}
                                            <span className="text-gray-600">{opt.option}</span>
                                        </li>
                                    ))}
                                </ul>
                            )
                        ) : <p className="text-gray-500">No options available.</p>}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setPreviewModalData(null)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Modal */}
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

            {/* Bulk Delete Confirmation Modal */}
            <Dialog open={!!bulkDeleteModalData} onOpenChange={() => setBulkDeleteModalData(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Trash2 className="mr-2 text-red-600"/>
                            Delete Multiple Questions
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete {bulkDeleteModalData?.length} question(s).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto py-4">
                        <h4 className="font-semibold mb-3 text-gray-700">Questions to be deleted:</h4>
                        <ul className="space-y-2">
                            {bulkDeleteModalData?.map((q, index) => (
                                <li key={q.que_id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="font-medium text-gray-600 min-w-[30px]">{index + 1}.</span>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800">{q.question}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className={`${getQuestionTypeDisplay(q.que_type).color} border-0 text-xs`}>
                                                {getQuestionTypeDisplay(q.que_type).label}
                                            </Badge>
                                            <span className="text-xs text-gray-500">ID: {q.que_id}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDeleteModalData(null)} disabled={isBulkDeleting}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-red-600 text-white hover:bg-red-700" 
                            onClick={confirmBulkDelete}
                            disabled={isBulkDeleting}
                        >
                            {isBulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isBulkDeleting ? 'Deleting...' : `Delete ${bulkDeleteModalData?.length} Question(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllQuestions;