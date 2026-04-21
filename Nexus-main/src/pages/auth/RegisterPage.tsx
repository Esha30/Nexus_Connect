import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CircleDollarSign, Building2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [role, setRole] = useState<UserRole>('entrepreneur');
 const [error, setError] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const [requiresOTP, setRequiresOTP] = useState(false);
 const [otp, setOtp] = useState('');
 
 const { register, googleLogin, verifyOTP } = useAuth();
 const navigate = useNavigate();

 const handleGoogleSuccess = async (response: { credential?: string }) => {
 setError(null);
 setIsLoading(true);
 try {
 if (response.credential) {
 await googleLogin(response.credential, role);
 navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
 }
 } catch (err) {
  if (err instanceof Error && err.message.includes('403')) {
    setError('Google Sign-in requires origin verification in GCP console. Please see documentation.');
  } else {
    setError(err instanceof Error ? err.message : 'Google Sign-up Failed');
  }
  setIsLoading(false);
 }
 };
 
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 
 // Validate passwords match
 if (password !== confirmPassword) {
 setError('Passwords do not match');
 return;
 }
 
 setIsLoading(true);
 
 try {
 const result = await register(name, email, password, role);
 if (result && result.requiresVerification) {
 setRequiresOTP(true);
 } else {
 navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Registration failed');
 } finally {
 setIsLoading(false);
 }
 };

 const handleOTPVerify = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 setIsLoading(true);
 try {
 await verifyOTP(email, otp, role);
 navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Verification failed');
 } finally {
 setIsLoading(false);
 }
 };
 
 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-4">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="flex justify-center mb-6">
 <div className="h-24 flex items-center justify-center">
 <img src="/logo.png" alt="Nexus Logo" className="h-full object-contain scale-150" />
 </div>
 </div>
 <h2 className="mt-6 text-center text-lg font-semibold text-gray-900">
 {requiresOTP ? 'Verify your email' : 'Create your account'}
 </h2>
 <p className="mt-2 text-center text-sm text-gray-600">
 {requiresOTP ? `Enter the 6-digit code sent to ${email}` : 'Join Business Nexus to connect with partners'}
 </p>
 </div>

 <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
 <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-5">
 {error && (
 <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
 <AlertCircle size={18} className="mr-2 mt-0.5" />
 <span>{error}</span>
 </div>
 )}
 
 {requiresOTP ? (
 <form className="space-y-6" onSubmit={handleOTPVerify}>
 <Input
 label="Security Code"
 type="text"
 maxLength={6}
 placeholder="000000"
 value={otp}
 onChange={(e) => setOtp(e.target.value)}
 required
 disabled={isLoading}
 fullWidth
 startAdornment={<Shield size={18} />}
 />
 <Button type="submit" fullWidth isLoading={isLoading}>
 Verify & Register
 </Button>
 </form>
 ) : (
 <>
 <form className="space-y-6" onSubmit={handleSubmit}>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 I am registering as a
 </label>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
 role === 'entrepreneur'
 ? 'border-primary-500 bg-primary-50 text-primary-700'
 : 'border-gray-300 text-gray-700 hover:bg-gray-50'
 }`}
 onClick={() => setRole('entrepreneur')}
 >
 <Building2 size={18} className="mr-2" />
 Entrepreneur
 </button>
 
 <button
 type="button"
 className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
 role === 'investor'
 ? 'border-primary-500 bg-primary-50 text-primary-700'
 : 'border-gray-300 text-gray-700 hover:bg-gray-50'
 }`}
 onClick={() => setRole('investor')}
 >
 <CircleDollarSign size={18} className="mr-2" />
 Investor
 </button>
 </div>
 </div>
 
 <Input
 label="Full name"
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 disabled={isLoading}
 fullWidth
 startAdornment={<User size={18} />}
 />
 
 <Input
 label="Email address"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 disabled={isLoading}
 fullWidth
 startAdornment={<Mail size={18} />}
 />
 
 <Input
 label="Password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 disabled={isLoading}
 fullWidth
 startAdornment={<Lock size={18} />}
 />
 
 <Input
 label="Confirm password"
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 disabled={isLoading}
 fullWidth
 startAdornment={<Lock size={18} />}
 />
 
 <div className="flex items-center">
 <input
 id="terms"
 name="terms"
 type="checkbox"
 required
 disabled={isLoading}
 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
 />
 <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
 I agree to the{' '}
 <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
 Terms of Service
 </a>{' '}
 and{' '}
 <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
 Privacy Policy
 </a>
 </label>
 </div>
 
 <Button
 type="submit"
 fullWidth
 isLoading={isLoading}
 className="rounded-lg h-12 shadow-sm"
 >
 Create account
 </Button>
 </form>
 
 <div className="mt-6">
 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-gray-300"></div>
 </div>
 <div className="relative flex justify-center text-sm">
 <span className="px-2 bg-white text-gray-500">Or continue with</span>
 </div>
 </div>

 <div className="mt-6 flex flex-col gap-3">
 <div className="flex justify-center">
 <GoogleLogin
 onSuccess={handleGoogleSuccess}
 onError={() => setError('Google Sign-in failed or misconfigured in GCP console')}
 theme="filled_blue"
 shape="pill"
 size="large"
 />
 </div>
 </div>
 </div>
 </>
 )}
 
 <div className="mt-6 text-center">
 <p className="text-sm text-gray-600">
 Already have an account?{' '}
 <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
 Sign in
 </Link>
 </p>
 </div>
 </div>
 </div>
 </div>
 );
};