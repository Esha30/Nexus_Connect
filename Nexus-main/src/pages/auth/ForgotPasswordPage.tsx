import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
 const [email, setEmail] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [isSubmitted, setIsSubmitted] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const { forgotPassword } = useAuth();
 
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 setError(null);
 
 try {
 await forgotPassword(email);
 setIsSubmitted(true);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Forgot password request failed');
 } finally {
 setIsLoading(false);
 }
 };
 
 if (isSubmitted) {
 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-4">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="text-center">
 <Mail className="mx-auto h-12 w-12 text-primary-600" />
 <h2 className="mt-6 text-lg font-semibold text-gray-900">
 Check your email
 </h2>
 <p className="mt-2 text-sm text-gray-600">
 We've sent password reset instructions to {email}
 </p>
 </div>
 
 <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-5">
 <div className="space-y-4">
 <p className="text-sm text-gray-500">
 Didn't receive the email? Check your spam folder or try again.
 </p>
 
 <Button
 variant="outline"
 fullWidth
 onClick={() => setIsSubmitted(false)}
 >
 Try again
 </Button>
 
 <Link to="/login">
 <Button
 variant="ghost"
 fullWidth
 leftIcon={<ArrowLeft size={18} />}
 >
 Back to login
 </Button>
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
 }
 
 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-4">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="text-center">
 <Mail className="mx-auto h-12 w-12 text-primary-600" />
 <h2 className="mt-6 text-lg font-semibold text-gray-900">
 Forgot your password?
 </h2>
 <p className="mt-2 text-sm text-gray-600">
 Enter your email address and we'll send you instructions to reset your password.
 </p>
 </div>
 
 <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-5">
 {error && (
 <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start animate-shake">
 <span className="text-sm font-medium">{error}</span>
 </div>
 )}
 <form className="space-y-6" onSubmit={handleSubmit}>
 <Input
 label="Email address"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 fullWidth
 startAdornment={<Mail size={18} />}
 />
 
 <Button
 type="submit"
 fullWidth
 isLoading={isLoading}
 >
 Send reset instructions
 </Button>
 
 <Link to="/login">
 <Button
 variant="ghost"
 fullWidth
 leftIcon={<ArrowLeft size={18} />}
 >
 Back to login
 </Button>
 </Link>
 </form>
 </div>
 </div>
 </div>
 );
};