import { CollaborationRequest, User } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import api from '../../api/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { X, Check, MessageCircle } from 'lucide-react';

interface CollaborationRequestCardProps {
 request: CollaborationRequest;
 onStatusUpdate?: (requestId: string, status: 'accepted' | 'rejected') => void;
}

export const CollaborationRequestCard: React.FC<CollaborationRequestCardProps> = ({
 request,
 onStatusUpdate
}) => {
 const navigate = useNavigate();
 // The backend already populates the investor object
 const investor = request.investor as User;
 
 if (!investor) return null;
 
 const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
 try {
 await api.put(`/collaborations/${request.id || (request as any)._id}/status`, { status });
 toast.success(`Request ${status}`);
 if (onStatusUpdate) {
 onStatusUpdate(request.id, status);
 }
 } catch (err) {
 console.error(`Error updating collaboration status to ${status}:`, err);
 toast.error(`Failed to update request`);
 }
 };
 
 const handleAccept = () => handleUpdateStatus('accepted');
 const handleReject = () => handleUpdateStatus('rejected');
 
 const handleMessage = () => {
 navigate(`/chat/${investor.id}`);
 };
 
 const handleViewProfile = () => {
 navigate(`/profile/investor/${investor.id}`);
 };
 
 const getStatusBadge = () => {
 switch (request.status) {
 case 'pending':
 return <Badge variant="warning">Pending</Badge>;
 case 'accepted':
 return <Badge variant="success">Accepted</Badge>;
 case 'rejected':
 return <Badge variant="error">Declined</Badge>;
 default:
 return null;
 }
 };
 
 return (
 <Card className="transition-all duration-300 border-gray-100 shadow-sm hover:shadow-sm rounded-lg overflow-hidden">
 <CardBody className="flex flex-col p-6">
 <div className="flex justify-between items-start">
 <div className="flex items-start">
 <Avatar
 src={investor.avatarUrl}
 alt={investor.name}
 size="md"
 status={investor.profile?.isOnline || (investor as any).isOnline ? 'online' : 'offline'}
 className="mr-4 ring-offset-2"
 />
 
 <div>
 <h3 className="text-md font-medium text-gray-900 tracking-tight">{investor.name}</h3>
 <p className="text-xs font-medium text-gray-400 mt-0.5">
 {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
 </p>
 </div>
 </div>
 
 <div className="scale-90 origin-top-right">
 {getStatusBadge()}
 </div>
 </div>
 
 <div className="mt-5 p-4 bg-gray-50/50 rounded-lg border border-gray-100/50 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-1 h-full bg-primary-600/20" />
 <p className="text-sm font-medium text-gray-700 leading-relaxed italic">"{request.message}"</p>
 </div>
 </CardBody>
 
 <CardFooter className="border-t border-gray-100 bg-gray-50/30 p-4">
 {request.status === 'pending' ? (
 <div className="flex justify-between w-full gap-3">
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 className="rounded-lg font-medium px-4 text-xs border-gray-200"
 leftIcon={<X size={14} />}
 onClick={handleReject}
 >
 Decline
 </Button>
 <Button
 variant="success"
 size="sm"
 className="rounded-lg font-medium px-6 bg-emerald-500 border-none shadow-sm"
 leftIcon={<Check size={16} />}
 onClick={handleAccept}
 >
 Accept
 </Button>
 </div>
 
 <Button
 variant="primary"
 size="sm"
 className="rounded-lg font-medium bg-primary-600 shadow-sm"
 leftIcon={<MessageCircle size={16} />}
 onClick={handleMessage}
 >
 Message
 </Button>
 </div>
 ) : (
 <div className="flex justify-between w-full gap-3">
 <Button
 variant="outline"
 size="sm"
 className="rounded-lg font-medium px-6 border-gray-200 text-xs "
 leftIcon={<MessageCircle size={14} />}
 onClick={handleMessage}
 >
 Message
 </Button>
 
 <Button
 variant="primary"
 size="sm"
 className="rounded-lg font-medium bg-primary-600 px-4"
 onClick={handleViewProfile}
 >
 View Profile
 </Button>
 </div>
 )}
 </CardFooter>
 </Card>
 );
};