import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';

export const CancelPage: React.FC = () => {
 const navigate = useNavigate();

 return (
 <div className="min-h-[80vh] flex items-center justify-center p-4">
 <Card className="max-w-md w-full text-center shadow-sm animate-fade-in">
 <CardBody className="p-10">
 <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
 <XCircle size={40} />
 </div>
 
 <h1 className="text-lg font-medium text-gray-900 mb-4 tracking-tight">Payment Cancelled</h1>
 <p className="text-gray-600 mb-8 leading-relaxed">
 The checkout process was cancelled. No charges were made to your account.
 </p>
 
 <div className="space-y-3">
 <Button 
 fullWidth 
 onClick={() => navigate('/settings')} 
 className="bg-gray-900 hover:bg-black text-white py-4 font-medium rounded-lg"
 >
 <ArrowLeft size={18} className="mr-2" /> Return to Billing
 </Button>
 <Button 
 variant="outline" 
 fullWidth 
 onClick={() => navigate('/dashboard')}
 className="border-gray-200 text-gray-600 hover:bg-gray-50 py-4 font-medium rounded-lg"
 >
 Back to Dashboard
 </Button>
 </div>
 </CardBody>
 </Card>
 </div>
 );
};
