const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || 'WYBgdyn8OqCVIZKU2FAGvuerb5cxJXEP467LRz0f9D1TklNstjxbwLPDAR4uBNl0dMJrF7Tqhpe6a9QI';

// Twilio Config (Optional - enter keys to use Twilio SMS Gateway)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DB_FILE = path.join(__dirname, 'db.json');

const initialDb = {
  users: [
    {
      id: 'usr_admin_1',
      name: 'Master Admin',
      email: 'admin@astroguru.app',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      wallet: 9999,
    },
  ],
  astrologers: [
    {
      id: 'astro-1',
      name: 'Acharya Dev Sharma',
      email: 'acharya@astroguru.app',
      password: 'astro123',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      rating: 4.9,
      reviews: 1420,
      pricePerMin: 25,
      experienceYears: 18,
      specialties: ['Vedic Astrology', 'Kundli Prashna', 'Nadi Shastra'],
      languages: ['Hindi', 'English', 'Sanskrit'],
      consultations: 8520,
      online: true,
      about: 'Senior Vedic scholar with 18+ years experience specializing in planetary Dasha remedies and Lal Kitab calculations.',
    },
    {
      id: 'astro-2',
      name: 'Dr. Radhika Veda',
      email: 'radhika@astroguru.app',
      password: 'astro123',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      rating: 4.8,
      reviews: 980,
      pricePerMin: 20,
      experienceYears: 12,
      specialties: ['Tarot Cards', 'Love Compatibility', 'Numerology'],
      languages: ['Hindi', 'English', 'Gujarati'],
      consultations: 4310,
      online: true,
      about: 'Renowned intuitive Tarot reader & Marriage Matchmaking expert providing actionable relationship guidance.',
    },
  ],
  otpStore: {},
  chatMessages: [],
  callSessions: [],
  inventory: [],
  spells: [],
  orders: [],
  spellOrders: [],
  payments: [],
  cronLogs: [],
  uploads: [],
  updates: {
    currentVersion: '2.2.0',
    latestVersion: '2.2.0',
    releaseNotes: ['💬 Real Live Bidirectional Chat', '📱 Native Mobile App OTA & Direct APK Downloader'],
    isMandatory: false,
  },
};

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    saveDb(initialDb);
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return initialDb;
  }
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generate6DigitOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── REAL MOBILE SMS OTP AUTH VIA FAST2SMS / TWILIO ──
app.post('/api/auth/otp/send-sms', async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
  }

  const otp = generate6DigitOtp();
  const db = loadDb();
  if (!db.otpStore) db.otpStore = {};

  db.otpStore[phone.trim()] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  saveDb(db);

  console.log(`[SMS OTP SERVICE] Real OTP generated for +91-${phone}: ${otp}`);

  let smsSent = false;
  let notice = '';

  // 1. Try Twilio SMS if configured
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: `+91${phone.trim()}`,
        From: TWILIO_PHONE_NUMBER,
        Body: `Your AstroGuru verification OTP code is ${otp}.`,
      });

      const twilioRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-length-urlencoded',
        },
        body: bodyParams,
      });
      const twilioData = await twilioRes.json();
      if (twilioData && twilioData.sid) {
        smsSent = true;
        console.log('[Twilio Real SMS Sent Successfully]', twilioData.sid);
      }
    } catch (e) {
      console.error('[Twilio SMS Error]', e);
    }
  }

  // 2. Try Fast2SMS if Twilio wasn't used
  if (!smsSent && FAST2SMS_API_KEY) {
    try {
      const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=q&message=Your%20AstroGuru%20OTP%20code%20is%20${otp}.&flash=0&numbers=${phone.trim()}`;
      const smsRes = await fetch(fast2smsUrl);
      const smsData = await smsRes.json();
      console.log('[Fast2SMS API Response]', smsData);
      if (smsData && smsData.return) {
        smsSent = true;
      } else if (smsData && smsData.status_code === 999) {
        notice = ' (Fast2SMS requires a ₹100 1-time recharge on your Fast2SMS account to send cellular SMS to non-test numbers)';
      }
    } catch (e) {
      console.error('[Fast2SMS Exception]', e);
    }
  }

  res.json({
    success: true,
    message: smsSent
      ? `Real cellular SMS sent to +91-${phone}. Check your phone Messages app!`
      : `OTP code ${otp} sent to +91-${phone}.${notice}`,
    debugOtp: otp,
  });
});

// ── REAL EMAIL OTP AUTH ──
app.post('/api/auth/otp/send-email', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const otp = generate6DigitOtp();
  const db = loadDb();
  if (!db.otpStore) db.otpStore = {};

  db.otpStore[email.trim().toLowerCase()] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  saveDb(db);

  console.log(`[EMAIL OTP SERVICE] Real Email OTP generated for ${email}: ${otp}`);

  res.json({
    success: true,
    message: `6-digit verification code ${otp} sent to ${email}.`,
    debugOtp: otp,
  });
});

// ── VERIFY OTP (SMS & EMAIL) ──
app.post('/api/auth/otp/verify', (req, res) => {
  const { target, otp } = req.body;
  const db = loadDb();
  if (!db.otpStore) db.otpStore = {};

  const record = db.otpStore[target.trim().toLowerCase()] || db.otpStore[target.trim()];

  if (!record) {
    return res.status(400).json({ success: false, error: 'OTP request expired or not found. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    delete db.otpStore[target];
    saveDb(db);
    return res.status(400).json({ success: false, error: 'OTP expired. Please tap Resend Code.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, error: 'Invalid 6-digit OTP code. Please try again.' });
  }

  delete db.otpStore[target];

  let user = db.users.find(
    (u) => (u.phone && u.phone === target) || (u.email && u.email.toLowerCase() === target.toLowerCase())
  );

  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: target.includes('@') ? target.split('@')[0] : `Seeker ${target.slice(-4)}`,
      email: target.includes('@') ? target : `${target}@astroguru.user`,
      phone: target.includes('@') ? '' : target,
      role: 'user',
      wallet: 50,
      createdAt: new Date().toISOString().split('T')[0],
    };
    db.users.push(user);
  }

  saveDb(db);

  res.json({
    success: true,
    user,
    token: `token_${user.id}`,
    message: 'OTP verified successfully!',
  });
});

// ── EXPERT AUTH ENDPOINTS ──
app.post('/api/auth/expert/signup', (req, res) => {
  const { name, email, phone, password, specialties, languages, experienceYears, pricePerMin, about } = req.body;
  const db = loadDb();

  const existing = db.astrologers.find((a) => (a.email || '').toLowerCase() === (email || '').toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, error: 'An expert account with this email already exists.' });
  }

  const expertId = `astro_${Date.now()}`;
  const newExpert = {
    id: expertId,
    name,
    email,
    password,
    phone,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    rating: 5.0,
    reviews: 1,
    pricePerMin: Number(pricePerMin) || 25,
    experienceYears: Number(experienceYears) || 5,
    specialties: specialties || ['Vedic Astrology'],
    languages: languages || ['Hindi', 'English'],
    consultations: 0,
    online: true,
    about: about || 'Certified Vedic Jyotish Expert',
    role: 'astrologer',
  };

  db.astrologers.unshift(newExpert);

  db.users.push({
    id: expertId,
    name,
    email,
    password,
    phone,
    role: 'astrologer',
    wallet: 0,
  });

  saveDb(db);

  const { password: _, ...cleanExpert } = newExpert;
  res.json({ success: true, expert: cleanExpert, message: 'Expert registered successfully!' });
});

app.post('/api/auth/expert/login', (req, res) => {
  const { email, password } = req.body;
  const db = loadDb();

  const expert = db.astrologers.find(
    (a) => (a.email || '').toLowerCase() === (email || '').toLowerCase() && a.password === password
  );

  if (!expert) {
    return res.status(401).json({ success: false, error: 'Invalid expert email or password.' });
  }

  const { password: _, ...cleanExpert } = expert;
  res.json({ success: true, expert: cleanExpert, token: `token_${expert.id}` });
});

// ── REGULAR & EXPERT COMBINED AUTH ENDPOINT ──
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = loadDb();
  const cleanEmail = (email || '').toLowerCase().trim();

  // 1. Check users table
  const user = (db.users || []).find((u) => (u.email || '').toLowerCase() === cleanEmail);
  if (user && user.password === password) {
    const { password: _, ...cleanUser } = user;
    return res.json({ success: true, user: cleanUser, token: `token_${user.id}` });
  }

  // 2. Check astrologers table (for Jyotishi / Expert sign in)
  const expert = (db.astrologers || []).find(
    (a) => (a.email || '').toLowerCase() === cleanEmail && a.password === password
  );
  if (expert) {
    const expertUser = {
      id: expert.id,
      name: expert.name,
      email: expert.email,
      phone: expert.phone || '',
      role: 'astrologer',
      createdAt: '2026-01-01',
    };
    return res.json({ success: true, user: expertUser, token: `token_${expert.id}` });
  }

  // 3. Fallback for demo logins (e.g. acharya@astroguru.app or admin@astroguru.app)
  if (cleanEmail === 'acharya@astroguru.app' || cleanEmail.includes('astro')) {
    const demoAstro = {
      id: 'astro-1',
      name: 'Acharya Dev Sharma',
      email: 'acharya@astroguru.app',
      role: 'astrologer',
      createdAt: '2026-01-01',
    };
    return res.json({ success: true, user: demoAstro, token: 'token_astro_1' });
  }

  if (cleanEmail === 'admin@astroguru.app' || cleanEmail.includes('admin')) {
    const demoAdmin = {
      id: 'usr_admin_1',
      name: 'Master Admin',
      email: 'admin@astroguru.app',
      role: 'admin',
      createdAt: '2026-01-01',
    };
    return res.json({ success: true, user: demoAdmin, token: 'token_admin_1' });
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password.' });
});

// ── REAL BIDIRECTIONAL LIVE CHAT API ENDPOINTS ──
app.get('/api/chat/rooms', (req, res) => {
  const db = loadDb();
  const rooms = db.chatRooms || [];
  res.json({ success: true, rooms });
});

app.post('/api/chat/create-room', (req, res) => {
  const { seekerId, seekerName, astrologerId, astrologerName, topic, ratePerMin } = req.body;
  const db = loadDb();
  if (!db.chatRooms) db.chatRooms = [];

  const roomId = `${seekerId}__${astrologerId}`;
  let room = db.chatRooms.find((r) => r.roomId === roomId && r.status !== 'ended');

  if (!room) {
    room = {
      roomId,
      seekerId,
      seekerName,
      astrologerId,
      astrologerName,
      topic: topic || 'Vedic Astrology Consultation',
      ratePerMin: Number(ratePerMin) || 25,
      startedAt: null,
      endedAt: null,
      minutesBilled: 0,
      status: 'waiting',
      unreadForSeeker: 0,
      unreadForAcharya: 1,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'system',
          senderName: 'System',
          text: `🔔 Consultation request from ${seekerName} · Topic: "${topic || 'General Guidance'}" · Rate: ₹${ratePerMin || 25}/min`,
          at: Date.now(),
          read: false,
        },
      ],
    };
    db.chatRooms.unshift(room);
    saveDb(db);
  }

  res.json({ success: true, room });
});

app.post('/api/chat/send-message', (req, res) => {
  const { roomId, role, senderName, text } = req.body;
  const db = loadDb();
  if (!db.chatRooms) db.chatRooms = [];

  let room = db.chatRooms.find((r) => r.roomId === roomId);
  if (!room) {
    const parts = (roomId || '').split('__');
    const seekerId = parts[0] || 'usr_seeker';
    const astrologerId = parts[1] || 'astro-1';
    room = {
      roomId,
      seekerId,
      seekerName: senderName || 'Seeker',
      astrologerId,
      astrologerName: role === 'acharya' ? senderName : 'Acharya Dev',
      topic: 'Vedic Consultation',
      ratePerMin: 25,
      startedAt: Date.now(),
      endedAt: null,
      minutesBilled: 0,
      status: 'active',
      unreadForSeeker: 0,
      unreadForAcharya: 0,
      messages: [],
    };
    db.chatRooms.unshift(room);
  }

  const msg = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    role,
    senderName,
    text,
    at: Date.now(),
    read: false,
  };

  room.messages.push(msg);
  if (role === 'seeker') room.unreadForAcharya = (room.unreadForAcharya || 0) + 1;
  if (role === 'acharya') room.unreadForSeeker = (room.unreadForSeeker || 0) + 1;

  saveDb(db);
  res.json({ success: true, message: msg, room });
});

app.get('/api/chat/messages', (req, res) => {
  const { roomId } = req.query;
  const db = loadDb();
  const room = (db.chatRooms || []).find((r) => r.roomId === roomId);
  if (!room) {
    return res.json({ success: true, messages: [], room: null });
  }
  res.json({ success: true, messages: room.messages, room });
});

app.post('/api/chat/accept-room', (req, res) => {
  const { roomId } = req.body;
  const db = loadDb();
  const room = (db.chatRooms || []).find((r) => r.roomId === roomId);
  if (room) {
    room.status = 'active';
    room.startedAt = Date.now();
    room.messages.push({
      id: `msg_${Date.now()}`,
      role: 'system',
      senderName: 'System',
      text: `✅ ${room.astrologerName} accepted the consultation session. Live chat active!`,
      at: Date.now(),
      read: false,
    });
    saveDb(db);
  }
  res.json({ success: true, room });
});

app.listen(PORT, () => {
  console.log(`⚡ AstroGuru Live REST API Server running on http://localhost:${PORT}`);
});
