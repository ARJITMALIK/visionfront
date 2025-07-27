import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

const AddElection = () => {
  const [formData, setFormData] = useState({
    election_name: '',
    state: '',
    election_date: '',
    election_desc: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    // Union Territories
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.election_name || !formData.state || !formData.election_date) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        election_date: formData.election_date,
        election_desc: formData.election_desc,
        state: formData.state,
        election_name: formData.election_name
      };

      // Simulating API call since VisionBase is not available
      await VisionBase.post('/add-election', payload);
      
      setMessage({ type: 'success', text: 'Election created successfully!' });
      // Reset form
      setFormData({
        election_name: '',
        state: '',
        election_date: '',
        election_desc: ''
      });
    } catch (error) {
      console.error('Error creating election:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create election. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      election_name: '',
      state: '',
      election_date: '',
      election_desc: ''
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                  <span className="text-lg font-medium text-gray-700">Election</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-red-500 hover:bg-red-600 text-white border-red-500">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {message.text && (
              <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="election_name" className="text-sm font-medium text-gray-700">
                    Election Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="election_name"
                    type="text"
                    placeholder="Election Name"
                    value={formData.election_name}
                    onChange={(e) => handleInputChange('election_name', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="election_date" className="text-sm font-medium text-gray-700">
                    Election Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="election_date"
                      type="date"
                      value={formData.election_date}
                      onChange={(e) => handleInputChange('election_date', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="election_desc" className="text-sm font-medium text-gray-700">
                    Election Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="election_desc"
                    placeholder="Enter election description..."
                    value={formData.election_desc}
                    onChange={(e) => handleInputChange('election_desc', e.target.value)}
                    className="w-full min-h-[200px] resize-none"
                    rows={8}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 px-6 py-2"
                >
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

export default AddElection;