export type UserRole = 'entrepreneur' | 'investor' | 'admin';

export interface UserProfile {
  bio?: string;
  location?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  industry?: string;
  startupName?: string;
  pitchSummary?: string;
  company?: string;
  priorityAccess?: 'none' | 'pending' | 'approved';
  isOnline?: boolean;
  lastActive?: string;
  aiUsageCount?: number;
  endorsements?: string[];
  endorsementCount?: number;
  foundedYear?: number;
  teamSize?: number;
  fundingNeeded?: string;
  valuation?: string;
  problemStatement?: string;
  solution?: string;
  marketOpportunity?: string;
  competitiveAdvantage?: string;
  investmentStage?: string[];
  investmentInterests?: string[];
  portfolioCompanies?: string[];
  totalInvestments?: number;
  minimumInvestment?: string;
  maximumInvestment?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  profile?: UserProfile;
  isOnline?: boolean;
  createdAt?: string;
  lastActive?: string;
  walletBalance: number;
  subscription: {
    plan: 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'past_due' | 'cancelled';
    updatedAt: string;
  };
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  bio?: string;
  foundedYear: number;
  teamSize: number;
  collaborationRequests?: CollaborationRequest[];
}

export interface Investor extends User {
  role: 'investor';
  location?: string;
  bio?: string;
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  replyTo?: {
    id: string;
    senderId: string;
    content: string;
  };
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  partner?: {
    id: string;
    name: string;
    avatarUrl?: string;
    isOnline: boolean;
    lastActive?: string;
  };
  lastMessage?: Message;
  updatedAt: string;
  unreadCount?: number;
}

export interface CollaborationRequest {
  id: string;
  _id?: string;
  investorId: string;
  entrepreneurId: string;
  investor?: User;
  entrepreneur?: User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export interface Transaction {
  _id: string;
  amount: number;
  type: 'deposit' | 'transfer' | 'withdrawal' | 'subscription' | 'investment';
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  createdAt: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  host: {
    _id: string;
    name: string;
    profile?: {
      avatarUrl?: string;
    };
  };
  participants: Array<{
    _id: string;
    name: string;
    profile?: {
      avatarUrl?: string;
    };
  }>;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'live' | 'completed';
  roomID?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<any>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  googleLogin: (credential: string, role: UserRole) => Promise<any>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  verifyOTP: (email: string, otp: string, role: UserRole) => Promise<any>;
  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  confirm2FA: (token: string) => Promise<boolean>;
  updatePartialUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    profile?: {
      avatarUrl?: string;
    };
  };
  type: 'message' | 'connection' | 'investment' | 'meeting' | 'system';
  content: string;
  isRead: boolean;
  relatedEntity?: string;
  createdAt: string;
}

export interface Deal {
  _id: string;
  investor: {
    _id: string;
    name: string;
    profile?: {
      avatarUrl?: string;
    };
  };
  startup: {
    _id: string;
    name: string;
    profile?: {
      avatarUrl?: string;
      startupName?: string;
      industry?: string;
    };
  };
  amount: number;
  equity: number;
  status: 'Due Diligence' | 'Term Sheet' | 'Negotiation' | 'Closed' | 'Passed';
  stage: string;
  lastActivity: string;
  createdAt: string;
}