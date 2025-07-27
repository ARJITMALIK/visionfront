import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Menu, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Assuming you have shadcn/ui components in these paths
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// A reusable form row component for consistent styling
const FormRow = ({ label, required, children, isEditor = false }) => (
    <div className={`flex flex-col md:flex-row items-start border-b border-dotted border-gray-200 py-4 last:border-b-0 ${isEditor ? 'md:items-start' : 'md:items-center'}`}>
        <div className="w-full md:w-1/4 mb-2 md:mb-0 md:pr-4 text-left md:text-right">
            <label className="font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        </div>
        <div className="w-full md:w-3/4">
            {children}
        </div>
    </div>
);

const AddNotification = () => {
    const navigate = useNavigate();

    const initialFormData = {
        electionId: '',
        title: '',
        detail: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setFormData(prev => ({ ...prev, detail: data }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Dummy API call simulation
        console.log("Submitting form data:", JSON.stringify(formData, null, 2));
        alert("Form data has been logged to the console. Ready for backend API integration.");
        // To reset the form after submission, uncomment the next line
        // setFormData(initialFormData);
    };

    const handleReset = () => {
        setFormData(initialFormData);
        console.log("Form has been reset.");
    };

    // --- THIS IS THE CHANGE ---
    // Update this function to navigate to the "/allnotifications" route
    const handleBack = () => {
        navigate('/allnotifications');
    };

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Notification</h1>
                        <p className="text-sm text-gray-500">Notification Add Notification</p>
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
                    <span className="text-brand-secondary">Notification</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">Add Notification</span>
                </div>

                {/* Main Form Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b">
                        <div className="flex items-center">
                            <Menu className="h-5 w-5 mr-3 text-gray-600"/>
                            <CardTitle className="text-lg font-semibold">Notification</CardTitle>
                        </div>
                        <Button
                            className="bg-brand-primary text-white hover:bg-brand-primary-dark"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <FormRow label="Election" required>
                                    <Select onValueChange={(value) => handleSelectChange('electionId', value)} value={formData.electionId}>
                                        <SelectTrigger><SelectValue placeholder="Select Election" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="election-1">Lok Sabha 2024</SelectItem>
                                            <SelectItem value="election-2">State Assembly 2025</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormRow>

                                <FormRow label="Title" required>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Title"
                                    />
                                </FormRow>

                                <FormRow label="Detail" required isEditor>
                                    <div className="prose max-w-none w-full ck-editor-container">
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.detail}
                                            onChange={handleEditorChange}
                                        />
                                    </div>
                                </FormRow>
                            </div>
                            
                            <div className="flex justify-start pt-8">
                                <Button type="submit" className="bg-brand-primary text-white hover:bg-brand-primary-dark mr-3 flex items-center">
                                    <ChevronRight className="h-4 w-4" /> <span>Submit</span>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    style={{ backgroundColor: '#f5b82e', color: 'white' }}
                                    className="hover:opacity-90 flex items-center"
                                >
                                    <RefreshCw className="h-4 w-4 mr-1" /> <span>Reset</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddNotification;