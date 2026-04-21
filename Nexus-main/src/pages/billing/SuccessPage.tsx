import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import toast from 'react-hot-toast';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { updatePartialUser } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;
      
      try {
        const res = await api.get(`/stripe/verify-session/${sessionId}`);
        if (res.data.success) {
          toast.success(`Success! Your account is now ${res.data.plan.toUpperCase()}.`);
          // Update local state immediately
          if (res.data.user) {
            updatePartialUser(res.data.user);
          }
        }
      } catch (err) {
        console.error('Session verification failed:', err);
      }
    };

    verifyPayment();
  }, [sessionId, updatePartialUser]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-sm animate-fade-in">
        <CardBody className="p-10">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          
          <h1 className="text-lg font-medium text-gray-900 mb-4 tracking-tight">Payment Successful!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for your purchase. Your account has been upgraded and your premium features are now active.
          </p>
          
          <div className="space-y-3">
            <Button 
              fullWidth 
              onClick={() => navigate('/settings')} 
              className="bg-gray-900 hover:bg-black text-white py-4 font-medium rounded-lg"
            >
              Go to Settings <ArrowRight size={18} className="ml-2" />
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
