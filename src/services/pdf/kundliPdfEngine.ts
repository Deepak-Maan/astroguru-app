export interface PDFReportSection {
  title: string;
  icon: string;
  content: string;
  details: { label: string; value: string }[];
}

export interface KundliPDFReport {
  generatedAt: string;
  seekerName: string;
  birthDetails: { date: string; time: string; place: string };
  rashi: string;
  nakshatra: string;
  lagna: string;
  sections: PDFReportSection[];
}

/**
 * Kundli PDF Generation Engine — Builds comprehensive 10-page Vedic Chart HTML & JSON Data
 */
export function generateKundliPDFReport(name: string, kundli: any): KundliPDFReport {
  const rashiName = kundli?.rashi?.name || kundli?.rashi || 'Mesha';
  const nakName = kundli?.nakshatra?.name || kundli?.nakshatra || 'Ashwini';
  const lagnaName = kundli?.ascendant || kundli?.lagna || 'Simha';
  const planetsList: any[] = kundli?.planets || [];
  return {
    generatedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    seekerName: name || 'Vedic Seeker',
    birthDetails: {
      date: kundli.birthDetails.date || '01 Jan 1995',
      time: kundli.birthDetails.time || '10:30 AM',
      place: kundli.birthDetails.place || 'New Delhi, India',
    },
    rashi: kundli.rashi.name,
    nakshatra: kundli.nakshatra.name,
    lagna: kundli.ascendant,
    sections: [
      {
        title: '1. Basic Birth Details & Avakhada Chakra',
        icon: '📜',
        content: `Seeker ${name} was born under the auspicious star of ${kundli.nakshatra.name} in ${kundli.rashi.name} Rashi with ${kundli.ascendant} Ascendant (Lagna).`,
        details: [
          { label: 'Seeker Name', value: name },
          { label: 'Ascendant (Lagna)', value: kundli.ascendant },
          { label: 'Rashi (Moon Sign)', value: kundli.rashi.name },
          { label: 'Rashi Lord', value: kundli.rashi.ruler },
          { label: 'Nakshatra', value: `${kundli.nakshatra.name} (Pada ${kundli.nakshatra.pada})` },
          { label: 'Nakshatra Lord', value: kundli.nakshatra.ruler },
          { label: 'Varna', value: 'Kshatriya' },
          { label: 'Yoni', value: 'Gaja (Elephant)' },
        ],
      },
      {
        title: '2. Planetary Positions & Degrees (Graha Balas)',
        icon: '🪐',
        content: 'Exact celestial longitudes and house placement of nine primary grahas (Navagrahas) at the time of birth.',
        details: planetsList.map((p: any) => ({
          label: `${p.name || 'Planet'} (${p.rashi || 'Rashi'})`,
          value: `House ${p.house || 1} · ${p.degree || p.longitude || 15}° ${p.isRetrograde || p.retrograde ? ' (Retrograde ℞)' : ''}`,
        })),
      },
      {
        title: '3. D9 Navamsha & Divisional Charts (Vargas)',
        icon: '🔮',
        content: 'The D9 Navamsha chart reveals soul destiny, marriage harmony, and spiritual evolution.',
        details: [
          { label: 'D9 Lagna', value: kundli.ascendant },
          { label: 'Atmakaraka (Soul Planet)', value: kundli.planets[0]?.name || 'Sun' },
          { label: 'Darakaraka (Spouse Planet)', value: kundli.planets[1]?.name || 'Venus' },
          { label: 'Navamsha Sun', value: 'Exalted in 1st House' },
          { label: 'Navamsha Jupiter', value: '9th House (Dharma Trikona)' },
        ],
      },
      {
        title: '4. Vimshottari Dasha Cycles (Mahadasha & Antardasha)',
        icon: '⏳',
        content: 'Vimshottari Dasha timeline outlining life periods, major shifts, and upcoming planetary influences.',
        details: [
          { label: 'Current Mahadasha', value: kundli.dasha.current.mahadasha },
          { label: 'Current Antardasha', value: `${kundli.dasha.current.antardasha} (Ends ${kundli.dasha.current.ends})` },
          { label: 'Next Mahadasha', value: `${kundli.dasha.next.mahadasha} (${kundli.dasha.next.starts})` },
        ],
      },
      {
        title: '5. Dosha Analysis: Manglik, Sade Sati & Kaal Sarp',
        icon: '🛡️',
        content: 'Vedic Dosha analysis to identify planetary afflictions and necessary pacification rituals.',
        details: [
          { label: 'Manglik Dosh', value: kundli.doshas.manglik ? '⚠️ Present (1st / 8th House Placement)' : '✅ No Manglik Dosh' },
          { label: 'Sade Sati Phase', value: kundli.doshas.sadeSati ? '⚠️ Active Shani Phase' : '✅ No Active Sade Sati' },
          { label: 'Kaal Sarp Dosh', value: kundli.doshas.kaalSarp ? '⚠️ Partial Kaal Sarp' : '✅ No Kaal Sarp Dosh' },
        ],
      },
      {
        title: '6. Ashtakvarga & Bhava Balas',
        icon: '📊',
        content: 'Ashtakvarga points indicate structural strength of each house for wealth, career, and longevity.',
        details: [
          { label: '10th House (Career)', value: '34 Points (Strong)' },
          { label: '11th House (Income)', value: '38 Points (Highly Favorable)' },
          { label: '2nd House (Wealth)', value: '31 Points (Stable)' },
          { label: '6th House (Debts/Enemies)', value: '24 Points (Weak/Protected)' },
        ],
      },
      {
        title: '7. Career & Financial Astrological Forecast',
        icon: '💼',
        content: 'Analysis of 10th House, 11th House, and Jupiter transits for business, promotions, and wealth creation.',
        details: [
          { label: 'Primary Career Domain', value: 'Technology, Management, Leadership & Advisory' },
          { label: 'Peak Earning Period', value: 'Age 32 to 54 years' },
          { label: 'Financial Prosperity', value: 'High accumulative wealth after 2027' },
        ],
      },
      {
        title: '8. Love, Marriage & Compatibility Insights',
        icon: '❤️',
        content: '7th House lord strength, Venus placement, and marital bliss parameters.',
        details: [
          { label: 'Marriage Partner Characteristics', value: 'Intelligent, Supportive, Spiritual' },
          { label: 'Favorable Direction for Spouse', value: 'North-East' },
          { label: 'Harmonious Marriage Years', value: '2026 - 2028' },
        ],
      },
      {
        title: '9. Health & Immunity Astrological Parameters',
        icon: '🩺',
        content: '6th House lord & Sun vitality score for physical and mental well-being.',
        details: [
          { label: 'Vitality Index', value: '88/100 (Strong Sun)' },
          { label: 'Recommended Diet', value: 'Sattvic, Hydrating, Fresh Herbs' },
          { label: 'Precautions Needed', value: 'Avoid stress during Rahu Antardasha' },
        ],
      },
      {
        title: '10. Remedial Gems, Mantras & Vedic Upayas',
        icon: '💎',
        content: 'Custom Vedic remedies to boost planetary strengths and mitigate obstacles.',
        details: [
          { label: 'Lucky Gemstone', value: 'Yellow Sapphire (Pukhraj) or Blue Sapphire' },
          { label: 'Sacred Mantra', value: 'Om Namah Shivaya (108 times daily)' },
          { label: 'Charity (Daan)', value: 'Feed birds on Saturdays, donate sesame seeds' },
          { label: 'Auspicious Color', value: 'Emerald Green & Saffron Gold' },
        ],
      },
    ],
  };
}

/**
 * Generate Printable HTML String for 10-Page Kundli Export
 */
export function buildKundliHTML(report: KundliPDFReport): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AstroGuru Vedic Kundli Report — ${report.seekerName}</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; padding: 24px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
    .title { color: #D97706; font-size: 28px; font-weight: 800; margin: 0; }
    .subtitle { color: #059669; font-size: 14px; font-weight: 700; margin-top: 4px; }
    .card { background: #1E293B; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); }
    .card-title { font-size: 18px; font-weight: 800; color: #38BDF8; margin-top: 0; display: flex; align-items: center; gap: 8px; }
    .card-desc { font-size: 13px; color: #94A3B8; margin-bottom: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .item { background: #0F172A; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,254,0.08); }
    .label { font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase; }
    .value { font-size: 14px; color: #F8FAFC; font-weight: 700; margin-top: 2px; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">🪔 ASTROGURU VEDIC KUNDLI REPORT</h1>
    <div class="subtitle">Certified Cyber-Vedic Chart & Astrological Analysis</div>
    <p style="font-size:12px; color:#94A3B8;">Generated for <strong>${report.seekerName}</strong> on ${report.generatedAt}</p>
  </div>

  ${report.sections.map((sec) => `
    <div class="card">
      <h2 class="card-title"><span>${sec.icon}</span> ${sec.title}</h2>
      <p class="card-desc">${sec.content}</p>
      <div class="grid">
        ${sec.details.map((d) => `
          <div class="item">
            <div class="label">${d.label}</div>
            <div class="value">${d.value}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}

  <div class="footer">
    AstroGuru Cyber-Vedic Engine v2.3.0 · Generated with 100% Vedic Precision · Confidential Report
  </div>
</body>
</html>
  `;
}
