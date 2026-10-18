# ✈️ AirSkyGo - Next-Gen Flight Booking Portal

AirSkyGo is a full-stack, real-time flight booking web platform inspired by **Ixigo** and **Cleartrip**. Built with **React (Vite, JSX)** and **Node.js Express** with an interactive seat picker, live radar telemetry, mock payment gateway (UPI QR, Cards, NetBanking), downloadable E-Tickets, and a **Full Working Admin Panel**.

---

## 🌟 Key Features

### 🛫 Flight Search & Booking (Ixigo & Cleartrip Style)
- **One-Way & Round-Trip** flight search.
- **Auto-Suggest Airports**: Major Indian & International hubs (DEL, BOM, BLR, GOI, DXB, CCU, HYD, MAA, AMD, etc.).
- **Lowest Fare Trend Calendar**: Real-time cheapest day indicator with instant date switching.
- **Comprehensive Filters**:
  - Filter by stops (Non-stop, 1 Stop).
  - Filter by Airlines (IndiGo, Air India, Vistara, Akasa Air, SpiceJet, Emirates) with count and min price.
  - Departure time slots (Early Morning, Morning, Afternoon, Night).
  - Interactive price range slider.
- **Sorting Options**: Cheapest first, Fastest, Earliest departure.
- **Fare Families**: Saver, Flexi Plus, AirSky VIP with baggage and meal rules.

### 💺 Interactive Aircraft Seat Map
- Authentic aircraft fuselage visualizer with cockpit, wings, and exit doors.
- Rows 1-24 with 3x3 layout (A, B, C | aisle | D, E, F).
- Extra legroom rows (+₹350), Business/Row 1 (+₹600), and free standard seats.
- Dynamic multi-passenger seat assignment with live fee calculation.

### 💳 Advance Payment Gateway Simulation
- **UPI Mode**: Live QR Code generator with animated scanner line and auto-fill buttons (GPay, PhonePe, Paytm).
- **Credit / Debit Card**: Live interactive animated card with automatic formatters.
- **NetBanking**: Major banks (HDFC, SBI, ICICI, Axis).
- **Promo Codes**:
  - `AIRSKY500` - Flat ₹500 discount
  - `FLYHIGH` - 10% discount up to ₹1,500
  - `IXIGO50` - ₹750 instant off

### 🎫 Instant PNR & Boarding Pass / E-Ticket
- Generates unique airline PNR (e.g. `ASG-782194`).
- Confetti celebration upon successful booking.
- Perforated authentic digital boarding pass with scannable barcode.
- **Print & Download PDF E-Ticket** directly from browser.

### 📡 Real-Time Flight Radar & Live Telemetry
- Track flights by flight number (e.g. `6E-2041`, `AI-805`) or route (`DEL-BOM`).
- Animated flight progression along route.
- Live Altitude, Ground Speed, Departure Gate, and Arrival Baggage Belt.

### 👤 Manage My Bookings & Web Check-In
- Search bookings by PNR or email.
- Web Check-In feature (assigns boarding pass sequence & gate).
- Instant cancellation with automated refund calculation.

### 🛡️ Full Working Admin Panel
- **Analytics Dashboard**: Total Revenue (₹), Total Bookings count, Active Flights, Total Passengers, and Airline Revenue breakdown.
- **Flight Operations**:
  - Add new flight routes with route airports, departure/arrival times, aircraft model, and pricing.
  - Delete or cancel scheduled flights.
- **Bookings Management**: Real-time customer reservation stream with live status updates.

---

## 🚀 How to Run the Project

### 1. Start the Backend Server (Port 5000)
```bash
cd server
node server.js
```

### 2. Start the Frontend Client (Port 5173)
```bash
cd client
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React Icons, Canvas Confetti.
- **Backend**: Node.js, Express, REST APIs, JSON data storage.
