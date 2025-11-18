import React, { useState } from 'react';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import Lucide icons
import { Phone, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Hardcoded credentials
  const VALID_NUMBER = '6350669414';
  const VALID_PASSWORD = 'vision@2025';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(''); // Clear error when user starts typing
  };
const navigate = useNavigate();
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check credentials
      if (formData.mobileNumber === VALID_NUMBER && formData.password === VALID_PASSWORD) {
        // Success - show success message
        setLoginSuccess(true);
        navigate('/dashboard');
        console.log('Login successful! Redirecting to dashboard...');
      } else {
        setError('Invalid mobile number or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMobileNumber = (number) => {
    if (number.length <= 5) return number;
    return `${number.slice(0, 5)} ${number.slice(5)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Main login container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
            {/* Header background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)] opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)] opacity-50" />
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl mb-6">
                <img 
                  src="https://visiondata.in/wp-content/uploads/2023/09/WhatsApp_Image_2023-09-14_at_12.56.23_PM-removebg-preview-e1695032684224.png" 
                  alt="Vision Data Logo" 
                  className="h-8 w-8"
                />
                <div className="text-left">
                  <h1 className="font-bold text-lg text-white leading-tight">VISION DATA</h1>
                  <p className="text-blue-100 text-xs leading-tight">Powered by Abhasthra Technology</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Secure Access
              </h2>
              <p className="text-blue-100 text-sm">
                Enter your credentials to continue
              </p>
            </div>
          </div>

          {/* Form section */}
          <div className="p-8">
            {loginSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Successful!</h3>
                <p className="text-gray-600">Welcome to Vision Data Dashboard</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mobile number field */}
                <div className="space-y-2">
                  <label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className={`relative group ${focusedField === 'mobileNumber' ? 'ring-2 ring-blue-500' : ''} rounded-lg transition-all duration-200`}>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Phone className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'mobileNumber' ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={formatMobileNumber(formData.mobileNumber)}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('mobileNumber')}
                      onBlur={() => setFocusedField(null)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      className="w-full pl-10 pr-4 py-3 h-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 bg-gray-50 focus:bg-white transition-all duration-200"
                      required
                      maxLength="11" // Account for space in formatting
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className={`relative group ${focusedField === 'password' ? 'ring-2 ring-blue-500' : ''} rounded-lg transition-all duration-200`}>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      className="w-full pl-10 pr-12 py-3 h-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 bg-gray-50 focus:bg-white transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Login button */}
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading || !formData.mobileNumber || !formData.password}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Footer info */}
            {!loginSuccess && (
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  Secure login protected by advanced encryption
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom branding */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/70">
            © 2025 Vision Data. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;