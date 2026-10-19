import React, { useState } from 'react';

// Name & fallback color map for major airlines
const airlineMeta = {
  '6E': { bg: 'bg-[#002B7F]', text: 'text-white', short: '6E', name: 'IndiGo' },
  'AI': { bg: 'bg-[#E21836]', text: 'text-white', short: 'AI', name: 'Air India' },
  'UK': { bg: 'bg-[#5C0632]', text: 'text-white', short: 'UK', name: 'Vistara' },
  'QP': { bg: 'bg-[#FF5900]', text: 'text-white', short: 'QP', name: 'Akasa Air' },
  'SG': { bg: 'bg-[#ED1C24]', text: 'text-white', short: 'SG', name: 'SpiceJet' },
  'IX': { bg: 'bg-[#E31B23]', text: 'text-white', short: 'IX', name: 'Air India Express' },
  'EK': { bg: 'bg-[#D71921]', text: 'text-white', short: 'EK', name: 'Emirates' },
  'EY': { bg: 'bg-[#BD9B60]', text: 'text-white', short: 'EY', name: 'Etihad Airways' },
  'QR': { bg: 'bg-[#5C0632]', text: 'text-white', short: 'QR', name: 'Qatar Airways' },
  'SQ': { bg: 'bg-[#00205B]', text: 'text-white', short: 'SQ', name: 'Singapore Airlines' },
  'FZ': { bg: 'bg-[#0070BA]', text: 'text-white', short: 'FZ', name: 'Flydubai' },
  'G8': { bg: 'bg-[#0055B8]', text: 'text-white', short: 'G8', name: 'Go First' },
  'LH': { bg: 'bg-[#05164D]', text: 'text-white', short: 'LH', name: 'Lufthansa' },
  'BA': { bg: 'bg-[#075AAA]', text: 'text-white', short: 'BA', name: 'British Airways' },
  'AF': { bg: 'bg-[#002157]', text: 'text-white', short: 'AF', name: 'Air France' },
  'KL': { bg: 'bg-[#00A1DE]', text: 'text-white', short: 'KL', name: 'KLM' },
  'WY': { bg: 'bg-[#A3238E]', text: 'text-white', short: 'WY', name: 'Oman Air' },
  'SV': { bg: 'bg-[#006C35]', text: 'text-white', short: 'SV', name: 'Saudia' },
  'MH': { bg: 'bg-[#004A97]', text: 'text-white', short: 'MH', name: 'Malaysia Airlines' },
  'TG': { bg: 'bg-[#4B1E78]', text: 'text-white', short: 'TG', name: 'Thai Airways' },
  'GF': { bg: 'bg-[#8F1A1D]', text: 'text-white', short: 'GF', name: 'Gulf Air' },
  'J9': { bg: 'bg-[#005EA6]', text: 'text-white', short: 'J9', name: 'Jazeera Airways' },
  'G9': { bg: 'bg-[#E30613]', text: 'text-white', short: 'G9', name: 'Air Arabia' },
  'AW': { bg: 'bg-[#B31917]', text: 'text-white', short: 'AW', name: 'Africa World Airlines' },
  'U5': { bg: 'bg-[#1B365D]', text: 'text-white', short: 'U5', name: 'United Nigeria Airlines' },
  'P4': { bg: 'bg-[#002244]', text: 'text-white', short: 'P4', name: 'Air Peace' },
  'KP': { bg: 'bg-[#662D91]', text: 'text-white', short: 'KP', name: 'ASKY Airlines' },
  'ET': { bg: 'bg-[#006A4E]', text: 'text-white', short: 'ET', name: 'Ethiopian Airlines' },
  'KQ': { bg: 'bg-[#C8102E]', text: 'text-white', short: 'KQ', name: 'Kenya Airways' },
  'MS': { bg: 'bg-[#0F2D6B]', text: 'text-white', short: 'MS', name: 'EgyptAir' },
  'VS': { bg: 'bg-[#C8102E]', text: 'text-white', short: 'VS', name: 'Virgin Atlantic' },
  'DL': { bg: 'bg-[#002244]', text: 'text-white', short: 'DL', name: 'Delta Air Lines' },
  'AA': { bg: 'bg-[#0078D2]', text: 'text-white', short: 'AA', name: 'American Airlines' },
  'UA': { bg: 'bg-[#002244]', text: 'text-white', short: 'UA', name: 'United Airlines' },
  'B6': { bg: 'bg-[#003366]', text: 'text-white', short: 'B6', name: 'JetBlue Airways' },
  'WN': { bg: 'bg-[#304BA8]', text: 'text-white', short: 'WN', name: 'Southwest Airlines' },
  'AC': { bg: 'bg-[#E31837]', text: 'text-white', short: 'AC', name: 'Air Canada' },
  'NZ': { bg: 'bg-[#1A1A1A]', text: 'text-white', short: 'NZ', name: 'Air New Zealand' },
  'QF': { bg: 'bg-[#E0001B]', text: 'text-white', short: 'QF', name: 'Qantas' },
  'JQ': { bg: 'bg-[#FF6600]', text: 'text-white', short: 'JQ', name: 'Jetstar' },
  'TK': { bg: 'bg-[#C8102E]', text: 'text-white', short: 'TK', name: 'Turkish Airlines' },
  'LX': { bg: 'bg-[#E30613]', text: 'text-white', short: 'LX', name: 'Swiss International Air Lines' },
  'FR': { bg: 'bg-[#073590]', text: 'text-white', short: 'FR', name: 'Ryanair' },
  'U2': { bg: 'bg-[#FF6600]', text: 'text-white', short: 'U2', name: 'easyJet' },
  'IB': { bg: 'bg-[#D71920]', text: 'text-white', short: 'IB', name: 'Iberia' },
  'CX': { bg: 'bg-[#006564]', text: 'text-white', short: 'CX', name: 'Cathay Pacific' },
  'JL': { bg: 'bg-[#CC0000]', text: 'text-white', short: 'JL', name: 'Japan Airlines' },
  'NH': { bg: 'bg-[#00205B]', text: 'text-white', short: 'NH', name: 'ANA' },
  'AK': { bg: 'bg-[#ED1C24]', text: 'text-white', short: 'AK', name: 'AirAsia' }
};

const nameToCode = {
  'indigo': '6E',
  'air india': 'AI',
  'air india express': 'IX',
  'vistara': 'UK',
  'akasa air': 'QP',
  'akasa': 'QP',
  'spicejet': 'SG',
  'emirates': 'EK',
  'etihad': 'EY',
  'etihad airways': 'EY',
  'qatar': 'QR',
  'qatar airways': 'QR',
  'singapore airlines': 'SQ',
  'flydubai': 'FZ',
  'go first': 'G8',
  'lufthansa': 'LH',
  'british airways': 'BA',
  'air france': 'AF',
  'klm': 'KL',
  'oman air': 'WY',
  'saudia': 'SV',
  'malaysia airlines': 'MH',
  'thai airways': 'TG',
  'gulf air': 'GF',
  'jazeera airways': 'J9',
  'air arabia': 'G9',
  'africa world airlines': 'AW',
  'africa world': 'AW',
  'awa': 'AW',
  'united nigeria airlines': 'U5',
  'united nigeria': 'U5',
  'air peace': 'P4',
  'asky': 'KP',
  'asky airlines': 'KP',
  'ethiopian airlines': 'ET',
  'ethiopian': 'ET',
  'kenya airways': 'KQ',
  'egyptair': 'MS',
  'virgin atlantic': 'VS',
  'delta': 'DL',
  'delta air lines': 'DL',
  'american airlines': 'AA',
  'united airlines': 'UA',
  'jetblue': 'B6',
  'jetblue airways': 'B6',
  'air canada': 'AC',
  'air new zealand': 'NZ',
  'air nz': 'NZ',
  'qantas': 'QF',
  'jetstar': 'JQ',
  'turkish airlines': 'TK',
  'swiss': 'LX',
  'ryanair': 'FR',
  'easyjet': 'U2',
  'iberia': 'IB',
  'cathay pacific': 'CX',
  'japan airlines': 'JL',
  'ana': 'NH',
  'airasia': 'AK'
};

export default function AirlineBadge({ code, name, logoUrl, size = 'md', showDetails = true, className = '' }) {
  const [imageError, setImageError] = useState(false);
  const [imgAttempt, setImgAttempt] = useState(0);

  // Automatically resolve airline IATA 2-character code
  const rawCode = (code || '').toUpperCase().trim();
  const rawName = (name || '').toLowerCase().trim();

  let resolvedCode = 'FL';
  if (rawCode && rawCode.length <= 3 && airlineMeta[rawCode]) {
    resolvedCode = rawCode;
  } else if (nameToCode[rawName]) {
    resolvedCode = nameToCode[rawName];
  } else if (rawCode && nameToCode[rawCode.toLowerCase()]) {
    resolvedCode = nameToCode[rawCode.toLowerCase()];
  } else if (rawCode && rawCode.length === 2) {
    resolvedCode = rawCode;
  } else {
    // Try substring matching (e.g. "IndiGo Airline" -> "6E")
    const matchedKey = Object.keys(nameToCode).find(k => rawName.includes(k) || rawCode.toLowerCase().includes(k));
    if (matchedKey) {
      resolvedCode = nameToCode[matchedKey];
    } else {
      resolvedCode = rawCode.slice(0, 2) || 'FL';
    }
  }

  const brand = airlineMeta[resolvedCode] || {
    bg: 'bg-slate-800',
    text: 'text-white',
    short: resolvedCode.slice(0, 2) || 'FL',
    name: name || 'Airlines'
  };

  // Determine logo source:
  // 1. Explicit logoUrl
  // 2. Bundled local logo in /airlines/{CODE}.png
  // 3. High-res CDN fallback
  const getLogoSrc = () => {
    if (logoUrl) return logoUrl;
    if (imgAttempt === 0) {
      return `/airlines/${resolvedCode}.png`;
    }
    if (imgAttempt === 1) {
      return `https://images.kiwi.com/airlines/64x64/${resolvedCode}.png`;
    }
    return null;
  };

  const handleImageError = () => {
    if (imgAttempt === 0) {
      // Try CDN fallback
      setImgAttempt(1);
    } else {
      // Both failed, fallback to stylish monogram badge
      setImageError(true);
    }
  };

  const containerSizes = {
    sm: 'w-7 h-7 min-w-[28px] p-0.5',
    md: 'w-11 h-11 min-w-[44px] p-1.5',
    lg: 'w-14 h-14 min-w-[56px] p-2'
  };

  const fontSizes = {
    sm: 'text-[11px]',
    md: 'text-sm',
    lg: 'text-base'
  };

  const currentSrc = getLogoSrc();

  const logoGraphic = (
    <div
      className={`${containerSizes[size] || containerSizes.md} rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200/80 overflow-hidden flex-shrink-0 transition-all hover:scale-105`}
      title={`${name || brand.name} (${resolvedCode})`}
    >
      {!imageError && currentSrc ? (
        <img
          src={currentSrc}
          alt={name || brand.name}
          onError={handleImageError}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full rounded-lg ${brand.bg} ${brand.text} ${fontSizes[size] || fontSizes.md} font-black flex items-center justify-center tracking-wider`}
        >
          {brand.short}
        </div>
      )}
    </div>
  );

  if (!showDetails) {
    return <div className={`inline-block ${className}`}>{logoGraphic}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoGraphic}
      <div className="min-w-0">
        <h4 className="font-bold text-slate-900 leading-snug truncate text-sm sm:text-base">
          {name || brand.name}
        </h4>
        <span className="text-[11px] font-semibold text-slate-500 font-mono tracking-wide uppercase">
          {resolvedCode}
        </span>
      </div>
    </div>
  );
}
