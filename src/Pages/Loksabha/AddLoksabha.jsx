import { VisionBase } from '@/utils/axiosInstance';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// This single file contains the main component and mocks for UI/icons
// to fulfill the request. In a real project, you would import these
// from their respective libraries (e.g., 'lucide-react', 'components/ui/...').

// --- Start of Mocked Icons (equivalent to lucide-react) ---
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const Menu = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>;
const FileText = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>;
const RotateCcw = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;
const ChevronDown = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>;
// --- End of Mocked Icons ---

// --- Start of Mocked shadcn/ui Components ---
const Card = ({ children, className = "" }) => <div className={`bg-white border border-gray-200/90 rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-4 sm:p-5 border-b border-gray-200/90 ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;

const Button = ({ children, className = "", variant, ...props }) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-4 py-2";
    let variantStyle = "";
    if (variant === 'back' || variant === 'submit') {
        variantStyle = "bg-[#EE4B4B] text-white hover:bg-[#d94444]";
    } else if (variant === 'reset') {
        variantStyle = "bg-[#F5B440] text-white hover:bg-[#e6a83a]";
    }
    return <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>{children}</button>;
};

const Input = (props) => <input className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/80 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
const Label = ({ children, ...props }) => <label className="text-sm font-medium text-gray-800 leading-none" {...props}>{children}</label>;

const CustomSelect = ({ value, placeholder, options, onValueChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onValueChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={selectRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left ring-offset-white focus:outline-none focus:ring-2 focus:ring-rose-500/80"
            >
                <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                    {value || placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
                    <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                        {options.length > 0 ? options.map((option) => (
                            <li
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="cursor-pointer select-none relative py-2 pl-4 pr-4 text-gray-800 hover:bg-rose-50 hover:text-rose-800"
                            >
                                {option}
                            </li>
                        )) : (
                            <li className="px-4 py-2 text-gray-500">No options available</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
// --- End of Mocked shadcn/ui Components ---



// For demonstration, using a placeholder base URL

const AddLoksabha = () => {
    const initialFormData = {
        lok_name: '',
        state: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States data for dropdown
    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
        "Ladakh", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
        "Lakshadweep", "Puducherry", "Andaman and Nicobar Islands"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleReset = () => {
        setFormData(initialFormData);
        console.log("Form has been reset!");
    };
const navigate = useNavigate();
    const handleBack = () => {
        navigate('/allloksabha');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.lok_name || !formData.state) {
            alert("Please fill all mandatory fields marked with *");
            return;
        }

        setIsSubmitting(true);
        console.log("Form Data to be sent to VisionBase API:", formData);

        try {
            await VisionBase.post('/add-lok', formData);
            setFormData(initialFormData);
            alert("Loksabha added successfully!");
        
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(`Failed to submit form: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-[#FEFBFB] p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl sm:text-3xl text-[#5a5a5a]">
                        Loksabha <span className="font-light text-[#6c757d]">Add Loksabha</span>
                    </h1>
                    <div className="p-3 bg-gray-200/70 rounded-md">
                         <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                </header>

                <nav className="text-sm mb-6 text-[#986A6A]" aria-label="Breadcrumb">
                    <ol className="list-none p-0 inline-flex items-center flex-wrap space-x-2">
                        <li className="flex items-center">
                            <Home className="h-4 w-4 mr-2" />
                            <a href="#" className="hover:underline">Home</a>
                        </li>
                        <li><span className="text-gray-400">›</span></li>
                        <li><a href="#" className="hover:underline">Loksabha</a></li>
                        <li><span className="text-gray-400">›</span></li>
                        <li className="font-semibold">Add Loksabha</li>
                    </ol>
                </nav>

                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl text-[#495057]">
                            <Menu className="mr-3 h-5 w-5" />
                            Add Loksabha
                        </CardTitle>
                        <Button variant="back" onClick={handleBack}>Back</Button>
                    </CardHeader>
                    <CardContent>
                        <div >
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 pb-2">
                                <div className="space-y-2">
                                    <Label htmlFor="lok_name">Loksabha Name <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="lok_name" 
                                        name="lok_name" 
                                        placeholder="Enter Loksabha Name" 
                                        value={formData.lok_name} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State <span className="text-red-500">*</span></Label>
                                    <CustomSelect
                                        placeholder="Select State"
                                        options={states}
                                        value={formData.state}
                                        onValueChange={(value) => handleSelectChange('state', value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 mt-8 border-t border-gray-200/90 pt-6">
                                <Button onClick={handleSubmit} variant="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : '> Submit'}
                                </Button>
                                <Button type="button" variant="reset" onClick={handleReset}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddLoksabha;