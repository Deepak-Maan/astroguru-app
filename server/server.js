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

  // Also add to users list with role 'astrologer'
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

// ── REGULAR AUTH ENDPOINTS ──
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
  console.log(`⚡ AstroGuru Live REST API Server running on http://localhost:${PORT}`);
});
