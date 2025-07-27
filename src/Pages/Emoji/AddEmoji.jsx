import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Menu, Send, RotateCcw, ArrowLeft, Upload, X, Sparkles, FileImage } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

// Import the new VisionBase API service

// ===================================================================================
// UTILITY FUNCTION
// ===================================================================================
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

// ===================================================================================
// MODERN UI COMPONENTS (Unchanged)
// ===================================================================================
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-8 py-6 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50 flex justify-between items-center ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-8 py-8 ${className}`}>
    {children}
  </div>
);

const FormRow = ({ label, children, required = false }) => (
  <div className="space-y-3 mb-8">
    <label className="block text-sm font-semibold text-gray-700 flex items-center">
      {label} 
      {required && <span className="text-red-500 ml-1.5 text-base">*</span>}
    </label>
    <div className="w-full">
      {children}
    </div>
  </div>
);

// ===================================================================================
// MODERN FILE UPLOAD COMPONENT (Unchanged)
// ===================================================================================
const ModernFileUpload = ({ onFileChange, preview, onRemove, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }, [disabled]);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onFileChange(files[0]);
    }
  }, [onFileChange, disabled]);
  const handleClick = () => { if (!disabled) fileInputRef.current?.click(); };

  return (
    <div className="space-y-4">
      <div
        className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${isDragOver ? 'border-violet-400 bg-violet-50/50 scale-105' : preview ? 'border-gray-200' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/30'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && onFileChange(e.target.files[0])} className="hidden" disabled={disabled} />
        {preview ? (
          <div className="relative aspect-square max-w-xs mx-auto">
            <img src={preview} alt="Emoji Preview" className="w-full h-full object-contain rounded-xl" />
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors" disabled={disabled}><X className="h-4 w-4" /></button>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center"><div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2"><Upload className="h-5 w-5 text-gray-600" /></div></div>
          </div>
        ) : (
          <div className="aspect-square max-w-xs mx-auto flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-full p-4 mb-4"><FileImage className="h-8 w-8 text-violet-600" /></div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Upload Emoji Image</p>
            <p className="text-sm text-gray-500 mb-4">Drag & drop or click to select</p>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"><Upload className="h-4 w-4 mr-2" /> Browse Files</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===================================================================================
// MAIN COMPONENT
// ===================================================================================
const AddEmoji = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [emojiImage, setEmojiImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setEmojiImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setEmojiImage(null); setImagePreview(null);
      alert('Please select a valid image file.');
    }
  };

  const handleRemoveImage = () => { setEmojiImage(null); setImagePreview(null); };
  const handleReset = () => { setTitle(''); setEmojiImage(null); setImagePreview(null); alert('Form has been reset.'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !emojiImage) {
      alert('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);

    try {
      const base64Image = await fileToBase64(emojiImage);
      const payload = { title: title, img: base64Image };
      
      // *** MODIFIED PART: Call the API using the VisionBase class ***
      const result = await VisionBase.post('/add-emoji', payload);
      
      console.log('Success:', result.message);
      alert('Emoji created successfully! Check the console for API simulation details.');
      handleReset();
      navigate('/allemoji');

    } catch (error) {
      console.error('Submission failed in component:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Emoji Studio</h1>
          <p className="text-gray-600 mt-1">Create and manage your custom emojis</p>
        </div>
        <div className="flex items-center space-x-3"><div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"><Sparkles className="h-6 w-6 text-white" /></div></div>
      </header>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="flex items-center space-x-2 text-sm bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/20">
          <li><a href="#" className="flex items-center text-violet-600 hover:text-violet-800 transition-colors"><Home className="h-4 w-4 mr-1.5" /> Home</a></li>
          <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
          <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Emoji</a></li>
          <li><ChevronRight className="h-4 w-4 text-gray-400" /></li>
          <li><span className="text-violet-600 font-semibold">Add New</span></li>
        </ol>
      </nav>

      {/* Main Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle><Menu className="h-6 w-6 mr-3 text-violet-600" />Add New Emoji</CardTitle>
          <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200"><ArrowLeft className="h-4 w-4 mr-2" /> Back</button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <FormRow label="Emoji Title" required>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter emoji title..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent text-sm bg-white/70 backdrop-blur-sm shadow-sm transition-all placeholder-gray-400" disabled={isLoading}/>
            </FormRow>
            <FormRow label="Emoji Image" required>
              <ModernFileUpload onFileChange={handleImageChange} preview={imagePreview} onRemove={handleRemoveImage} disabled={isLoading}/>
            </FormRow>
            <div className="flex flex-col sm:flex-row justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <button type="submit" disabled={isLoading || !title || !emojiImage} className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200">
                {isLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>Creating...</>) : (<><Send className="h-4 w-4 mr-2" />Create Emoji</>)}
              </button>
              <button type="button" onClick={handleReset} disabled={isLoading} className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-300 hover:to-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <RotateCcw className="h-4 w-4 mr-2" />Reset Form
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEmoji;