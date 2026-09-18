const { initializeApp, getApps } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyBq9PRkAUCwdEJjDAQFfV6eFPoWFnLYrLI",
  authDomain: "astroguru-d3c86.firebaseapp.com",
  databaseURL: "https://astroguru-d3c86-default-rtdb.firebaseio.com",
  projectId: "astroguru-d3c86",
  storageBucket: "astroguru-d3c86.firebasestorage.app",
  messagingSenderId: "539958199029",
  appId: "1:539958199029:web:e77f0e2b1c328fdfd03bbc",
  measurementId: "G-CX3DLN2G2D"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

async function sync() {
  try {
    let userCred;
    try {
      userCred = await signInWithEmailAndPassword(auth, 'admin@astroguru.app', 'admin123');
      console.log('Logged in as admin@astroguru.app, UID:', userCred.user.uid);
    } catch (authErr) {
      console.log('Admin login error:', authErr.message, '- Trying vivek@gmail.com');
      userCred = await signInWithEmailAndPassword(auth, 'vivek@gmail.com', 'Maan@50133');
      console.log('Logged in as vivek@gmail.com, UID:', userCred.user.uid);
    }

    const metaRef = ref(db, 'app_meta');
    await set(metaRef, {
      latestVersion: "2.9.6",
      versionCode: 296,
      releaseNotes: [
        "🚀 Official AstroGuru Platform Upgrade v2.9.6",
        "🎴 5 Specialized Tarot Spreads (Daily, Past/Present/Future, Celtic Cross, Love, Career)",
        "🎲 Interactive 3D Deck Cutting & Yes/No Oracle with Live Confidence Meter",
        "🎙️ WhatsApp-Style Voice Notes in Chat with Live Waveforms & Audio Bubbles",
        "🎯 1-Tap Problem Categories (Career, Delayed Marriage, Love, Finance, Dosha)",
        "🌅 Approximate Birth Time Windows (Morning, Afternoon, Evening, Night)",
        "⚡ Seamless 1-Tap Floating Wallet Recharge During Live Calls (+5 Mins ₹99)",
        "🔔 Daily 7:00 AM 'Subah Ka Shubh Muhurat' & Rahu Kaal Push Notifications",
        "📦 Direct Native In-App APK Download & Package Auto-Installer Engine",
        "💎 Ultra-Smooth Liquid Glass UI & Option 10 Polished Experience"
      ],
      apkUrl: "https://expo.dev/artifacts/eas/KqNVd3oafIKVeEIuHEhYUUB0ll5xTobex7TfgS_0ZvE.apk",
      downloadUrl: "https://expo.dev/artifacts/eas/KqNVd3oafIKVeEIuHEhYUUB0ll5xTobex7TfgS_0ZvE.apk",
      isMandatory: false,
      updatedAt: Date.now()
    });

    console.log("SUCCESS: /app_meta synced to v2.9.6 in Firebase!");
    const snap = await get(metaRef);
    console.log("VERIFIED DATA:", JSON.stringify(snap.val(), null, 2));
    process.exit(0);
  } catch (err) {
    console.error("ERROR syncing to Firebase:", err);
    process.exit(1);
  }
}

sync();
