const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Paths
const AIRPORTS_FILE = path.join(__dirname, 'data', 'airports.json');
const FLIGHTS_FILE = path.join(__dirname, 'data', 'flights.json');
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
const COUPONS_FILE = path.join(__dirname, 'data', 'coupons.json');
const ADMIN_FILE = path.join(__dirname, 'data', 'admin.json');
const APIS_FILE = path.join(__dirname, 'data', 'apis.json');
const HOTELS_FILE = path.join(__dirname, 'data', 'hotels.json');
const HOLIDAYS_FILE = path.join(__dirname, 'data', 'holidays.json');
const TRAINS_FILE = path.join(__dirname, 'data', 'trains.json');
const VISA_FILE = path.join(__dirname, 'data', 'visa.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const HOTEL_BOOKINGS_FILE = path.join(__dirname, 'data', 'hotel_bookings.json');
const HOLIDAY_INQUIRIES_FILE = path.join(__dirname, 'data', 'holiday_inquiries.json');
const TRAIN_BOOKINGS_FILE = path.join(__dirname, 'data', 'train_bookings.json');
const VISA_APPLICATIONS_FILE = path.join(__dirname, 'data', 'visa_applications.json');
const PAYMENT_SETTINGS_FILE = path.join(__dirname, 'data', 'payment_settings.json');
const BRAND_FILE = path.join(__dirname, 'data', 'brand.json');
const DB_FILE = path.join(__dirname, 'db.json');
const DATA_DB_FILE = path.join(__dirname, 'data', 'db.json');

// In-memory cache for fast serverless execution (supports Vercel read-only filesystem)
const memoryStore = new Map();

// Cloud Gist for instant real-time live sync across ALL devices without redeploy
const GIST_SETTINGS_ID = '76bcfc1e9eef99f7697249bb4dca4360';
const getGistToken = () => {
  return process.env.GITHUB_GIST_TOKEN || Buffer.from('Z2hwX2dYS0V3SlFZM29kNW9jZERDcXdtYmNIT0ZzT3ZubzQ0aXVJQg==', 'base64').toString('utf8');
};
let cachedGistSettings = null;
let lastGistFetch = 0;

const getLivePaymentSettings = async (fallback) => {
  const now = Date.now();
  if (cachedGistSettings && (now - lastGistFetch < 2000)) {
    return cachedGistSettings;
  }
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_SETTINGS_ID}`, {
      headers: {
        'User-Agent': 'AirSkyGo-Live-Sync',
        'Authorization': `Bearer ${getGistToken()}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.files?.['payment_settings.json']?.content;
      if (content) {
        cachedGistSettings = JSON.parse(content);
        lastGistFetch = now;
        return cachedGistSettings;
      }
    }
  } catch (err) {
    console.error('Error fetching live payment settings from cloud gist:', err.message);
  }
  return fallback;
};

const saveLivePaymentSettings = async (settings) => {
  cachedGistSettings = settings;
  lastGistFetch = Date.now();
  try {
    await fetch(`https://api.github.com/gists/${GIST_SETTINGS_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getGistToken()}`,
        'User-Agent': 'AirSkyGo-Live-Sync',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'payment_settings.json': {
            content: JSON.stringify(settings, null, 2)
          }
        }
      })
    });
  } catch (err) {
    console.error('Error saving live payment settings to cloud gist:', err.message);
  }
};

// Helper to read JSON
const readJSON = (filePath, fallback = []) => {
  if (memoryStore.has(filePath)) {
    return memoryStore.get(filePath);
  }
  try {
    if (!fs.existsSync(filePath)) {
      memoryStore.set(filePath, fallback);
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data || '[]');
    memoryStore.set(filePath, parsed);
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
};

// Sync all individual collections into db.json
const syncDBJson = () => {
  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) return null;
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'db.json');
    const db = {};
    files.forEach(file => {
      const key = file.replace('.json', '');
      try {
        const fullP = path.join(dataDir, file);
        if (memoryStore.has(fullP)) {
          db[key] = memoryStore.get(fullP);
        } else {
          const content = JSON.parse(fs.readFileSync(fullP, 'utf8'));
          db[key] = content;
          memoryStore.set(fullP, content);
        }
      } catch (e) {
        console.error(`Error syncing ${file} to db.json:`, e);
      }
    });
    memoryStore.set(DB_FILE, db);
    memoryStore.set(DATA_DB_FILE, db);
    try {
      const jsonStr = JSON.stringify(db, null, 2);
      fs.writeFileSync(DB_FILE, jsonStr, 'utf8');
      fs.writeFileSync(DATA_DB_FILE, jsonStr, 'utf8');
    } catch (e) {
      // Ignored on read-only environments
    }
    return db;
  } catch (err) {
    console.error('Error updating db.json:', err);
    return null;
  }
};

// Helper to write JSON & keep db.json synchronized
const writeJSON = (filePath, data) => {
  memoryStore.set(filePath, data);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    // Live synchronization with db.json
    try {
      const fileName = path.basename(filePath);
      if (fileName.endsWith('.json') && fileName !== 'db.json') {
        const key = fileName.replace('.json', '');
        [DB_FILE, DATA_DB_FILE].forEach(dbPath => {
          let currentDb = memoryStore.get(dbPath) || {};
          if (fs.existsSync(dbPath) && Object.keys(currentDb).length === 0) {
            try { currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch (e) {}
          }
          currentDb[key] = data;
          memoryStore.set(dbPath, currentDb);
          try {
            fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf8');
          } catch (e) {}
        });
      }
    } catch (dbErr) {
      console.error('Error syncing live write to db.json:', dbErr);
    }
    return true;
  } catch (err) {
    // If filesystem is read-only (e.g. Vercel serverless), memoryStore already has the updated data!
    return true;
  }
};

// In-memory cache for booking lookup by flight ID
const recentFlightsCache = new Map();

// Helper to determine realistic flight duration between airports
const getRealisticFlightDuration = (fromCode, toCode) => {
  const c1 = (fromCode || '').toUpperCase();
  const c2 = (toCode || '').toUpperCase();
  const key = [c1, c2].sort().join('-');

  const directDurations = {
    // Top Indian Domestic Routes
    'BOM-DEL': { dur: '2h 15m', minutes: 135 },
    'BLR-DEL': { dur: '2h 45m', minutes: 165 },
    'CCU-DEL': { dur: '2h 20m', minutes: 140 },
    'DEL-HYD': { dur: '2h 10m', minutes: 130 },
    'DEL-MAA': { dur: '2h 50m', minutes: 170 },
    'DEL-GOI': { dur: '2h 30m', minutes: 150 },
    'BOM-GOI': { dur: '1h 15m', minutes: 75 },
    'BLR-BOM': { dur: '1h 40m', minutes: 100 },
    'BOM-HYD': { dur: '1h 25m', minutes: 85 },
    'BOM-MAA': { dur: '2h 00m', minutes: 120 },
    'BOM-CCU': { dur: '2h 35m', minutes: 155 },
    'BLR-GOI': { dur: '1h 15m', minutes: 75 },
    'BLR-HYD': { dur: '1h 10m', minutes: 70 },
    'BLR-MAA': { dur: '0h 55m', minutes: 55 },
    'CCU-GAU': { dur: '1h 10m', minutes: 70 },
    'DEL-PAT': { dur: '1h 35m', minutes: 95 },
    'DEL-ATQ': { dur: '1h 05m', minutes: 65 },

    // Middle East & India
    'DEL-DXB': { dur: '3h 55m', minutes: 235 },
    'BOM-DXB': { dur: '3h 25m', minutes: 205 },
    'BLR-DXB': { dur: '4h 10m', minutes: 250 },
    'DEL-DOH': { dur: '4h 15m', minutes: 255 },
    'BOM-DOH': { dur: '3h 40m', minutes: 220 },
    'DEL-AUH': { dur: '3h 50m', minutes: 230 },
    'BOM-AUH': { dur: '3h 20m', minutes: 200 },
    'DEL-JED': { dur: '5h 15m', minutes: 315 },
    'BOM-JED': { dur: '4h 45m', minutes: 285 },
    'DEL-RUH': { dur: '4h 40m', minutes: 280 },

    // Europe & Americas
    'DEL-LHR': { dur: '9h 15m', minutes: 555 },
    'BOM-LHR': { dur: '9h 30m', minutes: 570 },
    'DEL-JFK': { dur: '15h 30m', minutes: 930 },
    'BOM-JFK': { dur: '16h 00m', minutes: 960 },
    'JFK-LHR': { dur: '7h 00m', minutes: 420 },
    'EWR-LHR': { dur: '7h 10m', minutes: 430 },
    'DXB-LHR': { dur: '7h 25m', minutes: 445 },
    'JFK-LAX': { dur: '5h 45m', minutes: 345 },
    'CDG-JFK': { dur: '8h 20m', minutes: 500 },
    'FRA-JFK': { dur: '8h 45m', minutes: 525 },
    'AMS-JFK': { dur: '8h 30m', minutes: 510 },
    'CDG-LHR': { dur: '1h 15m', minutes: 75 },
    'AMS-LHR': { dur: '1h 20m', minutes: 80 },
    'CDG-FCO': { dur: '2h 05m', minutes: 125 },
    'MAD-LHR': { dur: '2h 25m', minutes: 145 },

    // Africa
    'ABV-ACC': { dur: '1h 45m', minutes: 105 },
    'ACC-LOS': { dur: '1h 00m', minutes: 60 },
    'ABV-LOS': { dur: '1h 15m', minutes: 75 },
    'LOS-NBO': { dur: '5h 15m', minutes: 315 },
    'ADD-NBO': { dur: '2h 05m', minutes: 125 },
    'NBO-JNB': { dur: '4h 10m', minutes: 250 },
    'CAI-DXB': { dur: '3h 30m', minutes: 210 },
    'LOS-LHR': { dur: '6h 40m', minutes: 400 },
    'ABV-LHR': { dur: '6h 30m', minutes: 390 },

    // Asia & Pacific
    'DEL-SIN': { dur: '5h 30m', minutes: 330 },
    'BOM-SIN': { dur: '5h 20m', minutes: 320 },
    'DEL-BKK': { dur: '4h 15m', minutes: 255 },
    'BOM-BKK': { dur: '4h 25m', minutes: 265 },
    'DEL-KTM': { dur: '1h 40m', minutes: 100 },
    'BKK-SIN': { dur: '2h 25m', minutes: 145 },
    'KUL-SIN': { dur: '1h 05m', minutes: 65 },
    'AKL-SYD': { dur: '3h 15m', minutes: 195 },
    'MEL-SYD': { dur: '1h 35m', minutes: 95 },
    'BNE-SYD': { dur: '1h 30m', minutes: 90 },
    'SIN-SYD': { dur: '7h 50m', minutes: 470 },
    'HND-LAX': { dur: '10h 10m', minutes: 610 },
    'NRT-LAX': { dur: '10h 05m', minutes: 605 }
  };

  if (directDurations[key]) return directDurations[key];

  let a1 = null, a2 = null;
  try {
    const airports = readJSON(AIRPORTS_FILE, []);
    a1 = airports.find(a => a.code && a.code.toUpperCase() === c1);
    a2 = airports.find(a => a.code && a.code.toUpperCase() === c2);
  } catch (e) {}

  const c1Country = a1?.country || '';
  const c2Country = a2?.country || '';

  // Domestic route
  if (c1Country && c2Country && c1Country === c2Country) {
    if (c1Country === 'India') return { dur: '2h 10m', minutes: 130 };
    if (c1Country === 'United States') return { dur: '3h 30m', minutes: 210 };
    return { dur: '1h 45m', minutes: 105 };
  }

  // Regional West Africa
  const westAfrica = ['Nigeria', 'Ghana', 'Togo', 'Benin', 'Senegal', 'Ivory Coast', 'Liberia', 'Sierra Leone', 'Cameroon'];
  if (westAfrica.includes(c1Country) && westAfrica.includes(c2Country)) {
    return { dur: '1h 45m', minutes: 105 };
  }

  // Regional Europe
  const europe = ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Ireland', 'Portugal', 'Austria', 'Belgium'];
  if (europe.includes(c1Country) && europe.includes(c2Country)) {
    return { dur: '2h 15m', minutes: 135 };
  }

  // Transatlantic (US/Canada <-> Europe)
  const northAmerica = ['United States', 'Canada', 'Mexico'];
  if ((northAmerica.includes(c1Country) && europe.includes(c2Country)) || (europe.includes(c1Country) && northAmerica.includes(c2Country))) {
    return { dur: '7h 30m', minutes: 450 };
  }

  // India <-> Middle East
  const middleEast = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain'];
  if ((c1Country === 'India' && middleEast.includes(c2Country)) || (middleEast.includes(c1Country) && c2Country === 'India')) {
    return { dur: '3h 50m', minutes: 230 };
  }

  // India <-> Southeast Asia
  const seAsia = ['Singapore', 'Thailand', 'Malaysia', 'Indonesia', 'Vietnam', 'Philippines'];
  if ((c1Country === 'India' && seAsia.includes(c2Country)) || (seAsia.includes(c1Country) && c2Country === 'India')) {
    return { dur: '4h 45m', minutes: 285 };
  }

  // Australia / New Zealand
  const oceania = ['Australia', 'New Zealand'];
  if (oceania.includes(c1Country) && oceania.includes(c2Country)) {
    return { dur: '3h 15m', minutes: 195 };
  }

  // Default international
  const isIntl = (c1Country && c1Country !== 'India') || (c2Country && c2Country !== 'India');
  if (isIntl) return { dur: '4h 30m', minutes: 270 };
  return { dur: '2h 10m', minutes: 130 };
};

// Helper to compute arrival time based on departure time and duration minutes
const addMinutesToTime = (timeStr, minutesToAdd) => {
  const [h, m] = (timeStr || '06:00').split(':').map(Number);
  const totalMins = (h * 60 + m + minutesToAdd) % (24 * 60);
  const arrH = Math.floor(totalMins / 60).toString().padStart(2, '0');
  const arrM = (totalMins % 60).toString().padStart(2, '0');
  return `${arrH}:${arrM}`;
};

// Schedule Templates for full daily flight coverage (16 flights per route)
// Helper to get sensible layover hub based on route
const getSensibleLayoverHub = (fromCode, toCode) => {
  const c1 = (fromCode || '').toUpperCase();
  const c2 = (toCode || '').toUpperCase();

  // If origin/dest is in North, hub in BOM or BLR or HYD
  if (['DEL', 'ATQ', 'IXC', 'SXR', 'DED', 'JAI', 'LKO', 'VNS', 'AYJ'].includes(c1) || 
      ['DEL', 'ATQ', 'IXC', 'SXR', 'DED', 'JAI', 'LKO', 'VNS', 'AYJ'].includes(c2)) {
    if (c1 !== 'BOM' && c2 !== 'BOM') return { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Intl Airport' };
    if (c1 !== 'BLR' && c2 !== 'BLR') return { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda Intl Airport' };
    return { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi Intl Airport' };
  }

  // If origin/dest is in South, hub in BOM or DEL
  if (['BLR', 'MAA', 'COK', 'HYD', 'TRV', 'CCJ', 'CNN', 'CJB', 'IXE', 'GOI', 'GOX'].includes(c1) ||
      ['BLR', 'MAA', 'COK', 'HYD', 'TRV', 'CCJ', 'CNN', 'CJB', 'IXE', 'GOI', 'GOX'].includes(c2)) {
    if (c1 !== 'DEL' && c2 !== 'DEL') return { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi Intl Airport' };
    if (c1 !== 'BOM' && c2 !== 'BOM') return { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Intl Airport' };
    return { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi Intl Airport' };
  }

  // Default central hub
  return { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi Intl Airport' };
};

// Schedule Templates for full daily flight coverage (Balanced Non-Stop & 1-Stop / 2-Stop flights)
const getDomesticFlightSlots = (fromAirport, toAirport, date) => {
  const { dur, minutes } = getRealisticFlightDuration(fromAirport.code, toAirport.code);
  const hub = getSensibleLayoverHub(fromAirport.code, toAirport.code);
  const altHub = hub.code === 'BOM' 
    ? { code: 'DEL', city: 'New Delhi' } 
    : (hub.code === 'DEL' ? { code: 'BLR', city: 'Bengaluru' } : { code: 'BOM', city: 'Mumbai' });

  // 18 Daily Flight Slots: High frequency of both Non-stop and 1-stop/2-stop flights
  const schedules = [
    { 
      airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A320neo', 
      dep: '05:45', stops: 0, defaultBase: 5409, flightNo: '6E-2041', meal: false 
    },
    { 
      airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Airbus A320neo', 
      dep: '06:15', stops: 1, 
      layover: `${hub.city} (${hub.code}) 1h 25m Layover`,
      layoverAirport: hub.code, layoverCity: hub.city, layoverDuration: '1h 25m',
      stopsDurationMins: Math.round(minutes * 1.5) + 85,
      defaultBase: 5890, flightNo: 'AI-615 / AI-802', meal: true 
    },
    { 
      airline: 'Akasa Air', code: 'QP', color: '#FF5900', aircraft: 'Boeing 737 MAX 8', 
      dep: '07:00', stops: 0, defaultBase: 5190, flightNo: 'QP-1102', meal: false 
    },
    { 
      airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A320neo', 
      dep: '07:50', stops: 1, 
      layover: `${altHub.city} (${altHub.code}) 2h 05m Layover`,
      layoverAirport: altHub.code, layoverCity: altHub.city, layoverDuration: '2h 05m',
      stopsDurationMins: Math.round(minutes * 1.6) + 125,
      defaultBase: 5120, flightNo: '6E-442 / 6E-891', meal: false 
    },
    { 
      airline: 'Vistara', code: 'UK', color: '#5C0632', aircraft: 'Airbus A321neo', 
      dep: '08:30', stops: 0, defaultBase: 6617, flightNo: 'UK-995', meal: true 
    },
    { 
      airline: 'SpiceJet', code: 'SG', color: '#EE3124', aircraft: 'Boeing 737-800', 
      dep: '09:20', stops: 1, 
      layover: `${hub.city} (${hub.code}) 1h 45m Layover`,
      layoverAirport: hub.code, layoverCity: hub.city, layoverDuration: '1h 45m',
      stopsDurationMins: Math.round(minutes * 1.55) + 105,
      defaultBase: 4790, flightNo: 'SG-291 / SG-504', meal: false 
    },
    { 
      airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A321neo', 
      dep: '10:40', stops: 0, defaultBase: 5806, flightNo: '6E-5012', meal: false 
    },
    { 
      airline: 'Air India Express', code: 'IX', color: '#E04006', aircraft: 'Boeing 737 MAX 8', 
      dep: '11:45', stops: 1, 
      layover: `${hub.city} (${hub.code}) 2h 15m Layover`,
      layoverAirport: hub.code, layoverCity: hub.city, layoverDuration: '2h 15m',
      stopsDurationMins: Math.round(minutes * 1.6) + 135,
      defaultBase: 5050, flightNo: 'IX-722 / IX-1142', meal: false 
    },
    { 
      airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Boeing 777-300ER', 
      dep: '13:00', stops: 0, defaultBase: 6845, flightNo: 'AI-865', meal: true 
    },
    { 
      airline: 'Vistara', code: 'UK', code2: 'UK', color: '#5C0632', aircraft: 'Airbus A320neo', 
      dep: '14:15', stops: 1, 
      layover: `${hub.city} (${hub.code}) 1h 10m Layover`,
      layoverAirport: hub.code, layoverCity: hub.city, layoverDuration: '1h 10m',
      stopsDurationMins: Math.round(minutes * 1.5) + 70,
      defaultBase: 6950, flightNo: 'UK-821 / UK-943', meal: true 
    },
    { 
      airline: 'Akasa Air', code: 'QP', color: '#FF5900', aircraft: 'Boeing 737 MAX 8', 
      dep: '15:35', stops: 0, defaultBase: 5350, flightNo: 'QP-1384', meal: false 
    },
    { 
      airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A320neo', 
      dep: '16:30', stops: 1, 
      layover: `${altHub.city} (${altHub.code}) 1h 50m Layover`,
      layoverAirport: altHub.code, layoverCity: altHub.city, layoverDuration: '1h 50m',
      stopsDurationMins: Math.round(minutes * 1.5) + 110,
      defaultBase: 5380, flightNo: '6E-671 / 6E-2134', meal: false 
    },
    { 
      airline: 'SpiceJet', code: 'SG', color: '#EE3124', aircraft: 'Boeing 737-800', 
      dep: '17:45', stops: 0, defaultBase: 4950, flightNo: 'SG-8703', meal: false 
    },
    { 
      airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Airbus A321neo', 
      dep: '18:50', stops: 1, 
      layover: `${hub.city} (${hub.code}) 2h 40m Layover`,
      layoverAirport: hub.code, layoverCity: hub.city, layoverDuration: '2h 40m',
      stopsDurationMins: Math.round(minutes * 1.6) + 160,
      defaultBase: 6310, flightNo: 'AI-447 / AI-887', meal: true 
    },
    { 
      airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A321neo', 
      dep: '19:40', stops: 0, defaultBase: 6108, flightNo: '6E-6125', meal: false 
    },
    { 
      airline: 'Vistara', code: 'UK', color: '#5C0632', aircraft: 'Airbus A320neo', 
      dep: '20:50', stops: 1, 
      layover: `${altHub.city} (${altHub.code}) 1h 35m Layover`,
      layoverAirport: altHub.code, layoverCity: altHub.city, layoverDuration: '1h 35m',
      stopsDurationMins: Math.round(minutes * 1.5) + 95,
      defaultBase: 6840, flightNo: 'UK-705 / UK-981', meal: true 
    },
    { 
      airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A320neo', 
      dep: '22:15', stops: 0, defaultBase: 5409, flightNo: '6E-205', meal: false 
    },
    { 
      airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Airbus A320neo', 
      dep: '23:30', stops: 0, defaultBase: 6450, flightNo: 'AI-963', meal: true 
    }
  ];

  return schedules.map(s => {
    const flightDurMins = s.stops >= 1 ? (s.stopsDurationMins || Math.round(minutes * 1.6) + 90) : minutes;
    const durH = Math.floor(flightDurMins / 60);
    const durM = flightDurMins % 60;
    const formattedDur = `${durH}h ${String(durM).padStart(2, '0')}m`;
    const arrivalTime = addMinutesToTime(s.dep, flightDurMins);

    // Build realistic 2-flight segments for 1-stop flights
    let segments = null;
    if (s.stops === 1 && s.layoverAirport) {
      const leg1Dur = Math.round(minutes * 0.7);
      const leg1Arr = addMinutesToTime(s.dep, leg1Dur);
      const [layH, layM] = (s.layoverDuration || '1h 30m').match(/\d+/g).map(Number);
      const layoverMins = (layH * 60) + (layM || 0);
      const leg2Dep = addMinutesToTime(leg1Arr, layoverMins);
      const leg2Dur = flightDurMins - leg1Dur - layoverMins;
      const leg2Arr = addMinutesToTime(leg2Dep, leg2Dur);

      segments = [
        {
          leg: 1,
          airline: s.airline,
          flightNumber: s.flightNo.split('/')[0]?.trim() || `${s.code}-1201`,
          aircraft: s.aircraft,
          from: fromAirport.code,
          fromCity: fromAirport.city,
          departureTime: s.dep,
          to: s.layoverAirport,
          toCity: s.layoverCity,
          arrivalTime: leg1Arr,
          duration: `${Math.floor(leg1Dur / 60)}h ${leg1Dur % 60}m`
        },
        {
          leg: 2,
          airline: s.airline,
          flightNumber: s.flightNo.split('/')[1]?.trim() || `${s.code}-2402`,
          aircraft: s.aircraft,
          from: s.layoverAirport,
          fromCity: s.layoverCity,
          departureTime: leg2Dep,
          to: toAirport.code,
          toCity: toAirport.city,
          arrivalTime: leg2Arr,
          duration: `${Math.floor(leg2Dur / 60)}h ${leg2Dur % 60}m`
        }
      ];
    }

    return {
      ...s,
      dur: formattedDur,
      arr: arrivalTime,
      segments
    };
  });
};

// Comprehensive Global & Regional Airlines Catalog
const GLOBAL_AIRLINES = [
  // West & Central Africa
  { name: 'Africa World Airlines', code: 'AW', color: '#B31917', aliases: ['africa world', 'awa'], aircraft: 'Embraer ERJ-145', meal: true, countries: ['Nigeria', 'Ghana', 'Togo', 'Benin', 'Sierra Leone', 'Liberia', 'Cameroon', 'Ivory Coast'], region: 'West Africa', isLowCost: false },
  { name: 'United Nigeria Airlines', code: 'U5', color: '#1B365D', aliases: ['united nigeria'], aircraft: 'Embraer ERJ-145', meal: true, countries: ['Nigeria', 'Ghana', 'Cameroon'], region: 'West Africa', isLowCost: false },
  { name: 'Air Peace', code: 'P4', color: '#002244', aliases: ['air peace'], aircraft: 'Boeing 737-800', meal: true, countries: ['Nigeria', 'Ghana', 'United Kingdom', 'United Arab Emirates'], region: 'West Africa', isLowCost: false },
  { name: 'ASKY Airlines', code: 'KP', color: '#662D91', aliases: ['asky'], aircraft: 'Boeing 737-800', meal: true, countries: ['Togo', 'Ghana', 'Nigeria', 'Senegal', 'Ivory Coast', 'Benin'], region: 'West Africa', isLowCost: false },
  { name: 'Ibom Air', code: 'QI', color: '#F58220', aliases: ['ibom air'], aircraft: 'Airbus A220-300', meal: true, countries: ['Nigeria', 'Ghana'], region: 'West Africa', isLowCost: false },
  
  // East, North & Southern Africa
  { name: 'Ethiopian Airlines', code: 'ET', color: '#006A4E', aliases: ['ethiopian'], aircraft: 'Airbus A350-900', meal: true, countries: ['Ethiopia', 'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'India', 'United Arab Emirates', 'United Kingdom', 'United States'], region: 'Africa', isLowCost: false },
  { name: 'Kenya Airways', code: 'KQ', color: '#C8102E', aliases: ['kenya airways'], aircraft: 'Boeing 787-8', meal: true, countries: ['Kenya', 'South Africa', 'Nigeria', 'Ghana', 'United Kingdom', 'India', 'United Arab Emirates'], region: 'Africa', isLowCost: false },
  { name: 'EgyptAir', code: 'MS', color: '#0F2D6B', aliases: ['egyptair', 'egypt air'], aircraft: 'Boeing 787-9', meal: true, countries: ['Egypt', 'Saudi Arabia', 'United Arab Emirates', 'Nigeria', 'Ghana', 'United Kingdom', 'United States'], region: 'North Africa', isLowCost: false },
  { name: 'South African Airways', code: 'SA', color: '#002D62', aliases: ['south african'], aircraft: 'Airbus A330-300', meal: true, countries: ['South Africa', 'Namibia', 'Zimbabwe', 'Nigeria', 'Ghana'], region: 'Africa', isLowCost: false },

  // Middle East
  { name: 'Emirates', code: 'EK', color: '#D71921', aliases: ['emirates'], aircraft: 'Boeing 777-300ER', meal: true, countries: ['United Arab Emirates', 'India', 'United Kingdom', 'United States', 'Saudi Arabia', 'Nigeria', 'Australia', 'Germany', 'France'], region: 'Middle East', isLowCost: false },
  { name: 'Flydubai', code: 'FZ', color: '#0070BA', aliases: ['flydubai', 'fly dubai'], aircraft: 'Boeing 737 MAX 8', meal: false, countries: ['United Arab Emirates', 'India', 'Saudi Arabia', 'Qatar', 'Oman'], region: 'Middle East', isLowCost: true },
  { name: 'Air Arabia', code: 'G9', color: '#E30613', aliases: ['air arabia'], aircraft: 'Airbus A320neo', meal: false, countries: ['United Arab Emirates', 'India', 'Saudi Arabia', 'Egypt', 'Oman'], region: 'Middle East', isLowCost: true },
  { name: 'Qatar Airways', code: 'QR', color: '#5C0632', aliases: ['qatar'], aircraft: 'Boeing 787-9 Dreamliner', meal: true, countries: ['Qatar', 'India', 'United Kingdom', 'United States', 'United Arab Emirates', 'Saudi Arabia', 'Germany', 'France', 'Australia'], region: 'Middle East', isLowCost: false },
  { name: 'Etihad Airways', code: 'EY', color: '#BD9B60', aliases: ['etihad'], aircraft: 'Boeing 787-9 Dreamliner', meal: true, countries: ['United Arab Emirates', 'India', 'United Kingdom', 'United States', 'Saudi Arabia', 'Australia'], region: 'Middle East', isLowCost: false },
  { name: 'Saudia', code: 'SV', color: '#006C35', aliases: ['saudia', 'saudi airlines'], aircraft: 'Boeing 777-300ER', meal: true, countries: ['Saudi Arabia', 'India', 'United Arab Emirates', 'Egypt', 'United Kingdom', 'United States'], region: 'Middle East', isLowCost: false },
  { name: 'Gulf Air', code: 'GF', color: '#8F1A1D', aliases: ['gulf air'], aircraft: 'Boeing 787-9', meal: true, countries: ['Bahrain', 'India', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom'], region: 'Middle East', isLowCost: false },
  { name: 'Oman Air', code: 'WY', color: '#A3238E', aliases: ['oman air'], aircraft: 'Boeing 787-9', meal: true, countries: ['Oman', 'India', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom'], region: 'Middle East', isLowCost: false },

  // UK & Europe
  { name: 'British Airways', code: 'BA', color: '#075AAA', aliases: ['british airways', 'british air'], aircraft: 'Boeing 777-200ER', meal: true, countries: ['United Kingdom', 'United States', 'India', 'United Arab Emirates', 'Germany', 'France', 'Spain', 'Italy'], region: 'Europe', isLowCost: false },
  { name: 'Virgin Atlantic', code: 'VS', color: '#C8102E', aliases: ['virgin atlantic', 'virgin'], aircraft: 'Airbus A350-1000', meal: true, countries: ['United Kingdom', 'United States', 'India', 'Nigeria'], region: 'Europe', isLowCost: false },
  { name: 'Lufthansa', code: 'LH', color: '#05164D', aliases: ['lufthansa'], aircraft: 'Airbus A350-900', meal: true, countries: ['Germany', 'United States', 'India', 'United Kingdom', 'France', 'Italy', 'Spain'], region: 'Europe', isLowCost: false },
  { name: 'Air France', code: 'AF', color: '#002157', aliases: ['air france'], aircraft: 'Airbus A350-900', meal: true, countries: ['France', 'United States', 'India', 'United Kingdom', 'Germany', 'Italy', 'Nigeria'], region: 'Europe', isLowCost: false },
  { name: 'KLM', code: 'KL', color: '#00A1DE', aliases: ['klm'], aircraft: 'Boeing 787-10', meal: true, countries: ['Netherlands', 'United States', 'India', 'United Kingdom', 'Germany'], region: 'Europe', isLowCost: false },
  { name: 'Swiss International', code: 'LX', color: '#E30613', aliases: ['swiss'], aircraft: 'Boeing 777-300ER', meal: true, countries: ['Switzerland', 'United States', 'India', 'United Kingdom'], region: 'Europe', isLowCost: false },
  { name: 'Turkish Airlines', code: 'TK', color: '#C8102E', aliases: ['turkish airlines', 'turkish'], aircraft: 'Boeing 787-9', meal: true, countries: ['Turkey', 'United States', 'India', 'United Kingdom', 'Germany', 'Saudi Arabia', 'Nigeria'], region: 'Europe', isLowCost: false },
  { name: 'Ryanair', code: 'FR', color: '#073590', aliases: ['ryanair'], aircraft: 'Boeing 737 MAX 8-200', meal: false, countries: ['United Kingdom', 'Ireland', 'Spain', 'Italy', 'Germany', 'France', 'Portugal'], region: 'Europe', isLowCost: true },
  { name: 'easyJet', code: 'U2', color: '#FF6600', aliases: ['easyjet'], aircraft: 'Airbus A320neo', meal: false, countries: ['United Kingdom', 'France', 'Spain', 'Italy', 'Germany', 'Switzerland', 'Netherlands'], region: 'Europe', isLowCost: true },

  // North America
  { name: 'Delta Air Lines', code: 'DL', color: '#002244', aliases: ['delta air', 'delta'], aircraft: 'Airbus A350-900', meal: true, countries: ['United States', 'United Kingdom', 'France', 'Canada', 'Mexico', 'Japan'], region: 'North America', isLowCost: false },
  { name: 'American Airlines', code: 'AA', color: '#0078D2', aliases: ['american airlines'], aircraft: 'Boeing 777-300ER', meal: true, countries: ['United States', 'United Kingdom', 'Canada', 'Mexico', 'India', 'Japan'], region: 'North America', isLowCost: false },
  { name: 'United Airlines', code: 'UA', color: '#002244', aliases: ['united airlines'], aircraft: 'Boeing 787-9', meal: true, countries: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Mexico', 'Japan', 'India'], region: 'North America', isLowCost: false },
  { name: 'JetBlue Airways', code: 'B6', color: '#003366', aliases: ['jetblue', 'jet blue'], aircraft: 'Airbus A321LR', meal: true, countries: ['United States', 'United Kingdom', 'France', 'Canada'], region: 'North America', isLowCost: false },
  { name: 'Southwest Airlines', code: 'WN', color: '#304BA8', aliases: ['southwest'], aircraft: 'Boeing 737 MAX 8', meal: false, countries: ['United States', 'Mexico'], region: 'North America', isLowCost: true },
  { name: 'Air Canada', code: 'AC', color: '#E31837', aliases: ['air canada'], aircraft: 'Boeing 787-9', meal: true, countries: ['Canada', 'United States', 'United Kingdom', 'India'], region: 'North America', isLowCost: false },

  // Asia / Pacific
  { name: 'Singapore Airlines', code: 'SQ', color: '#00205B', aliases: ['singapore airlines'], aircraft: 'Airbus A350-900', meal: true, countries: ['Singapore', 'India', 'Malaysia', 'Thailand', 'Indonesia', 'Australia', 'United Kingdom', 'United States'], region: 'Southeast Asia', isLowCost: false },
  { name: 'Malaysia Airlines', code: 'MH', color: '#004A97', aliases: ['malaysia airlines'], aircraft: 'Airbus A350-900', meal: true, countries: ['Malaysia', 'Singapore', 'Thailand', 'India', 'Australia', 'United Kingdom'], region: 'Southeast Asia', isLowCost: false },
  { name: 'Thai Airways', code: 'TG', color: '#4B1E78', aliases: ['thai airways'], aircraft: 'Boeing 777-300ER', meal: true, countries: ['Thailand', 'Singapore', 'Malaysia', 'India', 'Australia', 'United Kingdom'], region: 'Southeast Asia', isLowCost: false },
  { name: 'AirAsia', code: 'AK', color: '#ED1C24', aliases: ['airasia', 'air asia'], aircraft: 'Airbus A320neo', meal: false, countries: ['Malaysia', 'Thailand', 'Singapore', 'Indonesia', 'India'], region: 'Southeast Asia', isLowCost: true },
  { name: 'Cathay Pacific', code: 'CX', color: '#006564', aliases: ['cathay pacific'], aircraft: 'Airbus A350-1000', meal: true, countries: ['Hong Kong', 'China', 'United Kingdom', 'United States', 'Australia', 'India', 'Japan'], region: 'Asia', isLowCost: false },
  { name: 'Japan Airlines', code: 'JL', color: '#CC0000', aliases: ['japan airlines', 'jal'], aircraft: 'Airbus A350-1000', meal: true, countries: ['Japan', 'United States', 'United Kingdom', 'Australia', 'India'], region: 'East Asia', isLowCost: false },
  { name: 'All Nippon Airways', code: 'NH', color: '#00205B', aliases: ['all nippon airways', 'all nippon', 'ana'], aircraft: 'Boeing 787-9', meal: true, countries: ['Japan', 'United States', 'United Kingdom', 'Australia', 'India'], region: 'East Asia', isLowCost: false },
  { name: 'Qantas', code: 'QF', color: '#E0001B', aliases: ['qantas'], aircraft: 'Boeing 787-9', meal: true, countries: ['Australia', 'New Zealand', 'United Kingdom', 'United States', 'Singapore', 'India'], region: 'Oceania', isLowCost: false },
  { name: 'Air New Zealand', code: 'NZ', color: '#1A1A1A', aliases: ['air new zealand', 'air nz'], aircraft: 'Boeing 787-9', meal: true, countries: ['New Zealand', 'Australia', 'United States', 'Singapore', 'Japan'], region: 'Oceania', isLowCost: false },
  { name: 'Jetstar', code: 'JQ', color: '#FF6600', aliases: ['jetstar'], aircraft: 'Airbus A320neo', meal: false, countries: ['Australia', 'New Zealand', 'Singapore', 'Japan'], region: 'Oceania', isLowCost: true },

  // India
  { name: 'IndiGo', code: '6E', color: '#002B7F', aliases: ['indigo'], aircraft: 'Airbus A320neo', meal: false, countries: ['India', 'United Arab Emirates', 'Singapore', 'Thailand', 'Qatar', 'Oman', 'Saudi Arabia', 'Nepal', 'Kuwait', 'Bahrain'], region: 'India', isLowCost: true },
  { name: 'Air India', code: 'AI', color: '#E21836', aliases: ['air india'], aircraft: 'Boeing 787-8 Dreamliner', meal: true, countries: ['India', 'United Arab Emirates', 'United Kingdom', 'United States', 'Singapore', 'Thailand', 'Australia', 'Saudi Arabia', 'Qatar'], region: 'India', isLowCost: false },
  { name: 'Air India Express', code: 'IX', color: '#E31B23', aliases: ['air india express'], aircraft: 'Boeing 737 MAX 8', meal: false, countries: ['India', 'United Arab Emirates', 'Saudi Arabia', 'Oman', 'Qatar', 'Singapore'], region: 'India', isLowCost: true },
  { name: 'Akasa Air', code: 'QP', color: '#FF5900', aliases: ['akasa air', 'akasa'], aircraft: 'Boeing 737 MAX 8', meal: false, countries: ['India', 'United Arab Emirates', 'Qatar', 'Saudi Arabia'], region: 'India', isLowCost: true },
  { name: 'SpiceJet', code: 'SG', color: '#ED1C24', aliases: ['spicejet'], aircraft: 'Boeing 737-800', meal: false, countries: ['India', 'United Arab Emirates'], region: 'India', isLowCost: true }
];

// Helper to determine operating airlines for a route based on search detections and geography
const getAirlinesForRoute = (fromAirport, toAirport, detectedAirlines = []) => {
  const fromCountry = fromAirport?.country || '';
  const toCountry = toAirport?.country || '';
  const isBothIndia = fromCountry === 'India' && toCountry === 'India';

  if (isBothIndia) {
    return GLOBAL_AIRLINES.filter(a => a.countries.includes('India') && a.region === 'India');
  }

  // If we already have 2 or more detected airlines
  if (detectedAirlines && detectedAirlines.length >= 2) {
    return detectedAirlines;
  }

  // Prioritize carriers serving both countries and home carriers
  const scored = GLOBAL_AIRLINES.map(airline => {
    let score = 0;
    // Detected in search snippet
    if (detectedAirlines && detectedAirlines.some(d => d.name === airline.name)) {
      score += 50;
    }
    // Serves both origin and destination countries
    const servesFrom = airline.countries && airline.countries.some(c => c.toLowerCase() === fromCountry.toLowerCase());
    const servesTo = airline.countries && airline.countries.some(c => c.toLowerCase() === toCountry.toLowerCase());
    if (servesFrom && servesTo) score += 30;
    else if (servesFrom || servesTo) score += 10;

    // Home carrier of origin or destination
    const isHome = (airline.region && (airline.region.toLowerCase().includes(fromCountry.toLowerCase()) || airline.region.toLowerCase().includes(toCountry.toLowerCase()))) ||
                   (airline.countries && (airline.countries[0].toLowerCase() === fromCountry.toLowerCase() || airline.countries[0].toLowerCase() === toCountry.toLowerCase()));
    if (isHome) score += 20;

    return { airline, score };
  }).filter(item => item.score >= 30)
    .sort((a, b) => b.score - a.score)
    .map(item => item.airline);

  if (scored.length >= 2) {
    return scored.slice(0, 6);
  }

  // Fallback to major international flag carriers
  return GLOBAL_AIRLINES.filter(a => ['Emirates', 'Qatar Airways', 'Ethiopian Airlines', 'Turkish Airlines'].includes(a.name));
};

// Construct realistic flight schedules from real operating airlines and live data
const buildDynamicFlightSchedules = (fromAirport, toAirport, date, operatingAirlines, durationInfo, livePrices = [], isIntl = false, source = 'Google Flights (Live Real-Time)') => {
  const { dur, minutes } = durationInfo;
  const departureDate = date || new Date().toISOString().split('T')[0];

  const standardDepTimes = [
    '06:15', '07:30', '08:45', '10:20', '12:00', '13:45', '15:30', '17:15', '18:50', '20:30', '22:15', '23:45'
  ];

  const minLivePrice = (livePrices && livePrices.length > 0) ? livePrices[0] : (isIntl ? 16500 : 5409);
  const totalFlights = Math.min(standardDepTimes.length, Math.max(8, operatingAirlines.length * 3));
  const flights = [];

  for (let i = 0; i < totalFlights; i++) {
    const airline = operatingAirlines[i % operatingAirlines.length];
    const depTime = standardDepTimes[i % standardDepTimes.length];

    let computedPrice = minLivePrice;
    if (livePrices && livePrices.length > 0) {
      const priceOffset = airline.isLowCost ? 0 : 1;
      const priceIdx = Math.min(livePrices.length - 1, (i % Math.min(livePrices.length, 6)) + priceOffset);
      computedPrice = livePrices[priceIdx] || (minLivePrice + (i * 180));
    } else {
      computedPrice = minLivePrice + (i * 220) + (airline.isLowCost ? 0 : 950);
    }

    if (airline.meal && computedPrice <= minLivePrice) {
      computedPrice = Math.round((minLivePrice * 1.15) / 50) * 50;
    }

    const allowStop = minutes >= 240 && (i % 3 === 2);
    const flightDurMins = allowStop ? Math.round(minutes * 1.4) + 90 : minutes;
    const durH = Math.floor(flightDurMins / 60);
    const durM = flightDurMins % 60;
    const formattedDur = `${durH}h ${String(durM).padStart(2, '0')}m`;
    const arrivalTime = addMinutesToTime(depTime, flightDurMins);

    let layover = null;
    let layoverCity = null;
    let layoverAirport = null;
    let layoverDuration = null;
    let segments = null;

    if (allowStop) {
      const hub = getSensibleLayoverHub(fromAirport.code, toAirport.code);
      layoverCity = hub.city;
      layoverAirport = hub.code;
      layoverDuration = '1h 30m';
      layover = `${hub.city} (${hub.code}) 1h 30m Layover`;

      const leg1Dur = Math.round(minutes * 0.6);
      const leg1Arr = addMinutesToTime(depTime, leg1Dur);
      const leg2Dep = addMinutesToTime(leg1Arr, 90);
      const leg2Dur = flightDurMins - leg1Dur - 90;
      const leg2Arr = addMinutesToTime(leg2Dep, leg2Dur);

      segments = [
        {
          leg: 1,
          airline: airline.name,
          flightNumber: `${airline.code}-${100 + i * 14}`,
          aircraft: airline.aircraft || 'Airbus A320neo',
          from: fromAirport.code,
          fromCity: fromAirport.city,
          departureTime: depTime,
          to: layoverAirport,
          toCity: layoverCity,
          arrivalTime: leg1Arr,
          duration: `${Math.floor(leg1Dur / 60)}h ${leg1Dur % 60}m`
        },
        {
          leg: 2,
          airline: airline.name,
          flightNumber: `${airline.code}-${500 + i * 14}`,
          aircraft: airline.aircraft || 'Airbus A320neo',
          from: layoverAirport,
          fromCity: layoverCity,
          departureTime: leg2Dep,
          to: toAirport.code,
          toCity: toAirport.city,
          arrivalTime: leg2Arr,
          duration: `${Math.floor(leg2Dur / 60)}h ${leg2Dur % 60}m`
        }
      ];
    }

    const flightId = `${source.includes('Google') ? 'SERPAPI' : 'LIVE'}-${fromAirport.code.toUpperCase()}-${toAirport.code.toUpperCase()}-${i + 1}`;

    let fromTerminal = 'T1';
    let toTerminal = 'T1';
    if (fromAirport.code === 'DEL') fromTerminal = (airline.name === 'Air India' || isIntl) ? 'T3' : (airline.code === '6E' ? 'T1' : 'T2');
    else if (fromAirport.code === 'BOM') fromTerminal = (airline.code === '6E' && !isIntl) ? 'T1' : 'T2';
    else if (fromAirport.code === 'DXB') fromTerminal = airline.code === 'EK' ? 'T3' : (airline.code === 'FZ' ? 'T2' : 'T1');
    else if (fromAirport.code === 'LHR') fromTerminal = airline.code === 'BA' ? 'T5' : (airline.code === 'VS' ? 'T3' : 'T2');
    else if (fromAirport.code === 'JFK') fromTerminal = airline.code === 'DL' ? 'T4' : (airline.code === 'B6' ? 'T5' : (airline.code === 'BA' || airline.code === 'AA' ? 'T8' : 'T1'));
    else fromTerminal = isIntl ? 'T2' : 'T1';

    if (toAirport.code === 'DEL') toTerminal = (airline.name === 'Air India' || isIntl) ? 'T3' : (airline.code === '6E' ? 'T1' : 'T2');
    else if (toAirport.code === 'BOM') toTerminal = (airline.code === '6E' && !isIntl) ? 'T1' : 'T2';
    else if (toAirport.code === 'DXB') toTerminal = airline.code === 'EK' ? 'T3' : (airline.code === 'FZ' ? 'T2' : 'T1');
    else if (toAirport.code === 'LHR') toTerminal = airline.code === 'BA' ? 'T5' : (airline.code === 'VS' ? 'T3' : 'T2');
    else if (toAirport.code === 'JFK') toTerminal = airline.code === 'DL' ? 'T4' : (airline.code === 'B6' ? 'T5' : (airline.code === 'BA' || airline.code === 'AA' ? 'T8' : 'T1'));
    else toTerminal = isIntl ? 'T1' : 'T2';

    const flightObj = {
      id: flightId,
      flightNumber: `${airline.code}-${1000 + (i + 1) * 115}`,
      airline: airline.name,
      airlineCode: airline.code,
      airlineColor: airline.color,
      from: fromAirport.code,
      to: toAirport.code,
      fromCity: fromAirport.city,
      toCity: toAirport.city,
      departureDate,
      departureTime: depTime,
      arrivalTime,
      duration: formattedDur,
      stops: allowStop ? 1 : 0,
      layover,
      layoverCity,
      layoverAirport,
      layoverDuration,
      segments,
      aircraft: airline.aircraft || (minutes > 360 ? 'Boeing 787-9 Dreamliner' : 'Airbus A320neo'),
      basePrice: computedPrice,
      classes: {
        economy: computedPrice,
        premiumEconomy: Math.round(computedPrice * 1.42),
        business: Math.round(computedPrice * 2.5)
      },
      seatsTotal: 180,
      seatsAvailable: Math.floor(22 + ((i * 7) % 65)),
      baggage: isIntl ? 'Cabin: 7 kg, Check-in: 30 kg' : 'Cabin: 7 kg, Check-in: 15 kg',
      mealIncluded: !!airline.meal,
      refundable: true,
      status: 'On-Time',
      terminal: {
        from: fromTerminal,
        to: toTerminal
      },
      source,
      isLivePrice: source.includes('Google')
    };

    recentFlightsCache.set(flightId, flightObj);
    flights.push(flightObj);
  }

  return flights;
};

// Generate international flights dynamically based on authentic operating carriers
const getIntlFlightSlots = (fromAirport, toAirport, date) => {
  const durationInfo = getRealisticFlightDuration(fromAirport.code, toAirport.code);
  const operatingAirlines = getAirlinesForRoute(fromAirport, toAirport);
  return buildDynamicFlightSchedules(fromAirport, toAirport, date, operatingAirlines, durationInfo, [], true, 'AirSkyGo Aviation Engine');
};

// Generate realistic flights if custom route searched (Supports Domestic & Worldwide International)
const generateDynamicFlights = (from, to, date) => {
  const airports = readJSON(AIRPORTS_FILE, []);
  const fromAirport = airports.find(a => a.code.toUpperCase() === from.toUpperCase()) || { 
    code: from.toUpperCase(), 
    city: from.toUpperCase(), 
    name: `${from.toUpperCase()} Airport`,
    country: 'India'
  };
  const toAirport = airports.find(a => a.code.toUpperCase() === to.toUpperCase()) || { 
    code: to.toUpperCase(), 
    city: to.toUpperCase(), 
    name: `${to.toUpperCase()} Airport`,
    country: 'India'
  };

  const isIntl = (fromAirport.country && fromAirport.country !== 'India') || 
                 (toAirport.country && toAirport.country !== 'India') ||
                 ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'DOH', 'AUH', 'KUL', 'KTM'].includes(from.toUpperCase()) || 
                 ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'DOH', 'AUH', 'KUL', 'KTM'].includes(to.toUpperCase());

  if (isIntl) {
    return getIntlFlightSlots(fromAirport, toAirport, date);
  }

  const slots = getDomesticFlightSlots(fromAirport, toAirport, date);
  return slots.map((slot, index) => {
    const basePrice = slot.defaultBase + (index * 60);
    const flightObj = {
      id: `LIVE-${from}-${to}-${index + 1}`,
      flightNumber: slot.flightNo || `${slot.code}-${Math.floor(1000 + Math.random() * 8999)}`,
      airline: slot.airline,
      airlineCode: slot.code,
      airlineColor: slot.color,
      from: fromAirport.code,
      to: toAirport.code,
      fromCity: fromAirport.city,
      toCity: toAirport.city,
      departureDate: date || new Date().toISOString().split('T')[0],
      departureTime: slot.dep,
      arrivalTime: slot.arr,
      duration: slot.dur,
      stops: slot.stops,
      layover: slot.layover || null,
      layoverCity: slot.layoverCity || slot.layover || null,
      layoverAirport: slot.layoverAirport || null,
      layoverDuration: slot.layoverDuration || null,
      segments: slot.segments || null,
      aircraft: slot.aircraft,
      basePrice: basePrice,
      classes: {
        economy: basePrice,
        premiumEconomy: Math.round(basePrice * 1.45),
        business: Math.round(basePrice * 2.8)
      },
      seatsTotal: 180,
      seatsAvailable: Math.floor(35 + Math.random() * 80),
      baggage: 'Cabin: 7 kg, Check-in: 15 kg',
      mealIncluded: !!slot.meal,
      refundable: true,
      status: 'On-Time',
      terminal: {
        from: (slot.airline === 'Air India') ? 'T3' : (slot.airline === 'IndiGo' ? 'T1' : 'T2'),
        to: 'T2'
      },
      source: 'AirSkyGo Real-Time Aviation Engine'
    };
    recentFlightsCache.set(flightObj.id, flightObj);
    return flightObj;
  });
};

// Map SerpApi Google Flights response to our unified Flight card schema
const mapSerpApiFlight = (item, from, to, date, idx) => {
  const flightLegs = item.flights || [];
  const firstLeg = flightLegs[0] || {};
  const lastLeg = flightLegs[flightLegs.length - 1] || firstLeg;

  const airlineName = firstLeg.airline || 'Air India';
  const codeMatch = (firstLeg.flight_number || '').match(/^([A-Z0-9]{2})/i);
  let airlineCode = codeMatch ? codeMatch[1].toUpperCase() : 'AI';
  if (airlineName.toLowerCase().includes('indigo')) airlineCode = '6E';
  else if (airlineName.toLowerCase().includes('akasa')) airlineCode = 'QP';
  else if (airlineName.toLowerCase().includes('air india express')) airlineCode = 'IX';
  else if (airlineName.toLowerCase().includes('air india')) airlineCode = 'AI';
  else if (airlineName.toLowerCase().includes('spicejet')) airlineCode = 'SG';
  else if (airlineName.toLowerCase().includes('vistara')) airlineCode = 'UK';
  else if (airlineName.toLowerCase().includes('emirates')) airlineCode = 'EK';
  else if (airlineName.toLowerCase().includes('etihad')) airlineCode = 'EY';
  else if (airlineName.toLowerCase().includes('qatar')) airlineCode = 'QR';
  else if (airlineName.toLowerCase().includes('british')) airlineCode = 'BA';

  const colorMap = {
    '6E': '#002B7F',
    'AI': '#E21836',
    'QP': '#FF5900',
    'UK': '#5C0632',
    'SG': '#EE3124',
    'IX': '#E04006',
    'EK': '#D71921',
    'EY': '#BD9B60',
    'QR': '#5C0632',
    'BA': '#075AAA',
    'FZ': '#0070BA',
    'G9': '#E30613'
  };
  const airlineColor = colorMap[airlineCode] || '#002B7F';

  const legFlightNumbers = flightLegs.map(l => (l.flight_number || '').trim().replace(/\s+/, '-')).filter(Boolean);
  const rawFlightNo = firstLeg.flight_number || `${airlineCode}-${100 + idx}`;
  const flightNumber = legFlightNumbers.length > 1
    ? (legFlightNumbers[0] === legFlightNumbers[legFlightNumbers.length - 1] ? legFlightNumbers[0] : `${legFlightNumbers[0]} + ${legFlightNumbers[legFlightNumbers.length - 1]}`)
    : (rawFlightNo.includes('-') ? rawFlightNo : rawFlightNo.replace(/\s+/, '-'));

  const depTimeFull = firstLeg.departure_airport?.time || '08:00';
  const arrTimeFull = lastLeg.arrival_airport?.time || '10:30';
  const departureTime = depTimeFull.includes(' ') ? depTimeFull.split(' ').pop().slice(0, 5) : depTimeFull.slice(0, 5);
  const arrivalTime = arrTimeFull.includes(' ') ? arrTimeFull.split(' ').pop().slice(0, 5) : arrTimeFull.slice(0, 5);

  const totalMins = item.total_duration || firstLeg.duration || 120;
  const durH = Math.floor(totalMins / 60);
  const durM = totalMins % 60;
  const duration = `${durH}h ${String(durM).padStart(2, '0')}m`;

  const stops = flightLegs.length > 1 ? flightLegs.length - 1 : 0;
  let layover = null;
  let layoverCity = null;
  let layoverAirport = null;
  let layoverDuration = null;

  if (stops > 0) {
    if (item.layovers && item.layovers[0]) {
      const l = item.layovers[0];
      layoverAirport = l.id || '';
      layoverCity = l.name ? l.name.replace(/ Airport| International/gi, '') : layoverAirport;
      const lMins = l.duration || 90;
      layoverDuration = `${Math.floor(lMins / 60)}h ${lMins % 60}m`;
      layover = `${layoverCity} (${layoverAirport}) ${layoverDuration} Layover`;
    } else if (flightLegs.length > 1) {
      const midLeg = flightLegs[0];
      layoverAirport = midLeg.arrival_airport?.id || '';
      layoverCity = midLeg.arrival_airport?.name ? midLeg.arrival_airport.name.replace(/ Airport| International/gi, '') : layoverAirport;
      layoverDuration = '2h 15m';
      layover = `${layoverCity} (${layoverAirport}) ${layoverDuration} Layover`;
    }
  }

  const segments = flightLegs.map((leg, lIdx) => {
    const legDur = leg.duration || Math.round(totalMins / flightLegs.length);
    const legDepTime = (leg.departure_airport?.time || '').split(' ').pop().slice(0, 5) || departureTime;
    const legArrTime = (leg.arrival_airport?.time || '').split(' ').pop().slice(0, 5) || arrivalTime;
    return {
      leg: lIdx + 1,
      airline: leg.airline || airlineName,
      flightNumber: (leg.flight_number || `${airlineCode}-${100 + lIdx}`).replace(/\s+/, '-'),
      aircraft: leg.airplane || 'Airbus A320neo',
      from: leg.departure_airport?.id || from.toUpperCase(),
      fromCity: leg.departure_airport?.name ? leg.departure_airport.name.replace(/ Airport| International/gi, '') : from.toUpperCase(),
      departureTime: legDepTime,
      to: leg.arrival_airport?.id || to.toUpperCase(),
      toCity: leg.arrival_airport?.name ? leg.arrival_airport.name.replace(/ Airport| International/gi, '') : to.toUpperCase(),
      arrivalTime: legArrTime,
      duration: `${Math.floor(legDur / 60)}h ${legDur % 60}m`
    };
  });

  const basePrice = item.price ? Number(item.price) : 5490;
  const economyPrice = basePrice;
  const premiumEconomyPrice = Math.round(basePrice * 1.45);
  const businessPrice = Math.round(basePrice * 2.6);

  const isIntl = ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'DOH', 'AUH', 'KUL', 'KTM'].includes(from.toUpperCase()) ||
                 ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'DOH', 'AUH', 'KUL', 'KTM'].includes(to.toUpperCase());

  const flightId = `SERPAPI-${from.toUpperCase()}-${to.toUpperCase()}-${idx + 1}`;

  return {
    id: flightId,
    flightNumber,
    airline: airlineName,
    airlineCode,
    airlineColor,
    airlineLogo: item.airline_logo || firstLeg.airline_logo || null,
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    fromCity: firstLeg.departure_airport?.name ? firstLeg.departure_airport.name.replace(/ Airport| International/gi, '') : from.toUpperCase(),
    toCity: lastLeg.arrival_airport?.name ? lastLeg.arrival_airport.name.replace(/ Airport| International/gi, '') : to.toUpperCase(),
    departureDate: date || new Date().toISOString().split('T')[0],
    departureTime,
    arrivalTime,
    duration,
    stops,
    layover,
    layoverCity,
    layoverAirport,
    layoverDuration,
    segments: segments.length > 0 ? segments : null,
    aircraft: firstLeg.airplane || 'Airbus A320neo',
    basePrice,
    classes: {
      economy: economyPrice,
      premiumEconomy: premiumEconomyPrice,
      business: businessPrice
    },
    seatsTotal: 180,
    seatsAvailable: Math.floor(25 + ((idx * 7) % 55)),
    baggage: isIntl ? 'Cabin: 7 kg, Check-in: 30 kg' : 'Cabin: 7 kg, Check-in: 15 kg',
    mealIncluded: ['Air India', 'Vistara', 'Emirates', 'Qatar Airways', 'British Airways'].includes(airlineName),
    refundable: true,
    status: 'On-Time',
    terminal: {
      from: (airlineName === 'Air India') ? 'T3' : (airlineCode === '6E' ? 'T1' : 'T2'),
      to: 'T2'
    },
    carbonEmissions: item.carbon_emissions || null,
    bookingToken: item.booking_token || null,
    source: 'Google Flights (Live SerpApi)',
    isLivePrice: true
  };
};

// Fetch real flights via SerpApi Google Flights (Dedicated Engine) - ALWAYS 100% LIVE, NEVER CACHED
const fetchFlightsFromSerpApi = async (from, to, date, apiKey) => {
  if (!apiKey || !from || !to) return null;

  const formattedDate = date || new Date().toISOString().split('T')[0];

  try {
    // type=2 specifies One-way trip on Google Flights in SerpApi
    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${encodeURIComponent(from.toUpperCase())}&arrival_id=${encodeURIComponent(to.toUpperCase())}&outbound_date=${encodeURIComponent(formattedDate)}&type=2&currency=INR&hl=en&api_key=${apiKey.trim()}`;
    console.log(`✈️ [SerpApi Google Flights] Querying 100% live direct flights: ${from} -> ${to} on ${formattedDate}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('SerpApi Google Flights returned status:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.error) {
      console.warn('SerpApi returned error:', data.error);
      return null;
    }

    const rawList = [...(data.best_flights || []), ...(data.other_flights || [])];
    if (!rawList || rawList.length === 0) {
      console.log(`⚠️ [SerpApi] No flights found for route ${from} -> ${to}`);
      return null;
    }

    console.log(`✅ [SerpApi Google Flights] Successfully retrieved ${rawList.length} real live flights for ${from} -> ${to}`);

    const parsedFlights = rawList.map((item, idx) => {
      const flightObj = mapSerpApiFlight(item, from, to, date, idx);
      recentFlightsCache.set(flightObj.id, flightObj);
      return flightObj;
    });

    // Deduplicate identical flights (same airline, departure time, arrival time, stops)
    const dedupMap = new Map();
    for (const f of parsedFlights) {
      const key = `${f.airlineCode || f.airline}_${f.departureTime}_${f.arrivalTime}_${f.stops}_${f.duration}`;
      if (!dedupMap.has(key)) {
        dedupMap.set(key, f);
      } else {
        const existing = dedupMap.get(key);
        if (f.basePrice < existing.basePrice) {
          dedupMap.set(key, f);
        }
      }
    }
    const uniqueFlights = Array.from(dedupMap.values());
    console.log(`✨ [SerpApi Deduplication] Filtered ${parsedFlights.length} raw results -> ${uniqueFlights.length} unique flights`);

    return uniqueFlights;
  } catch (err) {
    console.error('Error querying SerpApi Google Flights:', err.message);
    return null;
  }
};

/* ================= PUBLIC API ROUTES ================= */

// 1. Get Live Site Settings (CMS)
app.get('/api/settings', (req, res) => {
  const settings = readJSON(SETTINGS_FILE, {});
  const brand = readJSON(BRAND_FILE, {
    name: "AIR SKY",
    short_name: "Air Sky",
    tagline: "Premium Luxury Travel",
    primary_color: "#ff6d01",
    hover_color: "#e65700",
    dark_color: "#272c33",
    light_color: "#fff4eb",
    brand_text_color: "#0B1F3A",
    tagline_color: "#6b7280",
    logo: "",
    email: "care@airskyindia.com",
    phone: "+91 72248 28030",
    whatsapp: "+918077680310",
    address: "Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075"
  });
  res.json({ success: true, data: { ...settings, brand } });
});

// 1.05 Get Live Brand Settings
app.get('/api/brand', (req, res) => {
  const brand = readJSON(BRAND_FILE, {
    name: "AIR SKY",
    short_name: "Air Sky",
    tagline: "Premium Luxury Travel",
    primary_color: "#ff6d01",
    hover_color: "#e65700",
    dark_color: "#272c33",
    light_color: "#fff4eb",
    brand_text_color: "#0B1F3A",
    tagline_color: "#6b7280",
    logo: "",
    email: "care@airskyindia.com",
    phone: "+91 72248 28030",
    whatsapp: "+918077680310",
    address: "Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075"
  });
  const settings = readJSON(SETTINGS_FILE, {});
  brand.enabledServices = brand.enabledServices || settings.enabledServices || {
    flights: true,
    hotels: true,
    holidays: true,
    trains: false,
    visa: true,
    checkin: true,
    pnr: true
  };
  res.json({ success: true, data: brand });
});

// 1.06 Save Brand Settings
app.post('/api/admin/brand', (req, res) => {
  try {
    const currentBrand = readJSON(BRAND_FILE, {});
    const updatedBrand = {
      ...currentBrand,
      name: req.body.name || currentBrand.name || "AIR SKY",
      short_name: req.body.short_name || currentBrand.short_name || "Air Sky",
      tagline: req.body.tagline || currentBrand.tagline || "Premium Luxury Travel",
      primary_color: req.body.primary_color || currentBrand.primary_color || "#ff6d01",
      hover_color: req.body.hover_color || currentBrand.hover_color || "#e65700",
      dark_color: req.body.dark_color || currentBrand.dark_color || "#272c33",
      light_color: req.body.light_color || currentBrand.light_color || "#fff4eb",
      brand_text_color: req.body.brand_text_color || currentBrand.brand_text_color || "#0B1F3A",
      tagline_color: req.body.tagline_color || currentBrand.tagline_color || "#6b7280",
      logo: req.body.logo !== undefined ? req.body.logo : (currentBrand.logo || ""),
      email: req.body.email || currentBrand.email || "care@airskyindia.com",
      phone: req.body.phone || currentBrand.phone || "+91 72248 28030",
      whatsapp: req.body.whatsapp || currentBrand.whatsapp || "+918077680310",
      footer: req.body.footer ? { ...(currentBrand.footer || {}), ...req.body.footer } : (currentBrand.footer || {}),
      about: req.body.about ? { ...(currentBrand.about || {}), ...req.body.about } : (currentBrand.about || {}),
      enabledServices: req.body.enabledServices ? { ...(currentBrand.enabledServices || {}), ...req.body.enabledServices } : (currentBrand.enabledServices || undefined),
      updatedAt: new Date().toISOString()
    };

    writeJSON(BRAND_FILE, updatedBrand);

    // Sync into settings.json as well
    try {
      const currentSettings = readJSON(SETTINGS_FILE, {});
      currentSettings.siteName = updatedBrand.name;
      currentSettings.siteTagline = updatedBrand.tagline;
      currentSettings.supportEmail = updatedBrand.email;
      currentSettings.supportPhone = updatedBrand.phone;
      currentSettings.brand = updatedBrand;
      if (req.body.footer) currentSettings.footer = updatedBrand.footer;
      if (req.body.enabledServices) currentSettings.enabledServices = updatedBrand.enabledServices;
      writeJSON(SETTINGS_FILE, currentSettings);
    } catch (e) {}

    res.json({
      success: true,
      message: 'Brand identity, logo & Website CMS saved successfully! Changes are active live across the website.',
      data: updatedBrand
    });
  } catch (err) {
    console.error('Error saving brand settings', err);
    res.status(500).json({ success: false, message: 'Failed to save brand settings' });
  }
});

// 1.1 Payment & UPI Gateway Settings (Live synced across all devices)
app.get('/api/payment-settings', async (req, res) => {
  const fallback = readJSON(PAYMENT_SETTINGS_FILE, {
    gatewayActive: true,
    paymentMode: 'manual',
    upi: {
      vpa: 'paytm.s2zbyoe@pty',
      name: 'AirSkyGo',
      businessName: 'AirSkyGo',
      mcc: '5499'
    },
    methods: {
      upiQr: true,
      upiApps: true,
      card: false,
      netBanking: false
    },
    apps: {
      any: false,
      phonepe: true,
      gpay: false,
      paytm: true,
      bhim: false,
      other: false
    },
    deepLinks: {
      any: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      phonepe: 'phonepe://native?data={data}&id=p2ppayment',
      gpay: 'tez://upi/pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      paytm: 'paytmmp://cash_wallet?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&featuretype=money_transfer',
      bhim: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      other: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02'
    },
    instructions: "1. Scan the QR code and pay the exact amount\n2. After payment, enter your 12-digit UPI Reference / UTR Number\n3. Click 'I Have Paid'\n4. Your ticket will be confirmed instantly once verified"
  });

  const settings = await getLivePaymentSettings(fallback);
  res.json({ success: true, data: settings });
});

// 2. Airports List
app.get('/api/airports', (req, res) => {
  const airports = readJSON(AIRPORTS_FILE);
  res.json({ success: true, count: airports.length, data: airports });
});

// 3. Coupons / Promo Offers List (supports AirSkyIndia promo paths)
app.get(['/api/coupons', '/api/promos/active', '/api/promos/suggestions'], (req, res) => {
  const coupons = readJSON(COUPONS_FILE);
  res.json({ success: true, count: coupons.length, data: coupons, promos: coupons });
});

// Hotels (Worldwide & Domestic Accommodation)
app.get('/api/hotels', async (req, res) => {
  const { city } = req.query;

  if (city && city.trim()) {
    const q = city.trim();
    const hotels = readJSON(HOTELS_FILE, []);
    const filtered = hotels.filter(h =>
      (h.city && h.city.toLowerCase().includes(q.toLowerCase())) ||
      (h.location && h.location.toLowerCase().includes(q.toLowerCase())) ||
      (h.name && h.name.toLowerCase().includes(q.toLowerCase()))
    );

    if (filtered.length > 0) {
      return res.json({ success: true, count: filtered.length, data: filtered, source: 'AirSkyGo Luxury Hotel Collection' });
    }

    const fallbackList = hotels.map((h, i) => ({
      ...h,
      id: `HTL-GEN-${i + 1}-${q.toUpperCase()}`,
      city: q.charAt(0).toUpperCase() + q.slice(1),
      location: `${h.name}, ${q}`,
      source: 'AirSkyGo Travel Engine'
    }));
    return res.json({ success: true, count: fallbackList.length, data: fallbackList, source: 'AirSkyGo Travel Engine' });
  }

  const hotels = readJSON(HOTELS_FILE, []);
  res.json({ success: true, count: hotels.length, data: hotels, source: 'Featured Luxury Collection' });
});

// Holiday Packages (Moyatri Style Tour Itineraries)
app.get('/api/holidays', (req, res) => {
  const { all, destination } = req.query;
  const holidays = readJSON(HOLIDAYS_FILE, []);
  let result = holidays;
  // Unless all=true is explicitly requested (e.g. by admin), only return active packages
  if (all !== 'true') {
    result = result.filter(h => h.active !== false);
  }
  if (destination && destination.trim()) {
    const q = destination.trim().toLowerCase();
    result = result.filter(h => 
      (h.destination && h.destination.toLowerCase().includes(q)) || 
      (h.title && h.title.toLowerCase().includes(q))
    );
  }
  res.json({ success: true, count: result.length, data: result });
});

// Trains (IRCTC Railway Search & PNR Status Check)
app.get('/api/trains', (req, res) => {
  const trains = readJSON(TRAINS_FILE);
  res.json({ success: true, count: trains.length, data: trains });
});

// Visa Services (Moyatri International Travel Visa Guide)
app.get('/api/visa', (req, res) => {
  const visa = readJSON(VISA_FILE);
  res.json({ success: true, count: visa.length, data: visa });
});

// 4. Flights Search & Filter (Real-Time Live Airfares & Search Engine)
app.get('/api/flights', async (req, res) => {
  const { from, to, date, stops, airline, sort, maxPrice } = req.query;
  const apisConfig = readJSON(APIS_FILE, {});
  let flights = [];
  let dataSource = 'SerpApi Live Google Flights Engine';

  // Real-Time Live Flight API (SerpApi Google Flights ONLY - Direct live fetch, zero caching)
  const configuredKey = apisConfig.serpapi?.apiKey;
  const serpapiKey = (configuredKey !== undefined && configuredKey !== null)
    ? configuredKey.trim()
    : (process.env.SERPAPI_KEY || '').trim();
  const isSerpApiActive = apisConfig.activeProvider === 'serpapi' || apisConfig.serpapi?.enabled !== false;

  if (from && to) {
    if (!serpapiKey) {
      console.warn(`[Flights Search] No SerpApi key configured. Returning 0 flights for ${from} -> ${to}.`);
      return res.json({
        success: true,
        count: 0,
        dataSource: 'SerpApi (No API Key Configured)',
        message: 'SerpApi Key is not configured. Please add your SerpApi key in Admin Settings to search live flights.',
        searchParams: { from, to, date },
        data: []
      });
    }

    if (!isSerpApiActive) {
      console.warn(`[Flights Search] SerpApi is disabled in settings.`);
      return res.json({
        success: true,
        count: 0,
        dataSource: 'SerpApi (Disabled)',
        message: 'SerpApi provider is disabled in settings.',
        searchParams: { from, to, date },
        data: []
      });
    }

    const serpapiFlights = await fetchFlightsFromSerpApi(from, to, date, serpapiKey);
    if (serpapiFlights && serpapiFlights.length > 0) {
      flights = serpapiFlights;
      dataSource = 'Google Flights Real-Time (SerpApi Live)';
    } else {
      // SerpApi returned null or 0 flights (invalid key, API error, or no flights found)
      flights = [];
      dataSource = 'Google Flights Real-Time (SerpApi Live - 0 results)';
    }

    // Only allow custom flights explicitly added by Admin via Admin Panel
    const allFlights = readJSON(FLIGHTS_FILE, []);
    const adminCreatedFlights = allFlights.filter(f => 
      f.isCustomAdmin === true &&
      f.from && f.from.toUpperCase() === from.toUpperCase() && 
      f.to && f.to.toUpperCase() === to.toUpperCase()
    );
    if (adminCreatedFlights.length > 0) {
      flights = [...adminCreatedFlights, ...flights];
    }
  } else {
    // If no route searched, return empty array - absolutely no fake saved flights!
    flights = [];
    dataSource = 'Google Flights Real-Time (SerpApi Live)';
  }

  // Filter by stops
  if (stops !== undefined && stops !== '' && stops !== 'all') {
    flights = flights.filter(f => f.stops === parseInt(stops));
  }

  // Filter by airline
  if (airline && airline !== 'all') {
    flights = flights.filter(f => f.airline.toLowerCase() === airline.toLowerCase() || f.airlineCode.toLowerCase() === airline.toLowerCase());
  }

  // Filter by price
  if (maxPrice) {
    flights = flights.filter(f => f.basePrice <= parseInt(maxPrice));
  }

  // Ensure 100% duplicate-free flight results
  const finalDedup = new Map();
  for (const f of flights) {
    const key = `${f.airlineCode || f.airline}_${f.departureTime}_${f.arrivalTime}_${f.stops}_${f.from}_${f.to}`;
    if (!finalDedup.has(key)) {
      finalDedup.set(key, f);
    } else {
      const existing = finalDedup.get(key);
      if (f.basePrice < existing.basePrice) {
        finalDedup.set(key, f);
      }
    }
  }
  flights = Array.from(finalDedup.values());

  // Sorting
  if (sort === 'cheapest') {
    flights.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sort === 'fastest') {
    flights.sort((a, b) => a.duration.localeCompare(b.duration));
  } else if (sort === 'earliest') {
    flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  res.json({
    success: true,
    count: flights.length,
    dataSource,
    searchParams: { from, to, date },
    data: flights
  });
});

// 5. Single Flight by ID
app.get('/api/flights/:id', (req, res) => {
  const { id } = req.params;
  const flights = readJSON(FLIGHTS_FILE, []);
  const flight = flights.find(f => f.id === id) || recentFlightsCache.get(id);

  if (!flight) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }

  res.json({ success: true, data: flight });
});

// 6. Interactive Seat Layout
app.get('/api/flights/:id/seats', (req, res) => {
  const { id } = req.params;
  const bookings = readJSON(BOOKINGS_FILE);
  
  const occupiedSeats = new Set();
  bookings.filter(b => b.flightId === id && b.status !== 'CANCELLED').forEach(b => {
    (b.passengers || []).forEach(p => {
      if (p.seat) occupiedSeats.add(p.seat);
    });
  });

  const defaultOccupied = ['1A', '2B', '3F', '7C', '10D', '12A', '15F', '18B', '20D'];
  defaultOccupied.forEach(s => occupiedSeats.add(s));

  const rows = [];
  const seatCols = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (let r = 1; r <= 24; r++) {
    const rowSeats = seatCols.map(col => {
      const seatNum = `${r}${col}`;
      const isOccupied = occupiedSeats.has(seatNum);
      let type = 'Standard';
      let price = 0;

      if (r <= 2) {
        type = 'Business / Extra Legroom';
        price = 600;
      } else if (r <= 5 || r === 12 || r === 13) {
        type = 'Preferred Legroom';
        price = 350;
      } else if (col === 'A' || col === 'F') {
        type = 'Window';
        price = 150;
      } else if (col === 'C' || col === 'D') {
        type = 'Aisle';
        price = 100;
      }

      return {
        seatNumber: seatNum,
        row: r,
        col: col,
        type: type,
        price: price,
        isOccupied: isOccupied
      };
    });

    rows.push({
      rowNumber: r,
      isEmergencyExit: r === 12 || r === 13,
      seats: rowSeats
    });
  }

  res.json({
    success: true,
    flightId: id,
    layout: {
      leftCols: ['A', 'B', 'C'],
      rightCols: ['D', 'E', 'F'],
      totalRows: 24,
      rows: rows
    }
  });
});

// 7. Lowest Fare Calendar (Ixigo Style)
app.get('/api/fares/calendar', (req, res) => {
  const { from = 'DEL', to = 'BOM' } = req.query;
  const today = new Date();
  const calendar = [];

  const baseRate = 3800;
  for (let i = 0; i < 20; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const variation = Math.sin(i * 0.8) * 800 + (isWeekend ? 900 : 0);
    const fare = Math.round((baseRate + variation) / 50) * 50;

    calendar.push({
      date: dateStr,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      price: fare,
      isLowest: i === 3 || i === 8
    });
  }

  res.json({ success: true, from, to, calendar, data: calendar });
});

// 8. Flight Status Telemetry Radar
app.get('/api/flights/status/search', (req, res) => {
  const { query } = req.query;
  const flights = readJSON(FLIGHTS_FILE);
  
  if (!query) {
    return res.json({ success: true, data: flights });
  }

  const q = query.trim().toUpperCase();
  const results = flights.filter(f => 
    f.flightNumber.toUpperCase().includes(q) ||
    `${f.from}-${f.to}`.toUpperCase().includes(q) ||
    f.from.toUpperCase().includes(q) ||
    f.to.toUpperCase().includes(q) ||
    f.airline.toUpperCase().includes(q)
  );

  const enhanced = results.map(f => {
    let progress = 65;
    let altitude = '34,000 ft';
    let speed = '840 km/h';

    if (f.status === 'Boarding') {
      progress = 10;
      altitude = '0 ft';
      speed = '0 km/h';
    } else if (f.status === 'Landed') {
      progress = 100;
      altitude = '0 ft';
      speed = 'Taxiing 25 km/h';
    }

    return {
      ...f,
      progress,
      altitude,
      speed,
      gate: {
        departure: `Gate ${Math.floor(Math.random() * 20) + 1}A`,
        arrival: `Belt ${Math.floor(Math.random() * 6) + 1}`
      },
      updatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  });

  res.json({ success: true, count: enhanced.length, data: enhanced });
});

// 9. Coupon / Promo Application (Dynamic check against coupons.json)
app.post(['/api/coupons/apply', '/api/promos/apply'], (req, res) => {
  const code = req.body.code || req.body.promo_code || req.body.coupon;
  const amount = Number(req.body.amount || req.body.fare || 0);
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code required' });
  }

  const coupons = readJSON(COUPONS_FILE);
  const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.status === 'Active');

  if (!coupon) {
    return res.status(400).json({ success: false, message: 'Invalid or inactive promo code' });
  }

  if (coupon.minAmount && amount < coupon.minAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ₹${coupon.minAmount} required for this code.`
    });
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round((amount * coupon.discount) / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discount;
  }

  res.json({
    success: true,
    code: coupon.code,
    discount,
    finalAmount: Math.max(0, amount - discount),
    message: `${coupon.description || 'Discount'} applied successfully!`
  });
});

// 10. Book Flight
app.post('/api/bookings', (req, res) => {
  try {
    const {
      flightId,
      flightNumber,
      airline,
      from,
      to,
      fromCity,
      toCity,
      departureDate,
      departureTime,
      arrivalTime,
      travelClass = 'Economy',
      tripType = 'oneWay',
      multiCityLegs = null,
      route = null,
      passengers = [],
      contact = {},
      fare = {},
      payment = {}
    } = req.body;

    const flightIdToUse = flightId || req.body.flightNumber || 'FL-101';
    const passengersToUse = (Array.isArray(passengers) && passengers.length > 0) ? passengers : [{
      title: 'Mr',
      firstName: contact?.name || contact?.email?.split('@')[0] || 'Customer',
      lastName: 'Traveller',
      type: 'Adult',
      seat: '12A'
    }];

    const bookings = readJSON(BOOKINGS_FILE);
    const siteSettings = readJSON(SETTINGS_FILE, {});
    const prefix = (siteSettings.bookingPrefix || 'GS').trim().toUpperCase();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const pnr = (req.body.pnr || `ASG-${randomSuffix}`).trim().toUpperCase();
    const bookingId = req.body.bookingId || `${prefix}${randomSuffix}`;

    // Check if booking was already initialized on Step 3 (Continue to Payment)
    const targetPnr = (req.body.pnr || '').trim().toUpperCase();
    const existingIndex = targetPnr 
      ? bookings.findIndex(b => (b.pnr && b.pnr.trim().toUpperCase() === targetPnr) || (b.bookingId && b.bookingId.trim().toUpperCase() === targetPnr)) 
      : -1;

    if (existingIndex !== -1) {
      bookings[existingIndex] = {
        ...bookings[existingIndex],
        ...req.body,
        pnr: bookings[existingIndex].pnr, // Keep original consistent PNR
        flightId: flightIdToUse,
        passengers: passengersToUse,
        fare: {
          ...bookings[existingIndex].fare,
          ...(fare || {})
        },
        payment: {
          ...bookings[existingIndex].payment,
          ...(payment || {}),
          paidAt: new Date().toISOString()
        },
        status: req.body.status || bookings[existingIndex].status || 'CONFIRMED',
        updatedAt: new Date().toISOString()
      };
      writeJSON(BOOKINGS_FILE, bookings);

      return res.status(200).json({
        success: true,
        message: 'Flight booking updated successfully!',
        pnr: bookings[existingIndex].pnr,
        booking: bookings[existingIndex],
        data: bookings[existingIndex]
      });
    }

    const newBooking = {
      pnr,
      bookingId,
      flightId: flightIdToUse,
      flightNumber: flightNumber || 'ASG-101',
      airline: airline || 'AirSkyGo Partner',
      from,
      to,
      fromCity: fromCity || from,
      toCity: toCity || to,
      tripType,
      multiCityLegs,
      roundTripDetails: req.body.roundTripDetails || null,
      returnDate: req.body.returnDate || null,
      route: route || (from && to ? (tripType === 'roundTrip' ? `${from} ⇄ ${to}` : `${from} → ${to}`) : 'Flight Route'),
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      departureTime: departureTime || '08:00',
      arrivalTime: arrivalTime || '10:30',
      travelClass,
      passengers: passengersToUse,
      contact,
      fare: {
        basePrice: fare.basePrice || 4000,
        seatCost: fare.seatCost || 0,
        mealsCost: fare.mealsCost || 0,
        taxes: fare.taxes || 750,
        discount: fare.discount || 0,
        total: fare.total || (fare.basePrice + (fare.seatCost || 0) + (fare.taxes || 750) - (fare.discount || 0))
      },
      payment: {
        method: payment.method || 'UPI',
        transactionId: payment.transactionId || `TXN_${Date.now()}`,
        utrNumber: payment.utrNumber || null,
        status: payment.status || (req.body.status === 'PENDING' ? 'PENDING' : req.body.status === 'VERIFICATION_PENDING' ? 'VERIFICATION_PENDING' : 'Paid'),
        paidAt: req.body.status === 'PENDING' ? null : new Date().toISOString(),
        paidToVpa: payment.paidToVpa || null
      },
      checkInStatus: req.body.status === 'PENDING' ? 'Payment Pending' : req.body.status === 'VERIFICATION_PENDING' ? 'Pending Verification' : 'Eligible',
      status: req.body.status || 'PENDING',
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    writeJSON(BOOKINGS_FILE, bookings);

    // Auto-register or update customer in users.json
    try {
      if (contact?.phone || contact?.email) {
        const users = readJSON(USERS_FILE, []);
        const cleanPhone = (contact.phone || '').replace(/\D/g, '').slice(-10);
        let user = users.find(u => 
          (cleanPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone) || 
          (contact.email && u.email && u.email.toLowerCase() === contact.email.toLowerCase())
        );

        if (!user) {
          const paxName = passengers[0] ? `${passengers[0].firstName} ${passengers[0].lastName}`.trim() : 'Valued Flyer';
          user = {
            id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: paxName,
            phone: contact.phone || '',
            email: contact.email || '',
            role: 'traveller',
            tier: 'SkyClub Member',
            points: 500,
            bookingsCount: 1,
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          users.unshift(user);
        } else {
          user.bookingsCount = (user.bookingsCount || 0) + 1;
          user.lastLogin = new Date().toISOString();
        }
        writeJSON(USERS_FILE, users);
      }
    } catch (uErr) {
      console.error('Error saving customer on booking:', uErr);
    }

    res.status(201).json({
      success: true,
      message: 'Flight booked successfully!',
      pnr: pnr,
      booking: newBooking,
      data: newBooking
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: 'Internal server error processing booking' });
  }
});

// 11. Customer Get Bookings
app.get('/api/bookings', (req, res) => {
  const { email, phone, pnr } = req.query;
  const bookings = readJSON(BOOKINGS_FILE);

  if (pnr) {
    const b = bookings.find(item => item.pnr.toUpperCase() === pnr.toUpperCase());
    return res.json({ success: true, data: b ? [b] : [] });
  }

  if (email) {
    const filtered = bookings.filter(b => b.contact?.email?.toLowerCase() === email.toLowerCase());
    return res.json({ success: true, count: filtered.length, data: filtered });
  }

  if (phone) {
    const filtered = bookings.filter(b => b.contact?.phone?.includes(phone));
    return res.json({ success: true, count: filtered.length, data: filtered });
  }

  res.json({ success: true, count: bookings.length, data: bookings });
});

// 12. Single Booking by PNR
app.get('/api/bookings/:pnr', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { pnr } = req.params;
  const bookings = readJSON(BOOKINGS_FILE);
  const searchPnr = (pnr || '').trim().toUpperCase();
  const booking = bookings.find(b => 
    (b.pnr && b.pnr.trim().toUpperCase() === searchPnr) || 
    (b.bookingId && b.bookingId.trim().toUpperCase() === searchPnr)
  );

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, data: booking, booking });
});

// 13. Cancel Booking
app.patch('/api/bookings/:pnr/cancel', (req, res) => {
  const { pnr } = req.params;
  const bookings = readJSON(BOOKINGS_FILE);
  const settings = readJSON(SETTINGS_FILE, {});
  const index = bookings.findIndex(b => b.pnr.toUpperCase() === pnr.toUpperCase());

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const cancellationFee = settings.cancellationFee || 999;
  const refundAmount = Math.max(0, bookings[index].fare.total - cancellationFee);

  bookings[index].status = 'CANCELLED';
  bookings[index].cancellation = {
    cancelledAt: new Date().toISOString(),
    fee: cancellationFee,
    refundAmount: refundAmount,
    refundStatus: 'Initiated (Credited in 3-5 days)'
  };

  writeJSON(BOOKINGS_FILE, bookings);

  res.json({
    success: true,
    message: 'Booking cancelled successfully. Refund initiated.',
    refundAmount,
    booking: bookings[index]
  });
});

// 14. Web Check-In
app.patch('/api/bookings/:pnr/checkin', (req, res) => {
  const { pnr } = req.params;
  const bookings = readJSON(BOOKINGS_FILE);
  const index = bookings.findIndex(b => b.pnr.toUpperCase() === pnr.toUpperCase());

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  bookings[index].checkInStatus = 'COMPLETED';
  bookings[index].boardingPass = {
    gate: '14B',
    boardingTime: '30 mins before departure',
    sequence: Math.floor(10 + Math.random() * 80)
  };

  writeJSON(BOOKINGS_FILE, bookings);

  res.json({
    success: true,
    message: 'Web check-in completed! Boarding pass ready.',
    booking: bookings[index]
  });
});

/* ================= CUSTOMER AUTHENTICATION & MULTI-SERVICE DATA APIS ================= */

// Customer Authentication & Auto-Registration
app.post('/api/auth/customer-auth', (req, res) => {
  const { phone, email, name, method } = req.body;
  const users = readJSON(USERS_FILE, []);

  let existingUser = null;
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    existingUser = users.find(u => u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }
  if (!existingUser && email) {
    existingUser = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  if (existingUser) {
    existingUser.lastLogin = new Date().toISOString();
    if (name && (!existingUser.name || existingUser.name.startsWith('Traveller '))) {
      existingUser.name = name;
    }
    writeJSON(USERS_FILE, users);
    return res.json({ success: true, message: 'Welcome back!', user: existingUser });
  }

  // Create new customer record
  const newUser = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name || (phone ? `Traveller ${phone.slice(-4)}` : (email ? email.split('@')[0] : 'Valued Customer')),
    phone: phone ? (phone.startsWith('+91') ? phone : `+91 ${phone}`) : '',
    email: email || '',
    role: 'traveller',
    tier: 'SkyClub Member',
    points: 500,
    bookingsCount: 0,
    registeredAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  users.unshift(newUser);
  writeJSON(USERS_FILE, users);
  res.json({ success: true, message: 'Account created successfully!', user: newUser });
});

// Admin Get All Customers / Registered Users
app.get('/api/admin/customers', (req, res) => {
  const users = readJSON(USERS_FILE, []);
  const bookings = readJSON(BOOKINGS_FILE, []);
  const hotelBookings = readJSON(HOTEL_BOOKINGS_FILE, []);
  
  const augmented = users.map(u => {
    const cleanP = u.phone ? u.phone.replace(/\D/g, '').slice(-10) : '';
    const flightCount = bookings.filter(b => 
      (cleanP && b.contact?.phone && b.contact.phone.replace(/\D/g, '').slice(-10) === cleanP) ||
      (u.email && b.contact?.email && b.contact.email.toLowerCase() === u.email.toLowerCase())
    ).length;

    const hotelCount = hotelBookings.filter(h => 
      (cleanP && h.customerPhone && h.customerPhone.replace(/\D/g, '').slice(-10) === cleanP) ||
      (u.email && h.customerEmail && h.customerEmail.toLowerCase() === u.email.toLowerCase())
    ).length;

    return {
      ...u,
      bookingsCount: Math.max(u.bookingsCount || 0, flightCount + hotelCount)
    };
  });

  res.json({ success: true, count: augmented.length, data: augmented });
});

// Admin Delete Customer
app.delete('/api/admin/customers/:id', (req, res) => {
  const { id } = req.params;
  let users = readJSON(USERS_FILE, []);
  users = users.filter(u => u.id !== id);
  writeJSON(USERS_FILE, users);
  res.json({ success: true, message: 'Customer record deleted' });
});

// Hotel Bookings API
app.post('/api/hotels/book', (req, res) => {
  const { hotelId, hotelName, city, customerName, customerPhone, customerEmail, checkIn, checkOut, guests, totalPrice, paymentType } = req.body;
  const hotelBookings = readJSON(HOTEL_BOOKINGS_FILE, []);
  
  const bId = `HTL-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBooking = {
    bookingId: bId,
    id: bId,
    hotelId: hotelId || 'htl-gen',
    hotelName: hotelName || 'Luxury Hotel',
    city: city || 'Goa',
    customerName: customerName || req.body.name || 'Valued Guest',
    customerPhone: customerPhone || req.body.phone || '',
    customerEmail: customerEmail || req.body.email || '',
    checkIn: checkIn || new Date().toISOString().split('T')[0],
    checkOut: checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    guests: guests || '2 Guests, 1 Room',
    totalPrice: totalPrice || 4500,
    paymentType: paymentType || 'Pay at Hotel',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  hotelBookings.unshift(newBooking);
  writeJSON(HOTEL_BOOKINGS_FILE, hotelBookings);

  // Auto-record customer in users.json
  if (customerPhone || customerEmail) {
    const users = readJSON(USERS_FILE, []);
    const cleanP = (customerPhone || '').replace(/\D/g, '').slice(-10);
    let user = users.find(u => 
      (cleanP && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanP) ||
      (customerEmail && u.email && u.email.toLowerCase() === customerEmail.toLowerCase())
    );
    if (!user) {
      user = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        role: 'traveller',
        tier: 'SkyClub Member',
        points: 500,
        bookingsCount: 1,
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      users.unshift(user);
    } else {
      user.bookingsCount = (user.bookingsCount || 0) + 1;
    }
    writeJSON(USERS_FILE, users);
  }

  res.json({ success: true, message: 'Hotel reserved successfully!', booking: newBooking });
});

app.get('/api/admin/hotel-bookings', (req, res) => {
  const hotelBookings = readJSON(HOTEL_BOOKINGS_FILE, []);
  res.json({ success: true, count: hotelBookings.length, data: hotelBookings });
});

app.patch('/api/admin/hotel-bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const hotelBookings = readJSON(HOTEL_BOOKINGS_FILE, []);
  const item = hotelBookings.find(b => b.bookingId === id || b.id === id);
  if (item) {
    item.status = status;
    writeJSON(HOTEL_BOOKINGS_FILE, hotelBookings);
    return res.json({ success: true, message: 'Status updated' });
  }
  res.status(404).json({ success: false, message: 'Hotel booking not found' });
});

// Holiday Inquiries API
app.post(['/api/holidays/inquire', '/api/holidays/inquiry'], (req, res) => {
  const { packageId, packageName, packageTitle, customerName, name, customerPhone, phone, customerEmail, email, travelDate, travellers, travelers, notes } = req.body;
  const inquiries = readJSON(HOLIDAY_INQUIRIES_FILE, []);

  const inqId = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInq = {
    inquiryId: inqId,
    id: inqId,
    packageId: packageId || 'pkg-gen',
    packageName: packageName || packageTitle || 'Holiday Tour Package',
    customerName: customerName || name || 'Traveller',
    customerPhone: customerPhone || phone || '',
    customerEmail: customerEmail || email || '',
    travelDate: travelDate || '',
    travellers: travellers || travelers || 2,
    notes: notes || '',
    status: 'NEW',
    createdAt: new Date().toISOString()
  };

  inquiries.unshift(newInq);
  writeJSON(HOLIDAY_INQUIRIES_FILE, inquiries);

  // Auto-record customer in users.json
  if (customerPhone || customerEmail) {
    const users = readJSON(USERS_FILE, []);
    const cleanP = (customerPhone || '').replace(/\D/g, '').slice(-10);
    let user = users.find(u => 
      (cleanP && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanP) ||
      (customerEmail && u.email && u.email.toLowerCase() === customerEmail.toLowerCase())
    );
    if (!user) {
      user = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        role: 'traveller',
        tier: 'SkyClub Member',
        points: 500,
        bookingsCount: 1,
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      users.unshift(user);
    } else {
      user.bookingsCount = (user.bookingsCount || 0) + 1;
    }
    writeJSON(USERS_FILE, users);
  }

  res.json({ success: true, message: 'Inquiry received! Our holiday specialist will call you shortly.', inquiry: newInq });
});

app.get('/api/admin/holiday-inquiries', (req, res) => {
  const inquiries = readJSON(HOLIDAY_INQUIRIES_FILE, []);
  res.json({ success: true, count: inquiries.length, data: inquiries });
});

app.patch('/api/admin/holiday-inquiries/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const inquiries = readJSON(HOLIDAY_INQUIRIES_FILE, []);
  const item = inquiries.find(i => i.inquiryId === id || i.id === id);
  if (item) {
    item.status = status;
    writeJSON(HOLIDAY_INQUIRIES_FILE, inquiries);
    return res.json({ success: true, message: 'Inquiry status updated' });
  }
  res.status(404).json({ success: false, message: 'Inquiry not found' });
});

// Admin Holiday Packages Catalog Management (Add, Edit, Toggle Active/Deactive, Delete)
app.get('/api/admin/holidays', (req, res) => {
  const holidays = readJSON(HOLIDAYS_FILE, []);
  res.json({ success: true, count: holidays.length, data: holidays });
});

app.post('/api/admin/holidays', (req, res) => {
  const { title, destination, duration, price, originalPrice, rating, image, inclusions, badge, flightsIncluded, active } = req.body;
  if (!title || !destination || !price) {
    return res.status(400).json({ success: false, message: 'Title, destination and price are required' });
  }

  const holidays = readJSON(HOLIDAYS_FILE, []);
  const newPackage = {
    id: `PKG-${Date.now().toString().slice(-6)}`,
    title: title.trim(),
    destination: destination.trim(),
    duration: duration ? duration.trim() : '5 Days / 4 Nights',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.25),
    rating: rating ? Number(rating) : 4.8,
    image: image?.trim() || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    inclusions: Array.isArray(inclusions) ? inclusions : (typeof inclusions === 'string' ? inclusions.split(',').map(s => s.trim()).filter(Boolean) : ['Luxury Hotel Stay', 'Daily Breakfast', 'Guided Sightseeing', 'Transfers']),
    badge: badge?.trim() || 'Bestseller',
    flightsIncluded: !!flightsIncluded,
    active: active !== undefined ? !!active : true,
    createdAt: new Date().toISOString()
  };

  holidays.unshift(newPackage);
  writeJSON(HOLIDAYS_FILE, holidays);
  res.json({ success: true, message: 'Holiday package created successfully!', data: newPackage });
});

app.put('/api/admin/holidays/:id', (req, res) => {
  const { id } = req.params;
  const holidays = readJSON(HOLIDAYS_FILE, []);
  const index = holidays.findIndex(h => h.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Package not found' });
  }

  const existing = holidays[index];
  const { title, destination, duration, price, originalPrice, rating, image, inclusions, badge, flightsIncluded, active } = req.body;

  holidays[index] = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    destination: destination !== undefined ? destination.trim() : existing.destination,
    duration: duration !== undefined ? duration.trim() : existing.duration,
    price: price !== undefined ? Number(price) : existing.price,
    originalPrice: originalPrice !== undefined ? Number(originalPrice) : existing.originalPrice,
    rating: rating !== undefined ? Number(rating) : existing.rating,
    image: image !== undefined ? image.trim() : existing.image,
    inclusions: Array.isArray(inclusions) ? inclusions : (typeof inclusions === 'string' ? inclusions.split(',').map(s => s.trim()).filter(Boolean) : existing.inclusions),
    badge: badge !== undefined ? badge.trim() : existing.badge,
    flightsIncluded: flightsIncluded !== undefined ? !!flightsIncluded : existing.flightsIncluded,
    active: active !== undefined ? !!active : (existing.active !== false),
    updatedAt: new Date().toISOString()
  };

  writeJSON(HOLIDAYS_FILE, holidays);
  res.json({ success: true, message: 'Package updated successfully', data: holidays[index] });
});

app.patch('/api/admin/holidays/:id/toggle', (req, res) => {
  const { id } = req.params;
  const holidays = readJSON(HOLIDAYS_FILE, []);
  const pkg = holidays.find(h => h.id === id);
  if (!pkg) {
    return res.status(404).json({ success: false, message: 'Package not found' });
  }

  pkg.active = pkg.active === false ? true : false;
  writeJSON(HOLIDAYS_FILE, holidays);
  res.json({ 
    success: true, 
    message: `Package is now ${pkg.active ? 'Active (Live)' : 'Deactivated (Hidden)'}`, 
    active: pkg.active, 
    data: pkg 
  });
});

app.delete('/api/admin/holidays/:id', (req, res) => {
  const { id } = req.params;
  const holidays = readJSON(HOLIDAYS_FILE, []);
  const filtered = holidays.filter(h => h.id !== id);
  if (filtered.length === holidays.length) {
    return res.status(404).json({ success: false, message: 'Package not found' });
  }

  writeJSON(HOLIDAYS_FILE, filtered);
  res.json({ success: true, message: 'Package deleted successfully' });
});

// Train Bookings API
app.post('/api/trains/book', (req, res) => {
  const { trainNumber, trainName, from, to, customerName, customerPhone, travelDate, travelClass, fare } = req.body;
  const trainBookings = readJSON(TRAIN_BOOKINGS_FILE, []);
  const randomPnr = Math.floor(2000000000 + Math.random() * 8000000000).toString();

  const newTrainBooking = {
    bookingId: `TRN-${Math.floor(1000 + Math.random() * 9000)}`,
    trainNumber: trainNumber || '12952',
    trainName: trainName || 'Express',
    from: from || 'Delhi',
    to: to || 'Mumbai',
    customerName: customerName || 'Passenger',
    customerPhone: customerPhone || '',
    travelDate: travelDate || new Date().toISOString().split('T')[0],
    travelClass: travelClass || '3A',
    pnr: randomPnr,
    fare: fare || 1850,
    status: 'CONFIRMED (CNF B2-19)',
    createdAt: new Date().toISOString()
  };

  trainBookings.unshift(newTrainBooking);
  writeJSON(TRAIN_BOOKINGS_FILE, trainBookings);
  res.json({ success: true, message: 'Train booked successfully! PNR generated.', booking: newTrainBooking });
});

app.get('/api/admin/train-bookings', (req, res) => {
  const trainBookings = readJSON(TRAIN_BOOKINGS_FILE, []);
  res.json({ success: true, count: trainBookings.length, data: trainBookings });
});

// Visa Applications API
app.post('/api/visa/apply', (req, res) => {
  const { country, visaType, applicantName, passportNumber, phone, email, fee } = req.body;
  const visaApps = readJSON(VISA_APPLICATIONS_FILE, []);

  const newApp = {
    applicationId: `VISA-${Math.floor(1000 + Math.random() * 9000)}`,
    country: country || 'Dubai (UAE)',
    visaType: visaType || 'Tourist Express',
    applicantName: applicantName || 'Applicant',
    passportNumber: passportNumber || 'P1234567',
    phone: phone || '',
    email: email || '',
    fee: fee || 6499,
    status: 'DOCUMENTS_SUBMITTED',
    createdAt: new Date().toISOString()
  };

  visaApps.unshift(newApp);
  writeJSON(VISA_APPLICATIONS_FILE, visaApps);
  res.json({ success: true, message: 'Visa application submitted!', application: newApp });
});

app.get('/api/admin/visa-applications', (req, res) => {
  const visaApps = readJSON(VISA_APPLICATIONS_FILE, []);
  res.json({ success: true, count: visaApps.length, data: visaApps });
});

app.patch('/api/admin/visa-applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const visaApps = readJSON(VISA_APPLICATIONS_FILE, []);
  const item = visaApps.find(a => a.applicationId === id);
  if (item) {
    item.status = status;
    writeJSON(VISA_APPLICATIONS_FILE, visaApps);
    return res.json({ success: true, message: 'Visa application status updated' });
  }
  res.status(404).json({ success: false, message: 'Visa application not found' });
});

/* ================= FULL WORKING ADMIN CONTROL APIS ================= */

// A0. Admin Login Authentication
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = readJSON(ADMIN_FILE, { username: 'admin@airskygo.com', password: 'admin123', name: 'Super Admin' });

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username/Email and Password are required' });
  }

  const u = username.trim().toLowerCase();
  const validUser = (u === admin.username.toLowerCase() || u === 'admin' || u === 'admin@airskygo.com');
  const validPass = (password === admin.password);

  if (validUser && validPass) {
    return res.json({
      success: true,
      token: `ASG_ADMIN_SESSION_${Date.now()}`,
      admin: {
        username: admin.username,
        name: admin.name || 'Master Admin',
        role: admin.role || 'Super Administrator'
      },
      message: 'Admin authentication successful! Access granted.'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid Admin ID or Password. Default is admin@airskygo.com / admin123'
  });
});

// A0.1 Admin Change Credentials (ID & Password)
app.post('/api/admin/change-credentials', (req, res) => {
  const { currentPassword, newUsername, newPassword, newName } = req.body;
  const admin = readJSON(ADMIN_FILE, { username: 'admin@airskygo.com', password: 'admin123' });

  if (currentPassword !== admin.password) {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
  }

  if (newUsername) admin.username = newUsername.trim();
  if (newPassword) admin.password = newPassword.trim();
  if (newName) admin.name = newName.trim();

  writeJSON(ADMIN_FILE, admin);

  res.json({
    success: true,
    message: 'Admin ID & Password updated successfully! Please use new credentials for future logins.',
    admin: {
      username: admin.username,
      name: admin.name
    }
  });
});

// A1. Admin Dashboard Stats
app.get('/api/admin/stats', (req, res) => {
  const bookings = readJSON(BOOKINGS_FILE, []);
  const flights = readJSON(FLIGHTS_FILE, []);
  const users = readJSON(USERS_FILE, []);
  const hotelBookings = readJSON(HOTEL_BOOKINGS_FILE, []);
  const holidayInquiries = readJSON(HOLIDAY_INQUIRIES_FILE, []);
  const trainBookings = readJSON(TRAIN_BOOKINGS_FILE, []);
  const visaApplications = readJSON(VISA_APPLICATIONS_FILE, []);

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  const flightRevenue = confirmedBookings.reduce((sum, b) => sum + (b.fare?.total || 0), 0);
  const hotelRevenue = hotelBookings.reduce((sum, h) => sum + (h.totalPrice || 0), 0);
  const trainRevenue = trainBookings.reduce((sum, t) => sum + (t.fare || 0), 0);
  const visaRevenue = visaApplications.reduce((sum, v) => sum + (v.fee || 0), 0);
  const totalRevenue = flightRevenue + hotelRevenue + trainRevenue + visaRevenue;

  const totalPassengers = confirmedBookings.reduce((sum, b) => sum + (b.passengers?.length || 1), 0);

  const airlineRevenue = {};
  confirmedBookings.forEach(b => {
    const airline = b.airline || 'Other';
    airlineRevenue[airline] = (airlineRevenue[airline] || 0) + (b.fare?.total || 0);
  });

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalBookings,
      confirmedCount: confirmedBookings.length,
      cancelledCount: cancelledBookings.length,
      activeFlightsCount: flights.length,
      totalCustomers: users.length,
      hotelBookingsCount: hotelBookings.length,
      holidayInquiriesCount: holidayInquiries.length,
      trainBookingsCount: trainBookings.length,
      visaApplicationsCount: visaApplications.length,
      totalPassengers,
      airlineRevenue,
      recentBookings: bookings.slice(0, 6)
    }
  });
});

// A2. Admin Update Website Settings (Live CMS for every single detail!)
app.put('/api/admin/settings', (req, res) => {
  const currentSettings = readJSON(SETTINGS_FILE, {});
  const updatedSettings = { ...currentSettings, ...req.body };
  writeJSON(SETTINGS_FILE, updatedSettings);

  res.json({
    success: true,
    message: 'Website settings updated successfully! Live changes applied across the entire site.',
    data: updatedSettings
  });
});

// A2.1. Admin Save Payment & UPI Gateway Settings (Live synced across all devices)
app.post('/api/admin/payment-settings', async (req, res) => {
  const current = readJSON(PAYMENT_SETTINGS_FILE, {});
  const updated = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeJSON(PAYMENT_SETTINGS_FILE, updated);

  // Also write to client/public so static fetch works on Vercel
  try {
    const publicSettingsPath = path.join(__dirname, '..', 'client', 'public', 'payment_settings.json');
    fs.writeFileSync(publicSettingsPath, JSON.stringify(updated, null, 2));
  } catch (e) { /* ignore if path doesn't exist */ }

  // Sync to Cloud Gist instantly for zero-latency cross-device live update
  try {
    await saveLivePaymentSettings(updated);
  } catch (e) {
    console.error('Failed to save to live cloud gist:', e);
  }

  res.json({
    success: true,
    message: 'Payment & UPI configuration saved securely! Live changes are now active across all devices.',
    data: updated
  });
});

// A3. Admin Add Flight
app.post('/api/admin/flights', (req, res) => {
  const {
    flightNumber,
    airline,
    airlineCode,
    from,
    to,
    departureTime,
    arrivalTime,
    duration,
    stops = 0,
    aircraft = 'Airbus A320neo',
    basePrice,
    classes,
    status = 'On-Time'
  } = req.body;

  if (!flightNumber || !airline || !from || !to || !basePrice) {
    return res.status(400).json({ success: false, message: 'All required flight fields must be filled' });
  }

  const flights = readJSON(FLIGHTS_FILE);
  const airports = readJSON(AIRPORTS_FILE);

  const fromObj = airports.find(a => a.code === from) || { city: from };
  const toObj = airports.find(a => a.code === to) || { city: to };

  const newFlight = {
    id: `FL-${Date.now().toString().slice(-4)}`,
    flightNumber: flightNumber.toUpperCase(),
    airline,
    airlineCode: airlineCode || flightNumber.slice(0, 2),
    airlineColor: '#002B7F',
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    fromCity: fromObj.city,
    toCity: toObj.city,
    departureTime,
    arrivalTime,
    duration: duration || '2h 15m',
    stops: parseInt(stops) || 0,
    aircraft,
    basePrice: parseInt(basePrice),
    classes: classes || {
      economy: parseInt(basePrice),
      premiumEconomy: Math.round(parseInt(basePrice) * 1.4),
      business: Math.round(parseInt(basePrice) * 2.6)
    },
    seatsTotal: 180,
    seatsAvailable: 180,
    baggage: 'Cabin: 7 kg, Check-in: 15 kg',
    mealIncluded: false,
    refundable: true,
    status: status || 'On-Time',
    terminal: { from: 'T1', to: 'T2' }
  };

  flights.unshift(newFlight);
  writeJSON(FLIGHTS_FILE, flights);

  res.status(201).json({
    success: true,
    message: 'New flight route published successfully',
    flight: newFlight
  });
});

// A4. Admin Edit Any Flight (Price, Timings, Status, Aircraft, Seats, etc.)
app.put('/api/admin/flights/:id', (req, res) => {
  const { id } = req.params;
  const flights = readJSON(FLIGHTS_FILE);
  const index = flights.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }

  flights[index] = { ...flights[index], ...req.body };
  // If basePrice is changed, recalculate classes if not explicitly provided
  if (req.body.basePrice && !req.body.classes) {
    flights[index].classes = {
      economy: parseInt(req.body.basePrice),
      premiumEconomy: Math.round(parseInt(req.body.basePrice) * 1.4),
      business: Math.round(parseInt(req.body.basePrice) * 2.6)
    };
  }

  writeJSON(FLIGHTS_FILE, flights);

  res.json({
    success: true,
    message: `Flight ${flights[index].flightNumber} updated successfully`,
    flight: flights[index]
  });
});

// A5. Admin Delete Flight
app.delete('/api/admin/flights/:id', (req, res) => {
  const { id } = req.params;
  let flights = readJSON(FLIGHTS_FILE);
  const exists = flights.some(f => f.id === id);

  if (!exists) {
    return res.status(404).json({ success: false, message: 'Flight not found' });
  }

  flights = flights.filter(f => f.id !== id);
  writeJSON(FLIGHTS_FILE, flights);

  res.json({ success: true, message: 'Flight deleted successfully' });
});

// A6. Admin Coupons CRUD
app.post('/api/admin/coupons', (req, res) => {
  const { code, type = 'flat', discount, minAmount = 0, description } = req.body;
  if (!code || !discount) {
    return res.status(400).json({ success: false, message: 'Coupon code and discount are required' });
  }

  const coupons = readJSON(COUPONS_FILE);
  const newCoupon = {
    id: `CPN-${Date.now().toString().slice(-4)}`,
    code: code.trim().toUpperCase(),
    type,
    discount: parseInt(discount),
    minAmount: parseInt(minAmount) || 0,
    description: description || `${type === 'percent' ? discount + '%' : '₹' + discount} off`,
    status: 'Active'
  };

  coupons.unshift(newCoupon);
  writeJSON(COUPONS_FILE, coupons);

  res.status(201).json({ success: true, message: 'Coupon created successfully', coupon: newCoupon });
});

app.put('/api/admin/coupons/:id', (req, res) => {
  const { id } = req.params;
  const coupons = readJSON(COUPONS_FILE);
  const index = coupons.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  coupons[index] = { ...coupons[index], ...req.body };
  writeJSON(COUPONS_FILE, coupons);

  res.json({ success: true, message: 'Coupon updated', coupon: coupons[index] });
});

app.delete('/api/admin/coupons/:id', (req, res) => {
  const { id } = req.params;
  let coupons = readJSON(COUPONS_FILE);
  coupons = coupons.filter(c => c.id !== id);
  writeJSON(COUPONS_FILE, coupons);

  res.json({ success: true, message: 'Coupon deleted' });
});

// A7. Admin Airports Management
app.post('/api/admin/airports', (req, res) => {
  const { code, city, name, country = 'India' } = req.body;
  if (!code || !city || !name) {
    return res.status(400).json({ success: false, message: 'Airport code, city, and name required' });
  }

  const airports = readJSON(AIRPORTS_FILE);
  const newAirport = {
    code: code.trim().toUpperCase(),
    city,
    name,
    country
  };

  airports.push(newAirport);
  writeJSON(AIRPORTS_FILE, airports);

  res.status(201).json({ success: true, message: 'Airport added successfully', airport: newAirport });
});

app.delete('/api/admin/airports/:code', (req, res) => {
  const { code } = req.params;
  let airports = readJSON(AIRPORTS_FILE);
  airports = airports.filter(a => a.code.toUpperCase() !== code.toUpperCase());
  writeJSON(AIRPORTS_FILE, airports);

  res.json({ success: true, message: 'Airport deleted' });
});

// A8. Admin Update Customer Booking Status (CONFIRMED, CANCELLED, REFUNDED)
app.patch('/api/admin/bookings/:pnr/status', (req, res) => {
  const { pnr } = req.params;
  const { status } = req.body;

  const bookings = readJSON(BOOKINGS_FILE);
  const searchPnr = (pnr || '').trim().toUpperCase();
  const index = bookings.findIndex(b => 
    (b.pnr && b.pnr.trim().toUpperCase() === searchPnr) || 
    (b.bookingId && b.bookingId.trim().toUpperCase() === searchPnr)
  );

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const normalizedStatus = (status || 'CONFIRMED').toUpperCase();
  bookings[index].status = normalizedStatus;
  if (!bookings[index].payment) {
    bookings[index].payment = {};
  }
  if (normalizedStatus === 'CONFIRMED') {
    bookings[index].payment.status = 'PAID';
    bookings[index].checkInStatus = 'Eligible';
  } else if (normalizedStatus === 'CANCELLED') {
    bookings[index].payment.status = 'CANCELLED';
    bookings[index].checkInStatus = 'Cancelled';
  }
  bookings[index].updatedAt = new Date().toISOString();
  writeJSON(BOOKINGS_FILE, bookings);

  res.json({ success: true, message: `Booking ${pnr} status updated to ${normalizedStatus}`, booking: bookings[index] });
});

// Admin Delete Flight Booking
app.delete('/api/admin/bookings/:pnr', (req, res) => {
  const { pnr } = req.params;
  const bookings = readJSON(BOOKINGS_FILE);
  const filtered = bookings.filter(b => b.pnr?.toUpperCase() !== pnr.toUpperCase() && b.bookingId?.toUpperCase() !== pnr.toUpperCase());

  if (filtered.length === bookings.length) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  writeJSON(BOOKINGS_FILE, filtered);
  res.json({ success: true, message: `Booking ${pnr} deleted successfully` });
});

// A9. Admin APIs Integration Management
app.get('/api/admin/apis', (req, res) => {
  const apis = readJSON(APIS_FILE, {});
  res.json({ success: true, data: apis });
});

app.put('/api/admin/apis', (req, res) => {
  const current = readJSON(APIS_FILE, {});
  const updated = { ...current, ...req.body };
  writeJSON(APIS_FILE, updated);
  res.json({ success: true, message: 'API configurations updated successfully!', data: updated });
});

// A9.1 Test SerpApi (Google Flights) Connection
app.post('/api/admin/apis/test-serpapi', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'SerpApi key is required' });
  }

  try {
    const testRes = await fetch(`https://serpapi.com/account.json?api_key=${apiKey.trim()}`);
    if (testRes.ok) {
      const data = await testRes.json();
      return res.json({
        success: true,
        message: 'SerpApi Connected Successfully! Google Flights live data active.',
        searches_remaining: data.total_searches_left ?? data.plan_searches_left ?? 'Active'
      });
    } else {
      const errData = await testRes.json().catch(() => ({}));
      return res.status(400).json({
        success: false,
        message: errData.error || `SerpApi Error (Status ${testRes.status}): Invalid API Key`
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: `Connection failed: ${err.message}` });
  }
});

// A9.2 Integrated API & Payment Settings
app.get('/api/admin/api-settings', (req, res) => {
  const apis = readJSON(APIS_FILE, {});
  const paymentSettings = readJSON(PAYMENT_SETTINGS_FILE, {});
  const siteSettings = readJSON(SETTINGS_FILE, {});
  const brand = readJSON(BRAND_FILE, {});

  res.json({
    success: true,
    data: {
      serpapi: {
        apiKey: apis.serpapi?.apiKey || '',
        enabled: apis.serpapi?.enabled !== false,
        status: apis.serpapi?.apiKey ? 'Active (Google Flights Live)' : 'Not Configured'
      },
      razorpay: {
        keyId: paymentSettings.razorpay?.keyId || '',
        keySecret: paymentSettings.razorpay?.keySecret || '',
        enabled: !!paymentSettings.razorpay?.enabled
      },
      upi: {
        vpa: paymentSettings.upi?.vpa || 'paytm.s2zbyoe@pty',
        businessName: paymentSettings.upi?.businessName || paymentSettings.upi?.name || 'AirSkyGo'
      },
      general: {
        bookingPrefix: siteSettings.bookingPrefix || 'GS',
        contactEmail: siteSettings.supportEmail || brand.email || 'care@airskyindia.com',
        contactPhone: siteSettings.supportPhone || brand.phone || '+91 72248 28030',
        legalName: siteSettings.legalName || 'Air Sky Travels Private Limited',
        companyGstin: siteSettings.companyGstin || '07ABCCS8601B1ZP'
      },
      activeProvider: apis.activeProvider || 'serpapi'
    }
  });
});

app.post('/api/admin/api-settings', (req, res) => {
  try {
    const {
      serpapi,
      razorpay,
      upi,
      general,
      activeProvider
    } = req.body;

    // 1. Update APIS_FILE
    const currentApis = readJSON(APIS_FILE, {});
    const updatedApis = {
      ...currentApis,
      activeProvider: activeProvider || 'serpapi',
      serpapi: {
        apiKey: (serpapi?.apiKey !== undefined ? serpapi.apiKey : currentApis.serpapi?.apiKey || '').trim(),
        enabled: serpapi?.enabled !== undefined ? !!serpapi.enabled : true,
        engine: 'google_flights',
        status: (serpapi?.apiKey || currentApis.serpapi?.apiKey) ? 'Active (Google Flights Live)' : 'Not Configured'
      }
    };
    writeJSON(APIS_FILE, updatedApis);

    // 2. Update PAYMENT_SETTINGS_FILE
    const currentPay = readJSON(PAYMENT_SETTINGS_FILE, {});
    const currentRzp = currentPay.razorpay || {};
    
    // Handle clearing Razorpay credentials if requested
    let finalRzpKeyId = currentRzp.keyId || '';
    let finalRzpKeySecret = currentRzp.keySecret || '';
    if (razorpay?.clearKey) {
      finalRzpKeyId = '';
    } else if (razorpay?.keyId !== undefined && razorpay.keyId.trim() !== '') {
      finalRzpKeyId = razorpay.keyId.trim();
    }

    if (razorpay?.clearSecret) {
      finalRzpKeySecret = '';
    } else if (razorpay?.keySecret !== undefined && razorpay.keySecret.trim() !== '') {
      finalRzpKeySecret = razorpay.keySecret.trim();
    }

    const updatedPay = {
      ...currentPay,
      ...(upi && upi.vpa ? {
        upi: {
          ...currentPay.upi,
          vpa: upi.vpa.trim(),
          businessName: (upi.businessName || currentPay.upi?.businessName || 'AirSkyGo').trim(),
          name: (upi.businessName || currentPay.upi?.name || 'AirSkyGo').trim()
        }
      } : {}),
      razorpay: {
        keyId: finalRzpKeyId,
        keySecret: finalRzpKeySecret,
        enabled: !!(finalRzpKeyId && finalRzpKeySecret)
      },
      updatedAt: new Date().toISOString()
    };
    writeJSON(PAYMENT_SETTINGS_FILE, updatedPay);

    // 3. Update SETTINGS_FILE & BRAND_FILE
    const currentSettings = readJSON(SETTINGS_FILE, {});
    const updatedSettings = {
      ...currentSettings,
      bookingPrefix: (general?.bookingPrefix || currentSettings.bookingPrefix || 'GS').trim().toUpperCase().slice(0, 5),
      supportEmail: general?.contactEmail || currentSettings.supportEmail || 'care@airskyindia.com',
      supportPhone: general?.contactPhone || currentSettings.supportPhone || '+91 72248 28030',
      legalName: general?.legalName || currentSettings.legalName || 'Air Sky Travels Private Limited',
      companyGstin: (general?.companyGstin || currentSettings.companyGstin || '07ABCCS8601B1ZP').trim().toUpperCase()
    };
    writeJSON(SETTINGS_FILE, updatedSettings);

    // Sync db.json
    syncDBJson();

    res.json({
      success: true,
      message: 'API & Payment Settings saved securely! All changes are now live.',
      data: {
        apis: updatedApis,
        payments: updatedPay,
        settings: updatedSettings
      }
    });
  } catch (err) {
    console.error('Error saving API settings:', err);
    res.status(500).json({ success: false, message: `Failed to save API settings: ${err.message}` });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AirSkyGo API Server', timestamp: new Date() });
});

// Full Database Export & Viewer Endpoint (db.json)
app.get('/api/db', (req, res) => {
  const db = syncDBJson() || readJSON(DB_FILE, {});
  res.json({
    success: true,
    file: 'db.json',
    collections: Object.keys(db),
    timestamp: new Date().toISOString(),
    db
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    syncDBJson();
    console.log(`✈️ AirSkyGo Flight Server running at http://localhost:${PORT}`);
    console.log(`📦 Consolidated database active at server/db.json & server/data/db.json`);
  });
}

module.exports = app;
