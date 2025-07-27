import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // <-- IMPORT LINK FOR NAVIGATION

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Import Lucide icons
import { Mail, Cloud, BarChart3, ChevronRight, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Sending password reset for:', { email });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setIsModalOpen(true);
      } else {
        alert('Failed to send reset link.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to bottom right, #4A89DC, #A8D3F1 60%, #FFFFFF)' }}>
          <div className="absolute top-0 left-0 w-full h-full opacity-15 transform -rotate-45">
            <div className="absolute w-[2px] h-full bg-white left-1/4"></div>
            <div className="absolute w-[1px] h-full bg-white left-1/3"></div>
          </div>
        </div>
        
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#5B95EF] text-white p-8">
            <div className="flex justify-center mb-5">
              <div className="bg-white p-3 rounded-xl shadow-lg inline-block">
                <div className="flex items-center space-x-2">
                  <div className="relative h-10 w-10 flex items-center justify-center">
                    <Cloud className="text-[#5B95EF] h-10 w-10" />
                    <BarChart3 className="absolute text-[#3e7ac5]/80 h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-lg text-gray-800 tracking-wide">VISION DATA</span>
                    <span className="text-[10px] text-gray-500">Powered by Abhasthra Technology</span>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl text-center">Reset Password</h2>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input id="email" name="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-100 border-gray-200 rounded-md pl-10 pr-4 py-6 text-base" required aria-label="Email" />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-[#4A89DC] hover:bg-[#3e7ac5] text-white rounded-md px-4 py-2 w-full sm:w-auto" disabled={isLoading}>
                  {isLoading ? 'Sending...' : <><ChevronRight className="h-5 w-5 mr-1" /> Reset Password</>}
                </Button>
              </div>
            </form>

            {/* IMPROVED NAVIGATION LINK */}
            <div className="text-center mt-8">
              <span className="text-sm text-gray-600">Did you remember your password? </span>
              <Button asChild variant="link" className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <CheckCircle className="h-6 w-6 mr-2 text-green-500" /> Request Sent
            </DialogTitle>
            <DialogDescription className="pt-2">
              If an account with the email <strong>{email}</strong> exists, a password reset link has been sent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ForgotPasswordPage;