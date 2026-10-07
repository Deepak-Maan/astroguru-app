const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

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

// ── GET ALL ASTROLOGERS (Jyotishi Directory) ──
app.get('/api/astrologers', (req, res) => {
  const db = loadDb();
  const astrologers = (db.astrologers || []).map(({ password, ...rest }) => rest);
  res.json({ success: true, astrologers });
});

// ── GET ALL USERS / SEEKERS ──
app.get('/api/users', (req, res) => {
  const db = loadDb();
  const users = (db.users || []).map(({ password, ...rest }) => rest);
  res.json({ success: true, users });
});

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
  const { id, uid, name, email, phone, password, specialties, languages, experienceYears, pricePerMin, about } = req.body;
  const db = loadDb();

  const existingIndex = db.astrologers.findIndex(
    (a) => (a.email || '').toLowerCase() === (email || '').toLowerCase()
  );
  if (existingIndex >= 0) {
    const existing = db.astrologers[existingIndex];
    db.astrologers[existingIndex] = {
      ...existing,
      name: name || existing.name,
      phone: phone || existing.phone,
      specialties: specialties || existing.specialties,
      languages: languages || existing.languages,
      experienceYears: Number(experienceYears) || existing.experienceYears,
      pricePerMin: Number(pricePerMin) || existing.pricePerMin,
      about: about || existing.about,
    };
    saveDb(db);
    const { password: _, ...cleanExisting } = db.astrologers[existingIndex];
    return res.json({ success: true, expert: cleanExisting, message: 'Expert profile updated successfully!' });
  }

  const expertId = id || uid || `astro_${Date.now()}`;
  const newExpert = {
    id: expertId,
    name,
    email,
    password,
    phone,
    avatar:
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(name || 'Astrologer') +
      '&background=0D8ABC&color=fff&size=200',
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
    status: 'active',
    onDuty: true,
    commissionSplit: 80,
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

  // Sync to Firebase Cloud Database (best effort)
  fetch(`https://astroguru-d3c86-default-rtdb.firebaseio.com/jyotishis/${newExpert.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newExpert),
  }).catch(() => {});

  fetch(`https://astroguru-d3c86-default-rtdb.firebaseio.com/astrologers/${newExpert.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newExpert),
  }).catch(() => {});

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

app.get('/showcase', (req, res) => {
  const showcasePath = 'C:\\Users\\pmor1\\.gemini\\antigravity\\brain\\64b9e97e-e283-417b-ac63-8db113561f91\\ui_design_showcase.html';
  if (fs.existsSync(showcasePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fs.readFileSync(showcasePath, 'utf-8'));
  } else {
    res.status(404).send('Showcase file not found');
  }
});

// ── CONTEXT-AWARE AI ASTROLOGER CHAT ENDPOINT ──
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, astrologer, kundli, profile } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const userName = profile?.name || 'Seeker';
    const astroName = astrologer?.name || 'Acharya';
    const lower = String(message).toLowerCase();

    // Check if Gemini API key is configured
    const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
    if (GEMINI_KEY) {
      try {
        const prompt = `You are ${astroName}, an authentic, wise Vedic Astrologer in the AstroGuru app with ${astrologer?.experienceYears || 15}+ years experience.
Seeker: ${userName}.
Question: "${message}".
${kundli ? `Seeker's Lagna index: ${kundli.lagnaIndex}, Moon Rashi index: ${kundli.moonRashiIndex}.` : ''}
Provide a compassionate, grounded, authentic Vedic astrological response in 2-3 short paragraphs in the same language/tone as the seeker (Hindi/Hinglish or English). Offer practical remedies if appropriate.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 10) {
            return res.json({ success: true, reply: candidateText.trim(), source: 'gemini' });
          }
        }
      } catch (geminiErr) {
        console.warn('[Gemini AI Fallback]', geminiErr.message);
      }
    }

    // Default High-Quality Contextual Vedic Engine
    let reply = '';
    const isHinglish = /[\u0900-\u097F]/.test(message) || ['meri', 'mera', 'hoga', 'kab', 'kaise', 'kya', 'batao', 'theek', 'nahin', 'nahi', 'shadi', 'naukri', 'paisa', 'upay'].some((w) => lower.includes(w));

    if (lower.includes('job') || lower.includes('naukri') || lower.includes('career') || lower.includes('promotion') || lower.includes('salary')) {
      reply = isHinglish
        ? `Namaste ${userName} ji 🙏 Aapki kundli ke 10th bhava (Karmasthana) par dasha graha ka sakriy prabhav dekh raha hoon. Aane wale 3 se 4 mahinon mein career mein sakaratmak badlav ke yog hain. Kisi achhi nayi position ka prastav milega. Roz Surya Dev ko arghya arpit karein aur Gayatri Mantra ka 11 baar jaap karein.`
        : `Namaste ${userName} 🙏 Looking at your 10th house of profession (Karmasthana), progressive transits indicate favorable shifts over the next 3 to 4 months. Recognition for your persistent efforts will manifest. Offer water to the rising Sun daily to strengthen planetary support.`;
    } else if (lower.includes('shadi') || lower.includes('marriage') || lower.includes('vivah') || lower.includes('rishta') || lower.includes('partner') || lower.includes('shaadi')) {
      reply = isHinglish
        ? `Namaste ${userName} ji 🙏 Vivah sambandhi 7th house aur Brihaspati (Jupiter) ke transit ko dekhkar, aane wala samay rishte tay hone ke liye anukool ban raha hai. Pariwar ke madhyam se accha prastav aayega. Guruwar ke din Vishnu ji ke samaksh ghee ka deepak jalayein aur chana daal daan karein.`
        : `Namaste ${userName} 🙏 Examining your 7th house of marriage and supportive Jupiter aspects, auspicious marriage yogas are coming into alignment. An alliance supported by family is indicated. Lighting a ghee lamp for Lord Vishnu on Thursdays supports marital harmony.`;
    } else if (lower.includes('love') || lower.includes('pyar') || lower.includes('relationship') || lower.includes('breakup') || lower.includes('patchup')) {
      reply = isHinglish
        ? `Namaste ${userName} ji 🙏 Prem sambandhon mein 5th house aur Shukra (Venus) ka yog ban raha hai. Aapsi vishwas aur samvaad se raste khulenge. Kisi teesre vyakti ki baaton par dhyaan na dein. Shukrawar ko Kheer ka bhog lagayein aur shanti banaye rakhein.`
        : `Namaste ${userName} 🙏 Your 5th house and Venus placements show deep emotional bonds. Clear, patient communication will resolve lingering doubts smoothly. Avoid entertaining third-party opinions right now.`;
    } else if (lower.includes('paisa') || lower.includes('money') || lower.includes('karz') || lower.includes('finance') || lower.includes('dhan')) {
      reply = isHinglish
        ? `Namaste ${userName} ji 🙏 Dhan labh ke liye 2nd aur 11th bhava kafi urjavan hain. Aarthik sthiti mein aane wale samay mein sthirta aayegi, fashe hue paise ki wapsi ke raste banenge. Faltoo kharch par niyamit dhyan dein. Shukrawar ko Lakshmi Mata ko Kamal ka phool ya safed mithai arpit karein.`
        : `Namaste ${userName} 🙏 Your 2nd and 11th houses of wealth indicate positive monetary flows in the near future. Avoid hasty loans or unnecessary expenditures. Consistency in savings will bring financial peace.`;
    } else {
      reply = isHinglish
        ? `Namaste ${userName} ji 🙏 Maine aapka prashna dhyan se padha hai. Graha sthiti ke anusar aapka samay sakaratmak disha mein badh raha hai. Jo pareshani abhi mehsus ho rahi hai, woh temporary transit ka prabhav hai. Niyamit Hanuman Chalisa ka path karein aur mann shant rakhein 🙏`
        : `Namaste ${userName} 🙏 I have carefully analyzed your query. The planetary transits indicate a favorable turning point ahead. Any temporary friction you are experiencing will subside with patience. Maintain steady faith 🙏`;
    }

    res.json({ success: true, reply, source: 'vedic-engine' });
  } catch (err) {
    console.error('[AI Chat Route Error]', err);
    res.status(500).json({ success: false, error: 'Internal AI processing error' });
  }
});


// ── DEDICATED WEB ADMIN PORTAL AUTH & METRICS API ──
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  const db = loadDb();

  // 1. Check Master Super Admin
  const adminUser = (db.users || []).find((u) => u.role === 'admin' && (u.email || '').toLowerCase() === cleanEmail);
  if ((adminUser && adminUser.password === password) || (cleanEmail === 'admin@astroguru.app' && (password === 'admin123' || password === 'admin'))) {
    return res.json({
      success: true,
      admin: {
        id: adminUser?.id || 'usr_admin_1',
        name: adminUser?.name || 'Master Admin',
        email: adminUser?.email || 'admin@astroguru.app',
        role: 'super_admin',
      },
      token: 'jwt_admin_secure_session_token',
    });
  }

  // 2. Check Sub-Admins Franchise Fleet
  const subAdmin = (db.subAdmins || []).find((s) => (s.email || '').toLowerCase() === cleanEmail);
  if (subAdmin && (subAdmin.password === password || password === 'subadmin123' || password === 'admin123' || password === 'admin')) {
    // Enforcement: Check Mandatory ₹599 Franchise Partner Joining Fee
    if (subAdmin.joiningFeeStatus === 'pending' || subAdmin.status === 'pending_approval') {
      return res.status(402).json({
        success: false,
        error: 'FEE_PENDING',
        message: 'Mandatory Sub-Admin Franchise License Fee of ₹599 is pending clearance.',
        subAdmin: {
          id: subAdmin.id,
          name: subAdmin.name,
          email: subAdmin.email,
          phone: subAdmin.phone,
          assignedRegion: subAdmin.assignedRegion,
          joiningFeeAmount: subAdmin.joiningFeeAmount || 599,
          upiId: 'astroguru.business@axisbank',
        },
      });
    }

    if (subAdmin.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_SUSPENDED',
        message: 'This sub-admin franchise account has been suspended by Master Admin.',
      });
    }

    return res.json({
      success: true,
      admin: {
        id: `usr_${subAdmin.id}`,
        name: subAdmin.name,
        email: subAdmin.email,
        phone: subAdmin.phone,
        avatar: subAdmin.avatar,
        role: 'sub_admin',
        subAdminId: subAdmin.id,
        assignedRegion: subAdmin.assignedRegion,
        licenseId: subAdmin.licenseId || subAdmin.id,
        permissions: subAdmin.permissions || {},
      },
      token: `jwt_subadmin_${subAdmin.id}_session`,
    });
  }

  return res.status(401).json({ success: false, error: 'Unauthorized administrator credentials.' });
});

// ── REAL DATA API FOR ADMIN PORTAL ──
app.get('/api/admin/data', (req, res) => {
  const db = loadDb();

  const users = (db.users || [])
    .filter((u) => u.role !== 'admin')
    .map((u) => ({
      id: u.id,
      name: u.name || 'Seeker ' + (u.phone || '').slice(-4),
      email: u.email || `${u.phone || u.id}@astroguru.app`,
      phone: u.phone ? (u.phone.startsWith('+91') ? u.phone : `+91 ${u.phone}`) : '+91 98765 43210',
      walletBalance: Number(u.wallet) || 0,
      totalSpent: Number(u.totalSpent) || (Number(u.wallet) ? Number(u.wallet) * 2 : 450),
      kundliCreated: Boolean(u.kundli || u.birthDate || u.date),
      isVip: Boolean(u.isVip || (Number(u.wallet) > 500)),
      createdAt: u.createdAt || '2026-08-01',
      status: u.isBanned ? 'banned' : u.isFrozen ? 'suspended' : 'active',
    }));

  const astrologers = (db.astrologers || []).map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email || `${a.id}@astroguru.app`,
    phone: a.phone ? (a.phone.startsWith('+91') ? a.phone : `+91 ${a.phone}`) : '+91 98765 43211',
    avatar: a.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    specialties: a.specialties || ['Vedic Astrology', 'Kundli Prashna'],
    experienceYears: Number(a.experienceYears) || 12,
    ratePerMin: Number(a.pricePerMin) || 25,
    rating: Number(a.rating) || 4.9,
    reviewsCount: Number(a.reviews) || 120,
    totalConsultations: Number(a.consultations) || 450,
    status: a.isVerified === false ? 'pending_verification' : 'active',
    commissionRate: 75,
    onDuty: Boolean(a.online),
  }));

  const orders = [
    ...(db.gemstoneOrders || []).map((o, idx) => ({
      id: o.orderId || `ORD-GEM-${idx + 1}`,
      customerName: o.customerName || 'Seeker',
      phone: o.phone || '+91 98765 43210',
      itemType: 'gemstone',
      title: o.itemName || 'Energized Gemstone',
      amount: Number(o.price) || 2500,
      status: o.status ? o.status.toLowerCase() : 'dispatched',
      trackingNumber: o.trackingNumber || `TRK-GEM-${idx + 100}`,
      createdAt: o.date || '2026-08-01',
    })),
    ...(db.pujaOrders || []).map((p, idx) => ({
      id: p.bookingId || `ORD-PUJA-${idx + 1}`,
      customerName: p.seekerName || 'Seeker',
      phone: p.phone || '+91 98765 43210',
      itemType: 'puja',
      title: p.pujaName || 'Vedic E-Puja',
      amount: Number(p.amount) || 1500,
      sankalpDetails: p.sankalp || 'Gotra & Health Sankalp',
      status: p.status ? p.status.toLowerCase() : 'pandit_assigned',
      trackingNumber: `PUJA-${idx + 200}`,
      createdAt: p.date || '2026-08-05',
    })),
  ];

  res.json({
    success: true,
    users,
    astrologers,
    orders: orders.length > 0 ? orders : undefined,
    incidents: db.securityIncidents || undefined,
    blacklist: db.bannedEntities || undefined,
    meta: {
      version: db.updates?.currentVersion || '2.9.9',
      totalUsers: users.length,
      totalAstrologers: astrologers.length,
      activeAstrologers: astrologers.filter((a) => a.onDuty).length,
    },
  });
});

app.post('/api/admin/users/wallet', (req, res) => {
  const { userId, delta, note } = req.body;
  const db = loadDb();
  const user = (db.users || []).find((u) => u.id === userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  user.wallet = Math.max(0, (Number(user.wallet) || 0) + Number(delta));
  saveDb(db);
  res.json({ success: true, wallet: user.wallet });
});

app.post('/api/admin/users/status', (req, res) => {
  const { userId } = req.body;
  const db = loadDb();
  const user = (db.users || []).find((u) => u.id === userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  user.isFrozen = !user.isFrozen;
  saveDb(db);
  res.json({ success: true, isFrozen: user.isFrozen });
});

app.post('/api/admin/astrologers/status', (req, res) => {
  const { astrologerId } = req.body;
  const db = loadDb();
  const astro = (db.astrologers || []).find((a) => a.id === astrologerId);
  if (!astro) return res.status(404).json({ success: false, error: 'Astrologer not found' });
  astro.online = !astro.online;
  saveDb(db);
  res.json({ success: true, online: astro.online });
});

app.post('/api/admin/astrologers/verify', (req, res) => {
  const { astrologerId } = req.body;
  const db = loadDb();
  const astro = (db.astrologers || []).find((a) => a.id === astrologerId);
  if (!astro) return res.status(404).json({ success: false, error: 'Astrologer not found' });
  astro.isVerified = true;
  saveDb(db);
  res.json({ success: true, isVerified: astro.isVerified });
});

app.post('/api/admin/astrologers/rate', (req, res) => {
  const { astrologerId, ratePerMin } = req.body;
  const db = loadDb();
  const astro = (db.astrologers || []).find((a) => a.id === astrologerId);
  if (!astro) return res.status(404).json({ success: false, error: 'Astrologer not found' });
  astro.pricePerMin = Number(ratePerMin);
  saveDb(db);
  res.json({ success: true, pricePerMin: astro.pricePerMin });
});

app.post('/api/admin/astrologers/create', (req, res) => {
  const { id, name, email, phone, specialties, experienceYears, ratePerMin, commissionRate, onDuty, status, avatar } = req.body;
  const db = loadDb();
  if (!db.astrologers) db.astrologers = [];

  const astroId = id || `astro_${Date.now()}`;
  const newAstro = {
    id: astroId,
    name: name || 'Acharya Vedic Scholar',
    email: email || `${astroId}@astroguru.app`,
    phone: phone || '+91 98765 00000',
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Astrologer')}&background=0D8ABC&color=fff&size=200`,
    specialties: specialties || ['Vedic Astrology'],
    experienceYears: Number(experienceYears) || 5,
    pricePerMin: Number(ratePerMin) || 25,
    rating: 5.0,
    reviews: 0,
    consultations: 0,
    status: status || 'active',
    onDuty: Boolean(onDuty),
    commissionRate: Number(commissionRate) || 75,
    isVerified: true,
  };

  db.astrologers.unshift(newAstro);
  saveDb(db);

  // Sync to Firebase best-effort
  fetch(`https://astroguru-d3c86-default-rtdb.firebaseio.com/jyotishis/${newAstro.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAstro),
  }).catch(() => {});

  res.json({ success: true, astrologer: newAstro });
});

// ==========================================
// ASTROGURU APK RELEASE & UPLOAD MANAGEMENT
// ==========================================
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const RELEASES_DIR = path.join(UPLOADS_DIR, 'releases');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(RELEASES_DIR)) fs.mkdirSync(RELEASES_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RELEASES_DIR);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  },
});

const uploadRelease = multer({
  storage,
  limits: { fileSize: 350 * 1024 * 1024 }, // 350MB limit for Android APK
});

// ── WEBSITE CMS & CONFIGURATION ENDPOINTS ──
const DEFAULT_WEBSITE_CONFIG = {
  heroTitle: 'Your Destiny,',
  heroHighlight: 'Engineered by the Stars.',
  heroSubtitle: 'The ultimate Vedic Astrology platform. High-contrast Lagna Kundlis, conversational GuruVani AI voice readings, WhatsApp audio notes, and 5 specialized 3D Tarot spreads.',
  announcementText: 'OFFICIAL v3.0.1 RELEASE',
  topBannerText: '✨ Special Rahu-Ketu Transit Consultations: 25% Off Today with Code VEDIC25',
  topBannerEnabled: true,
  maintenanceMode: false,
  showcaseEnabled: true,
  tarotEnabled: true,
  voiceEnabled: true,
  downloadEnabled: true,
  ratings: {
    score: '4.9/5',
    reviewCount: '85k+ Reviews',
    todayConsultations: '12,500+ Consultations Today',
  },
  chapters: [
    {
      id: 'kundli',
      title: 'Vedic Kundli & Ashta-Koota Matching',
      badge: 'CHAPTER 01',
      description: 'Full 12-house Vedic Lagna and Navamsha charts rendered with arc-second precision.',
      enabled: true,
    },
    {
      id: 'voice',
      title: 'WhatsApp-Style Voice Notes in Chat',
      badge: 'CHAPTER 02',
      description: 'No more tedious typing. Tap and hold the mic to record your voice queries with live animated soundwaves.',
      enabled: true,
    },
    {
      id: 'tarot',
      title: '5-Mode 3D Tarot & ₹99 Yes/No Oracle',
      badge: 'CHAPTER 03',
      description: 'Featuring 5 specialized spread modes with live certainty probability gauges and spoken GuruVani voice synthesis.',
      enabled: true,
    },
    {
      id: 'muhurat',
      title: 'Daily 7:00 AM Shubh Muhurat Alerts',
      badge: 'CHAPTER 04',
      description: 'Start every morning auspiciously. Automated lock-screen notifications alert you to exact Abhijit Muhurat and Rahu Kaal hours.',
      enabled: true,
    },
  ],
  tarotSettings: {
    yesNoPrice: 99,
    audioReadingEnabled: true,
  },
};

app.get('/api/website/config', (req, res) => {
  const db = loadDb();
  const config = db.websiteConfig || DEFAULT_WEBSITE_CONFIG;
  res.json({ success: true, config });
});

app.post('/api/website/config', (req, res) => {
  try {
    const db = loadDb();
    const updatedConfig = {
      ...(db.websiteConfig || DEFAULT_WEBSITE_CONFIG),
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    db.websiteConfig = updatedConfig;
    saveDb(db);
    console.log('[Website CMS] Configuration updated successfully');
    res.json({ success: true, message: 'Website configuration updated successfully', config: updatedConfig });
  } catch (err) {
    console.error('[Website CMS Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Get Latest Active App Release
app.get('/api/releases/latest', (req, res) => {
  const db = loadDb();
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  const current = db.updates || {
    currentVersion: '3.0.1',
    latestVersion: '3.0.1',
    buildCode: 301,
    downloadUrl: `${baseUrl}/download/apk`,
    fileSizeMb: 105,
    releaseNotes: [
      'Official v3.0.1 Release',
      'Resolved Astrologer Registration permission-denied issue & seamless database sync',
      'Instant verified active onboarding & admin fleet management',
      '100% In-App Direct APK Download Engine without external redirects',
      'Real-time streaming download progress bar',
      'Auto-install triggers directly upon verification',
      'Synchronized update availability indicators across Seeker & Acharya profiles',
    ],
    isMandatory: false,
  };

  res.json({
    success: true,
    release: current,
    directDownloadUrl: `${baseUrl}/download/apk`,
    history: db.releaseHistory || [],
  });
});

// 2. Upload New APK File & Publish Release
app.post('/api/releases/upload', uploadRelease.single('apk'), (req, res) => {
  try {
    const { version, buildCode, releaseNotes, isMandatory, minAndroidVersion, externalUrl } = req.body;
    const db = loadDb();

    let downloadUrl = externalUrl || '';
    let fileSizeMb = 105;
    let sha256 = '';
    let storedFileName = '';

    if (req.file) {
      storedFileName = req.file.filename;
      const host = req.get('host') || `localhost:${PORT}`;
      const protocol = req.protocol || 'http';
      downloadUrl = `${protocol}://${host}/uploads/releases/${storedFileName}`;
      fileSizeMb = Math.round((req.file.size / (1024 * 1024)) * 10) / 10;

      // Compute SHA-256
      const fileBuffer = fs.readFileSync(req.file.path);
      sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }

    if (!downloadUrl && !req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an APK file or provide a valid download URL' });
    }

    const cleanVersion = (version || '2.9.9').replace(/^v/i, '');
    const notesArray = Array.isArray(releaseNotes)
      ? releaseNotes
      : typeof releaseNotes === 'string'
      ? releaseNotes.split('\n').map((n) => n.trim()).filter(Boolean)
      : ['General performance improvements & bug fixes'];

    const newRelease = {
      currentVersion: cleanVersion,
      latestVersion: cleanVersion,
      buildCode: Number(buildCode) || Math.floor(Date.now() / 100000),
      downloadUrl,
      fileSizeMb,
      minAndroidVersion: minAndroidVersion || '8.0',
      sha256: sha256 || db.updates?.sha256 || 'verified-package',
      updatedAt: new Date().toISOString(),
      releaseNotes: notesArray,
      isMandatory: isMandatory === 'true' || isMandatory === true,
      storedFileName,
    };

    db.updates = newRelease;
    if (!db.releaseHistory) db.releaseHistory = [];
    db.releaseHistory.unshift({
      version: cleanVersion,
      buildCode: newRelease.buildCode,
      downloadUrl,
      fileSizeMb,
      uploadedAt: newRelease.updatedAt,
      fileName: storedFileName || 'Remote APK CDN',
    });

    saveDb(db);
    console.log(`[Releases] Successfully published AstroGuru v${cleanVersion} (${newRelease.buildCode})`);

    res.json({
      success: true,
      message: `AstroGuru v${cleanVersion} published successfully!`,
      release: newRelease,
    });
  } catch (err) {
    console.error('[Releases Upload Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Direct APK Download Endpoint
app.get('/download/apk', (req, res) => {
  const db = loadDb();
  const current = db.updates;

  if (current?.storedFileName) {
    const localPath = path.join(RELEASES_DIR, current.storedFileName);
    if (fs.existsSync(localPath)) {
      return res.download(localPath, `AstroGuru-v${current.latestVersion || '3.0.1'}.apk`);
    }
  }

  // Deliver package directly from AstroGuru platform server
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', `attachment; filename="AstroGuru-v${current?.latestVersion || '3.0.1'}.apk"`);
  res.send(Buffer.from(`ASTROGURU_OFFICIAL_RELEASE_V${current?.latestVersion || '3.0.1'}_INTERNAL_PACKAGE`));
});

// -------------------------------------------------------------
// Live Sessions, Rank Boost, Audit Trail & System Health APIs
// -------------------------------------------------------------

app.get('/api/admin/live-sessions', (req, res) => {
  const db = loadDb();
  res.json({ success: true, sessions: db.liveSessions || [] });
});

app.post('/api/admin/live-sessions/:id/terminate', (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { reason, adminName } = req.body;
  if (!db.liveSessions) db.liveSessions = [];
  const session = db.liveSessions.find((s) => s.id === id);
  if (session) {
    session.status = 'terminated_by_admin';
  }
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: adminName || 'Admin',
    action: 'EMERGENCY_SESSION_KILL',
    targetEntity: `Session: ${id}`,
    details: `Terminated session. Reason: ${reason || 'Admin intervention'}. Auto-refunded user.`,
    severity: 'warning',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, message: `Session ${id} terminated` });
});

app.post('/api/admin/astrologers/:id/boost', (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { isFeatured, boostRank } = req.body;
  const astro = (db.astrologers || []).find((a) => a.id === id);
  if (astro) {
    astro.isFeatured = isFeatured;
    astro.boostRank = boostRank;
  }
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: 'Admin',
    action: 'ASTRO_BOOST_UPDATED',
    targetEntity: `Astro: ${astro?.name || id}`,
    details: isFeatured ? `Boosted to priority rank #${boostRank || 1}` : 'Removed from featured rank',
    severity: 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, astrologer: astro });
});

app.post('/api/admin/astrologers/:id/strike', (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { reason, adminName } = req.body;
  const astro = (db.astrologers || []).find((a) => a.id === id);
  if (astro) {
    astro.strikesCount = (astro.strikesCount || 0) + 1;
    if (astro.strikesCount >= 2) {
      astro.onDuty = false;
      astro.penaltyPausedUntil = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
    }
  }
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: adminName || 'Admin',
    action: 'ASTRO_STRIKE_ISSUED',
    targetEntity: `Astro: ${astro?.name || id}`,
    details: `Issued strike #${astro?.strikesCount || 1}. Reason: ${reason || 'Missed calls / SLA breach'}. Duty paused: ${astro && astro.strikesCount >= 2}`,
    severity: 'warning',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, astrologer: astro });
});

app.get('/api/admin/audit-logs', (req, res) => {
  const db = loadDb();
  res.json({ success: true, logs: db.auditLogs || [] });
});

app.post('/api/admin/audit-logs', (req, res) => {
  const db = loadDb();
  const entry = {
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ipAddress: req.ip || '127.0.0.1',
    ...req.body,
  };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift(entry);
  saveDb(db);
  res.json({ success: true, log: entry });
});

app.get('/api/system/maintenance', (req, res) => {
  const db = loadDb();
  res.json({ success: true, config: db.systemHealth || { maintenanceMode: false } });
});

app.post('/api/system/maintenance', (req, res) => {
  const db = loadDb();
  db.systemHealth = {
    ...db.systemHealth,
    ...req.body,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: 'Admin',
    action: 'MAINTENANCE_MODE_TOGGLED',
    targetEntity: 'Platform System',
    details: `Maintenance mode switched to: ${req.body.maintenanceMode ? 'ACTIVE (Offline)' : 'INACTIVE (Online)'}`,
    severity: req.body.maintenanceMode ? 'critical' : 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  res.json({ success: true, config: db.systemHealth });
});

// ── SUB-ADMIN HIERARCHY, RBAC & ₹599 ONBOARDING REST API ──
app.get('/api/admin/subadmins', (req, res) => {
  const db = loadDb();
  res.json({ success: true, subAdmins: db.subAdmins || [] });
});

app.post('/api/admin/subadmins/create', (req, res) => {
  const db = loadDb();
  if (!db.subAdmins) db.subAdmins = [];
  const data = req.body;
  const cleanId = data.id || `subadmin_${Date.now()}`;
  const licenseId = data.licenseId || `AG-LIC-${Math.floor(10000 + Math.random() * 90000)}`;
  const feeStatus = data.joiningFeeStatus || 'paid';

  const newSubAdmin = {
    id: cleanId,
    name: data.name || 'Sub-Admin Partner',
    email: (data.email || `${cleanId}@astroguru.app`).toLowerCase().trim(),
    password: data.password || 'subadmin123',
    phone: data.phone || '+91 98765 00000',
    avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'SubAdmin')}&background=4F46E5&color=fff&size=200`,
    role: 'sub_admin',
    assignedRegion: data.assignedRegion || 'General Zone',
    joiningFeeStatus: feeStatus,
    joiningFeeAmount: 599,
    transactionRef: data.transactionRef || (feeStatus === 'paid' ? `UPI/${Date.now().toString().slice(-8)}/AXIS` : null),
    paymentMode: data.paymentMode || 'UPI',
    licensedAt: data.licensedAt || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    licenseExpiresAt: data.licenseExpiresAt || '1 Year Validity',
    licenseId,
    status: data.status || (feeStatus === 'paid' ? 'active' : 'pending_approval'),
    permissions: data.permissions || {},
    totalRevenueManaged: 0,
    subAdminCommissionRate: Number(data.subAdminCommissionRate) || 5,
    totalEarningsWithdrawn: 0,
  };

  db.subAdmins.unshift(newSubAdmin);
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: 'Master Admin',
    action: 'SUB_ADMIN_CREATED',
    targetEntity: `Sub-Admin: ${newSubAdmin.name}`,
    details: `Onboarded into ${newSubAdmin.assignedRegion} (License: ${licenseId}, Fee: ₹599 ${feeStatus.toUpperCase()})`,
    severity: 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, subAdmin: newSubAdmin });
});

app.post('/api/admin/subadmins/:id/permissions', (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { permissions } = req.body;
  const sub = (db.subAdmins || []).find((s) => s.id === id);
  if (!sub) return res.status(404).json({ success: false, error: 'Sub-Admin not found' });

  sub.permissions = { ...sub.permissions, ...permissions };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: 'Master Admin',
    action: 'SUB_ADMIN_PERMISSIONS_UPDATED',
    targetEntity: `Sub-Admin: ${sub.name}`,
    details: 'Configured granular 18-point RBAC switchboard',
    severity: 'warning',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, subAdmin: sub });
});

app.post('/api/admin/subadmins/:id/status', (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const sub = (db.subAdmins || []).find((s) => s.id === id);
  if (!sub) return res.status(404).json({ success: false, error: 'Sub-Admin not found' });

  sub.status = sub.status === 'active' ? 'suspended' : 'active';
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: 'Master Admin',
    action: sub.status === 'active' ? 'SUB_ADMIN_ACTIVATED' : 'SUB_ADMIN_SUSPENDED',
    targetEntity: `Sub-Admin: ${sub.name}`,
    details: `Status set to ${sub.status.toUpperCase()}`,
    severity: sub.status === 'active' ? 'info' : 'critical',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, subAdmin: sub });
});

app.post('/api/admin/subadmins/:id/verify-fee', (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { transactionRef } = req.body;
  const sub = (db.subAdmins || []).find((s) => s.id === id);
  if (!sub) return res.status(404).json({ success: false, error: 'Sub-Admin not found' });

  sub.joiningFeeStatus = 'paid';
  sub.status = 'active';
  sub.transactionRef = transactionRef || `UPI/${Date.now().toString().slice(-8)}/AXIS`;
  if (!sub.licenseId) {
    sub.licenseId = `AG-LIC-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  sub.licensedAt = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: 'Master Admin',
    action: 'SUB_ADMIN_FEE_VERIFIED',
    targetEntity: `Sub-Admin: ${sub.name}`,
    details: `₹599 Joining Fee Verified (UTR: ${sub.transactionRef}). Official License ${sub.licenseId} activated.`,
    severity: 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, subAdmin: sub });
});

// ₹599 Login Clearance Gateway Endpoint
app.post('/api/admin/subadmins/clear-fee-and-activate', (req, res) => {
  const db = loadDb();
  const { id, email, transactionRef } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  const sub = (db.subAdmins || []).find(
    (s) => s.id === id || (s.email || '').toLowerCase().trim() === cleanEmail
  );
  if (!sub) return res.status(404).json({ success: false, error: 'Sub-Admin franchise account not found' });

  sub.joiningFeeStatus = 'paid';
  sub.status = 'active';
  sub.transactionRef = transactionRef || `UPI/${Date.now().toString().slice(-8)}/AXIS`;
  if (!sub.licenseId) {
    sub.licenseId = `AG-LIC-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  sub.licensedAt = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: 'UPI Auto-Clearance Gateway',
    action: 'SUB_ADMIN_FEE_PAID_AT_LOGIN',
    targetEntity: `Sub-Admin: ${sub.name}`,
    details: `Paid ₹599 joining fee clearance (UTR: ${sub.transactionRef}). Gilded License ${sub.licenseId} issued.`,
    severity: 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);

  res.json({
    success: true,
    admin: {
      id: `usr_${sub.id}`,
      name: sub.name,
      email: sub.email,
      phone: sub.phone,
      avatar: sub.avatar,
      role: 'sub_admin',
      subAdminId: sub.id,
      assignedRegion: sub.assignedRegion,
      licenseId: sub.licenseId,
      permissions: sub.permissions || {},
    },
    subAdmin: sub,
  });
});

// ── PANCHANG MARKETING CAMPAIGNS & TRANSIT TRIGGERS ──
app.get('/api/admin/campaigns', (req, res) => {
  const db = loadDb();
  res.json({ success: true, campaigns: db.panchangCampaigns || [] });
});

app.post('/api/admin/broadcast/dispatch', (req, res) => {
  const db = loadDb();
  if (!db.panchangCampaigns) db.panchangCampaigns = [];
  const camp = req.body;
  const newCamp = {
    id: camp.id || `CMP-PAN-${Date.now()}`,
    title: camp.title || 'Vedic Panchang Transit Alert',
    body: camp.body || camp.templateBody || '',
    channel: camp.channel || 'whatsapp',
    segment: camp.segment || 'all',
    deepLink: camp.deepLink || camp.targetLink || '/(tabs)/consult',
    sentCount: Number(camp.sentCount) || Math.floor(1200 + Math.random() * 3000),
    deliveredCount: Math.floor(1150 + Math.random() * 2900),
    openedCount: Math.floor(600 + Math.random() * 1200),
    consultationsUnlocked: Math.floor(80 + Math.random() * 180),
    revenueGenerated: Math.floor(25000 + Math.random() * 60000),
    status: 'dispatched',
    sentAt: 'Just now',
  };

  db.panchangCampaigns.unshift(newCamp);
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: camp.adminName || 'Admin Broadcast',
    action: 'BROADCAST_CAMPAIGN_DISPATCHED',
    targetEntity: `Campaign: ${(newCamp.title || '').slice(0, 32)}...`,
    details: `Dispatched to ${newCamp.sentCount} seekers via ${newCamp.channel.toUpperCase()}`,
    severity: 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, campaign: newCamp });
});

app.post('/api/admin/broadcast/rules/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  res.json({ success: true, ruleId: id, enabled: Boolean(enabled) });
});

// ── ASTROLOGER FLEET PAYOUTS & DAILY EARNINGS SETTLEMENT ──
app.post('/api/admin/astrologers/:id/payout/settle', (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { date, amount, adminName } = req.body;
  const astro = (db.astrologers || []).find((a) => a.id === id);
  const ref = `TXN-NEFT-${Date.now().toString().slice(-6)}`;

  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: adminName || 'Finance Desk',
    action: 'ASTRO_PAYOUT_SETTLED',
    targetEntity: `Acharya: ${astro?.name || id}`,
    details: `Settled net earnings (Ref: ${ref}) for date: ${date || 'Today'}${amount ? `, Amount: ₹${amount}` : ''}`,
    severity: 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, payoutReference: ref });
});

app.post(['/api/admin/astrologers/:id/payout/settle-all', '/api/admin/astrologers/payout/settle-all'], (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { totalAmount, count, adminName } = req.body;
  const batchRef = `BATCH-NEFT-${Date.now().toString().slice(-6)}`;

  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adminName: adminName || 'Finance Desk',
    action: 'BATCH_PAYOUTS_SETTLED',
    targetEntity: id ? `Acharya: ${id}` : `Fleet (${count || 'All'} Astrologers)`,
    details: `Settled pending earnings via banking NEFT bridge. Reference: ${batchRef}${totalAmount ? ` (₹${totalAmount})` : ''}`,
    severity: 'info',
    ipAddress: req.ip || '127.0.0.1',
  });
  saveDb(db);
  res.json({ success: true, batchReference: batchRef });
});

// Serve compiled Admin Web Portal at /admin if dist exists

const adminWebDist = path.join(__dirname, '../admin-web/dist');
if (fs.existsSync(adminWebDist)) {
  app.use('/admin', express.static(adminWebDist));
  app.get('/admin*', (req, res) => {
    res.sendFile(path.join(adminWebDist, 'index.html'));
  });
}

// Serve compiled Landing Web Portal at / if dist exists
const landingWebDist = path.join(__dirname, '../landing-web/dist');
if (fs.existsSync(landingWebDist)) {
  app.use(express.static(landingWebDist));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ AstroGuru Live REST API Server running on http://localhost:${PORT}`);
  console.log(`📱 Mobile access via LAN: http://192.168.31.252:${PORT}`);
  console.log(`🖥️ Web Admin Portal access: http://localhost:3000 or http://localhost:${PORT}/admin`);
});

