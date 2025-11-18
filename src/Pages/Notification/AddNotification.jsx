import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2, Bell } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

const AddNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await VisionBase.get('/notifications');
      setNotifications(response.data.data.rows || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load notifications.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description
      };

      await VisionBase.post('/notification', payload);
      
      setMessage({ type: 'success', text: 'Notification created successfully!' });
      setFormData({
        title: '',
        description: ''
      });
      
      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create notification. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await VisionBase.delete(`/notification/${notificationId}`);
      setMessage({ type: 'success', text: 'Notification deleted successfully!' });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete notification. Please try again.' 
      });
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: ''
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add Notification Form */}
        <Card className="shadow-lg">
          <CardHeader className="bg-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-700">Add Notification</span>
                </div>
              </div>
             
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

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Notification Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter notification title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Notification Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter notification description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full min-h-[150px] resize-none"
                  rows={6}
                  required
                />
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

        {/* Notifications List */}
        <Card className="shadow-lg">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg font-medium text-gray-700">
              Notifications List
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications found. Create your first notification above.
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {notification.description}
                      </p>
                      {notification.created_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddNotification;