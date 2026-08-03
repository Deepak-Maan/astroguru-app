const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Persistent JSON Database path
const DB_FILE = path.join(__dirname, 'db.json');

// Initial seed data
const initialDb = {
  users: [
    {
      id: 'usr_demo_1',
      name: 'Demo Seeker',
      email: 'seeker@astroguru.app',
      password: 'seeker123',
      phone: '9876543210',
      role: 'user',
      wallet: 310,
    },
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
  chatMessages: [],
  callSessions: [],
  inventory: [
    {
      id: 'gem-1',
      name: 'Natural Yellow Sapphire (Pukhraj)',
      sanskritName: 'पुखराज',
      planet: 'Jupiter (Brihaspati)',
      planetIcon: '🟡',
      price: 4999,
      stock: 15,
      available: true,
    },
  ],
  spells: [],
  orders: [],
  spellOrders: [],
  payments: [],
  cronLogs: [],
  uploads: [],
  updates: {
    currentVersion: '1.2.0',
    latestVersion: '1.2.0',
    releaseNotes: ['✨ Redesigned Modern Light UI', '🛡️ Added Security Vault & PIN Lock'],
    isMandatory: false,
  },
};

// Database helper functions
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

// ── REAL CHAT SYSTEM ENDPOINTS ──
app.get('/api/chat/messages/:astrologerId', (req, res) => {
  const { astrologerId } = req.params;
  const db = loadDb();
  const messages = (db.chatMessages || []).filter((m) => m.astrologerId === astrologerId);
  res.json({ success: true, messages });
});

app.post('/api/chat/messages', (req, res) => {
  const { astrologerId, userId, role, text } = req.body;
  const db = loadDb();

  const msg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    astrologerId,
    userId: userId || 'usr_demo_1',
    role: role || 'user',
    text,
    at: Date.now(),
    timestamp: new Date().toISOString(),
  };

  if (!db.chatMessages) db.chatMessages = [];
  db.chatMessages.push(msg);
  saveDb(db);

  res.json({ success: true, message: msg });
});

// ── REAL CALL SYSTEM ENDPOINTS ──
app.post('/api/consultations/call/start', (req, res) => {
  const { astrologerId, userId, callType } = req.body;
  const db = loadDb();

  const astro = db.astrologers.find((a) => a.id === astrologerId);
  if (!astro) return res.status(404).json({ success: false, error: 'Astrologer not found' });

  const session = {
    callId: `call_${Date.now()}`,
    astrologerId,
    astrologerName: astro.name,
    userId: userId || 'usr_demo_1',
    callType: callType || 'audio',
    channelToken: `rtc_token_${crypto.randomBytes(16).toString('hex')}`,
    startedAt: new Date().toISOString(),
    status: 'ACTIVE',
    pricePerMin: astro.pricePerMin,
  };

  if (!db.callSessions) db.callSessions = [];
  db.callSessions.unshift(session);
  saveDb(db);

  res.json({ success: true, session });
});

app.post('/api/consultations/call/end', (req, res) => {
  const { callId, durationSeconds } = req.body;
  const db = loadDb();

  const session = (db.callSessions || []).find((s) => s.callId === callId);
  if (!session) return res.status(404).json({ success: false, error: 'Call session not found' });

  const minutes = Math.ceil((durationSeconds || 60) / 60);
  const totalCost = minutes * (session.pricePerMin || 25);

  session.status = 'COMPLETED';
  session.durationSeconds = durationSeconds || 60;
  session.totalCost = totalCost;

  // Deduct from user wallet
  const user = db.users.find((u) => u.id === session.userId);
  if (user) {
    user.wallet = Math.max(0, user.wallet - totalCost);
  }
  saveDb(db);

  res.json({
    success: true,
    summary: {
      callId,
      durationMinutes: minutes,
      totalCost,
      remainingWallet: user ? user.wallet : 0,
    },
  });
});

// ── AUTH ENDPOINTS ──
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = loadDb();
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const { password: _, ...cleanUser } = user;
  res.json({ success: true, user: cleanUser, token: 'demo_token' });
});

// ── ASTROLOGERS ENDPOINTS ──
app.get('/api/astrologers', (req, res) => {
  const db = loadDb();
  res.json({ success: true, astrologers: db.astrologers });
});

app.listen(PORT, () => {
  console.log(`⚡ AstroGuru Live REST API & Real Call/Chat Server running on http://localhost:${PORT}`);
});
