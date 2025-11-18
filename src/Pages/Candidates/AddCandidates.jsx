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

const AddCandidate = () => {
    const navigate = useNavigate();

    const initialFormData = {
        electionId: '',
        partyId: '',
        vidhanId: '',
        candidateName: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [elections, setElections] = useState([]);
    const [parties, setParties] = useState([]);
    const [vidhans, setVidhans] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingElections, setIsLoadingElections] = useState(true);
    const [isLoadingParties, setIsLoadingParties] = useState(true);
    const [isLoadingVidhans, setIsLoadingVidhans] = useState(true);

    // Fetch Elections for the dropdown
    useEffect(() => {
        const fetchElections = async () => {
            try {
                setIsLoadingElections(true);
                const response = await VisionBase.get('/elections');
                if (response.data && response.data.data && response.data.data.rows) {
                    setElections(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Elections:", error);
                alert("Could not load Election data. Please try refreshing the page.");
            } finally {
                setIsLoadingElections(false);
            }
        };

        fetchElections();
    }, []);

    // Fetch Parties for the dropdown
    useEffect(() => {
        const fetchParties = async () => {
            try {
                setIsLoadingParties(true);
                const response = await VisionBase.get('/parties');
                if (response.data && response.data.data && response.data.data.rows) {
                    setParties(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Parties:", error);
                alert("Could not load Party data. Please try refreshing the page.");
            } finally {
                setIsLoadingParties(false);
            }
        };

        fetchParties();
    }, []);

    // Fetch Vidhan Sabhas for the dropdown
    useEffect(() => {
        const fetchVidhans = async () => {
            try {
                setIsLoadingVidhans(true);
                const response = await VisionBase.get('/vidhans');
                if (response.data && response.data.data && response.data.data.rows) {
                    setVidhans(response.data.data.rows);
                }
            } catch (error) {
                console.error("Failed to fetch Vidhan Sabhas:", error);
                alert("Could not load Vidhan Sabha data. Please try refreshing the page.");
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
        if (!formData.electionId || !formData.partyId || !formData.vidhanId || !formData.candidateName.trim()) {
            alert("Please fill in all required fields.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const submissionData = {
                vidhan_id: formData.vidhanId,
                party_id: formData.partyId,
                candidate_name: formData.candidateName,
            };

            await VisionBase.post('/add-candidate', submissionData);

            alert("Candidate added successfully!");
            navigate('/allcandidates');
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(`Failed to add Candidate. ${error.response?.data?.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
    };
    
    // Navigate to the candidates list page
    const handleBack = () => {
        navigate('/allcandidates');
    };

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Candidate</h1>
                        <p className="text-sm text-gray-500">Add a new Candidate</p>
                    </div>
                    <div className="p-2 bg-gray-200 rounded-md">
                       <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Home className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>Master</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>Candidate</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="text-gray-700 font-medium">Add Candidate</span>
                </div>

                {/* Main Form Card */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b">
                        <div className="flex items-center">
                            <Menu className="h-5 w-5 mr-3 text-gray-600"/>
                            <CardTitle className="text-lg font-semibold">Add Candidate</CardTitle>
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
                                <FormRow label="Election" required>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange('electionId', value)} 
                                        value={formData.electionId}
                                        disabled={isLoadingElections || isSubmitting}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingElections ? "Loading Elections..." : "Select Election"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingElections ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                elections.map((election) => (
                                                    <SelectItem key={election.election_id} value={election.election_id.toString()}>
                                                        {election.election_name} ({election.state})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormRow>

                                <FormRow label="Party" required>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange('partyId', value)} 
                                        value={formData.partyId}
                                        disabled={isLoadingParties || isSubmitting}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingParties ? "Loading Parties..." : "Select Party"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingParties ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                parties.map((party) => (
                                                    <SelectItem key={party.party_id} value={party.party_id.toString()}>
                                                        {party.party_name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormRow>

                                <FormRow label="Vidhan Sabha" required>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange('vidhanId', value)} 
                                        value={formData.vidhanId}
                                        disabled={isLoadingVidhans || isSubmitting}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingVidhans ? "Loading Vidhan Sabhas..." : "Select Vidhan Sabha"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingVidhans ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                vidhans.map((vidhan) => (
                                                    <SelectItem key={vidhan.vidhan_id} value={vidhan.vidhan_id.toString()}>
                                                        {vidhan.vidhan_name} - {vidhan.lok_name} ({vidhan.state})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormRow>

                                <FormRow label="Candidate Name" required>
                                    <Input
                                        name="candidateName"
                                        value={formData.candidateName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Candidate name"
                                        disabled={isSubmitting}
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

export default AddCandidate;