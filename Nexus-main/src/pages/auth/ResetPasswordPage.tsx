import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ResetPasswordPage: React.FC = () => {
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 
 const [error, setError] = useState<string | null>(null);
 const { resetPassword } = useAuth();
 const token = searchParams.get('token');
 
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 
 if (!token) {
 setError('Invalid reset token');
 return;
 }
 
 if (password !== confirmPassword) {
 setError('Passwords do not match');
 return;
 }
 
 setIsLoading(true);
 
 try {
 await resetPassword(token, password);
 navigate('/login');
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Reset password failed');
 } finally {
 setIsLoading(false);
 }
 };
 
 if (!token) {
 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-4">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="text-center">
 <h2 className="text-lg font-semibold text-gray-900">
 Invalid reset link
 </h2>
 <p className="mt-2 text-sm text-gray-600">
 This password reset link is invalid or has expired.
 </p>
 <Button
 className="mt-4"
 onClick={() => navigate('/forgot-password')}
 >
 Request new reset link
 </Button>
 </div>
 </div>
 </div>
 );
 }
 
 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-4">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="text-center">
 <Lock className="mx-auto h-12 w-12 text-primary-600" />
 <h2 className="mt-6 text-lg font-semibold text-gray-900">
 Reset your password
 </h2>
 <p className="mt-2 text-sm text-gray-600">
 Enter your new password below
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
 label="New password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 fullWidth
 startAdornment={<Lock size={18} />}
 />
 
 <Input
 label="Confirm new password"
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 fullWidth
 startAdornment={<Lock size={18} />}
 error={password !== confirmPassword ? 'Passwords do not match' : undefined}
 />
 
 <Button
 type="submit"
 fullWidth
 isLoading={isLoading}
 >
 Reset password
 </Button>
 </form>
 </div>
 </div>
 </div>
 );
};