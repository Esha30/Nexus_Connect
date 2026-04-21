import React from 'react';
import { 
 Eye, 
 UserPlus, 
 CheckCircle2, 
 MessageSquare, 
 Calendar, 
 FileText,
 Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
 _id: string;
 action: string;
 actor: {
 name: string;
 profile?: {
 avatarUrl?: string;
 };
 role: string;
 };
 metadata: Record<string, unknown>;
 createdAt: string;
}

interface ActivityFeedProps {
 activities: ActivityItem[];
 isLoading?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading }) => {
 const getActionDetails = (activity: ActivityItem) => {
 switch (activity.action) {
 case 'PROFILE_VIEW':
 return {
 icon: <Eye size={16} className="text-primary-600" />,
 text: (
 <span>
 <span className="font-medium text-gray-900">{activity.actor.name}</span> viewed your profile
 </span>
 ),
 bg: 'bg-primary-50'
 };
 case 'COLLABORATION_REQUEST':
 return {
 icon: <UserPlus size={16} className="text-indigo-600" />,
 text: (
 <span>
 <span className="font-medium text-gray-900">{activity.actor.name}</span> sent you a collaboration request
 </span>
 ),
 bg: 'bg-indigo-50'
 };
 case 'COLLABORATION_ACCEPTED':
 return {
 icon: <CheckCircle2 size={16} className="text-emerald-600" />,
 text: (
 <span>
 <span className="font-medium text-gray-900">{activity.actor.name}</span> accepted your request!
 </span>
 ),
 bg: 'bg-emerald-50'
 };
 case 'MESSAGE_SENT':
 return {
 icon: <MessageSquare size={16} className="text-primary-600" />,
 text: (
 <span>
 New message from <span className="font-medium text-gray-900">{activity.actor.name}</span>
 </span>
 ),
 bg: 'bg-primary-50'
 };
 case 'MEETING_SCHEDULED':
 return {
 icon: <Calendar size={16} className="text-amber-600" />,
 text: (
 <span>
 Meeting scheduled with <span className="font-medium text-gray-900">{activity.actor.name}</span>
 </span>
 ),
 bg: 'bg-amber-50'
 };
 case 'SYSTEM_NEWS':
 return {
 icon: <Sparkles size={16} className="text-primary-600" />,
 text: (
 <span>
 <span className="font-bold text-gray-900">Pulse:</span> {activity.metadata?.message || 'New platform update available.'}
 </span>
 ),
 bg: 'bg-primary-50'
 };
 default:
 return {
 icon: <FileText size={16} className="text-gray-500" />,
 text: <span className="font-medium">Recent activity from <span className="font-medium">{activity.actor.name}</span></span>,
 bg: 'bg-gray-50'
 };
 }
 };

 if (isLoading) {
 return (
 <div className="space-y-6 p-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="flex gap-4 animate-pulse">
 <div className="w-12 h-12 bg-gray-100 rounded-lg" />
 <div className="flex-1 space-y-3 py-1">
 <div className="h-4 bg-gray-100 rounded-full w-3/4" />
 <div className="h-3 bg-gray-100 rounded-full w-1/4" />
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (!activities || activities.length === 0) {
 return (
 <div className="text-center py-12 px-6">
 <div className="bg-gray-50 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-100">
 <Clock size={24} className="text-gray-300" />
 </div>
 <p className="text-gray-400 font-medium text-xs">No sequence protocols found.</p>
 </div>
 );
 }

 return (
 <div className="flow-root p-8">
 <ul className="-mb-8">
 {activities.map((activity, activityIdx) => {
 const { icon, text, bg } = getActionDetails(activity);
 return (
 <li key={activity._id}>
 <div className="relative pb-8">
 {activityIdx !== activities.length - 1 ? (
 <span className="absolute left-6 top-6 -ml-px h-full w-0.5 bg-gray-50" aria-hidden="true" />
 ) : null}
 <div className="relative flex items-start space-x-4">
 <div className={`relative p-3 rounded-lg scale-95 hover:scale-100 transition-all duration-300 shadow-sm border border-gray-100 ${bg}`}>
 {icon}
 </div>
 <div className="min-w-0 flex-1 pt-1.5">
 <div className="text-sm font-medium text-gray-600 leading-relaxed">
 {text}
 </div>
 <div className="mt-1 text-xs font-medium text-gray-400 flex items-center">
 <Clock size={10} className="mr-1.5" />
 {formatDistanceToNow(new Date(activity.createdAt))} ago
 </div>
 </div>
 </div>
 </div>
 </li>
 );
 })}
 </ul>
 </div>
 );
};
