import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type IncidentType = 'free_chat_abuse' | 'contact_bypass' | 'offplatform_payment' | 'multi_ip_login';
export type IncidentSeverity = 'critical' | 'warning' | 'info';
export type IncidentStatus = 'flagged' | 'resolved' | 'banned';

export interface SecurityIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  targetName: string;
  targetId: string;
  targetRole: 'seeker' | 'astrologer';
  deviceUuid?: string;
  phone?: string;
  evidence: string;
  timestamp: string;
  status: IncidentStatus;
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

export interface HourlyTraffic {
  hour: number;
  label: string;
  consultations: number;
  seekersActive: number;
  astrologersOnDuty: number;
  isPeak: boolean;
  deficitCount: number;
}

export interface AstrologerScorecard {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  totalConsultations: number;
  minutesBilled: number;
  repeatRatePct: number;
  rating: number;
  pickupRatePct: number;
  grossRevenue: number;
  strikeCount: number;
}

export interface AdminIntelState {
  // Security & Anti-Fraud
  incidents: SecurityIncident[];
  blacklist: BannedEntity[];
  blockedFreeChatCount: number;
  interceptedBypassCount: number;

  // Analytics & Heatmap
  hourlyTraffic: HourlyTraffic[];
  astrologerScorecards: AstrologerScorecard[];
  dutyAlertSentTime: string | null;

  // Actions
  banEntity: (entity: Omit<BannedEntity, 'id' | 'bannedAt'>) => void;
  unbanEntity: (id: string) => void;
  resolveIncident: (id: string) => void;
  issueStrike: (incidentId: string) => void;
  banFromIncident: (incidentId: string, reason: string) => void;
  dismissIncident: (id: string) => void;
  triggerDutyAlert: () => boolean;
}

const INITIAL_INCIDENTS: SecurityIncident[] = [
  {
    id: 'inc-101',
    type: 'free_chat_abuse',
    severity: 'critical',
    title: 'Repeated Multi-Account Free Chat Farming',
    targetName: 'Seeker_9921',
    targetId: 'usr_8192a8',
    targetRole: 'seeker',
    deviceUuid: 'AND-9A7F-E102-881B',
    phone: '+91 98112 00192',
    evidence: 'Same hardware device created 4 distinct accounts (+91 98112..., +91 70112...) to repeatedly claim 3-min free chats within 45 mins.',
    timestamp: '12 mins ago',
    status: 'flagged',
  },
  {
    id: 'inc-102',
    type: 'contact_bypass',
    severity: 'warning',
    title: 'Direct WhatsApp/Phone Exchange in Chat',
    targetName: 'Rohit K.',
    targetId: 'usr_7712c4',
    targetRole: 'seeker',
    deviceUuid: 'AND-44B1-209C-338A',
    phone: '+91 88001 92831',
    evidence: 'Pattern match inside live room: "Please message me on WhatsApp 98112XXXXX for personal puja booking."',
    timestamp: '34 mins ago',
    status: 'flagged',
  },
  {
    id: 'inc-103',
    type: 'offplatform_payment',
    severity: 'critical',
    title: 'Off-Platform UPI Payment Request',
    targetName: 'Acharya Devendra',
    targetId: 'astro-4',
    targetRole: 'astrologer',
    phone: '+91 97110 44219',
    evidence: 'Astrologer sent UPI string "devendra@okaxis" and requested direct ₹2,100 payment to bypass 20% platform commission.',
    timestamp: '1 hour ago',
    status: 'flagged',
  },
  {
    id: 'inc-104',
    type: 'multi_ip_login',
    severity: 'info',
    title: 'Rapid Geographic IP Shift (Account Sharing)',
    targetName: 'Kavita M.',
    targetId: 'usr_55018a',
    targetRole: 'seeker',
    phone: '+91 99551 22891',
    evidence: 'Session accessed from New Delhi IP (103.21.x.x) and London UK IP (82.165.x.x) within a 4-minute window.',
    timestamp: '3 hours ago',
    status: 'flagged',
  },
];

const INITIAL_BLACKLIST: BannedEntity[] = [
  {
    id: 'ban-1',
    entityType: 'device',
    identifier: 'AND-1B88-C401-992F',
    name: 'Device (Multi-SIM Farm)',
    reason: 'Farmed 18 free consultation trials across 12 fake accounts',
    bannedAt: '14 Sep 2026',
    duration: 'Permanent',
  },
  {
    id: 'ban-2',
    entityType: 'phone',
    identifier: '+91 91234 56789',
    name: 'Suresh Raina',
    reason: 'Abusive language and harassment of female astrologer during audio call',
    bannedAt: '12 Sep 2026',
    duration: 'Permanent',
  },
  {
    id: 'ban-3',
    entityType: 'astrologer',
    identifier: 'astro-temp-09',
    name: 'Pandit Vikas Jha',
    reason: 'Repeated solicitations of off-platform Paytm transfers',
    bannedAt: '10 Sep 2026',
    duration: '30 Days',
  },
];

const INITIAL_HOURLY_TRAFFIC: HourlyTraffic[] = [
  { hour: 0, label: '12 AM', consultations: 142, seekersActive: 198, astrologersOnDuty: 14, isPeak: true, deficitCount: 6 },
  { hour: 1, label: '1 AM', consultations: 88, seekersActive: 110, astrologersOnDuty: 8, isPeak: false, deficitCount: 0 },
  { hour: 2, label: '2 AM', consultations: 42, seekersActive: 55, astrologersOnDuty: 6, isPeak: false, deficitCount: 0 },
  { hour: 3, label: '3 AM', consultations: 25, seekersActive: 32, astrologersOnDuty: 5, isPeak: false, deficitCount: 0 },
  { hour: 4, label: '4 AM', consultations: 38, seekersActive: 50, astrologersOnDuty: 6, isPeak: false, deficitCount: 0 },
  { hour: 5, label: '5 AM', consultations: 95, seekersActive: 140, astrologersOnDuty: 12, isPeak: false, deficitCount: 0 },
  { hour: 6, label: '6 AM', consultations: 180, seekersActive: 240, astrologersOnDuty: 18, isPeak: false, deficitCount: 0 },
  { hour: 7, label: '7 AM', consultations: 210, seekersActive: 290, astrologersOnDuty: 20, isPeak: false, deficitCount: 0 },
  { hour: 8, label: '8 AM', consultations: 280, seekersActive: 360, astrologersOnDuty: 24, isPeak: false, deficitCount: 0 },
  { hour: 9, label: '9 AM', consultations: 340, seekersActive: 420, astrologersOnDuty: 26, isPeak: false, deficitCount: 0 },
  { hour: 10, label: '10 AM', consultations: 390, seekersActive: 490, astrologersOnDuty: 28, isPeak: false, deficitCount: 0 },
  { hour: 11, label: '11 AM', consultations: 420, seekersActive: 520, astrologersOnDuty: 30, isPeak: false, deficitCount: 0 },
  { hour: 12, label: '12 PM', consultations: 460, seekersActive: 580, astrologersOnDuty: 32, isPeak: false, deficitCount: 0 },
  { hour: 13, label: '1 PM', consultations: 380, seekersActive: 470, astrologersOnDuty: 28, isPeak: false, deficitCount: 0 },
  { hour: 14, label: '2 PM', consultations: 350, seekersActive: 440, astrologersOnDuty: 26, isPeak: false, deficitCount: 0 },
  { hour: 15, label: '3 PM', consultations: 410, seekersActive: 510, astrologersOnDuty: 29, isPeak: false, deficitCount: 0 },
  { hour: 16, label: '4 PM', consultations: 470, seekersActive: 590, astrologersOnDuty: 31, isPeak: false, deficitCount: 0 },
  { hour: 17, label: '5 PM', consultations: 520, seekersActive: 670, astrologersOnDuty: 32, isPeak: false, deficitCount: 0 },
  { hour: 18, label: '6 PM', consultations: 680, seekersActive: 890, astrologersOnDuty: 34, isPeak: false, deficitCount: 0 },
  { hour: 19, label: '7 PM', consultations: 820, seekersActive: 1100, astrologersOnDuty: 36, isPeak: true, deficitCount: 8 },
  { hour: 20, label: '8 PM', consultations: 1150, seekersActive: 1540, astrologersOnDuty: 38, isPeak: true, deficitCount: 14 },
  { hour: 21, label: '9 PM', consultations: 1480, seekersActive: 1980, astrologersOnDuty: 40, isPeak: true, deficitCount: 18 },
  { hour: 22, label: '10 PM', consultations: 1620, seekersActive: 2150, astrologersOnDuty: 42, isPeak: true, deficitCount: 22 },
  { hour: 23, label: '11 PM', consultations: 1280, seekersActive: 1720, astrologersOnDuty: 35, isPeak: true, deficitCount: 15 },
];

const INITIAL_SCORECARDS: AstrologerScorecard[] = [
  {
    id: 'astro-1',
    name: 'Acharya Dev Sharma',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    specialty: 'Vedic Astrology, Kundli',
    totalConsultations: 1420,
    minutesBilled: 24800,
    repeatRatePct: 78,
    rating: 4.98,
    pickupRatePct: 99.2,
    grossRevenue: 620000,
    strikeCount: 0,
  },
  {
    id: 'astro-2',
    name: 'Tarot Radhika',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    specialty: 'Tarot Reading, Love',
    totalConsultations: 1180,
    minutesBilled: 19400,
    repeatRatePct: 82,
    rating: 4.95,
    pickupRatePct: 98.4,
    grossRevenue: 485000,
    strikeCount: 0,
  },
  {
    id: 'astro-3',
    name: 'Pandit Ramdas Shastri',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    specialty: 'Numerology, Career',
    totalConsultations: 890,
    minutesBilled: 14200,
    repeatRatePct: 71,
    rating: 4.91,
    pickupRatePct: 96.0,
    grossRevenue: 355000,
    strikeCount: 0,
  },
  {
    id: 'astro-5',
    name: 'Guru Anand Swami',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    specialty: 'Vedic, Palmistry',
    totalConsultations: 760,
    minutesBilled: 11800,
    repeatRatePct: 69,
    rating: 4.88,
    pickupRatePct: 94.5,
    grossRevenue: 295000,
    strikeCount: 1,
  },
];

export const useAdminIntelStore = create<AdminIntelState>()(
  persist(
    (set, get) => ({
      incidents: INITIAL_INCIDENTS,
      blacklist: INITIAL_BLACKLIST,
      blockedFreeChatCount: 142,
      interceptedBypassCount: 29,
      hourlyTraffic: INITIAL_HOURLY_TRAFFIC,
      astrologerScorecards: INITIAL_SCORECARDS,
      dutyAlertSentTime: null,

      banEntity: (entity) => {
        const newEntry: BannedEntity = {
          ...entity,
          id: `ban-${Date.now()}`,
          bannedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        };
        set((state) => ({
          blacklist: [newEntry, ...state.blacklist],
        }));
      },

      unbanEntity: (id) => {
        set((state) => ({
          blacklist: state.blacklist.filter((b) => b.id !== id),
        }));
      },

      resolveIncident: (id) => {
        set((state) => ({
          incidents: state.incidents.map((inc) =>
            inc.id === id ? { ...inc, status: 'resolved' } : inc
          ),
        }));
      },

      dismissIncident: (id) => {
        set((state) => ({
          incidents: state.incidents.filter((inc) => inc.id !== id),
        }));
      },

      issueStrike: (incidentId) => {
        const inc = get().incidents.find((i) => i.id === incidentId);
        if (inc && inc.targetRole === 'astrologer') {
          set((state) => ({
            astrologerScorecards: state.astrologerScorecards.map((s) =>
              s.id === inc.targetId ? { ...s, strikeCount: s.strikeCount + 1 } : s
            ),
            incidents: state.incidents.map((i) =>
              i.id === incidentId ? { ...i, status: 'resolved' } : i
            ),
          }));
        } else {
          get().resolveIncident(incidentId);
        }
      },

      banFromIncident: (incidentId, reason) => {
        const inc = get().incidents.find((i) => i.id === incidentId);
        if (!inc) return;

        const entityType = inc.deviceUuid ? 'device' : (inc.targetRole === 'astrologer' ? 'astrologer' : 'user');
        const identifier = inc.deviceUuid || inc.phone || inc.targetId;

        get().banEntity({
          entityType,
          identifier,
          name: inc.targetName,
          reason,
          duration: 'Permanent',
        });

        set((state) => ({
          incidents: state.incidents.map((i) =>
            i.id === incidentId ? { ...i, status: 'banned' } : i
          ),
        }));
      },

      triggerDutyAlert: () => {
        set({
          dutyAlertSentTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        });
        return true;
      },
    }),
    {
      name: 'astroguru_admin_intel_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
