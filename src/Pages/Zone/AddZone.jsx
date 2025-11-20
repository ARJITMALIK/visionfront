import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Menu, ArrowLeft, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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

const AddZone = () => {
    const navigate = useNavigate();

    const initialFormData = {
        name: '',
        vidhanId: '',
        lat: '',
        lon: '',
        range: '',
        survey_limit: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [vidhans, setVidhans] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingVidhans, setIsLoadingVidhans] = useState(true);

    useEffect(() => {
        const fetchVidhans = async () => {
            try {
                setIsLoadingVidhans(true);
                const response = await VisionBase.get('/vidhans');
                if (response.data && response.data.data && response.data.data.rows) {
                    setVidhans(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Vidhans:", error);
                alert("Could not load Vidhan data. Please try refreshing the page.");
            } finally {
                setIsLoadingVidhans(false);
            }
        };

        fetchVidhans();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim() || !formData.vidhanId) {
            alert("Please fill in all required fields.");
            return;
        }

        // Validate lat and lon if provided
        if (formData.lat && (isNaN(formData.lat) || formData.lat < -90 || formData.lat > 90)) {
            alert("Please enter a valid lat between -90 and 90.");
            return;
        }

        if (formData.lon && (isNaN(formData.lon) || formData.lon < -180 || formData.lon > 180)) {
            alert("Please enter a valid lon between -180 and 180.");
            return;
        }

        // Validate range if provided
        if (formData.range && (isNaN(formData.range) || formData.range < 0)) {
            alert("Please enter a valid range (must be a positive number).");
            return;
        }

        // Validate survey_limit if provided
        if (formData.survey_limit && (isNaN(formData.survey_limit) || formData.survey_limit < 0 || !Number.isInteger(Number(formData.survey_limit)))) {
            alert("Please enter a valid survey per booth survey_limit (must be a positive whole number).");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const submissionData = {
                zone_name: formData.name,
                vidhan_id: formData.vidhanId,
                lat: formData.lat || null,
                lon: formData.lon || null,
                range: formData.range || null,
                survey_limit: formData.survey_limit || null,
            };

            await VisionBase.post('/add-zone', submissionData);

            navigate('/allbooth');
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(`Failed to add Booth. ${error.response?.data?.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
    };
    
    const handleBack = () => {
        navigate('/allbooth');
    };

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Booth</h1>
                        <p className="text-sm text-gray-500">Add a new Booth</p>
                    </div>
                    <div className="p-2 bg-gray-200 rounded-md">
                       <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Home className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>Master</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>Booth</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">Add Booth</span>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b">
                        <div className="flex items-center">
                            <Menu className="h-5 w-5 mr-3 text-gray-600"/>
                            <CardTitle className="text-lg font-semibold">Add Booth</CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <FormRow label="Booth Name" required>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter Booth name"
                                        disabled={isSubmitting}
                                    />
                                </FormRow>

                                <FormRow label="Vidhan Sabha" required>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange('vidhanId', value)} 
                                        value={formData.vidhanId}
                                        disabled={isLoadingVidhans || isSubmitting}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingVidhans ? "Loading Vidhans..." : "Select Vidhan Sabha"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingVidhans ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                vidhans.map((vidhan) => (
                                                    <SelectItem key={vidhan.vidhan_id} value={vidhan.vidhan_id.toString()}>
                                                        {vidhan.vidhan_name} <b>{vidhan.lok_name}</b> ({vidhan.state})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormRow>

                                <FormRow label="latitude">
                                    <Input
                                        name="lat"
                                        value={formData.lat}
                                        onChange={handleInputChange}
                                        placeholder="Enter latitude (e.g., 28.6139)"
                                        disabled={isSubmitting}
                                        type="number"
                                        step="any"
                                    />
                                </FormRow>

                                <FormRow label="longitude">
                                    <Input
                                        name="lon"
                                        value={formData.lon}
                                        onChange={handleInputChange}
                                        placeholder="Enter longitude (e.g., 77.2090)"
                                        disabled={isSubmitting}
                                        type="number"
                                        step="any"
                                    />
                                </FormRow>

                                <FormRow label="Range (in kilometers)">
                                    <Input
                                        name="range"
                                        value={formData.range}
                                        onChange={handleInputChange}
                                        placeholder="Enter range in kilometers (e.g., 5)"
                                        disabled={isSubmitting}
                                        type="number"
                                        step="any"
                                        min="0"
                                    />
                                </FormRow>

                                <FormRow label="Survey per Booth">
                                    <Input
                                        name="survey_limit"
                                        value={formData.survey_limit}
                                        onChange={handleInputChange}
                                        placeholder="Enter survey survey_limit per booth (e.g., 100)"
                                        disabled={isSubmitting}
                                        type="number"
                                        step="1"
                                        min="0"
                                    />
                                </FormRow>
                            </div>
                            
                            <div className="flex justify-start pt-8">
                                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 mr-3" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    variant="outline"
                                    disabled={isSubmitting}
                                >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddZone;