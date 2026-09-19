export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'moderator' | 'support';
  avatar?: string;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  type: 'MULTI_ACCOUNT_FREE_CHAT' | 'DIRECT_CONTACT_LEAK' | 'PAYMENT_BYPASS_UPI';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  phone?: string;
  astrologerId?: string;
  astrologerName?: string;
  evidence: string;
  deviceFingerprint: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface BannedEntity {
  id: string;
  entityType: 'device' | 'user' | 'astrologer' | 'phone';
  identifier: string;
  name: string;
  reason: string;
  bannedAt: string;
  duration: '24 Hours' | '7 Days' | '30 Days' | 'Permanent';
}

export interface AstrologerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialties: string[];
  experienceYears: number;
  ratePerMin: number;
  rating: number;
  reviewsCount: number;
  totalConsultations: number;
  status: 'active' | 'pending_verification' | 'suspended';
  commissionRate: number; // e.g. 75 means 75% to astrologer, 25% to platform
  onDuty: boolean;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  totalSpent: number;
  kundliCreated: boolean;
  isVip: boolean;
  createdAt: string;
  status: 'active' | 'warned' | 'suspended';
}

export interface OrderItem {
  id: string;
  customerName: string;
  phone: string;
  itemType: 'puja' | 'gemstone' | 'rudraksha' | 'yantra';
  title: string;
  amount: number;
  sankalpDetails?: string;
  status: 'pending' | 'pandit_assigned' | 'performed' | 'dispatched' | 'delivered';
  trackingNumber?: string;
  createdAt: string;
}

export interface WebsiteChapter {
  id: string;
  title: string;
  badge: string;
  description: string;
  enabled: boolean;
}

export interface WebsiteConfig {
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  announcementText: string;
  topBannerText: string;
  topBannerEnabled: boolean;
  maintenanceMode: boolean;
  showcaseEnabled: boolean;
  tarotEnabled: boolean;
  voiceEnabled: boolean;
  downloadEnabled: boolean;
  ratings: {
    score: string;
    reviewCount: string;
    todayConsultations: string;
  };
  chapters: WebsiteChapter[];
  tarotSettings: {
    yesNoPrice: number;
    audioReadingEnabled: boolean;
  };
}

