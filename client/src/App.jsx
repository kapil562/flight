import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import ServiceTabs from './components/ServiceTabs';
import HeroSearch from './components/HeroSearch';
import FlightList from './components/FlightList';
import HotelSection from './components/HotelSection';
import HolidaysSection from './components/HolidaysSection';
import TrainSection from './components/TrainSection';
import VisaSection from './components/VisaSection';
import SeatSelectionModal from './components/SeatSelectionModal';
import BookingCheckoutModal from './components/BookingCheckoutModal';
import TicketConfirmationModal from './components/TicketConfirmationModal';
import MyBookingsModal from './components/MyBookingsModal';
import QuickPnrModal from './components/QuickPnrModal';
import WebCheckInModal from './components/WebCheckInModal';
import WhatsAppSupportButton from './components/WhatsAppSupportButton';
import Footer from './components/Footer';
import OffersSection from './components/OffersSection';
import WhyBookSection from './components/WhyBookSection';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import { api } from './utils/api';
import defaultAirports from './data/airports.json';

function MainWebsite() {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState('flights'); // 'flights' | 'hotels' | 'holidays' | 'trains' | 'visa'
  const [settings, setSettings] = useState({
    siteName: 'AirSkyGo',
    siteTagline: 'Premium Luxury Travel',
    currency: '₹',
    currencyCode: 'INR',
    announcement: { enabled: true, text: '🎉 Special Festive Sale: Get Flat ₹500 OFF with code AIRSKY500!' }
  });
  const [airports, setAirports] = useState(defaultAirports || []);
  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [multiCityLegsData, setMultiCityLegsData] = useState(null);
  const [roundTripData, setRoundTripData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Quick PNR & Web Check-In Modals
  const [quickPnrOpen, setQuickPnrOpen] = useState(false);
  const [webCheckInOpen, setWebCheckInOpen] = useState(false);

  // Search parameters for Flights
  const [searchParams, setSearchParams] = useState({
    tripType: 'oneWay',
    from: '',
    to: '',
    date: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    travelClass: 'economy',
    passengers: { adults: 1, children: 0, infants: 0 }
  });

  // Modals state
  const [seatModalData, setSeatModalData] = useState(null);
  const [checkoutModalData, setCheckoutModalData] = useState(null);
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [brand, setBrand] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_brand');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load site settings, airports & brand identity initially
  const loadInitialData = async () => {
    try {
      const [settingsRes, airportsRes, brandRes] = await Promise.all([
        api.getSettings(),
        api.getAirports(),
        api.getBrand().catch(() => ({ success: false }))
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
        try { localStorage.setItem('asg_settings', JSON.stringify(settingsRes.data)); } catch (e) {}
        if (settingsRes.data.brand) {
          setBrand(settingsRes.data.brand);
          try { localStorage.setItem('asg_brand', JSON.stringify(settingsRes.data.brand)); } catch (e) {}
        }
      }
      if (brandRes && brandRes.success && brandRes.data) {
        setBrand(brandRes.data);
        try { localStorage.setItem('asg_brand', JSON.stringify(brandRes.data)); } catch (e) {}
      }
      if (airportsRes && airportsRes.success && Array.isArray(airportsRes.data) && airportsRes.data.length > 0) {
        setAirports(airportsRes.data);
      }
    } catch (err) {
      console.error('Error fetching initial configuration', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    const handleBrandUpdate = (e) => {
      if (e.detail) {
        setBrand(e.detail);
        if (e.detail.enabledServices) {
          setSettings(prev => ({ ...(prev || {}), enabledServices: e.detail.enabledServices }));
        }
      } else {
        try {
          const saved = localStorage.getItem('asg_brand');
          if (saved) setBrand(JSON.parse(saved));
          const savedSettings = localStorage.getItem('asg_settings');
          if (savedSettings) setSettings(JSON.parse(savedSettings));
        } catch {}
      }
    };
    window.addEventListener('asg_brand_updated', handleBrandUpdate);
    return () => window.removeEventListener('asg_brand_updated', handleBrandUpdate);
  }, []);

  // Synchronize dynamic brand styling & CSS root variables across whole application
  useEffect(() => {
    if (brand) {
      if (brand.primary_color) document.documentElement.style.setProperty('--brand', brand.primary_color);
      if (brand.hover_color) document.documentElement.style.setProperty('--brand-hover', brand.hover_color);
      if (brand.dark_color) document.documentElement.style.setProperty('--brand-dark', brand.dark_color);
      if (brand.light_color) document.documentElement.style.setProperty('--brand-light', brand.light_color);
      if (brand.brand_text_color) document.documentElement.style.setProperty('--brand-text', brand.brand_text_color);
      if (brand.tagline_color) document.documentElement.style.setProperty('--tagline-color', brand.tagline_color);
      
      if (brand.name) {
        document.title = `${brand.name} - ${brand.tagline || 'Premium Luxury Travel'}`;
      }
      window.__BRAND__ = brand;
    }
  }, [brand]);

  // Synchronize dynamic theme fallback
  useEffect(() => {
    const activeTheme = settings?.theme || localStorage.getItem('asg_theme') || 'sky';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [settings?.theme]);

  // Fetch flights when searchParams change (handles One Way, Round Trip & Multi-City)
  const executeFlightSearch = async (params) => {
    setLoadingFlights(true);
    try {
      if (params.tripType === 'multiCity' && params.legs && params.legs.length > 0) {
        setRoundTripData(null);
        const legQueries = params.legs.map(leg => 
          api.searchFlights({ from: leg.from, to: leg.to, date: leg.date })
        );
        const legResults = await Promise.all(legQueries);
        const legsStructured = legResults.map((res, idx) => ({
          legIndex: idx,
          from: params.legs[idx].from,
          to: params.legs[idx].to,
          date: params.legs[idx].date,
          flights: res?.success && Array.isArray(res.data) ? res.data : []
        }));
        setMultiCityLegsData(legsStructured);
        setFlights(legsStructured[0]?.flights || []);
      } else if (params.tripType === 'roundTrip') {
        setMultiCityLegsData(null);
        const returnDateToUse = params.returnDate || params.date;
        const [onwardRes, returnRes] = await Promise.all([
          api.searchFlights({
            from: params.from,
            to: params.to,
            date: params.date
          }),
          api.searchFlights({
            from: params.to,
            to: params.from,
            date: returnDateToUse
          })
        ]);

        const onwardFlights = onwardRes?.success && Array.isArray(onwardRes.data) ? onwardRes.data : [];
        const returnFlights = returnRes?.success && Array.isArray(returnRes.data) ? returnRes.data : [];

        setRoundTripData({
          onward: onwardFlights,
          return: returnFlights,
          departureDate: params.date,
          returnDate: returnDateToUse,
          from: params.from,
          to: params.to
        });
        setFlights(onwardFlights);
      } else {
        setRoundTripData(null);
        setMultiCityLegsData(null);
        const res = await api.searchFlights({
          from: params.from,
          to: params.to,
          date: params.date
        });
        if (res.success) {
          setFlights(res.data);
        }
      }
    } catch (err) {
      console.error('Error fetching flights', err);
    } finally {
      setLoadingFlights(false);
    }
  };

  useEffect(() => {
    if (activeService === 'flights' && hasSearched && (searchParams.tripType === 'multiCity' || (searchParams.from && searchParams.to))) {
      executeFlightSearch(searchParams);
    }
  }, [
    searchParams.from, 
    searchParams.to, 
    searchParams.date, 
    searchParams.returnDate,
    searchParams.tripType, 
    JSON.stringify(searchParams.legs || []),
    activeService,
    hasSearched
  ]);

  // Handle Search submit from Hero
  const handleHeroSearch = (newParams) => {
    const updated = { ...searchParams, ...newParams };
    setSearchParams(updated);
    setActiveService('flights');
    setHasSearched(true);
    executeFlightSearch(updated);

    // Smooth scroll down to the flight results section
    setTimeout(() => {
      const el = document.getElementById('flight-results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Handle Date change from Price Calendar
  const handleDateChange = (newDate) => {
    setSearchParams(prev => ({ ...prev, date: newDate }));
  };

  // Step 1: User clicks "Book Now" -> Opens Checkout Modal DIRECTLY (Seat option upfront blocked nahi hoga)
  const handleInitiateBooking = (flight, currentPrice, initialFareTier = 'saver', initialCoupon = '') => {
    const totalPax = (searchParams.passengers?.adults || 1) + (searchParams.passengers?.children || 0);

    setCheckoutModalData({
      flight,
      currentPrice,
      travelClass: searchParams.travelClass,
      selectedSeats: [],
      passengersCount: totalPax,
      initialCoupon: initialCoupon || '',
      initialFareTier: initialFareTier || 'saver'
    });
  };

  // Seats confirmed (if accessed optionally) -> Opens Checkout Modal
  const handleSeatsConfirmed = (selectedSeats) => {
    if (!seatModalData) return;
    const { flight, currentPrice, travelClass, passengersCount, initialCoupon } = seatModalData;
    setSeatModalData(null);
    setCheckoutModalData({
      flight,
      currentPrice,
      travelClass,
      selectedSeats,
      passengersCount,
      initialCoupon: initialCoupon || ''
    });
  };

  // Step 3: Payment success -> Show Confirmed Ticket Modal
  const handleBookingSuccess = (booking) => {
    setCheckoutModalData(null);
    setTicketModalBooking(booking);
    executeFlightSearch(searchParams);
  };

  // User auth actions
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('asg_user');
    setCurrentUser(null);
  };

  const currentEnabledServices = settings?.enabledServices || brand?.enabledServices || {
    flights: true,
    hotels: true,
    holidays: true,
    trains: false, // Default: OFF as requested
    visa: true,
    checkin: true,
    pnr: true
  };

  useEffect(() => {
    if (activeService && currentEnabledServices[activeService] === false) {
      setActiveService('flights');
    }
  }, [activeService, currentEnabledServices]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-full overflow-x-hidden">
      
      {/* Customer Navigation Bar (No admin buttons, toll-free support, full navigation) */}
      <Navbar
        settings={settings}
        brand={brand}
        activeService={activeService}
        onSelectService={setActiveService}
        onOpenQuickPnr={() => setQuickPnrOpen(true)}
        onOpenWebCheckIn={() => setWebCheckInOpen(true)}
        onOpenMyBookings={() => setMyBookingsOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Moyatri-Style Multi-Service Switcher Tabs */}
      <div className="pt-2 sm:pt-4 relative z-40">
        <ServiceTabs
          activeService={activeService}
          onSelectService={setActiveService}
          onOpenQuickPnr={() => setQuickPnrOpen(true)}
          onOpenWebCheckIn={() => setWebCheckInOpen(true)}
          settings={settings}
          brand={brand}
        />
      </div>

      {/* Main Content Area with bottom safe padding on mobile */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-12">
        {activeService === 'flights' && currentEnabledServices.flights !== false && (
          <>
            {/* Hero Search Section */}
            <HeroSearch
              settings={settings}
              brand={brand}
              airports={airports}
              onSearch={handleHeroSearch}
              searchParams={searchParams}
            />

            {/* Flight Search Results & Dynamic Filters - Shown only after user clicks Search */}
            {hasSearched && (
              <div id="flight-results-section" className="scroll-mt-6">
                <FlightList
                  flights={flights}
                  loading={loadingFlights}
                  searchParams={searchParams}
                  multiCityLegsData={multiCityLegsData}
                  roundTripData={roundTripData}
                  airports={airports}
                  onDateChange={handleDateChange}
                  onBookFlight={handleInitiateBooking}
                  brand={brand}
                />
              </div>
            )}
          </>
        )}

        {activeService === 'hotels' && currentEnabledServices.hotels !== false && (
          <>
            <HotelSection />
            <OffersSection />
          </>
        )}

        {activeService === 'holidays' && currentEnabledServices.holidays !== false && (
          <>
            <HolidaysSection />
            <OffersSection />
          </>
        )}

        {activeService === 'trains' && currentEnabledServices.trains === true && (
          <>
            <TrainSection />
            <OffersSection />
          </>
        )}

        {activeService === 'visa' && currentEnabledServices.visa !== false && (
          <>
            <VisaSection />
            <OffersSection />
          </>
        )}

        {/* Why Book With Us & Trust Indicators */}
        <WhyBookSection />
      </main>

      {/* Footer */}
      <Footer
        brand={brand}
        settings={settings}
        onSelectRoute={(from, to) => {
          setSearchParams(p => ({ ...p, from, to }));
          setActiveService('flights');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 24x7 Floating WhatsApp & Helpline Support Widget */}
      <WhatsAppSupportButton
        onOpenQuickPnr={() => setQuickPnrOpen(true)}
        onOpenWebCheckIn={() => setWebCheckInOpen(true)}
        brand={brand}
      />

      {/* Mobile Sticky Bottom Navigation Bar (MakeMyTrip / Ixigo pattern) */}
      <BottomNav
        activeService={activeService}
        onSelectService={setActiveService}
        onOpenMyBookings={() => setMyBookingsOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        currentUser={currentUser}
        settings={settings}
        brand={brand}
      />

      <AnimatePresence>
        {/* Quick PNR Checker Modal */}
        {quickPnrOpen && (
          <QuickPnrModal
            key="quick-pnr-modal"
            isOpen={quickPnrOpen}
            onClose={() => setQuickPnrOpen(false)}
            onOpenTicket={(b) => {
              setQuickPnrOpen(false);
              setTicketModalBooking(b);
            }}
          />
        )}

        {/* 1-Click Airline Web Check-In Modal */}
        {webCheckInOpen && (
          <WebCheckInModal
            key="web-checkin-modal"
            isOpen={webCheckInOpen}
            onClose={() => setWebCheckInOpen(false)}
          />
        )}

        {/* MODAL 1: Interactive Aircraft Seat Selector */}
        {seatModalData && (
          <SeatSelectionModal
            key="seat-modal"
            flight={seatModalData.flight}
            passengersCount={seatModalData.passengersCount}
            onClose={() => setSeatModalData(null)}
            onConfirmSeats={handleSeatsConfirmed}
          />
        )}

        {/* MODAL 2: Passenger Details & Advance Payment Gateway */}
        {checkoutModalData && (
          <BookingCheckoutModal
            key="checkout-modal"
            flight={checkoutModalData.flight}
            currentPrice={checkoutModalData.currentPrice}
            travelClass={checkoutModalData.travelClass}
            selectedSeats={checkoutModalData.selectedSeats}
            passengersCount={checkoutModalData.passengersCount}
            initialCoupon={checkoutModalData.initialCoupon || ''}
            initialFareTier={checkoutModalData.initialFareTier || 'saver'}
            onClose={() => setCheckoutModalData(null)}
            onBookingSuccess={handleBookingSuccess}
            brand={brand}
          />
        )}

        {/* MODAL 3: Ticket Confirmation with Print & PDF Download */}
        {ticketModalBooking && (
          <TicketConfirmationModal
            key="ticket-modal"
            booking={ticketModalBooking}
            brand={brand}
            onClose={() => setTicketModalBooking(null)}
            onOpenMyBookings={() => {
              setTicketModalBooking(null);
              setMyBookingsOpen(true);
            }}
          />
        )}

        {/* MODAL 4: User Dashboard / Manage Bookings */}
        {myBookingsOpen && (
          <MyBookingsModal
            key="bookings-modal"
            onClose={() => setMyBookingsOpen(false)}
            onSelectTicket={(b) => {
              setMyBookingsOpen(false);
              setTicketModalBooking(b);
            }}
          />
        )}

        {/* MODAL 5: Animated Aviation Login / Sign Up */}
        {authModalOpen && (
          <AuthModal
            key="auth-modal"
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/terms-and-conditions" element={<TermsPage />} />
      <Route path="*" element={<MainWebsite />} />
    </Routes>
  );
}
