"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Dnd-kit imports for drag and drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Shadcn UI imports
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster, toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icon imports
import { GripVertical, PlusCircle, Trash2, Loader2, Users, Vote } from "lucide-react";
import { VisionBase } from "@/utils/axiosInstance";

// --- ZOD SCHEMA for FORM VALIDATION ---
const formSchema = z.object({
  electionId: z.string().min(1, "An election must be selected."),
  parentId: z.string().optional(),
  question_type: z.enum(
    ["single_answer", "multiple_answer", "emoji_based", "dynamic"],
    {
      required_error: "Question type is required.",
    }
  ),
  question_title: z
    .string()
    .min(10, "Question title must be at least 10 characters long."),
});

// Question type mapping to integers
const questionTypeMapping = {
  "single_answer": 0,
  "multiple_answer": 1,
  "emoji_based": 2,
  "dynamic": 3
};

// --- Draggable Option Item Component ---
function SortableOptionItem({ id, text, img, onDelete, isEmoji = false, isDynamic = false, type = null }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 mb-2 bg-slate-100 dark:bg-slate-800 rounded-md"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab p-1"
      >
        <GripVertical className="h-5 w-5 text-slate-500" />
      </button>
      {(isEmoji || isDynamic) && img && (
        <img src={img} alt={text} className="w-6 h-6 object-contain rounded" />
      )}
      {isDynamic && type && (
        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
          {type}
        </span>
      )}
      <span className="flex-grow">{text}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
        aria-label="Delete option"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}

// --- Emoji Selection Component ---
function EmojiSelector({ availableEmojis, selectedOptions, onSelectionChange }) {
  const handleEmojiToggle = (emoji, checked) => {
    if (checked) {
      const newOption = {
        id: `emoji-${emoji.title}-${Date.now()}`,
        text: emoji.title,
        img: emoji.img,
      };
      onSelectionChange([...selectedOptions, newOption]);
    } else {
      onSelectionChange(selectedOptions.filter(opt => opt.text !== emoji.title));
    }
  };

  const isSelected = (emoji) => selectedOptions.some(opt => opt.text === emoji.title);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900 max-h-60 overflow-y-auto">
      {availableEmojis.map((emoji, index) => (
        <div key={index} className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
          <Checkbox
            id={`emoji-${index}`}
            checked={isSelected(emoji)}
            onCheckedChange={(checked) => handleEmojiToggle(emoji, checked)}
          />
          <img src={emoji.img} alt={emoji.title} className="w-6 h-6 object-contain" />
          <label
            htmlFor={`emoji-${index}`}
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

// --- Dynamic Options Selector Component ---
function DynamicOptionSelector({ parties, candidates, selectedOptions, onSelectionChange }) {
  const handlePartyToggle = (party, checked) => {
    if (checked) {
      const newOption = {
        id: `party-${party.party_id}-${Date.now()}`,
        text: party.party_name,
        img: party.party_logo,
        type: 'party',
        originalId: party.party_id,
      };
      onSelectionChange([...selectedOptions, newOption]);
    } else {
      onSelectionChange(selectedOptions.filter(opt => 
        !(opt.type === 'party' && opt.originalId === party.party_id)
      ));
    }
  };

  const handleCandidateToggle = (candidate, checked) => {
    if (checked) {
      const newOption = {
        id: `candidate-${candidate.candidate_id}-${Date.now()}`,
        text: candidate.candidate_name,
        type: 'candidate',
        originalId: candidate.candidate_id,
        partyName: candidate.party_name,
      };
      onSelectionChange([...selectedOptions, newOption]);
    } else {
      onSelectionChange(selectedOptions.filter(opt => 
        !(opt.type === 'candidate' && opt.originalId === candidate.candidate_id)
      ));
    }
  };

  const isPartySelected = (party) => selectedOptions.some(opt => 
    opt.type === 'party' && opt.originalId === party.party_id
  );

  const isCandidateSelected = (candidate) => selectedOptions.some(opt => 
    opt.type === 'candidate' && opt.originalId === candidate.candidate_id
  );

  return (
    <Tabs defaultValue="parties" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="parties" className="flex items-center gap-2">
          <Vote className="h-4 w-4" />
          Parties ({parties.length})
        </TabsTrigger>
        <TabsTrigger value="candidates" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Candidates ({candidates.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="parties">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900 max-h-60 overflow-y-auto">
          {parties.map((party) => (
            <div key={party.party_id} className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <Checkbox
                id={`party-${party.party_id}`}
                checked={isPartySelected(party)}
                onCheckedChange={(checked) => handlePartyToggle(party, checked)}
              />
              {party.party_logo && (
                <img src={party.party_logo} alt={party.party_name} className="w-8 h-8 object-contain rounded" />
              )}
              <label
                htmlFor={`party-${party.party_id}`}
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
        <div className="grid grid-cols-1 gap-2 p-4 border rounded-md bg-slate-50 dark:bg-slate-900 max-h-60 overflow-y-auto">
          {candidates.map((candidate) => (
            <div key={candidate.candidate_id} className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <Checkbox
                id={`candidate-${candidate.candidate_id}`}
                checked={isCandidateSelected(candidate)}
                onCheckedChange={(checked) => handleCandidateToggle(candidate, checked)}
              />
              <div className="flex-grow">
                <label
                  htmlFor={`candidate-${candidate.candidate_id}`}
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
      </TabsContent>
    </Tabs>
  );
}

// --- MAIN COMPONENT ---
export default function AddQuestions() {
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State to hold data fetched from APIs
  const [elections, setElections] = useState([]);
  const [parentQuestions, setParentQuestions] = useState([]);
  const [availableEmojis, setAvailableEmojis] = useState([]);
  const [parties, setParties] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      electionId: "",
      parentId: "",
      question_type: undefined,
      question_title: "",
    },
  });

  const watchedQuestionType = form.watch("question_type");

  // Fetch data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch Elections
        const electionsResponse = await VisionBase.get("/elections");
        if (electionsResponse.data?.data?.rows) {
          setElections(electionsResponse.data.data.rows);
        }

        // Fetch Parent Questions
        const questionsResponse = await VisionBase.get("/questions");
        if (questionsResponse.data?.data?.rows) {
          setParentQuestions(questionsResponse.data.data.rows);
        }

        // Fetch Emojis
        const emojisResponse = await VisionBase.get("/emojis");
        if (emojisResponse.data?.data?.rows) {
          setAvailableEmojis(emojisResponse.data.data.rows);
        }

        // Fetch Parties for dynamic questions
        const partiesResponse = await VisionBase.get("/parties");
        if (partiesResponse.data?.data?.rows) {
          setParties(partiesResponse.data.data.rows);
        }

        // Fetch Candidates for dynamic questions
        const candidatesResponse = await VisionBase.get("/candidates");
        if (candidatesResponse.data?.data?.rows) {
          setCandidates(candidatesResponse.data.data.rows);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Failed to load data for dropdowns. Please refresh.");
      }
    };

    fetchDropdownData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Reset options when question type changes
  useEffect(() => {
    setOptions([]);
    setNewOptionText("");
  }, [watchedQuestionType]);

  const handleAddOption = () => {
    if (newOptionText.trim() === "") {
      toast.error("Option text cannot be empty.");
      return;
    }
    const newOption = {
      id: `option-${Date.now()}`, // Unique ID for dnd-kit
      text: newOptionText.trim(),
    };
    setOptions((prev) => [...prev, newOption]);
    setNewOptionText("");
  };

  const handleDeleteOption = (idToDelete) => {
    setOptions((prev) => prev.filter((option) => option.id !== idToDelete));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
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

  async function onSubmit(values) {
    if (options.length < 2) {
      toast.error("Please add at least two options.");
      return;
    }

    setIsLoading(true);
    
    // Format options as objects for PostgreSQL json[] with {} syntax
    const formattedOptions = options.reduce((acc, opt, index) => {
      const optionData = {
        option: opt.text,
        order: index + 1,
      };
      
      // Include image for emoji-based questions
      if (values.question_type === "emoji_based" && opt.img) {
        optionData.img = opt.img;
      }
      
      // Include additional data for dynamic questions
      if (values.question_type === "dynamic") {
        if (opt.img) {
          optionData.img = opt.img;
        }
        if (opt.type) {
          optionData.type = opt.type;
        }
        if (opt.originalId) {
          optionData.originalId = opt.originalId;
        }
        if (opt.partyName) {
          optionData.partyName = opt.partyName;
        }
      }
      
      acc[`option_${index}`] = optionData;
      return acc;
    }, {});
    
    // Construct payload according to API requirements
    const payload = {
      election_id: Number(values.electionId),
      question: values.question_title,
      // Handle the 'No Parent' case by sending null
      parent_id: values.parentId === "0" || !values.parentId ? 0 : Number(values.parentId),
      // Convert question type string to integer
      que_type: questionTypeMapping[values.question_type],
      // Send as object with {} structure
      options: formattedOptions,
    };

    console.log("Submitting Payload:", JSON.stringify(payload, null, 2));

    try {
      await VisionBase.post("/add-question", payload);

      toast.success("Question created successfully!");
      // Reset the form and options for a clean slate
      form.reset();
      setOptions([]);

    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to create question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isEmojiBasedQuestion = watchedQuestionType === "emoji_based";
  const isDynamicQuestion = watchedQuestionType === "dynamic";

  return (
    <>
      <Toaster richColors />
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Survey Question</CardTitle>
          <CardDescription>
            Fill in the details to add a new question to an election survey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Election Dropdown (populated from API) */}
                <FormField
                  control={form.control}
                  name="electionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Election</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an election" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {elections?.map((election) => (
                            <SelectItem key={election.election_id} value={String(election.election_id)}>
                              {election.election_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Question Dropdown (populated from API) */}
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Question (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent question" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No Parent</SelectItem>
                          {parentQuestions.map((question) => (
                            <SelectItem key={question.que_id} value={String(question.que_id)}>
                              {question.question}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Question Type */}
              <FormField
                control={form.control}
                name="question_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single_answer">Single Answer</SelectItem>
                        <SelectItem value="multiple_answer">Multiple Answer</SelectItem>
                        <SelectItem value="emoji_based">Emoji Based</SelectItem>
                        <SelectItem value="dynamic">Dynamic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Title */}
              <FormField
                control={form.control}
                name="question_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Who is your preferred candidate?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options Section */}
              <div className="space-y-4">
                <FormLabel>Options</FormLabel>
                
                {/* Show different UI based on question type */}
                {isEmojiBasedQuestion ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Select emoji options from the available choices below:
                    </p>
                    {availableEmojis.length > 0 ? (
                      <EmojiSelector
                        availableEmojis={availableEmojis}
                        selectedOptions={options}
                        onSelectionChange={handleEmojiSelectionChange}
                      />
                    ) : (
                      <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                        <p className="text-sm text-center text-slate-500">Loading emoji options...</p>
                      </div>
                    )}
                  </div>
                ) : isDynamicQuestion ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Select parties and candidates from the available options below:
                    </p>
                    {parties.length > 0 || candidates.length > 0 ? (
                      <DynamicOptionSelector
                        parties={parties}
                        candidates={candidates}
                        selectedOptions={options}
                        onSelectionChange={handleDynamicSelectionChange}
                      />
                    ) : (
                      <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                        <p className="text-sm text-center text-slate-500">Loading parties and candidates...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an option"
                      value={newOptionText}
                      onChange={(e) => setNewOptionText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddOption} variant="outline">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                )}

                {/* Selected Options Display */}
                <div className="p-4 border rounded-md min-h-[100px] bg-slate-50 dark:bg-slate-900">
                  {options.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={options.map(opt => opt.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {options.map(option => (
                          <SortableOptionItem
                            key={option.id}
                            id={option.id}
                            text={option.text}
                            img={option.img}
                            onDelete={handleDeleteOption}
                            isEmoji={isEmojiBasedQuestion}
                            isDynamic={isDynamicQuestion}
                            type={option.type}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <p className="text-sm text-center text-slate-500">
                      {isEmojiBasedQuestion 
                        ? "No emoji options selected yet. Choose from the options above."
                        : isDynamicQuestion
                        ? "No parties or candidates selected yet. Choose from the options above."
                        : "No options added yet. Use the input above."
                      }
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Question
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}