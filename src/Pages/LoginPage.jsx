import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

// Import Lucide icons
import { Mail, Lock, Cloud, BarChart3, ChevronRight, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Logging in with:', formData);

    try {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Login successful! Redirecting to dashboard...');
        navigate('/dashboard'); 
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at top, #667eea 0%, #764ba2 100%)',
          animation: 'gradientShift 8s ease-in-out infinite alternate'
        }}
      />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-white to-transparent transform -rotate-12 left-1/4 animate-pulse" />
        <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-white to-transparent transform rotate-12 right-1/4 animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        {/* Glassmorphism container */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Animated top accent */}
          <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse" />
          
          {/* Card Header */}
          <div className="relative p-8 text-center">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_transparent_20%,_white_21%,_white_22%,_transparent_23%)] bg-[length:20px_20px]" />
            </div>
            
            {/* Logo with hover animation */}
            <div className="relative inline-block bg-white/90 backdrop-blur-sm text-black py-3 px-5 rounded-2xl mx-auto mb-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 flex items-center justify-center">
                  <img src="https://visiondata.in/wp-content/uploads/2023/09/WhatsApp_Image_2023-09-14_at_12.56.23_PM-removebg-preview-e1695032684224.png" alt="Vision Data Logo" className="h-10 w-10" />
                </div>
                <div className="text-left">
                  <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    VISION DATA
                  </h1>
                  <p className="text-gray-500 text-xs leading-tight">Powered by Abhasthra Technology</p>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-light text-white mb-2">
              Welcome <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Back</span>
            </h2>
            <p className="text-white/70 text-sm">Sign in to continue to your dashboard</p>
          </div>

          {/* Card Body */}
          <div className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username field */}
              <div className="relative group">
                <div className={`relative bg-white/10 backdrop-blur-sm border rounded-2xl transition-all duration-300 ${
                  focusedField === 'username' ? 'border-blue-400 shadow-lg shadow-blue-400/25' : 'border-white/20'
                }`}>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'username' ? 'text-blue-400' : 'text-white/60'
                    }`} />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-12 pr-4 py-4 h-14 text-white placeholder-white/50 rounded-2xl"
                    required
                  />
                </div>
                <label htmlFor="username" className="absolute -top-2 left-4 px-2 text-xs font-medium text-white/80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full">
                  Username
                </label>
              </div>

              {/* Password field */}
              <div className="relative group">
                <div className={`relative bg-white/10 backdrop-blur-sm border rounded-2xl transition-all duration-300 ${
                  focusedField === 'password' ? 'border-blue-400 shadow-lg shadow-blue-400/25' : 'border-white/20'
                }`}>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-blue-400' : 'text-white/60'
                    }`} />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-12 pr-12 py-4 h-14 text-white placeholder-white/50 rounded-2xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <label htmlFor="password" className="absolute -top-2 left-4 px-2 text-xs font-medium text-white/80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full">
                  Password
                </label>
              </div>
              
              {/* Remember me and Login button */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-3">
                  <Switch 
                    id="remember-me" 
                    checked={formData.rememberMe} 
                    onCheckedChange={handleSwitchChange}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <label htmlFor="remember-me" className="text-sm text-white/80 select-none cursor-pointer hover:text-white transition-colors duration-300">
                    Remember me
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-6 py-3 h-12 text-sm font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    <>
                      <span>Login</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Forgot password link */}
            <div className="text-center mt-8">
              <Button asChild variant="link" className="text-white/80 hover:text-white p-0 h-auto text-sm transition-colors duration-300">
                <Link to="/forgot-password" className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-blue-400 after:to-purple-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">
                  Forgot password?
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background: radial-gradient(ellipse at top, #667eea 0%, #764ba2 100%); }
          50% { background: radial-gradient(ellipse at bottom, #f093fb 0%, #f5576c 100%); }
          100% { background: radial-gradient(ellipse at top, #4facfe 0%, #00f2fe 100%); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;