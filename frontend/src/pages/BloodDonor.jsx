import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  AlertCircle,
  Heart,
  Users,
  Clock,
  Search,
  MapPin,
  X,
  User,
  Calendar,
  Phone,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DonorCard from '@/components/cards/DonorCard';
import LocationSearch from '@/components/layout/LocationSearch';
import { getDonors, registerDonor } from '@/services/api';
import { BLOOD_GROUPS } from '@/utils/constants';
import { useLocation } from '@/context/LocationContext';

const ALL_GROUPS = ['All', ...(BLOOD_GROUPS || ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])];

const CITY_COORDS = {
  delhi: { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function BloodDonor() {
  const { coordinates, city, area } = useLocation();

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering]             = useState(false);
  const [formError, setFormError]                 = useState('');
  const [donorForm, setDonorForm] = useState({
    name: '',
    age: '',
    blood_group: 'O+',
    phone: '',
    city: '',
    area: '',
    availability: true,
    last_donation_date: '',
  });

  // OTP verification state
  const [showOtpModal, setShowOtpModal]   = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null); // form data waiting for OTP
  const [generatedOtp, setGeneratedOtp]   = useState('');
  const [enteredOtp, setEnteredOtp]       = useState('');
  const [otpError, setOtpError]           = useState('');
  const [otpSending, setOtpSending]       = useState(false);
  const otpInputRef = useRef(null);

  // Pre-fill city/area from context ONLY when the modal first opens AND the fields are empty.
  // Never overwrite values the user has already typed.
  useEffect(() => {
    if (showRegisterModal) {
      setDonorForm((prev) => ({
        ...prev,
        city: prev.city || city || '',
        area: prev.area || area || '',
      }));
    }
  }, [showRegisterModal]); // intentionally NOT in [city, area] — context changes must not overwrite user input

  const fetchBloodDonors = async (group, lat, lng, cityName) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch backend donors
      let backendDonors = [];
      try {
        const data = await getDonors(group, lat, lng, cityName);
        if (data && Array.isArray(data)) {
          backendDonors = data;
        }
      } catch (err) {
        console.warn('[BloodDonor] Backend query failed, showing local database:', err.message);
        setError('Failed to retrieve nearby donors. Displaying offline list.');
      }

      // 2. Fetch local storage donors
      let localDonorsRaw = [];
      try {
        localDonorsRaw = JSON.parse(localStorage.getItem('lifelink_local_donors') || '[]');
      } catch (e) {
        console.warn('[BloodDonor] Failed to read local storage donors:', e);
      }

      // 3. Resolve coords and calculate distances for local donors
      const resolvedLocalDonors = localDonorsRaw.map((ld) => {
        let dLat = lat;
        let dLng = lng;

        const cityClean = ld.city.trim().toLowerCase();
        if (cityName && cityClean !== cityName.trim().toLowerCase()) {
          const matchedCoords = CITY_COORDS[cityClean];
          if (matchedCoords) {
            dLat = matchedCoords.lat;
            dLng = matchedCoords.lng;
          } else {
            dLat = 12.9716;
            dLng = 77.5946;
          }
        }

        let distanceStr = '2.5 km';
        let rawDistance = 2.5;
        if (lat && lng && dLat && dLng) {
          const dist = haversineDistance(lat, lng, dLat, dLng);
          distanceStr = `${dist.toFixed(1)} km`;
          rawDistance = dist;
        }

        return {
          ...ld,
          distance: distanceStr,
          _raw_distance: rawDistance,
        };
      });

      // 4. Filter local donors by selected blood group only.
      // Do NOT filter by city/area here — the backend already handles location-based filtering.
      // Local donors are shown regardless of city match so the newly-registered donor always appears.
      const filteredLocalDonors = resolvedLocalDonors.filter((ld) => {
        if (group && group !== 'All' && ld.blood_group !== group) {
          return false;
        }
        return true;
      });

      // 5. Merge: backend donors FIRST so fresh server data takes priority over stale local cache.
      // Deduplication keeps the first-seen entry, so backend wins when phone numbers match.
      const merged = [...backendDonors, ...filteredLocalDonors];
      
      // Deduplicate by Name + Phone
      const seen = new Set();
      const uniqueDonors = merged.filter((d) => {
        const key = `${d.name.toLowerCase()}_${d.phone}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort by distance ascending
      uniqueDonors.sort((a, b) => {
        const distA = parseFloat(a.distance.replace(' km', '')) || 999;
        const distB = parseFloat(b.distance.replace(' km', '')) || 999;
        return distA - distB;
      });

      setDonors(uniqueDonors);
    } catch (err) {
      console.error('[BloodDonor] Error processing donor network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lat = coordinates?.lat;
    const lng = coordinates?.lng;
    fetchBloodDonors(selectedGroup, lat, lng, city);
  }, [selectedGroup, coordinates, city, area]);

  // ── Phone validation helper ────────────────────────────────────────────────
  const isValidIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\s|-/g, ''));

  // ── Step 1: Validate form → send (simulated) OTP ─────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // ── Validation ─────────────────────────────────────────────────────────
    if (!donorForm.name.trim()) { setFormError('Full name is required.'); return; }

    const ageNum = parseInt(donorForm.age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      setFormError('Age must be between 18 and 65 years.'); return;
    }

    const rawPhone = donorForm.phone.replace(/\s|-/g, '');
    if (!isValidIndianPhone(rawPhone)) {
      setFormError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'); return;
    }

    if (!donorForm.city.trim()) { setFormError('City is required.'); return; }

    // ── Generate 6-digit OTP and show OTP modal ─────────────────────────────
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setEnteredOtp('');
    setOtpError('');
    setOtpSending(true);

    // Simulate SMS send delay
    await new Promise((r) => setTimeout(r, 1200));
    setOtpSending(false);

    setPendingPayload({
      name:               donorForm.name.trim(),
      age:                ageNum,
      blood_group:        donorForm.blood_group,
      phone:              rawPhone,
      city:               donorForm.city.trim(),
      area:               donorForm.area.trim(),
      availability:       donorForm.availability,
      last_donation_date: donorForm.last_donation_date || '',
    });

    setShowOtpModal(true);
    setTimeout(() => otpInputRef.current?.focus(), 100);
  };

  // ── Step 2: Verify OTP → complete registration ───────────────────────────
  const handleOtpVerify = async () => {
    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError('Incorrect OTP. Please try again.');
      return;
    }

    if (!pendingPayload) return;
    setRegistering(true);
    setOtpError('');

    try {
      await registerDonor(pendingPayload);
      console.info('[BloodDonor] Donor registered in backend database.');
    } catch (err) {
      console.warn('[BloodDonor] Backend offline — saving to local cache:', err.message);
      // LocalStorage upsert: update existing entry with the same phone, don't push duplicates.
      const localDonors = JSON.parse(localStorage.getItem('lifelink_local_donors') || '[]');
      const idx = localDonors.findIndex((d) => d.phone === pendingPayload.phone);
      if (idx >= 0) {
        localDonors[idx] = pendingPayload; // update
      } else {
        localDonors.push(pendingPayload);  // new entry
      }
      localStorage.setItem('lifelink_local_donors', JSON.stringify(localDonors));
    } finally {
      setRegistering(false);
    }

    const submittedCity = pendingPayload.city;
    setShowOtpModal(false);
    setShowRegisterModal(false);
    setFormError('');
    setPendingPayload(null);
    setGeneratedOtp('');
    setEnteredOtp('');
    setDonorForm({
      name: '', age: '', blood_group: 'O+', phone: '',
      city: '', area: '', availability: true, last_donation_date: '',
    });

    alert(`✅ Registration successful! You are now listed as a blood donor in ${submittedCity}.`);

    const lat = coordinates?.lat;
    const lng = coordinates?.lng;
    fetchBloodDonors(selectedGroup, lat, lng, submittedCity);
  };

  const activeLabel = area ? `${area}, ${city}` : city;

  return (
    <Layout>
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-red-500 via-rose-500 to-red-650 py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Droplets className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Blood Donor Network
            </h1>
            <p className="text-lg text-red-100 max-w-xl mx-auto">
              Find compatible blood donors sorted by nearest distance first
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid selector / register panel */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Filter and Location Selector Panel */}
            <motion.div
              className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Location selector integration */}
              <div className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Searching Donors Near: <span className="text-slate-700 dark:text-slate-200 font-semibold">{activeLabel}</span>
                </p>
                <LocationSearch />
              </div>

              {/* Blood Group filters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Select Blood Group
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_GROUPS.map((group) => (
                    <motion.button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`px-4.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        selectedGroup === group
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg border-transparent shadow-red-200 dark:shadow-none'
                          : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {group}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-slate-500 font-semibold">
                Found {donors.length} compatible donor{donors.length !== 1 ? 's' : ''} nearest to you.
              </p>
            </motion.div>

            {/* Become a Donor CTA Card */}
            <motion.div
              className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Become a Blood Donor</h3>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Join our verified donor network. By registering, hospitals and families nearby can request your assistance during urgent blood shortages.
                </p>
              </div>
              <Button
                variant="primary"
                className="w-full mt-6 bg-red-500 hover:bg-red-600 border-none shadow-lg shadow-red-500/20 font-bold"
                onClick={() => setShowRegisterModal(true)}
              >
                Register as Donor
              </Button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Results Donor Grid Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-900 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" message="Locating nearest blood donors..." />
            </div>
          ) : donors.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {donors.map((donor, index) => (
                <motion.div key={donor.phone || index} variants={fadeUp}>
                  <DonorCard donor={donor} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-md"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Droplets className="w-16 h-16 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                No matching donors found
              </h3>
              <p className="text-slate-500 text-sm">
                No registered donors matching blood group "{selectedGroup}" are located in this area. Try selecting another blood group.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Educational Campaign Section */}
      <section className="py-16 bg-white dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Why <span className="text-red-500">Donate Blood</span>?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Every donation can save up to three lives. Here's why your contribution matters.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Save Lives',
                description: 'Every 2 seconds, someone needs blood. A single donation can save up to 3 lives.',
                stat: '3 Lives',
                statLabel: 'per donation',
                gradient: 'from-red-500 to-rose-500',
              },
              {
                icon: Users,
                title: 'High Demand',
                description: 'India requires about 5 crore units of blood annually, but only 2.5 crore units are available.',
                stat: '50%',
                statLabel: 'shortage',
                gradient: 'from-orange-500 to-amber-500',
              },
              {
                icon: Clock,
                title: 'Quick Process',
                description: 'Blood donation takes only 10-15 minutes and your body replenishes the donated blood within 24-48 hours.',
                stat: '15 min',
                statLabel: 'to donate',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl transition-shadow"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mx-auto mb-4`}
                >
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{card.description}</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.stat}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{card.statLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal Dialog */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal content box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-left z-10"
            >
              {/* Modal header */}
              <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-white animate-pulse" />
                  <h3 className="font-bold text-lg text-white">Donor Registration</h3>
                </div>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">

                {/* Inline validation error */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px]"
                    >
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{formError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="col-span-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={donorForm.name}
                      onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Age field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Age * (18 - 65)
                    </label>
                    <input
                      type="number"
                      required
                      min="18"
                      max="65"
                      value={donorForm.age}
                      onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
                      placeholder="25"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Blood Group selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      Blood Group *
                    </label>
                    <select
                      value={donorForm.blood_group}
                      onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone field */}
                  <div className="col-span-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={donorForm.phone}
                      onChange={(e) => {
                        // Allow only digits
                        const v = e.target.value.replace(/\D/g, '');
                        setDonorForm({ ...donorForm, phone: v });
                        setFormError('');
                      }}
                      placeholder="e.g. 9876543210"
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white ${
                        donorForm.phone && !isValidIndianPhone(donorForm.phone)
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                    {donorForm.phone && !isValidIndianPhone(donorForm.phone) && (
                      <p className="text-[10px] text-red-400 mt-1">
                        Must be 10 digits starting with 6, 7, 8, or 9
                      </p>
                    )}
                  </div>

                  {/* City field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={donorForm.city}
                      onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Area field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Area (Optional)
                    </label>
                    <input
                      type="text"
                      value={donorForm.area}
                      onChange={(e) => setDonorForm({ ...donorForm, area: e.target.value })}
                      placeholder="e.g. Koramangala"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Last Donation Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Last Donation Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={donorForm.last_donation_date}
                      onChange={(e) => setDonorForm({ ...donorForm, last_donation_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white text-xs"
                    />
                  </div>

                  {/* Availability checkbox */}
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="avail"
                      checked={donorForm.availability}
                      onChange={(e) => setDonorForm({ ...donorForm, availability: e.target.checked })}
                      className="w-4.5 h-4.5 text-red-500 rounded border-slate-350 focus:ring-red-500 dark:bg-slate-800"
                    />
                    <label htmlFor="avail" className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                      Available to donate now
                    </label>
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => { setShowRegisterModal(false); setFormError(''); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    loading={otpSending}
                    className="bg-red-500 hover:bg-red-650 border-none font-bold"
                  >
                    {otpSending ? 'Sending OTP…' : 'Verify & Register'}
                  </Button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── OTP Verification Modal ── */}
      <AnimatePresence>
        {showOtpModal && pendingPayload && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* OTP Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-white" />
                <h3 className="font-bold text-lg">Verify Your Number</h3>
                <p className="text-emerald-100 text-xs mt-1">
                  OTP sent to +91 ••••••{pendingPayload.phone.slice(-4)}
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Demo OTP hint */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[11px]">
                  <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    <strong>Demo mode:</strong> Your OTP is{' '}
                    <strong className="font-mono tracking-widest text-amber-400">{generatedOtp}</strong>
                  </span>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Enter 6-digit OTP
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleOtpVerify()}
                    placeholder="• • • • • •"
                    className={`w-full px-4 py-3 rounded-xl border text-center text-xl font-mono tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 dark:text-white ${
                      otpError ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {otpError && (
                    <p className="text-xs text-red-400 mt-1.5 text-center">{otpError}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowOtpModal(false); setOtpError(''); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleOtpVerify}
                    disabled={registering || enteredOtp.length < 6}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white disabled:opacity-50 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
                  >
                    {registering ? 'Registering…' : 'Confirm & Register'}
                  </button>
                </div>

                {/* Resend */}
                <p className="text-center text-[11px] text-slate-400">
                  Didn’t get it?{' '}
                  <button
                    type="button"
                    className="text-emerald-500 font-semibold hover:underline"
                    onClick={() => {
                      const newOtp = String(Math.floor(100000 + Math.random() * 900000));
                      setGeneratedOtp(newOtp);
                      setEnteredOtp('');
                      setOtpError('');
                    }}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </Layout>
  );
}
