import React, { useState, useRef } from 'react';
import { Home, ChevronRight, Menu, Send, RotateCcw, Settings, Globe, Image, Phone, FileText, Eye, Code, User } from 'lucide-react';

// ===================================================================================
// DUMMY API HANDLER
// Simulates sending form data to a backend.
// ===================================================================================
const handleApiSubmission = async (formData) => {
  // We remove the file preview URL before sending, as the backend only needs the file itself.
  const { logoPreview, ...dataToSend } = formData;
  
  console.log('[API SIMULATION] Submitting form data...');
  console.log('[API SIMULATION] Data to be sent:', dataToSend);

  // Use FormData for file uploads
  const apiFormData = new FormData();
  Object.keys(dataToSend).forEach(key => {
    apiFormData.append(key, dataToSend[key]);
  });

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // For this demo, we'll just simulate success
    console.log('[API SIMULATION] Submission successful!');
    return { success: true, message: 'Settings updated successfully!' };
  } catch (error) {
    console.error('[API SIMULATION] Error:', error);
    throw new Error('An error occurred during submission.');
  }
};

// ===================================================================================
// MODERN UI COMPONENTS
// ===================================================================================
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 border-b border-gray-200/50 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "", icon: Icon }) => (
  <h3 className={`text-xl font-bold text-gray-800 flex items-center ${className}`}>
    {Icon && <Icon className="h-6 w-6 mr-3 text-indigo-600" />}
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const FormRow = ({ label, children, icon: Icon }) => (
  <div className="group relative p-4 rounded-xl hover:bg-gray-50/50 transition-all duration-300">
    <div className="flex flex-col lg:flex-row items-start lg:items-center">
      <label className="flex items-center w-full lg:w-1/3 mb-3 lg:mb-0 text-sm font-semibold text-gray-700 pr-4">
        {Icon && <Icon className="h-4 w-4 mr-2 text-indigo-500" />}
        {label}
      </label>
      <div className="w-full lg:w-2/3">
        {children}
      </div>
    </div>
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 shadow-sm ${className}`}
    {...props}
  />
);

const TextArea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 shadow-sm resize-y ${className}`}
    {...props}
  />
);

const Button = ({ children, variant = "primary", className = "", disabled = false, ...props }) => {
  const baseClasses = "inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    secondary: "text-gray-700 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const RadioButton = ({ label, ...props }) => (
  <label className="flex items-center cursor-pointer group">
    <input
      type="radio"
      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
      {...props}
    />
    <span className="ml-3 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
      {label}
    </span>
  </label>
);

const Toast = ({ message, type = "success", onClose }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl backdrop-blur-lg border transform transition-all duration-300 ${
    type === "success" 
      ? "bg-green-50/90 border-green-200 text-green-800" 
      : "bg-red-50/90 border-red-200 text-red-800"
  }`}>
    <div className="flex items-center">
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">
        ×
      </button>
    </div>
  </div>
);

// ===================================================================================
// MAIN WebsiteSettings COMPONENT
// ===================================================================================
const WebsiteSettings = () => {
  const initialData = {
    siteName: 'Vision Data',
    metaTitle: 'Vision Data',
    metaKeyword: 'Vision Data',
    metaDescription: 'Vision Data - Powered by Abhasthra Technology Pvt. Ltd',
    phoneNumber: '6350669414',
    siteStatus: 'active',
    copyrightText: 'Copyright © 2025 abhasthra.com All Rights Reserved.',
    pageSizeAdmin: 10,
    siteLogo: null,
  };
  
  const initialLogoPreview = "https://i.imgur.com/As8d6hA.png";

  const [formData, setFormData] = useState(initialData);
  const [logoPreview, setLogoPreview] = useState(initialLogoPreview);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, siteLogo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setLogoPreview(initialLogoPreview);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    showToast('Form has been reset', 'success');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const result = await handleApiSubmission(formData);
      showToast(result.message, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-150"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              General Settings
            </h1>
            <p className="text-lg text-gray-600">Configure your website settings</p>
          </div>
          <div className="p-3 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg">
            <Settings className="h-8 w-8 text-indigo-600" />
          </div>
        </header>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm bg-white/60 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg">
            <li>
              <a href="#" className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                <Home className="h-4 w-4 mr-2" />
                Home
              </a>
            </li>
            <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">General Settings</a></li>
            <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
            <li><span className="text-indigo-600 font-semibold">Website Settings</span></li>
          </ol>
        </nav>

        {/* Main Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="text-white" icon={Globe}>
              Website Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <FormRow label="Site Name" icon={Globe}>
                <Input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder="Enter your site name"
                />
              </FormRow>

              <FormRow label="Meta Title" icon={FileText}>
                <Input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="Enter meta title"
                />
              </FormRow>

              <FormRow label="Meta Keywords" icon={Code}>
                <Input
                  type="text"
                  name="metaKeyword"
                  value={formData.metaKeyword}
                  onChange={handleChange}
                  placeholder="Enter meta keywords"
                />
              </FormRow>

              <FormRow label="Meta Description" icon={FileText}>
                <TextArea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter meta description"
                />
              </FormRow>

              <FormRow label="Phone Number" icon={Phone}>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </FormRow>

              <FormRow label="Site Status" icon={Eye}>
                <div className="flex items-center space-x-8">
                  <RadioButton
                    label="Yes, Site is live"
                    name="siteStatus"
                    value="active"
                    checked={formData.siteStatus === 'active'}
                    onChange={handleChange}
                  />
                  <RadioButton
                    label="Inactive"
                    name="siteStatus"
                    value="inactive"
                    checked={formData.siteStatus === 'inactive'}
                    onChange={handleChange}
                  />
                </div>
              </FormRow>
              
              <FormRow label="Copyright Text" icon={FileText}>
                <Input
                  type="text"
                  name="copyrightText"
                  value={formData.copyrightText}
                  onChange={handleChange}
                  placeholder="Enter copyright text"
                />
              </FormRow>
              
              <FormRow label="Page Size (Admin)" icon={Settings}>
                <Input
                  type="number"
                  name="pageSizeAdmin"
                  value={formData.pageSizeAdmin}
                  onChange={handleChange}
                  className="lg:w-1/3"
                  placeholder="10"
                />
              </FormRow>

              <FormRow label="Site Logo" icon={Image}>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative group">
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-2xl bg-white/80 backdrop-blur-sm group-hover:border-indigo-400 transition-all duration-300">
                      <img
                        src={logoPreview}
                        alt="Site Logo Preview"
                        className="h-20 w-auto max-w-32 object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 bg-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current.click()}
                    className="text-gray-700"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </div>
              </FormRow>

              <div className="flex justify-start space-x-4 pt-8">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="min-w-32"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default WebsiteSettings;