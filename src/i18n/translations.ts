export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu';

export const LANGUAGES: { code: LanguageCode; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🚩' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🚩' },
];

export type TranslationKey =
  | 'home'
  | 'kundli'
  | 'rashifal'
  | 'consult'
  | 'wallet'
  | 'profile'
  | 'panchang'
  | 'tarot'
  | 'vip'
  | 'admin'
  | 'namaste'
  | 'todayReading'
  | 'askAi'
  | 'askAiSub'
  | 'astrologersOnline'
  | 'topRated'
  | 'coreDetails'
  | 'mangalDosha'
  | 'recharge'
  | 'availableBalance'
  | 'selectPaymentApp'
  | 'searchPlaceholder'
  | 'settings'
  | 'signOut'
  | 'language';

export const TRANSLATIONS: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: {
    home: 'Home',
    kundli: 'Kundli',
    rashifal: 'Rashifal',
    consult: 'Consult',
    wallet: 'Wallet',
    profile: 'Profile',
    panchang: 'Panchang',
    tarot: 'Tarot',
    vip: 'AstroVIP',
    admin: 'Admin',
    namaste: 'Namaste',
    todayReading: "TODAY'S READING",
    askAi: 'Ask the AI Jyotishi',
    askAiSub: 'Instant answers about your chart — free, unlimited',
    astrologersOnline: 'Astrologers Online',
    topRated: 'Top Rated',
    coreDetails: 'Core Details',
    mangalDosha: 'Mangal Dosha',
    recharge: 'Add Money to Wallet',
    availableBalance: 'AVAILABLE BALANCE',
    selectPaymentApp: 'Select Real Payment App',
    searchPlaceholder: 'Search name, specialty or language',
    settings: 'Settings',
    signOut: 'Sign Out',
    language: 'Language',
  },
  hi: {
    home: 'होम',
    kundli: 'कुंडली',
    rashifal: 'राशिफल',
    consult: 'सलाह',
    wallet: 'वॉलेट',
    profile: 'प्रोफाइल',
    panchang: 'पंचांग',
    tarot: 'टैरो कार्ड',
    vip: 'एस्ट्रो VIP',
    admin: 'एडमिन',
    namaste: 'नमस्ते',
    todayReading: 'आज का राशिफल',
    askAi: 'AI ज्योतिषी से पूछें',
    askAiSub: 'अपनी कुंडली के तुरंत उत्तर पाएं — बिल्कुल मुफ्त',
    astrologersOnline: 'ऑनलाइन ज्योतिषी',
    topRated: 'शीर्ष रेटिंग वाले',
    coreDetails: 'मुख्य विवरण',
    mangalDosha: 'मंगल दोष',
    recharge: 'वॉलेट में पैसे जोड़ें',
    availableBalance: 'उपलब्ध शेष राशि',
    selectPaymentApp: 'भुगतान ऐप चुनें',
    searchPlaceholder: 'नाम, विशेषज्ञता या भाषा खोजें',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    language: 'भाषा',
  },
  mr: {
    home: 'होम',
    kundli: 'कुंडली',
    rashifal: 'राशीभविष्य',
    consult: 'सल्ला',
    wallet: 'वॉलेट',
    profile: 'प्रोफाइल',
    panchang: 'पंचांग',
    tarot: 'टॅरो कार्ड',
    vip: 'स्ट्रो VIP',
    admin: 'अ‍ॅडमिन',
    namaste: 'नमस्कार',
    todayReading: 'आजचे राशीभविष्य',
    askAi: 'AI ज्योतिषाला विचारा',
    askAiSub: 'तुमच्या कुंडलीचे झटपट उत्तर मिळवा',
    astrologersOnline: 'ऑनलाइन ज्योतिषी',
    topRated: 'सर्वोत्तम ज्योतिषी',
    coreDetails: 'मुख्य तपशील',
    mangalDosha: 'मंगल दोष',
    recharge: 'वॉलेटमध्ये पैसे जोडा',
    availableBalance: 'शिल्लक रक्कम',
    selectPaymentApp: 'पेमेंट अ‍ॅप निवडा',
    searchPlaceholder: 'नाव, तज्ञता किंवा भाषा शोधा',
    settings: 'सेटिंग्ज',
    signOut: 'साइन आउट',
    language: 'भाषा',
  },
  gu: {
    home: 'હોમ',
    kundli: 'કુંડળી',
    rashifal: 'રાશિફળ',
    consult: 'સલાહ',
    wallet: 'વોલેટ',
    profile: 'પ્રોફાઇલ',
    panchang: 'પંચાંગ',
    tarot: 'ટેરોટ કાર્ડ',
    vip: 'એસ્ટ્રો VIP',
    admin: 'એડમિન',
    namaste: 'નમસ્તે',
    todayReading: 'આજનું રાશિફળ',
    askAi: 'AI જ્યોતિષીને પૂછો',
    askAiSub: 'તમારી કુંડળીના ત્વરિત જવાબો મેળવો',
    astrologersOnline: 'ઓનલાઈન જ્યોતિષીઓ',
    topRated: 'ટોપ રેટેડ',
    coreDetails: 'મુખ્ય વિગતો',
    mangalDosha: 'મંગળ દોષ',
    recharge: 'વોલેટમાં પૈસા ઉમેરો',
    availableBalance: 'ઉપલબ્ધ બેલેન્સ',
    selectPaymentApp: 'પેમેન્ટ એપ પસંદ કરો',
    searchPlaceholder: 'નામ, નિષ્ણાતતા અથવા ભાષા શોધો',
    settings: 'સેટિંગ્સ',
    signOut: 'સાઇન આઉટ',
    language: 'ભાષા',
  },
};
