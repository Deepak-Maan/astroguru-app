import React, { useState, useMemo } from 'react';
import { AstrologerProfile, AstrologerDailyEarning } from '../types';

interface AstrologersDeskProps {
  astrologers: AstrologerProfile[];
  onToggleDuty: (id: string) => void;
  onUpdateCommission: (id: string, newRate: number) => void;
  onApproveAstro: (id: string) => void;
  onSettlePayout?: (id: string, date?: string) => void;
  onCreateAstrologer?: (newAstro: AstrologerProfile) => void;
}

const PRESET_SPECIALTIES = [
  'Vedic Astrology',
  'Kundli Prashna',
  'Nadi Shastra',
  'Tarot Cards',
  'Love Compatibility',
  'Numerology',
  'Lal Kitab',
  'Vastu Shastra',
  'Muhurat',
  'Gemology',
  'Palmistry',
  'Face Reading',
];

const PRESET_AVATARS = [
  { label: 'Acharya Dev', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
  { label: 'Pt. Shastri', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { label: 'Dr. Radhika', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
  { label: 'Acharya Anand', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
];

export const AstrologersDesk: React.FC<AstrologersDeskProps> = ({
  astrologers,
  onToggleDuty,
  onUpdateCommission,
  onApproveAstro,
  onSettlePayout,
  onCreateAstrologer,
}) => {
  // Navigation / View Tabs
  const [activeTab, setActiveTab] = useState<'roster' | 'master_ledger'>('roster');

  // Roster Tab Filtering
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Drawers
  const [selectedAstroForKYC, setSelectedAstroForKYC] = useState<AstrologerProfile | null>(null);
  const [incomeAstroId, setIncomeAstroId] = useState<string | null>(null);

  // Income Drawer State
  const [incomeRange, setIncomeRange] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [daySearchQuery, setDaySearchQuery] = useState('');

  // Master Ledger State
  const todayIso = '2026-09-29';
  const [selectedLedgerDate, setSelectedLedgerDate] = useState<string>(todayIso);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');

  // Astro ID Generation Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genId, setGenId] = useState(() => `astro_${Date.now()}`);
  const [genName, setGenName] = useState('');
  const [genEmail, setGenEmail] = useState('');
  const [genPhone, setGenPhone] = useState('');
  const [genRate, setGenRate] = useState(25);
  const [genCommission, setGenCommission] = useState(75);
  const [genExp, setGenExp] = useState(8);
  const [genSpecialties, setGenSpecialties] = useState<string[]>(['Vedic Astrology', 'Kundli Prashna']);
  const [genAvatar, setGenAvatar] = useState(PRESET_AVATARS[0].url);
  const [genOnDuty, setGenOnDuty] = useState(true);
  const [genStatus, setGenStatus] = useState<'active' | 'pending_verification'>('active');
  const [successGeneratedAstro, setSuccessGeneratedAstro] = useState<AstrologerProfile | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Helper to copy text with transient visual feedback
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Open Astro ID Modal with fresh ID
  const handleOpenGenerateModal = () => {
    const freshId = `astro_${Date.now()}`;
    setGenId(freshId);
    setGenName('');
    setGenEmail('');
    setGenPhone('');
    setGenRate(25);
    setGenCommission(75);
    setGenExp(8);
    setGenSpecialties(['Vedic Astrology', 'Kundli Prashna']);
    setGenAvatar(PRESET_AVATARS[0].url);
    setGenOnDuty(true);
    setGenStatus('active');
    setSuccessGeneratedAstro(null);
    setIsGenerateModalOpen(true);
  };

  // Regenerate random or timestamped Astro ID
  const handleRegenerateId = () => {
    setGenId(`astro_${Date.now()}`);
  };

  // Toggle specialty in generator
  const toggleSpecialty = (spec: string) => {
    setGenSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  // Submit generated Astrologer
  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = genId.trim() || `astro_${Date.now()}`;
    const cleanName = genName.trim() || 'Acharya Vedic Scholar';
    const cleanEmail = genEmail.trim() || `${finalId}@astroguru.app`;
    const cleanPhone = genPhone.trim() || '+91 98765 00000';

    const newAstro: AstrologerProfile = {
      id: finalId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      avatar: genAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0D8ABC&color=fff&size=200`,
      specialties: genSpecialties.length ? genSpecialties : ['Vedic Astrology'],
      experienceYears: Number(genExp) || 5,
      ratePerMin: Number(genRate) || 25,
      rating: 5.0,
      reviewsCount: 0,
      totalConsultations: 0,
      status: genStatus,
      commissionRate: Number(genCommission) || 75,
      onDuty: genOnDuty,
      isFeatured: false,
      boostRank: 0,
      strikesCount: 0,
      dailyEarnings: [],
    };

    if (onCreateAstrologer) {
      onCreateAstrologer(newAstro);
    }
    setSuccessGeneratedAstro(newAstro);
  };

  // Find currently selected astrologer for income drawer
  const selectedIncomeAstro = useMemo(() => {
    return astrologers.find((a) => a.id === incomeAstroId) || null;
  }, [astrologers, incomeAstroId]);

  // Today's Fleet-wide aggregates
  const todayFleetMetrics = useMemo(() => {
    let gross = 0;
    let net = 0;
    let platform = 0;
    let consults = 0;
    let totalPending = 0;

    astrologers.forEach((astro) => {
      const todayRecord = astro.dailyEarnings?.find((d) => d.date === todayIso);
      if (todayRecord) {
        gross += todayRecord.grossRevenue;
        net += todayRecord.netPayout;
        platform += todayRecord.platformCommission;
        consults += todayRecord.consultationsCount;
      }
      const pendingSum = astro.dailyEarnings
        ?.filter((d) => d.payoutStatus === 'pending')
        .reduce((sum, d) => sum + d.netPayout, 0) || 0;
      totalPending += pendingSum;
    });

    return {
      gross,
      net,
      platform,
      consults,
      totalPending,
    };
  }, [astrologers]);

  // Filtered Astrologers in Roster
  const filteredAstrologers = useMemo(() => {
    return astrologers.filter((a) => {
      if (filter === 'active' && (!a.onDuty || a.status !== 'active')) return false;
      if (filter === 'pending' && a.status !== 'pending_verification') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.specialties.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [astrologers, filter, searchQuery]);

  // Filtered day records for the active astrologer in the Income Drawer
  const filteredDailyEarnings = useMemo(() => {
    if (!selectedIncomeAstro || !selectedIncomeAstro.dailyEarnings) return [];

    let list = [...selectedIncomeAstro.dailyEarnings];

    // Range slicing
    if (incomeRange === '7d') {
      list = list.slice(0, 7);
    } else if (incomeRange === '14d') {
      list = list.slice(0, 14);
    } else if (incomeRange === '30d') {
      list = list.slice(0, 30);
    }

    // Search query
    if (daySearchQuery.trim()) {
      const q = daySearchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.date.includes(q) ||
          d.formattedDate.toLowerCase().includes(q) ||
          d.dayOfWeek.toLowerCase().includes(q) ||
          (d.payoutReference && d.payoutReference.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedIncomeAstro, incomeRange, daySearchQuery]);

  // Drawer range metrics for selected astrologer
  const drawerRangeMetrics = useMemo(() => {
    if (!filteredDailyEarnings.length) {
      return { totalGross: 0, totalNet: 0, totalPlatform: 0, totalConsults: 0, totalMins: 0, pendingCount: 0 };
    }
    const totalGross = filteredDailyEarnings.reduce((acc, curr) => acc + curr.grossRevenue, 0);
    const totalNet = filteredDailyEarnings.reduce((acc, curr) => acc + curr.netPayout, 0);
    const totalPlatform = filteredDailyEarnings.reduce((acc, curr) => acc + curr.platformCommission, 0);
    const totalConsults = filteredDailyEarnings.reduce((acc, curr) => acc + curr.consultationsCount, 0);
    const totalMins = filteredDailyEarnings.reduce((acc, curr) => acc + curr.totalBillableMinutes, 0);
    const pendingCount = filteredDailyEarnings.filter((d) => d.payoutStatus === 'pending').length;

    return { totalGross, totalNet, totalPlatform, totalConsults, totalMins, pendingCount };
  }, [filteredDailyEarnings]);

  // Max daily earning in filtered set (for visual bar scaling)
  const maxNetPayoutInRange = useMemo(() => {
    if (!filteredDailyEarnings.length) return 1;
    return Math.max(...filteredDailyEarnings.map((d) => d.netPayout), 1);
  }, [filteredDailyEarnings]);

  // Master Ledger Data for selected date across ALL astrologers
  const masterLedgerForDate = useMemo(() => {
    const rows = astrologers.map((astro) => {
      const dayRecord = astro.dailyEarnings?.find((d) => d.date === selectedLedgerDate);
      return {
        astro,
        dayRecord: dayRecord || {
          date: selectedLedgerDate,
          formattedDate: selectedLedgerDate,
          dayOfWeek: '',
          consultationsCount: 0,
          chatConsultations: 0,
          callConsultations: 0,
          totalBillableMinutes: 0,
          grossRevenue: 0,
          commissionRate: astro.commissionRate,
          platformCommission: 0,
          netPayout: 0,
          payoutStatus: 'settled' as const,
        },
      };
    });

    if (!ledgerSearchQuery.trim()) return rows;
    const q = ledgerSearchQuery.toLowerCase();
    return rows.filter((r) => r.astro.id.toLowerCase().includes(q) || r.astro.name.toLowerCase().includes(q) || r.astro.email.toLowerCase().includes(q));
  }, [astrologers, selectedLedgerDate, ledgerSearchQuery]);

  // Master Ledger Aggregates for the selected date
  const masterLedgerMetrics = useMemo(() => {
    let gross = 0;
    let net = 0;
    let platform = 0;
    let consults = 0;
    let mins = 0;
    let pendingCount = 0;

    masterLedgerForDate.forEach((r) => {
      gross += r.dayRecord.grossRevenue;
      net += r.dayRecord.netPayout;
      platform += r.dayRecord.platformCommission;
      consults += r.dayRecord.consultationsCount;
      mins += r.dayRecord.totalBillableMinutes;
      if (r.dayRecord.payoutStatus === 'pending' && r.dayRecord.netPayout > 0) {
        pendingCount++;
      }
    });

    return { gross, net, platform, consults, mins, pendingCount };
  }, [masterLedgerForDate]);

  // Universal CSV Export Utility
  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Individual Astrologer Day-Wise CSV
  const handleExportAstroIncomeCsv = () => {
    if (!selectedIncomeAstro) return;
    const headers = [
      'Astro ID',
      'Date',
      'Day',
      'Consultations Count',
      'Audio Calls',
      'Chats',
      'Total Billable Minutes',
      'Rate Per Min (INR)',
      'Gross Revenue (INR)',
      'Commission Rate (%)',
      'Platform Commission (INR)',
      'Net Astrologer Payout (INR)',
      'Payout Status',
      'Payout Reference',
    ];
    const rows = filteredDailyEarnings.map((d) => [
      selectedIncomeAstro.id,
      d.formattedDate,
      d.dayOfWeek,
      d.consultationsCount,
      d.callConsultations,
      d.chatConsultations,
      d.totalBillableMinutes,
      selectedIncomeAstro.ratePerMin,
      d.grossRevenue,
      `${d.commissionRate}%`,
      d.platformCommission,
      d.netPayout,
      d.payoutStatus.toUpperCase(),
      d.payoutReference || 'N/A (Pending)',
    ]);
    const cleanName = selectedIncomeAstro.name.replace(/\s+/g, '_');
    exportCsv(`Astroguru_${cleanName}_Income_${incomeRange}.csv`, headers, rows);
  };

  // Export Fleet Day Master Ledger CSV
  const handleExportMasterLedgerCsv = () => {
    const headers = [
      'Ledger Date',
      'Astro ID',
      'Astrologer Name',
      'Tariff (INR/min)',
      'Total Consultations',
      'Audio Calls',
      'Chats',
      'Billable Minutes',
      'Gross Revenue (INR)',
      'Commission (%)',
      'Platform Cut (INR)',
      'Net Astrologer Payout (INR)',
      'Settlement Status',
      'Reference',
    ];
    const rows = masterLedgerForDate.map((r) => [
      selectedLedgerDate,
      r.astro.id,
      r.astro.name,
      r.astro.ratePerMin,
      r.dayRecord.consultationsCount,
      r.dayRecord.callConsultations,
      r.dayRecord.chatConsultations,
      r.dayRecord.totalBillableMinutes,
      r.dayRecord.grossRevenue,
      `${r.astro.commissionRate}%`,
      r.dayRecord.platformCommission,
      r.dayRecord.netPayout,
      r.dayRecord.payoutStatus.toUpperCase(),
      r.dayRecord.payoutReference || 'PENDING',
    ]);
    exportCsv(`Astroguru_Fleet_Daily_Income_${selectedLedgerDate}.csv`, headers, rows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF', letterSpacing: '-0.3px' }}>
              Astrologer Fleet & Day-Wise Income Command
            </h1>
            <span className="badge-pill badge-emerald" style={{ fontSize: '11px' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#10B981' }} />
              Live Ledger Sync
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Generate official Astro IDs, verify Vedic degrees, manage tariffs, audit day-wise income, and disburse bank payouts.
          </p>
        </div>

        {/* Action Controls: Generate Astro ID + View Switcher */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* ✨ GENERATE ASTRO ID BUTTON */}
          <button
            onClick={handleOpenGenerateModal}
            className="btn-gold"
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)',
            }}
          >
            <span>✨</span>
            <span>Generate New Astro ID</span>
          </button>

          {/* Primary View Switcher: Fleet Roster vs Master Day-Wise Ledger */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(10, 12, 22, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.25)' }}>
            <button
              onClick={() => setActiveTab('roster')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'roster' ? '700' : '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'roster' ? '#6366F1' : 'transparent',
                color: activeTab === 'roster' ? '#FFFFFF' : '#A5B4FC',
                transition: 'all 0.2s',
              }}
            >
              <span>👥</span>
              <span>Acharya Fleet ({astrologers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('master_ledger')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'master_ledger' ? '700' : '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'master_ledger' ? '#6366F1' : 'transparent',
                color: activeTab === 'master_ledger' ? '#FFFFFF' : '#A5B4FC',
                transition: 'all 0.2s',
              }}
            >
              <span>📅</span>
              <span>Master Day-Wise Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Executive Financial KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Gross Billed
            </span>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#FCD34D', marginTop: '6px' }}>
            ₹{todayFleetMetrics.gross.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            {todayFleetMetrics.consults} Total Consultations Today
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Acharya Net Payout Pool
            </span>
            <span style={{ fontSize: '18px' }}>🔮</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#34D399', marginTop: '6px' }}>
            ₹{todayFleetMetrics.net.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px' }}>
            Average ~75% payout allocation
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Platform Retained Margin
            </span>
            <span style={{ fontSize: '18px' }}>🏛️</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#38BDF8', marginTop: '6px' }}>
            ₹{todayFleetMetrics.platform.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px' }}>
            ~25% commission retained
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Settlement
            </span>
            <span style={{ fontSize: '18px' }}>⏳</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#FB7185', marginTop: '6px' }}>
            ₹{todayFleetMetrics.totalPending.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#FB7185', marginTop: '4px', fontWeight: '600' }}>
            Awaiting NEFT / Bank Payout
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ACHARYA FLEET ROSTER & DAY-WISE QUICK ACCESS                   */}
      {/* ===================================================================== */}
      {activeTab === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar: Search & Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search Acharya by name, Astro ID, email or specialty..."
                style={{
                  backgroundColor: 'rgba(10, 12, 22, 0.8)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: '#EEF2FF',
                  fontSize: '12.5px',
                  width: '360px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'all', label: `All Acharyas (${astrologers.length})` },
                { id: 'active', label: `On Duty (${astrologers.filter((a) => a.onDuty).length})` },
                { id: 'pending', label: `KYC Review (${astrologers.filter((a) => a.status === 'pending_verification').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={filter === tab.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Astrologers Table with Copyable Astro ID, In-line Today & Lifetime Earnings */}
          <div className="liquid-card" style={{ overflow: 'hidden' }}>
            <table className="cosmic-table">
              <thead>
                <tr>
                  <th>Acharya & Astro ID</th>
                  <th>Specialties</th>
                  <th>Rate / min</th>
                  <th>Rating & Volume</th>
                  <th style={{ color: '#FCD34D' }}>Today's Income</th>
                  <th style={{ color: '#34D399' }}>Lifetime Net</th>
                  <th>Commission Split</th>
                  <th>Duty Status</th>
                  <th>Day-Wise & Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAstrologers.map((astro) => {
                  const todayEarning = astro.dailyEarnings?.find((d) => d.date === todayIso);
                  const pendingTotal = astro.dailyEarnings
                    ?.filter((d) => d.payoutStatus === 'pending')
                    .reduce((sum, d) => sum + d.netPayout, 0) || 0;

                  return (
                    <tr key={astro.id}>
                      {/* Profile info with Clickable Astro ID */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={astro.avatar}
                            alt={astro.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              border: '1.5px solid rgba(129, 140, 248, 0.45)',
                              objectFit: 'cover',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: '#EEF2FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{astro.name}</span>
                              {astro.status === 'active' && (
                                <span style={{ color: '#34D399', fontSize: '13px' }} title="Verified Vedic Scholar">✓</span>
                              )}
                            </div>
                            
                            {/* Copyable Astro ID Pill */}
                            <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => handleCopy(astro.id)}
                                title="Click to copy Astro ID"
                                style={{
                                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                  border: '1px solid rgba(129, 140, 248, 0.35)',
                                  borderRadius: '6px',
                                  padding: '2px 7px',
                                  color: '#A5B4FC',
                                  fontFamily: 'monospace',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <span>🆔 {astro.id}</span>
                                <span style={{ fontSize: '10px' }}>{copiedText === astro.id ? '✓ Copied' : '📋'}</span>
                              </button>
                            </div>

                            <div style={{ fontSize: '11px', color: '#818CF8', marginTop: '2px' }}>
                              {astro.email} · {astro.experienceYears}y exp
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specialties */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '180px' }}>
                          {astro.specialties.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="badge-pill badge-indigo" style={{ fontSize: '10px' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Rate */}
                      <td style={{ fontWeight: '800', color: '#FCD34D', fontSize: '13.5px' }}>
                        ₹{astro.ratePerMin}/min
                      </td>

                      {/* Rating & Consults */}
                      <td>
                        <div style={{ fontWeight: '700', color: '#FCD34D' }}>
                          {astro.rating} ★
                        </div>
                        <div style={{ fontSize: '11px', color: '#A5B4FC' }}>
                          {astro.totalConsultations.toLocaleString()} consults
                        </div>
                      </td>

                      {/* Today's Income */}
                      <td>
                        {todayEarning ? (
                          <div>
                            <div style={{ fontWeight: '800', color: '#FCD34D', fontSize: '14px' }}>
                              ₹{todayEarning.netPayout.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#818CF8' }}>
                              {todayEarning.consultationsCount} consults · {todayEarning.totalBillableMinutes}m
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#64748B' }}>₹0 Today</div>
                        )}
                      </td>

                      {/* Lifetime Net */}
                      <td>
                        <div style={{ fontWeight: '800', color: '#34D399', fontSize: '14px' }}>
                          ₹{(astro.lifetimeEarned || 0).toLocaleString('en-IN')}
                        </div>
                        {pendingTotal > 0 ? (
                          <div style={{ fontSize: '10.5px', color: '#FB7185', fontWeight: '600' }}>
                            ₹{pendingTotal.toLocaleString('en-IN')} pending
                          </div>
                        ) : (
                          <div style={{ fontSize: '10.5px', color: '#A5B4FC' }}>
                            Settled ✓
                          </div>
                        )}
                      </td>

                      {/* Commission Split */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#34D399' }}>
                            {astro.commissionRate}%
                          </span>
                          <input
                            type="range"
                            min="50"
                            max="90"
                            step="5"
                            value={astro.commissionRate}
                            onChange={(e) => onUpdateCommission(astro.id, Number(e.target.value))}
                            style={{ width: '70px', accentColor: '#6366F1', cursor: 'pointer' }}
                          />
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>
                          Platform: {100 - astro.commissionRate}%
                        </div>
                      </td>

                      {/* Duty Status */}
                      <td>
                        <button
                          onClick={() => onToggleDuty(astro.id)}
                          className={astro.onDuty ? 'badge-pill badge-emerald' : 'badge-pill badge-indigo'}
                          style={{ border: 'none', cursor: 'pointer' }}
                        >
                          {astro.onDuty ? '🟢 Online Duty' : '⚪ Offline'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setIncomeAstroId(astro.id)}
                            className="btn-gold"
                            style={{
                              fontSize: '11px',
                              padding: '5px 10px',
                              gap: '4px',
                            }}
                            title="Inspect full day-wise income breakdown, history, and settlement"
                          >
                            <span>📊</span>
                            <span>Day-Wise</span>
                          </button>

                          {astro.status === 'pending_verification' ? (
                            <button
                              onClick={() => onApproveAstro(astro.id)}
                              className="btn-primary"
                              style={{ fontSize: '11px', padding: '5px 10px' }}
                            >
                              ✓ KYC
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedAstroForKYC(astro)}
                              className="btn-secondary"
                              style={{ fontSize: '11px', padding: '5px 8px' }}
                            >
                              Audit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MASTER DAY-WISE INCOME LEDGER (ALL ASTROLOGERS FOR SELECTED DAY) */}
      {/* ===================================================================== */}
      {activeTab === 'master_ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Date Selector & Search Strip */}
          <div className="liquid-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>Select Calendar Day:</span>
              
              {/* Quick Date Pills */}
              {[
                { date: '2026-09-29', label: 'Today (29 Sep)' },
                { date: '2026-09-28', label: 'Yesterday (28 Sep)' },
                { date: '2026-09-27', label: '27 Sep (Sun)' },
                { date: '2026-09-26', label: '26 Sep (Sat)' },
                { date: '2026-09-25', label: '25 Sep (Fri)' },
              ].map((pill) => (
                <button
                  key={pill.date}
                  onClick={() => setSelectedLedgerDate(pill.date)}
                  className={selectedLedgerDate === pill.date ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '11.5px', padding: '6px 12px' }}
                >
                  {pill.label}
                </button>
              ))}

              {/* Custom Date Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#A5B4FC' }}>Pick Date:</span>
                <input
                  type="date"
                  value={selectedLedgerDate}
                  onChange={(e) => e.target.value && setSelectedLedgerDate(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(10, 12, 22, 0.8)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    borderRadius: '8px',
                    color: '#EEF2FF',
                    padding: '5px 10px',
                    fontSize: '12px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* Actions: Search & Export CSV */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={ledgerSearchQuery}
                onChange={(e) => setLedgerSearchQuery(e.target.value)}
                placeholder="Search by ID or name..."
                style={{
                  backgroundColor: 'rgba(10, 12, 22, 0.8)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#EEF2FF',
                  fontSize: '12px',
                  width: '180px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleExportMasterLedgerCsv}
                className="btn-gold"
                style={{ fontSize: '12px', padding: '7px 14px' }}
              >
                📥 Export Ledger CSV
              </button>
            </div>
          </div>

          {/* Date Summary Card Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
          }}>
            <div className="inset-box" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '700' }}>TOTAL BILLED ON {selectedLedgerDate}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>
                ₹{masterLedgerMetrics.gross.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="inset-box" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '700' }}>ACHARYAS' NET PAYOUT</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#34D399', marginTop: '4px' }}>
                ₹{masterLedgerMetrics.net.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="inset-box" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '700' }}>PLATFORM REVENUE SHARE</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#38BDF8', marginTop: '4px' }}>
                ₹{masterLedgerMetrics.platform.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="inset-box" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '700' }}>CONSULTATION VOLUME</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#EEF2FF', marginTop: '4px' }}>
                {masterLedgerMetrics.consults} consults
              </div>
              <div style={{ fontSize: '10.5px', color: '#818CF8' }}>{masterLedgerMetrics.mins} billed minutes</div>
            </div>

            <div className="inset-box" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '700' }}>SETTLEMENT STATUS</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px' }}>
                {masterLedgerMetrics.pendingCount === 0 ? (
                  <span style={{ color: '#34D399' }}>✓ All Settled</span>
                ) : (
                  <span style={{ color: '#FB7185' }}>⏳ {masterLedgerMetrics.pendingCount} Pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Master Day-Wise Table */}
          <div className="liquid-card" style={{ overflow: 'hidden' }}>
            <table className="cosmic-table">
              <thead>
                <tr>
                  <th>Acharya & Astro ID</th>
                  <th>Tariff</th>
                  <th>Consultations Breakdown</th>
                  <th>Billable Time</th>
                  <th style={{ color: '#FCD34D' }}>Gross Revenue</th>
                  <th>Split</th>
                  <th style={{ color: '#38BDF8' }}>Platform Cut</th>
                  <th style={{ color: '#34D399' }}>Net Acharya Payout</th>
                  <th>Payout Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {masterLedgerForDate.map(({ astro, dayRecord }) => (
                  <tr key={astro.id}>
                    {/* Acharya & Astro ID */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={astro.avatar}
                          alt={astro.name}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#EEF2FF', fontSize: '13px' }}>{astro.name}</div>
                          <button
                            onClick={() => handleCopy(astro.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#818CF8',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>🆔 {astro.id}</span>
                            <span style={{ fontSize: '10px' }}>{copiedText === astro.id ? '✓' : '📋'}</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Tariff */}
                    <td style={{ fontWeight: '700', color: '#FCD34D' }}>
                      ₹{astro.ratePerMin}/min
                    </td>

                    {/* Consultations */}
                    <td>
                      <div style={{ fontWeight: '700', color: '#EEF2FF' }}>
                        {dayRecord.consultationsCount} Total
                      </div>
                      <div style={{ fontSize: '11px', color: '#A5B4FC' }}>
                        {dayRecord.callConsultations} Audio Calls · {dayRecord.chatConsultations} Chats
                      </div>
                    </td>

                    {/* Billable Time */}
                    <td style={{ fontWeight: '600', color: '#EEF2FF' }}>
                      {dayRecord.totalBillableMinutes} mins
                    </td>

                    {/* Gross */}
                    <td style={{ fontWeight: '800', color: '#FCD34D', fontSize: '14px' }}>
                      ₹{dayRecord.grossRevenue.toLocaleString('en-IN')}
                    </td>

                    {/* Split */}
                    <td style={{ fontSize: '12px', fontWeight: '700', color: '#34D399' }}>
                      {astro.commissionRate}%
                    </td>

                    {/* Platform Cut */}
                    <td style={{ color: '#38BDF8', fontWeight: '700' }}>
                      ₹{dayRecord.platformCommission.toLocaleString('en-IN')}
                    </td>

                    {/* Net Astrologer Payout */}
                    <td style={{ fontWeight: '800', color: '#34D399', fontSize: '14.5px' }}>
                      ₹{dayRecord.netPayout.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td>
                      {dayRecord.payoutStatus === 'settled' ? (
                        <div>
                          <span className="badge-pill badge-emerald" style={{ fontSize: '11px' }}>
                            ✓ Settled
                          </span>
                          {dayRecord.payoutReference && (
                            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                              {dayRecord.payoutReference}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="badge-pill badge-rose" style={{ fontSize: '11px' }}>
                          ⏳ Pending Settlement
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {dayRecord.payoutStatus === 'pending' && dayRecord.netPayout > 0 && onSettlePayout && (
                          <button
                            onClick={() => onSettlePayout(astro.id, selectedLedgerDate)}
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '5px 9px' }}
                            title="Disburse / Mark payout as settled in bank"
                          >
                            ✓ Disburse
                          </button>
                        )}
                        <button
                          onClick={() => setIncomeAstroId(astro.id)}
                          className="btn-secondary"
                          style={{ fontSize: '11px', padding: '5px 9px' }}
                          title="View complete 30-day day-wise trajectory"
                        >
                          30-Day View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: GENERATE NEW ASTRO ID & ONBOARD ACHARYA                        */}
      {/* ===================================================================== */}
      {isGenerateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 6, 15, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 130,
            padding: '20px',
          }}
        >
          <div
            className="liquid-card"
            style={{
              width: '680px',
              maxWidth: '96vw',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#EEF2FF' }}>
                    Generate Astro ID & Onboard Acharya
                  </h2>
                  <p style={{ fontSize: '12px', color: '#A5B4FC', marginTop: '2px' }}>
                    Mint an official unique Astro ID for a new astrologer and configure tariffs & credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#EEF2FF',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* If Astrologer was just generated, show Success Dossier */}
            {successGeneratedAstro ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1.5px solid #10B981',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '38px', marginBottom: '8px' }}>🎉</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
                    Astro ID Generated Successfully!
                  </h3>
                  <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
                    {successGeneratedAstro.name} is now onboarded into the AstroGuru platform.
                  </p>

                  {/* Astro ID Highlight Box */}
                  <div
                    style={{
                      margin: '18px auto',
                      backgroundColor: 'rgba(10, 12, 22, 0.85)',
                      border: '1.5px dashed #FCD34D',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#FCD34D' }}>ASSIGNED ASTRO ID:</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#EEF2FF', fontFamily: 'monospace' }}>
                      {successGeneratedAstro.id}
                    </span>
                    <button
                      onClick={() => handleCopy(successGeneratedAstro.id)}
                      className="btn-primary"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {copiedText === successGeneratedAstro.id ? '✓ Copied!' : '📋 Copy ID'}
                    </button>
                  </div>
                </div>

                {/* Acharya Welcome Kit Dossier (WhatsApp / SMS Ready) */}
                <div className="inset-box" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>
                      📲 Acharya Welcome Onboarding Dossier:
                    </span>
                    <button
                      onClick={() => {
                        const dossier = `🌟 Welcome to AstroGuru Astrologer Network! 🌟\nNamaste ${successGeneratedAstro.name} ji,\n\nYour verified AstroGuru Acharya credentials have been generated:\n🆔 Astro ID: ${successGeneratedAstro.id}\n📞 Registered Phone: ${successGeneratedAstro.phone}\n💰 Consultation Tariff: ₹${successGeneratedAstro.ratePerMin}/min (${successGeneratedAstro.commissionRate}% Acharya Split)\n📲 Astrologer App: https://astroguru.app/download\n\nPlease login to start taking live consultations.`;
                        handleCopy(dossier);
                      }}
                      className="btn-gold"
                      style={{ fontSize: '11px', padding: '5px 12px' }}
                    >
                      {copiedText?.includes('Welcome to AstroGuru') ? '✓ Dossier Copied!' : '📋 Copy Welcome Message'}
                    </button>
                  </div>
                  <pre
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'rgba(4, 6, 15, 0.7)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      color: '#A5B4FC',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '18px',
                      fontFamily: 'monospace',
                    }}
                  >
{`🌟 Welcome to AstroGuru Astrologer Network! 🌟
Namaste ${successGeneratedAstro.name} ji,

Your verified AstroGuru Acharya credentials have been generated:
🆔 Astro ID: ${successGeneratedAstro.id}
📞 Registered Phone: ${successGeneratedAstro.phone}
💰 Consultation Tariff: ₹${successGeneratedAstro.ratePerMin}/min (${successGeneratedAstro.commissionRate}% Acharya Split)
📲 Astrologer App: https://astroguru.app/download

Please login to start taking live consultations.`}
                  </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    onClick={() => {
                      setIncomeAstroId(successGeneratedAstro.id);
                      setIsGenerateModalOpen(false);
                    }}
                    className="btn-gold"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                  >
                    📊 View Day-Wise Ledger
                  </button>
                  <button
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Astrologer Generation Form */
              <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Astro ID Generator Strip */}
                <div
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>
                      Unique Astro ID (System Identifier)
                    </label>
                    <span style={{ fontSize: '11px', color: '#34D399', fontWeight: '600' }}>
                      ✓ Auto-Generated & Available
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        value={genId}
                        onChange={(e) => setGenId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        required
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(10, 12, 22, 0.9)',
                          border: '1px solid #818CF8',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#FCD34D',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          fontWeight: '700',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateId}
                      className="btn-secondary"
                      style={{ fontSize: '11.5px', padding: '8px 14px' }}
                      title="Generate a fresh timestamped Astro ID"
                    >
                      🎲 Fresh ID
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#818CF8' }}>
                    Format: <code>astro_&#123;timestamp&#125;</code> or custom handle (e.g. <code>astro_kanhaiya</code>)
                  </div>
                </div>

                {/* 2. Basic Profile Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Acharya Full Name *
                    </label>
                    <input
                      type="text"
                      value={genName}
                      onChange={(e) => setGenName(e.target.value)}
                      placeholder="e.g. Pt. Kanhaiya Lal Sharma"
                      required
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(10, 12, 22, 0.8)',
                        border: '1px solid rgba(129, 140, 248, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#EEF2FF',
                        fontSize: '12.5px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Mobile Phone Number *
                    </label>
                    <input
                      type="text"
                      value={genPhone}
                      onChange={(e) => setGenPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(10, 12, 22, 0.8)',
                        border: '1px solid rgba(129, 140, 248, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#EEF2FF',
                        fontSize: '12.5px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={genEmail}
                      onChange={(e) => setGenEmail(e.target.value)}
                      placeholder={`e.g. ${genId || 'acharya'}@astroguru.app`}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(10, 12, 22, 0.8)',
                        border: '1px solid rgba(129, 140, 248, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#EEF2FF',
                        fontSize: '12.5px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={genExp}
                      onChange={(e) => setGenExp(Number(e.target.value))}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(10, 12, 22, 0.8)',
                        border: '1px solid rgba(129, 140, 248, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#EEF2FF',
                        fontSize: '12.5px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* 3. Tariff & Commission Split */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Consultation Tariff (₹ / min)
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[15, 20, 25, 35, 50].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setGenRate(rate)}
                          className={genRate === rate ? 'btn-primary' : 'btn-secondary'}
                          style={{ fontSize: '11px', padding: '5px 9px', flex: 1 }}
                        >
                          ₹{rate}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>
                        Commission Split: <strong style={{ color: '#34D399' }}>{genCommission}%</strong>
                      </label>
                      <span style={{ fontSize: '11px', color: '#A5B4FC' }}>Platform: {100 - genCommission}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      step="5"
                      value={genCommission}
                      onChange={(e) => setGenCommission(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#6366F1', cursor: 'pointer', marginTop: '6px' }}
                    />
                  </div>
                </div>

                {/* 4. Specialties Selection */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                    Vedic Specialties (Select All That Apply)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {PRESET_SPECIALTIES.map((spec) => {
                      const isSelected = genSpecialties.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpecialty(spec)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            border: isSelected ? '1px solid #6366F1' : '1px solid rgba(129, 140, 248, 0.2)',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(10, 12, 22, 0.6)',
                            color: isSelected ? '#EEF2FF' : '#A5B4FC',
                            fontWeight: isSelected ? '700' : '500',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Avatar Selection */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                    Select Acharya Avatar
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {PRESET_AVATARS.map((av, idx) => (
                      <img
                        key={idx}
                        src={av.url}
                        alt={av.label}
                        onClick={() => setGenAvatar(av.url)}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: genAvatar === av.url ? '2.5px solid #FCD34D' : '2px solid rgba(129, 140, 248, 0.3)',
                          boxShadow: genAvatar === av.url ? '0 0 12px rgba(252, 211, 77, 0.5)' : 'none',
                          objectFit: 'cover',
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                    <div style={{ fontSize: '11px', color: '#A5B4FC', marginLeft: '6px' }}>
                      Or custom initials avatar will be generated.
                    </div>
                  </div>
                </div>

                {/* 6. Initial Status Toggles */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                    <input
                      type="checkbox"
                      checked={genOnDuty}
                      onChange={(e) => setGenOnDuty(e.target.checked)}
                      style={{ accentColor: '#10B981', width: '16px', height: '16px' }}
                    />
                    <span>Immediately Online on Duty</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                    <input
                      type="checkbox"
                      checked={genStatus === 'active'}
                      onChange={(e) => setGenStatus(e.target.checked ? 'active' : 'pending_verification')}
                      style={{ accentColor: '#6366F1', width: '16px', height: '16px' }}
                    />
                    <span>Pre-Approved Vedic KYC Degree</span>
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold"
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >
                    ✨ Generate Astro ID & Onboard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DRAWER / MODAL: INDIVIDUAL ASTROLOGER DAY-WISE INCOME BREAKDOWN       */}
      {/* ===================================================================== */}
      {selectedIncomeAstro && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 6, 15, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 120,
            padding: '20px',
          }}
        >
          <div
            className="liquid-card"
            style={{
              width: '950px',
              maxWidth: '96vw',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={selectedIncomeAstro.avatar}
                  alt={selectedIncomeAstro.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '2px solid #818CF8',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#EEF2FF' }}>
                      {selectedIncomeAstro.name} · Day-Wise Income Ledger
                    </h2>
                    <span className="badge-pill badge-emerald">Verified Scholar</span>
                  </div>
                  
                  {/* Astro ID Badge in Drawer */}
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleCopy(selectedIncomeAstro.id)}
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid #818CF8',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        color: '#EEF2FF',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Click to copy Astro ID"
                    >
                      <span>🆔 {selectedIncomeAstro.id}</span>
                      <span style={{ fontSize: '10px' }}>{copiedText === selectedIncomeAstro.id ? '✓ Copied' : '📋'}</span>
                    </button>
                    <span style={{ fontSize: '12px', color: '#A5B4FC' }}>
                      Tariff: <strong style={{ color: '#FCD34D' }}>₹{selectedIncomeAstro.ratePerMin}/min</strong> · Commission Cut: <strong style={{ color: '#34D399' }}>{selectedIncomeAstro.commissionRate}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={handleExportAstroIncomeCsv}
                  className="btn-gold"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => setIncomeAstroId(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    color: '#EEF2FF',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Summary KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              <div className="inset-box" style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
                  Total Lifetime Earned
                </span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>
                  ₹{(selectedIncomeAstro.lifetimeEarned || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '10.5px', color: '#34D399', marginTop: '2px' }}>
                  {selectedIncomeAstro.totalConsultations.toLocaleString()} consultations
                </div>
              </div>

              <div className="inset-box" style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
                  Selected Period Net Payout
                </span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#34D399', marginTop: '4px' }}>
                  ₹{drawerRangeMetrics.totalNet.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '10.5px', color: '#A5B4FC', marginTop: '2px' }}>
                  {drawerRangeMetrics.totalConsults} consults ({drawerRangeMetrics.totalMins} mins)
                </div>
              </div>

              <div className="inset-box" style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
                  Platform Share Retained
                </span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#38BDF8', marginTop: '4px' }}>
                  ₹{drawerRangeMetrics.totalPlatform.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '10.5px', color: '#A5B4FC', marginTop: '2px' }}>
                  {100 - selectedIncomeAstro.commissionRate}% platform share
                </div>
              </div>

              <div className="inset-box" style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
                  Pending Payout Settlement
                </span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#FB7185', marginTop: '4px' }}>
                  ₹{(selectedIncomeAstro.pendingPayout || 0).toLocaleString('en-IN')}
                </div>
                {selectedIncomeAstro.pendingPayout && selectedIncomeAstro.pendingPayout > 0 && onSettlePayout ? (
                  <button
                    onClick={() => onSettlePayout(selectedIncomeAstro.id)}
                    className="btn-primary"
                    style={{ fontSize: '10.5px', padding: '3px 8px', marginTop: '4px' }}
                  >
                    ✓ Settle All Pending
                  </button>
                ) : (
                  <div style={{ fontSize: '10.5px', color: '#34D399', marginTop: '2px' }}>All settled ✓</div>
                )}
              </div>
            </div>

            {/* Visual Day-Wise Earnings Bar Chart */}
            <div className="inset-box" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>
                  📈 Daily Net Earnings Trend ({incomeRange.toUpperCase()})
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#A5B4FC' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#34D399', borderRadius: '2px' }} />
                    Settled
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
                    Pending
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '90px', paddingBottom: '4px' }}>
                {filteredDailyEarnings.slice().reverse().map((d) => {
                  const barHeightPct = Math.max(12, Math.round((d.netPayout / maxNetPayoutInRange) * 100));
                  const isPending = d.payoutStatus === 'pending';
                  return (
                    <div
                      key={d.date}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                      title={`${d.formattedDate} (${d.dayOfWeek}): ₹${d.netPayout.toLocaleString('en-IN')} (${d.consultationsCount} consults) - ${d.payoutStatus}`}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${barHeightPct}%`,
                          backgroundColor: isPending ? '#F59E0B' : '#10B981',
                          borderRadius: '4px 4px 0 0',
                          opacity: 0.9,
                          transition: 'height 0.3s ease',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{ fontSize: '9px', color: '#818CF8', marginTop: '4px', whiteSpace: 'nowrap' }}>
                        {d.formattedDate.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter Bar for Drawer Table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '14d', label: 'Last 14 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: 'all', label: 'All History' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setIncomeRange(pill.id as any)}
                    className={incomeRange === pill.id ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '11.5px', padding: '5px 12px' }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={daySearchQuery}
                onChange={(e) => setDaySearchQuery(e.target.value)}
                placeholder="Filter by date, weekday, or ref..."
                style={{
                  backgroundColor: 'rgba(10, 12, 22, 0.8)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#EEF2FF',
                  fontSize: '12px',
                  width: '240px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Day-Wise Table */}
            <div className="liquid-card" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              <table className="cosmic-table">
                <thead>
                  <tr>
                    <th>Date & Day</th>
                    <th>Consultations Breakdown</th>
                    <th>Duration</th>
                    <th style={{ color: '#FCD34D' }}>Gross Billed</th>
                    <th style={{ color: '#38BDF8' }}>Platform Cut</th>
                    <th style={{ color: '#34D399' }}>Net Acharya Payout</th>
                    <th>Payout Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDailyEarnings.map((d) => (
                    <tr key={d.date}>
                      {/* Date & Day */}
                      <td>
                        <div style={{ fontWeight: '700', color: '#EEF2FF' }}>
                          {d.formattedDate}
                          {d.date === todayIso && (
                            <span className="badge-pill badge-emerald" style={{ marginLeft: '6px', fontSize: '9px', padding: '1px 6px' }}>
                              Today
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#818CF8' }}>{d.dayOfWeek}</div>
                      </td>

                      {/* Consultations */}
                      <td>
                        <div style={{ fontWeight: '600', color: '#EEF2FF' }}>
                          {d.consultationsCount} Sessions
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#A5B4FC' }}>
                          {d.callConsultations} Audio Calls · {d.chatConsultations} Chats
                        </div>
                      </td>

                      {/* Duration */}
                      <td style={{ color: '#EEF2FF', fontWeight: '600' }}>
                        {d.totalBillableMinutes} mins
                      </td>

                      {/* Gross */}
                      <td style={{ fontWeight: '800', color: '#FCD34D' }}>
                        ₹{d.grossRevenue.toLocaleString('en-IN')}
                      </td>

                      {/* Platform */}
                      <td style={{ color: '#38BDF8', fontWeight: '600' }}>
                        ₹{d.platformCommission.toLocaleString('en-IN')} ({100 - d.commissionRate}%)
                      </td>

                      {/* Net */}
                      <td style={{ fontWeight: '800', color: '#34D399', fontSize: '14px' }}>
                        ₹{d.netPayout.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td>
                        {d.payoutStatus === 'settled' ? (
                          <div>
                            <span className="badge-pill badge-emerald" style={{ fontSize: '10px' }}>
                              ✓ Settled
                            </span>
                            {d.payoutReference && (
                              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                                {d.payoutReference}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="badge-pill badge-rose" style={{ fontSize: '10px' }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td>
                        {d.payoutStatus === 'pending' && onSettlePayout ? (
                          <button
                            onClick={() => onSettlePayout(selectedIncomeAstro.id, d.date)}
                            className="btn-primary"
                            style={{ fontSize: '10.5px', padding: '4px 8px' }}
                          >
                            Mark Settled
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#34D399' }}>✓ Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ fontSize: '11px', color: '#818CF8' }}>
                Showing {filteredDailyEarnings.length} daily earning records for {selectedIncomeAstro.name} ({selectedIncomeAstro.id})
              </div>
              <button onClick={() => setIncomeAstroId(null)} className="btn-secondary">
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* AUDIT / KYC DOSSIER MODAL                                             */}
      {/* ===================================================================== */}
      {selectedAstroForKYC && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 6, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <div className="liquid-card" style={{ width: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
                Acharya Dossier & Credentials
              </h2>
              <button
                onClick={() => setSelectedAstroForKYC(null)}
                style={{ background: 'none', border: 'none', color: '#A5B4FC', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px', alignItems: 'center' }}>
              <img
                src={selectedAstroForKYC.avatar}
                alt={selectedAstroForKYC.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #818CF8' }}
              />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF' }}>{selectedAstroForKYC.name}</h3>
                
                {/* Astro ID in Dossier */}
                <div style={{ marginTop: '3px' }}>
                  <button
                    onClick={() => handleCopy(selectedAstroForKYC.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FCD34D',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🆔 {selectedAstroForKYC.id}</span>
                    <span style={{ fontSize: '11px' }}>{copiedText === selectedAstroForKYC.id ? '✓' : '📋'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '12px', color: '#A5B4FC', marginTop: '2px' }}>
                  {selectedAstroForKYC.email} · {selectedAstroForKYC.phone}
                </p>
                <div style={{ marginTop: '6px' }}>
                  <span className="badge-pill badge-emerald">Verified Vedic Scholar</span>
                </div>
              </div>
            </div>

            <div className="inset-box" style={{ padding: '16px', marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#FCD34D' }}>VERIFIED CREDENTIALS:</div>
              <ul style={{ fontSize: '13px', color: '#EEF2FF', marginTop: '8px', paddingLeft: '18px', lineHeight: '22px' }}>
                <li>Astro ID Identifier: <strong style={{ color: '#FCD34D', fontFamily: 'monospace' }}>{selectedAstroForKYC.id}</strong></li>
                <li>Aadhaar & PAN Identity Verification: <span style={{ color: '#34D399' }}>Verified ✓</span></li>
                <li>Vedic Jyotish Acharya Degree: <span style={{ color: '#34D399' }}>Verified ✓</span></li>
                <li>Test Audition Audio Quality Score: <span style={{ color: '#34D399' }}>98/100 ✓</span></li>
                <li>Lifetime Net Payouts Disbursed: <span style={{ color: '#FCD34D' }}>₹{(selectedAstroForKYC.lifetimeEarned || 0).toLocaleString('en-IN')}</span></li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setSelectedAstroForKYC(null)} className="btn-primary">
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
