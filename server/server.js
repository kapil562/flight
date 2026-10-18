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

// Schedule Templates for full daily flight coverage (16 flights per route)
const getDomesticFlightSlots = (fromAirport, toAirport, date) => {
  return [
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A320neo', dep: '05:45', arr: '08:00', dur: '2h 15m', stops: 0, defaultBase: 3890, flightNo: '6E-2041', meal: false },
    { airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Airbus A320neo', dep: '06:30', arr: '08:45', dur: '2h 15m', stops: 0, defaultBase: 4490, flightNo: 'AI-805', meal: true },
    { airline: 'Akasa Air', code: 'QP', color: '#FF5900', aircraft: 'Boeing 737 MAX 8', dep: '07:15', arr: '09:25', dur: '2h 10m', stops: 0, defaultBase: 3690, flightNo: 'QP-1102', meal: false },
    { airline: 'Vistara', code: 'UK', color: '#5C0632', aircraft: 'Airbus A321neo', dep: '08:00', arr: '10:15', dur: '2h 15m', stops: 0, defaultBase: 5190, flightNo: 'UK-995', meal: true },
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A321neo', dep: '09:10', arr: '11:25', dur: '2h 15m', stops: 0, defaultBase: 4290, flightNo: '6E-5012', meal: false },
    { airline: 'SpiceJet', code: 'SG', color: '#EE3124', aircraft: 'Boeing 737-800', dep: '10:25', arr: '12:40', dur: '2h 15m', stops: 0, defaultBase: 3450, flightNo: 'SG-8169', meal: false },
    { airline: 'Air India Express', code: 'IX', color: '#E04006', aircraft: 'Boeing 737 MAX 8', dep: '11:40', arr: '13:55', dur: '2h 15m', stops: 0, defaultBase: 3790, flightNo: 'IX-1142', meal: false },
    { airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Boeing 777-300ER', dep: '13:00', arr: '15:15', dur: '2h 15m', stops: 0, defaultBase: 4790, flightNo: 'AI-865', meal: true },
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A320neo', dep: '14:20', arr: '16:35', dur: '2h 15m', stops: 0, defaultBase: 4150, flightNo: '6E-2134', meal: false },
    { airline: 'Akasa Air', code: 'QP', color: '#FF5900', aircraft: 'Boeing 737 MAX 8', dep: '15:35', arr: '17:50', dur: '2h 15m', stops: 0, defaultBase: 3950, flightNo: 'QP-1384', meal: false },
    { airline: 'Vistara', code: 'UK', color: '#5C0632', aircraft: 'Airbus A321neo', dep: '16:15', arr: '20:45', dur: '4h 30m', stops: 1, layover: 'Direct / 1-Stop via Jaipur', defaultBase: 5390, flightNo: 'UK-927', meal: true },
    { airline: 'SpiceJet', code: 'SG', color: '#EE3124', aircraft: 'Boeing 737-800', dep: '17:45', arr: '20:00', dur: '2h 15m', stops: 0, defaultBase: 3650, flightNo: 'SG-8703', meal: false },
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A321neo', dep: '19:10', arr: '21:25', dur: '2h 15m', stops: 0, defaultBase: 4690, flightNo: '6E-6125', meal: false },
    { airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Airbus A320neo', dep: '20:30', arr: '22:45', dur: '2h 15m', stops: 0, defaultBase: 4990, flightNo: 'AI-887', meal: true },
    { airline: 'Vistara', code: 'UK', color: '#5C0632', aircraft: 'Airbus A320neo', dep: '21:45', arr: '23:55', dur: '2h 10m', stops: 0, defaultBase: 5290, flightNo: 'UK-981', meal: true },
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A320neo', dep: '23:00', arr: '01:15', dur: '2h 15m', stops: 0, defaultBase: 3790, flightNo: '6E-205', meal: false }
  ];
};

const getIntlFlightSlots = (fromAirport, toAirport, date) => {
  return [
    { airline: 'Emirates', code: 'EK', color: '#D71921', aircraft: 'Boeing 777-300ER', dep: '04:15', arr: '06:45', dur: '3h 45m', stops: 0, defaultBase: 21500, flightNo: 'EK-511', meal: true },
    { airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Boeing 787-8 Dreamliner', dep: '06:30', arr: '08:50', dur: '3h 50m', stops: 0, defaultBase: 18500, flightNo: 'AI-995', meal: true },
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A321neo', dep: '07:45', arr: '10:05', dur: '3h 50m', stops: 0, defaultBase: 13900, flightNo: '6E-1451', meal: false },
    { airline: 'Qatar Airways', code: 'QR', color: '#5C0632', aircraft: 'Airbus A350-900', dep: '09:15', arr: '11:35', dur: '3h 50m', stops: 0, defaultBase: 23200, flightNo: 'QR-571', meal: true },
    { airline: 'Singapore Airlines', code: 'SQ', color: '#00266B', aircraft: 'Boeing 787-10', dep: '11:00', arr: '13:20', dur: '3h 50m', stops: 0, defaultBase: 24900, flightNo: 'SQ-401', meal: true },
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A321neo', dep: '13:10', arr: '15:30', dur: '3h 50m', stops: 0, defaultBase: 14500, flightNo: '6E-1485', meal: false },
    { airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Airbus A320neo', dep: '15:20', arr: '17:40', dur: '3h 50m', stops: 0, defaultBase: 19200, flightNo: 'AI-917', meal: true },
    { airline: 'Emirates', code: 'EK', color: '#D71921', aircraft: 'Airbus A380-800', dep: '17:30', arr: '19:50', dur: '3h 50m', stops: 0, defaultBase: 23900, flightNo: 'EK-517', meal: true },
    { airline: 'Qatar Airways', code: 'QR', color: '#5C0632', aircraft: 'Boeing 777-300ER', dep: '19:15', arr: '23:45', dur: '5h 15m', stops: 1, layover: 'DOH 1h Layover', defaultBase: 21800, flightNo: 'QR-579', meal: true },
    { airline: 'IndiGo', code: '6E', color: '#002B7F', aircraft: 'Airbus A321neo', dep: '20:45', arr: '23:05', dur: '3h 50m', stops: 0, defaultBase: 15200, flightNo: '6E-1499', meal: false },
    { airline: 'Air India', code: 'AI', color: '#E21836', aircraft: 'Boeing 787-8 Dreamliner', dep: '22:15', arr: '00:35', dur: '3h 50m', stops: 0, defaultBase: 18900, flightNo: 'AI-921', meal: true },
    { airline: 'Etihad Airways', code: 'EY', color: '#D4AF37', aircraft: 'Boeing 787-9', dep: '23:40', arr: '02:00', dur: '3h 50m', stops: 0, defaultBase: 22400, flightNo: 'EY-215', meal: true }
  ];
};

// Generate realistic flights if custom route searched (Supports Domestic & Worldwide International)
const generateDynamicFlights = (from, to, date) => {
  const airports = readJSON(AIRPORTS_FILE);
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

  const slots = isIntl ? getIntlFlightSlots(fromAirport, toAirport, date) : getDomesticFlightSlots(fromAirport, toAirport, date);

  return slots.map((slot, index) => {
    const basePrice = slot.defaultBase + (index * 60);
    return {
      id: `LIVE-${from}-${to}-${index + 1}`,
      flightNumber: slot.flightNo || `${slot.code}-${Math.floor(1000 + Math.random() * 8999)}`,
      airline: slot.airline,
      airlineCode: slot.code,
      airlineColor: slot.color,
      from: fromAirport.code,
      to: toAirport.code,
      fromCity: fromAirport.city,
      toCity: toAirport.city,
      departureTime: slot.dep,
      arrivalTime: slot.arr,
      duration: slot.dur,
      stops: slot.stops,
      layoverCity: slot.layover || null,
      aircraft: slot.aircraft,
      basePrice: basePrice,
      classes: {
        economy: basePrice,
        premiumEconomy: Math.round(basePrice * 1.45),
        business: Math.round(basePrice * 2.8)
      },
      seatsTotal: 180,
      seatsAvailable: Math.floor(35 + Math.random() * 80),
      baggage: isIntl ? 'Cabin: 7 kg, Check-in: 30 kg' : 'Cabin: 7 kg, Check-in: 15 kg',
      mealIncluded: !!slot.meal,
      refundable: true,
      status: 'On-Time',
      terminal: { from: 'T1D / T3', to: 'T2 / T3' },
      source: 'AirSkyGo Real-Time Aviation Engine'
    };
  });
};

// Fetch real flights via Serper Google Search
const fetchFlightsFromSerper = async (from, to, date, apiKey) => {
  try {
    const airports = readJSON(AIRPORTS_FILE);
    const fromAirport = airports.find(a => a.code.toUpperCase() === from.toUpperCase()) || { code: from.toUpperCase(), city: from.toUpperCase() };
    const toAirport = airports.find(a => a.code.toUpperCase() === to.toUpperCase()) || { code: to.toUpperCase(), city: to.toUpperCase() };

    const query = `flights from ${fromAirport.city} (${fromAirport.code}) to ${toAirport.city} (${toAirport.code}) ${date || ''} air ticket price`;
    console.log(`🔍 [Serper Live Query] Fetching Google real flight data for: ${query}`);

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query, gl: 'in', hl: 'en' })
    });

    if (!response.ok) {
      console.warn('Serper API returned status', response.status);
      return null;
    }

    const json = await response.json();
    const textCorpus = JSON.stringify(json);

    // Parse all real prices found in Google Search snippets
    const priceMatches = [...textCorpus.matchAll(/(?:₹|Rs\.?\s?|INR\s?)(\d[\d,]+)/gi)];
    const extractedPrices = priceMatches
      .map(m => parseInt(m[1].replace(/,/g, '')))
      .filter(p => p >= 1800 && p <= 120000)
      .sort((a, b) => a - b);

    // Parse real flight codes from Google search snippets
    const flightCodeMatches = [...textCorpus.matchAll(/\b(6E|AI|UK|QP|SG|IX|EK|QR|BA|SQ|EY|TG)[-\s]?(\d{3,4})\b/gi)]
      .map(m => `${m[1].toUpperCase()}-${m[2]}`);

    const isIntl = ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'DOH', 'AUH', 'KUL', 'KTM'].includes(from.toUpperCase()) || 
                   ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'DOH', 'AUH', 'KUL', 'KTM'].includes(to.toUpperCase());

    const slots = isIntl ? getIntlFlightSlots(fromAirport, toAirport, date) : getDomesticFlightSlots(fromAirport, toAirport, date);

    const parsedFlights = slots.map((slot, index) => {
      // Use real Google scraped price if available, else standard realistic base
      let computedPrice = slot.defaultBase;
      if (extractedPrices.length > 0) {
        computedPrice = extractedPrices[index % extractedPrices.length] || (extractedPrices[0] + (index * 150));
      }

      // Use real flight code if detected for this airline
      const realFlightNo = flightCodeMatches.find(code => code.startsWith(slot.code)) || 
                           slot.flightNo ||
                           `${slot.code}-${Math.floor(2000 + Math.random() * 7000)}`;

      return {
        id: `SERPER-${from}-${to}-${index + 1}`,
        flightNumber: realFlightNo,
        airline: slot.airline,
        airlineCode: slot.code,
        airlineColor: slot.color,
        from: fromAirport.code,
        to: toAirport.code,
        fromCity: fromAirport.city,
        toCity: toAirport.city,
        departureTime: slot.dep,
        arrivalTime: slot.arr,
        duration: slot.dur,
        stops: slot.stops,
        layoverCity: slot.layover || null,
        aircraft: slot.aircraft,
        basePrice: computedPrice,
        classes: {
          economy: computedPrice,
          premiumEconomy: Math.round(computedPrice * 1.4),
          business: Math.round(computedPrice * 2.6)
        },
        seatsTotal: 180,
        seatsAvailable: Math.floor(25 + Math.random() * 70),
        baggage: isIntl ? 'Cabin: 7 kg, Check-in: 25-30 kg' : 'Cabin: 7 kg, Check-in: 15 kg',
        mealIncluded: !!slot.meal,
        refundable: true,
        status: 'On-Time',
        terminal: { from: 'T1D / T3', to: 'T2 / T3' },
        source: 'Google Flights (Live Serper)'
      };
    });

    return parsedFlights;
  } catch (err) {
    console.error('Error querying Serper API:', err);
    return null;
  }
};

// Fetch real hotels via Serper Google Places
const fetchHotelsFromSerper = async (city, apiKey) => {
  try {
    if (!city || !apiKey) return null;
    const cleanCity = city.trim();
    const query = `hotels in ${cleanCity}`;
    console.log(`🏨 [Serper Places] Fetching Google real hotels for: ${query}`);

    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query, gl: 'in', hl: 'en' })
    });

    if (!response.ok) {
      console.warn('Serper Places API returned status', response.status);
      return null;
    }

    const data = await response.json();
    if (!data.places || !Array.isArray(data.places) || data.places.length === 0) {
      return null;
    }

    const hotelPhotos = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80'
    ];

    const amenitiesList = [
      ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Complimentary Breakfast', 'Air Conditioning', '24/7 Room Service', 'Spa & Wellness'],
      ['Ocean/City View', 'Fine Dining Restaurant', 'Valet Parking', 'Free Wi-Fi', 'Airport Shuttle', 'Gym & Fitness'],
      ['Rooftop Lounge', 'Free Breakfast', 'Smart TV', 'Tea & Coffee Maker', 'Daily Housekeeping', 'Concierge Service'],
      ['Infinity Pool', 'Private Balcony', 'Mini Bar', 'Laundry Service', 'Express Check-In', 'Doctor on Call']
    ];

    const roomTypes = [
      'Deluxe King Room with Balcony',
      'Executive Premier Sea/City View Suite',
      'Royal Luxury Room with Breakfast',
      'Superior Double Room',
      'Club Suite with Lounge Access'
    ];

    const parsedHotels = data.places.map((place, idx) => {
      const rating = place.rating ? Number(place.rating.toFixed(1)) : 4.4;
      const stars = rating >= 4.6 ? 5 : rating >= 4.0 ? 4 : 3;

      let basePrice;
      if (stars === 5) {
        basePrice = Math.round((7500 + (rating * 850) + (idx * 350)) / 100) * 100;
      } else if (stars === 4) {
        basePrice = Math.round((4200 + (rating * 500) + (idx * 250)) / 100) * 100;
      } else {
        basePrice = Math.round((2400 + (rating * 300) + (idx * 150)) / 100) * 100;
      }

      const originalPrice = Math.round((basePrice * 1.25) / 100) * 100;
      const discount = Math.round(((originalPrice - basePrice) / originalPrice) * 100) + '% OFF';

      const badge = rating >= 4.7 ? '⭐ Top Rated Google Choice' :
                    rating >= 4.5 ? '✨ Luxury Moyatri Verified' :
                    rating >= 4.2 ? '🔥 Popular Pick' : '💡 Best Value Deal';

      const cleanTitle = (place.title || '').replace(/[\u{0080}-\u{FFFF}]/gu, '').trim() || place.title;

      return {
        id: `SERPER-HTL-${place.position || (idx + 1)}-${cleanCity.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
        name: cleanTitle,
        city: cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1).toLowerCase(),
        location: `${cleanTitle}, ${cleanCity}`,
        stars,
        rating,
        reviewsCount: place.ratingCount || Math.floor(250 + Math.random() * 850),
        image: hotelPhotos[idx % hotelPhotos.length],
        price: basePrice,
        originalPrice,
        discount,
        amenities: amenitiesList[idx % amenitiesList.length],
        badge,
        roomType: roomTypes[idx % roomTypes.length],
        source: 'Google Places (Live Serper API)',
        verified: true,
        latitude: place.latitude,
        longitude: place.longitude
      };
    });

    return parsedHotels;
  } catch (err) {
    console.error('Error querying Serper Places API:', err);
    return null;
  }
};

// Fetch real flights via SerpApi Google Flights
const fetchFlightsFromSerpApi = async (from, to, date, apiKey) => {
  if (!apiKey || !from || !to) return null;
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${encodeURIComponent(from)}&arrival_id=${encodeURIComponent(to)}&outbound_date=${encodeURIComponent(formattedDate)}&currency=INR&hl=en&api_key=${apiKey.trim()}`;
    console.log(`✈️ [SerpApi Google Flights] Querying: ${from} -> ${to} on ${formattedDate}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('SerpApi Google Flights returned status:', response.status);
      return null;
    }
    const data = await response.json();
    const flightResults = [...(data.best_flights || []), ...(data.other_flights || [])];
    if (!flightResults || flightResults.length === 0) return null;

    return flightResults.slice(0, 10).map((item, idx) => {
      const flightLeg = (item.flights && item.flights[0]) || {};
      const airlineName = flightLeg.airline || 'Air India';
      const flightNumber = flightLeg.flight_number || `AI-${100 + idx}`;
      const price = item.price || (4200 + idx * 350);
      return {
        id: `SERPAPI-${from}-${to}-${idx + 1}`,
        flightNumber,
        airline: airlineName,
        airlineCode: flightNumber.slice(0, 2) || 'AI',
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        fromCity: flightLeg.departure_airport?.name || from.toUpperCase(),
        toCity: flightLeg.arrival_airport?.name || to.toUpperCase(),
        departureTime: flightLeg.departure_airport?.time || '08:00',
        arrivalTime: flightLeg.arrival_airport?.time || '10:30',
        duration: item.total_duration ? `${Math.floor(item.total_duration / 60)}h ${item.total_duration % 60}m` : '2h 15m',
        basePrice: price,
        aircraft: flightLeg.airplane || 'Airbus A320neo',
        stops: item.flights?.length > 1 ? item.flights.length - 1 : 0,
        status: 'On-Time',
        source: 'Google Flights (Live SerpApi)'
      };
    });
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

// 1.1 Payment & UPI Gateway Settings
app.get('/api/payment-settings', (req, res) => {
  const settings = readJSON(PAYMENT_SETTINGS_FILE, {
    gatewayActive: true,
    paymentMode: 'manual',
    upi: {
      vpa: 'paytm.s2zbyoe@pty',
      name: 'Air Sky India',
      mcc: '5499'
    },
    methods: {
      upiQr: true,
      upiApps: true,
      card: true,
      netBanking: true
    },
    apps: {
      any: false,
      phonepe: true,
      gpay: true,
      paytm: true,
      bhim: true,
      other: false
    },
    deepLinks: {
      any: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      phonepe: 'phonepe://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      gpay: 'tez://upi/pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      paytm: 'paytmmp://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      bhim: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
      other: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02'
    },
    instructions: "1. Scan the QR code and pay the exact amount\n2. After payment, enter your 12-digit UPI Reference / UTR Number\n3. Click 'I Have Paid'\n4. Your ticket will be confirmed instantly once verified"
  });
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

// Hotels (Moyatri Style Worldwide & Domestic Accommodation)
app.get('/api/hotels', async (req, res) => {
  const { city } = req.query;
  const apisConfig = readJSON(APIS_FILE, {});
  const serperKey = apisConfig.serper?.apiKey || process.env.SERPER_API_KEY;

  if (city && city.trim()) {
    const q = city.trim();
    // Try live Serper Google Places first if enabled
    if ((apisConfig.activeProvider === 'serper' || apisConfig.serper?.enabled) && serperKey) {
      const serperHotels = await fetchHotelsFromSerper(q, serperKey);
      if (serperHotels && serperHotels.length > 0) {
        return res.json({
          success: true,
          count: serperHotels.length,
          data: serperHotels,
          source: 'Google Places (Live Serper API)'
        });
      }
    }

    // Fallback to local hotels.json
    const hotels = readJSON(HOTELS_FILE);
    const filtered = hotels.filter(h =>
      (h.city && h.city.toLowerCase().includes(q.toLowerCase())) ||
      (h.location && h.location.toLowerCase().includes(q.toLowerCase())) ||
      (h.name && h.name.toLowerCase().includes(q.toLowerCase()))
    );

    if (filtered.length > 0) {
      return res.json({ success: true, count: filtered.length, data: filtered, source: 'Local Database' });
    }

    // If query didn't match local database and Serper had no places, dynamically return realistic hotels for that city
    if (serperKey) {
      const fallbackList = hotels.map((h, i) => ({
        ...h,
        id: `HTL-GEN-${i + 1}-${q.toUpperCase()}`,
        city: q.charAt(0).toUpperCase() + q.slice(1),
        location: `${h.name}, ${q}`,
        source: 'Moyatri Travel Engine'
      }));
      return res.json({ success: true, count: fallbackList.length, data: fallbackList, source: 'Moyatri Travel Engine' });
    }

    return res.json({ success: true, count: filtered.length, data: filtered });
  }

  const hotels = readJSON(HOTELS_FILE);
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

// 4. Flights Search & Filter
app.get('/api/flights', async (req, res) => {
  const { from, to, date, stops, airline, sort, maxPrice } = req.query;
  const apisConfig = readJSON(APIS_FILE, {});
  let flights = [];
  let dataSource = 'Database / Local Engine';

  // Check if SerpApi Google Flights API is enabled
  const serpapiKey = apisConfig.serpapi?.apiKey || process.env.SERPAPI_KEY;
  if ((apisConfig.activeProvider === 'serpapi' || apisConfig.serpapi?.enabled) && serpapiKey && from && to) {
    const serpapiFlights = await fetchFlightsFromSerpApi(from, to, date, serpapiKey);
    if (serpapiFlights && serpapiFlights.length > 0) {
      flights = serpapiFlights;
      dataSource = 'Google Flights (SerpApi Real-Time)';
    }
  }

  // Check if Serper Google Search API is enabled (if flights not already found)
  const serperKey = apisConfig.serper?.apiKey || process.env.SERPER_API_KEY;
  if (flights.length === 0 && (apisConfig.activeProvider === 'serper' || apisConfig.serper?.enabled) && serperKey && from && to) {
    const serperFlights = await fetchFlightsFromSerper(from, to, date, serperKey);
    if (serperFlights && serperFlights.length > 0) {
      flights = serperFlights;
      dataSource = 'Google Serper Real-Time API';
    }
  }

  // Merge with custom flights from FLIGHTS_FILE or fallback to full schedule
  const allFlights = readJSON(FLIGHTS_FILE, []);
  if (from && to) {
    const matched = allFlights.filter(f => 
      f.from.toUpperCase() === from.toUpperCase() && 
      f.to.toUpperCase() === to.toUpperCase()
    ).map(f => ({ ...f, source: f.source || 'AirSkyGo Aviation Engine' }));

    if (flights.length > 0) {
      const flightNos = new Set(flights.map(f => f.flightNumber));
      const customToAdd = matched.filter(f => !flightNos.has(f.flightNumber));
      flights = [...customToAdd, ...flights];
    } else {
      const dynamicOnes = generateDynamicFlights(from.toUpperCase(), to.toUpperCase(), date);
      const flightNos = new Set(matched.map(f => f.flightNumber));
      const fillFromDynamic = dynamicOnes.filter(f => !flightNos.has(f.flightNumber));
      flights = [...matched, ...fillFromDynamic];
      dataSource = 'AirSkyGo Full Aviation Schedule';
    }
  } else {
    flights = allFlights.map(f => ({ ...f, source: f.source || 'AirSkyGo Aviation Engine' }));
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
    searchParams: { from, to, date },
    data: flights
  });
});

// 5. Single Flight by ID
app.get('/api/flights/:id', (req, res) => {
  const { id } = req.params;
  const flights = readJSON(FLIGHTS_FILE);
  let flight = flights.find(f => f.id === id);

  if (!flight && id.startsWith('DYN-')) {
    const parts = id.split('-');
    const dynFlights = generateDynamicFlights(parts[1], parts[2]);
    flight = dynFlights.find(f => f.id === id);
  }

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

    if (!flightId || passengers.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing flight details or passengers' });
    }

    const bookings = readJSON(BOOKINGS_FILE);
    const siteSettings = readJSON(SETTINGS_FILE, {});
    const prefix = (siteSettings.bookingPrefix || 'GS').trim().toUpperCase();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const pnr = `ASG-${randomSuffix}`;
    const bookingId = `${prefix}${randomSuffix}`;

    const newBooking = {
      pnr,
      bookingId,
      flightId,
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
      passengers,
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
        status: payment.status || (req.body.status === 'VERIFICATION_PENDING' ? 'Verification Pending' : 'Paid'),
        paidAt: new Date().toISOString(),
        paidToVpa: payment.paidToVpa || null
      },
      checkInStatus: req.body.status === 'VERIFICATION_PENDING' ? 'Pending Verification' : 'Eligible',
      status: req.body.status || 'CONFIRMED',
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
      booking: newBooking
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
  const { pnr } = req.params;
  const bookings = readJSON(BOOKINGS_FILE);
  const booking = bookings.find(b => b.pnr.toUpperCase() === pnr.toUpperCase());

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, data: booking });
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

// A2.1. Admin Save Payment & UPI Gateway Settings
app.post('/api/admin/payment-settings', (req, res) => {
  const current = readJSON(PAYMENT_SETTINGS_FILE, {});
  const updated = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeJSON(PAYMENT_SETTINGS_FILE, updated);
  res.json({
    success: true,
    message: 'Payment & UPI configuration saved securely! Live changes are now active.',
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
  const index = bookings.findIndex(b => b.pnr.toUpperCase() === pnr.toUpperCase());

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  bookings[index].status = status;
  writeJSON(BOOKINGS_FILE, bookings);

  res.json({ success: true, message: `Booking ${pnr} status updated to ${status}`, booking: bookings[index] });
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

app.post('/api/admin/apis/test-serper', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'Serper API key is required' });
  }

  try {
    const testRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: 'flights from Delhi to Mumbai', gl: 'in' })
    });

    if (testRes.ok) {
      const data = await testRes.json();
      return res.json({
        success: true,
        message: 'Serper API Connected Successfully! Google Search engine is active.',
        credits: data.credits || 'Active'
      });
    } else {
      const errText = await testRes.text();
      return res.status(400).json({
        success: false,
        message: `Serper API Error (${testRes.status}): ${errText || 'Invalid API Key'}`
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: `Connection failed: ${err.message}` });
  }
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

// A9.2 Integrated API & Payment Settings (Matches airskyindia.com/admin/settings)
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
        enabled: apis.serpapi?.enabled !== false
      },
      razorpay: {
        keyId: paymentSettings.razorpay?.keyId || '',
        keySecret: paymentSettings.razorpay?.keySecret || '',
        enabled: !!paymentSettings.razorpay?.enabled
      },
      upi: {
        vpa: paymentSettings.upi?.vpa || 'paytm.s2zbyoe@pty',
        businessName: paymentSettings.upi?.businessName || paymentSettings.upi?.name || brand.name || 'Air Sky India'
      },
      general: {
        bookingPrefix: siteSettings.bookingPrefix || 'GS',
        contactEmail: siteSettings.supportEmail || brand.email || 'care@airskyindia.com',
        contactPhone: siteSettings.supportPhone || brand.phone || '+91 72248 28030',
        legalName: siteSettings.legalName || 'Air Sky Travels Private Limited',
        companyGstin: siteSettings.companyGstin || '07ABCCS8601B1ZP'
      },
      // Extra APIs ("apna wala extra jo bhi ha")
      activeProvider: apis.activeProvider || 'serper',
      serper: {
        apiKey: apis.serper?.apiKey || '',
        enabled: apis.serper?.enabled !== false,
        status: apis.serper?.status || 'Active (Live Google Search)'
      },
      amadeus: {
        clientId: apis.amadeus?.clientId || '',
        clientSecret: apis.amadeus?.clientSecret || '',
        environment: apis.amadeus?.environment || 'test',
        enabled: !!apis.amadeus?.enabled,
        status: apis.amadeus?.status || 'Not Configured'
      },
      aviationStack: {
        accessKey: apis.aviationStack?.accessKey || '',
        enabled: !!apis.aviationStack?.enabled,
        status: apis.aviationStack?.status || 'Not Configured'
      }
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
      activeProvider,
      serper,
      amadeus,
      aviationStack
    } = req.body;

    // 1. Update APIS_FILE
    const currentApis = readJSON(APIS_FILE, {});
    const updatedApis = {
      ...currentApis,
      activeProvider: activeProvider || currentApis.activeProvider || 'serper',
      serpapi: {
        apiKey: (serpapi?.apiKey !== undefined ? serpapi.apiKey : currentApis.serpapi?.apiKey || '').trim(),
        enabled: serpapi?.enabled !== undefined ? !!serpapi.enabled : true,
        engine: 'google_flights',
        status: serpapi?.apiKey ? 'Configured (Google Flights)' : 'Not Configured'
      },
      serper: {
        apiKey: (serper?.apiKey !== undefined ? serper.apiKey : currentApis.serper?.apiKey || '').trim(),
        enabled: serper?.enabled !== undefined ? !!serper.enabled : true,
        engine: 'google_search',
        status: serper?.apiKey ? 'Active (Live Google Search)' : 'Not Configured'
      },
      amadeus: {
        clientId: (amadeus?.clientId !== undefined ? amadeus.clientId : currentApis.amadeus?.clientId || '').trim(),
        clientSecret: (amadeus?.clientSecret !== undefined ? amadeus.clientSecret : currentApis.amadeus?.clientSecret || '').trim(),
        environment: amadeus?.environment || currentApis.amadeus?.environment || 'test',
        enabled: amadeus?.enabled !== undefined ? !!amadeus.enabled : false,
        status: amadeus?.clientId ? 'Configured' : 'Not Configured'
      },
      aviationStack: {
        accessKey: (aviationStack?.accessKey !== undefined ? aviationStack.accessKey : currentApis.aviationStack?.accessKey || '').trim(),
        enabled: aviationStack?.enabled !== undefined ? !!aviationStack.enabled : false,
        status: aviationStack?.accessKey ? 'Configured' : 'Not Configured'
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
      upi: {
        ...currentPay.upi,
        vpa: upi?.vpa || currentPay.upi?.vpa || 'paytm.s2zbyoe@pty',
        businessName: upi?.businessName || currentPay.upi?.businessName || 'Air Sky India',
        name: upi?.businessName || currentPay.upi?.name || 'Air Sky India'
      },
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
