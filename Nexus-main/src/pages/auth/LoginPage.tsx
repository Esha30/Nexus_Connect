import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [otp, setOtp] = useState('');

  const handleGoogleSuccess = async (response: { credential?: string }) => {
    setError(null);
    setIsLoading(true);
    try {
      if (response.credential) {
        const result = await googleLogin(response.credential, role);
        if (result && typeof result === 'object' && 'requires2FA' in result && result.requires2FA) {
          setEmail((result as { email?: string }).email || '');
          setRequires2FA(true);
          setIsLoading(false);
          return;
        }

        if (result?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('403')) {
        setError('Google Sign-in requires origin verification in GCP console.');
      } else {
        setError(err instanceof Error ? err.message : 'Google login failed');
      }
      setIsLoading(false);
    }
  };

  const { login, verifyOTP, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (requires2FA) {
        const otpResult = await verifyOTP(email, otp, role);
        if (otpResult?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
        }
        return;
      }

      const result = await login(email, password, role);
      
      if (result && result.requires2FA) {
        setRequires2FA(true);
        setIsLoading(false);
        return;
      }

      if (result?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'entrepreneur') {
      setEmail('demo@entrepreneur.com');
      setPassword('password123');
    } else {
      setEmail('demo@investor.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-24 flex items-center justify-center">
            <img src="/logo.png" alt="Nexus Logo" className="h-full object-contain scale-150" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
          {requires2FA ? 'Two-factor authentication' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          {requires2FA ? 'Enter the code from your authenticator app' : 'Connect with entrepreneurs and investors worldwide'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!requires2FA ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sign in as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                        role === 'entrepreneur'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setRole('entrepreneur')}
                    >
                      <Building2 size={18} className="mr-2" />
                      Entrepreneur
                    </button>
                    
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                        role === 'investor'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setRole('investor')}
                    >
                      <CircleDollarSign size={18} className="mr-2" />
                      Investor
                    </button>
                  </div>
                </div>
                
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  fullWidth
                  placeholder="name@company.com"
                  startAdornment={<User size={18} />}
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  fullWidth
                  placeholder="••••••••"
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-2">
                   <p className="text-sm text-gray-500">Check your authenticator app</p>
                   <p className="text-sm font-medium text-gray-900">Google Authenticator or Authy</p>
                </div>
                <Input
                  label="Verification code"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={isLoading}
                  fullWidth
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setRequires2FA(false)}
                  className="w-full text-center text-sm text-primary-600 font-medium hover:underline"
                >
                  Back to login
                </button>
              </div>
            )}
            
            {!requires2FA && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </Link>
              </div>
            )}
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="py-2.5"
            >
              {requires2FA ? 'Verify' : 'Sign in'}
            </Button>
          </form>

          {!requires2FA && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-in failed or misconfigured in GCP console')}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo accounts</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('entrepreneur')}
                leftIcon={<Building2 size={14} />}
              >
                Entrepreneur
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('investor')}
                leftIcon={<CircleDollarSign size={14} />}
              >
                Investor
              </Button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};