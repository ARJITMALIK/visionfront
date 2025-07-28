import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Menu, ArrowLeft, RefreshCw, FileText, Upload, X } from 'lucide-react';

// Assuming you have shadcn/ui components in these paths
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { VisionBase } from '@/utils/axiosInstance';

// A reusable form row component for consistent styling
const FormRow = ({ label, required, children }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center border-b border-dotted border-gray-200 py-4 last:border-b-0">
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

const AddParty = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const initialFormData = {
        partyName: '',
        partyLogo: null, // Will store the file object instead of base64
    };

    const [formData, setFormData] = useState(initialFormData);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file selection
    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        // Store the file object and create preview URL
        setFormData(prev => ({ ...prev, partyLogo: file }));
        setLogoPreview(URL.createObjectURL(file));
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    // Remove selected logo
    const removeLogo = () => {
        setFormData(prev => ({ ...prev, partyLogo: null }));
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview); // Clean up object URL
        }
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.partyName.trim()) {
            alert("Party Name is required.");
            return;
        }

        setIsSubmitting(true);
        setUploadProgress('');

        try {
            let logoUrl = null;

            // Step 1: Upload logo to S3 if a file is selected
            if (formData.partyLogo) {
                setUploadProgress('Uploading logo...');
                
                const logoFormData = new FormData();
                logoFormData.append('file', formData.partyLogo);
                
                const uploadResult = await VisionBase.post('/uploads', logoFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                console.log('Logo upload result:', uploadResult);
                
                // Extract the S3 URL from upload response
                logoUrl = uploadResult.data.data.fileUrl;
                
                if (!logoUrl) {
                    throw new Error('Failed to get logo URL from upload response');
                }
            }

            setUploadProgress('Saving party...');

            // Step 2: Create party with the S3 URL (or null if no logo)
            const payload = {
                party_name: formData.partyName.trim(),
                party_logo: logoUrl
            };

            const result = await VisionBase.post('/add-party', payload);
            
            console.log('Success:', result.message);
            alert("Party added successfully!");
            
            // Reset form after successful submission
            setFormData(initialFormData);
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview); // Clean up object URL
            }
            setLogoPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            // Navigate back to the party list
            navigate('/allparty');
            
        } catch (error) {
            console.error('Error adding party:', error);
            
            // More detailed error handling
            let errorMessage = 'An error occurred while adding the party.';
            if (error.response) {
                errorMessage = error.response.data.message || error.response.data.error || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview); // Clean up object URL
        }
        setLogoPreview(null);
        setUploadProgress('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        console.log("Form has been reset.");
    };

    const handleBack = () => {
        navigate('/allparty');
    };

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Party</h1>
                        <p className="text-sm text-gray-500">Party Add Party</p>
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
                    <span className="text-brand-secondary">Party</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">Add Party</span>
                </div>

                {/* Main Form Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b">
                        <div className="flex items-center">
                            <Menu className="h-5 w-5 mr-3 text-gray-600"/>
                            <CardTitle className="text-lg font-semibold">Party</CardTitle>
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
                            <FormRow label="Party Name" required>
                                <Input
                                    name="partyName"
                                    value={formData.partyName}
                                    onChange={handleInputChange}
                                    placeholder="Enter party name"
                                    disabled={isSubmitting}
                                />
                            </FormRow>

                            <FormRow label="Party Logo">
                                <div className="space-y-4">
                                    {/* File input (hidden) */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                    
                                    {/* Drag and drop area or file picker */}
                                    {!logoPreview ? (
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                                isDragOver 
                                                    ? 'border-brand-primary bg-brand-primary/5' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => !isSubmitting && fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">
                                                Drag and drop an image here, or <span className="text-brand-primary">click to select</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    ) : (
                                        /* Logo preview */
                                        <div className="space-y-2">
                                            <div className="relative inline-block">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                    onClick={removeLogo}
                                                    disabled={isSubmitting}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => !isSubmitting && fileInputRef.current?.click()}
                                                    disabled={isSubmitting}
                                                >
                                                    Change Logo
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormRow>

                            {/* Progress indicator */}
                            {uploadProgress && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-3"></div>
                                        <span className="text-sm font-medium text-blue-700">{uploadProgress}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-start pt-8">
                                <Button 
                                    type="submit" 
                                    className="bg-brand-primary text-white hover:bg-brand-primary-dark mr-3 flex items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronRight className="h-4 w-4" /> 
                                            <span>Submit</span>
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    style={{ backgroundColor: '#f5b82e', color: 'white' }}
                                    className="hover:opacity-90 flex items-center"
                                    disabled={isSubmitting}
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

export default AddParty;