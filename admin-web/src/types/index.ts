export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'sub_admin' | 'moderator' | 'support';
  avatar?: string;
  phone?: string;
  assignedRegion?: string;
  licenseId?: string;
  subAdminId?: string;
  permissions?: SubAdminPermissions;
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

export interface AstrologerDailyEarning {
  date: string; // ISO date 'YYYY-MM-DD'
  formattedDate: string; // e.g. '29 Sep 2026'
  dayOfWeek: string; // e.g. 'Tuesday'
  consultationsCount: number;
  chatConsultations: number;
  callConsultations: number;
  totalBillableMinutes: number;
  grossRevenue: number;
  commissionRate: number;
  platformCommission: number;
  netPayout: number;
  payoutStatus: 'settled' | 'pending';
  payoutReference?: string;
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
  isFeatured?: boolean;
  boostRank?: number;
  strikesCount?: number;
  penaltyPausedUntil?: string | null;
  dailyEarnings?: AstrologerDailyEarning[];
  lifetimeEarned?: number;
  pendingPayout?: number;
}

export interface LiveConsultationSession {
  id: string;
  type: 'audio_call' | 'chat' | 'video_call';
  astrologerId: string;
  astrologerName: string;
  astrologerAvatar: string;
  userId: string;
  userName: string;
  userPhone: string;
  startedAt: string;
  ratePerMin: number;
  durationSeconds: number;
  totalBilled: number;
  status: 'active' | 'terminated_by_admin' | 'completed';
  flaggedReason?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  targetEntity: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress?: string;
}

export interface SystemHealthConfig {
  maintenanceMode: boolean;
  maintenanceNotice: string;
  estimatedDowntime: string;
  allowAdminsBypass: boolean;
  lastUpdated?: string;
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

export interface ReengagementCampaign {
  id: string;
  title: string;
  body: string;
  channel: 'push' | 'whatsapp' | 'sms' | 'omnichannel';
  segment: 'dormant_with_balance' | 'zero_balance' | 'first_time_dropouts' | 'vip' | 'all';
  deepLink: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  consultationsUnlocked: number;
  revenueGenerated: number;
  status: 'dispatched' | 'scheduled' | 'active_rule';
  sentAt: string;
}

export interface AutomatedTriggerRule {
  id: string;
  name: string;
  description: string;
  channel: 'push' | 'whatsapp' | 'sms';
  targetSegment: string;
  triggerCondition: string;
  scheduleTime: string;
  enabled: boolean;
  timesTriggered: number;
  revenueImpact: number;
}

export interface SubAdminPermissions {
  // Astrologer Sector
  canViewAstrologers: boolean;
  canEditTariffs: boolean;
  canApproveKYC: boolean;
  canGenerateAstroId: boolean;
  canViewDayWiseIncome: boolean;
  canSettlePayouts: boolean;

  // Live Operations & Security
  canMonitorLiveSessions: boolean;
  canTerminateSessions: boolean;
  canIssueStrikes: boolean;
  canAccessWatchtower: boolean;
  canBanDevices: boolean;

  // Users & Wallets
  canViewUsers: boolean;
  canAdjustWallet: boolean;
  maxWalletCreditLimitPerDay: number; // in INR
  canSuspendUsers: boolean;

  // AstroMall & E-Puja
  canManageAstroMall: boolean;
  canAssignPandits: boolean;

  // Marketing & Re-engagement
  canDispatchBroadcast: boolean;
  canAccessAutomationRules: boolean;

  // System Infrastructure (Locked to Super Admin)
  canAccessSystemHealth: boolean;
  canViewAuditLogs: boolean;
}

export interface SubAdminProfile {
  id: string; // e.g., 'subadmin_1001'
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'sub_admin';
  assignedRegion?: string;

  // Licensing & Fee Details (₹599)
  licenseId?: string;
  joiningFeeStatus: 'paid' | 'pending' | 'waived';
  joiningFeeAmount: number; // 599
  transactionRef?: string;
  paymentMode?: 'UPI' | 'Razorpay' | 'Bank Transfer' | 'Cash / Offline';
  licensedAt: string;
  licenseExpiresAt?: string;

  // Status
  status: 'active' | 'suspended' | 'pending_approval';

  // Granular Rights
  permissions: SubAdminPermissions;

  // Operational Scoping
  assignedAstrologerIds?: string[];
  totalRevenueManaged?: number;
  subAdminCommissionRate?: number; // e.g. 5% override commission
  totalEarningsWithdrawn?: number;
}

