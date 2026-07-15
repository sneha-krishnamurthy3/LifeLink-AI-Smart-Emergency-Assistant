import { useState, useEffect, useRef } from 'react';
import { Link, useLocation as useRouteLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation as useAppLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import LocationSearch from './LocationSearch';
import {
  Heart,
  Menu,
  X,
  Home,
  AlertTriangle,
  Building2,
  Droplets,
  Phone,
  Mic,
  Info,
  MapPin,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Activity,
} from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Emergency', path: '/emergency', icon: AlertTriangle },
  { name: 'Hospitals', path: '/hospitals', icon: Building2 },
  { name: 'Donors', path: '/donors', icon: Droplets },
  { name: 'SOS', path: '/sos', icon: Phone },
  { name: 'Voice', path: '/voice', icon: Mic },
  { name: 'About', path: '/about', icon: Info },
];

// ── User avatar dropdown ───────────────────────────────────────────────────
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const email = user?.email || '';

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 transition-all"
        aria-label="Account menu"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {initials}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Signed in as</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{email}</p>
            </div>
            <Link
              to="/my-health"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium border-b border-slate-100 dark:border-slate-800"
            >
              <Activity className="w-4 h-4 text-blue-400" />
              My Health Profile
            </Link>
            <Link
              to="/emergency-contacts"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              Emergency Contacts
            </Link>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium border-t border-slate-100 dark:border-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const routeLocation = useRouteLocation();
  const { city, area, address, coordinates, gpsAccuracy, isApproximate, permissionStatus } = useAppLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [routeLocation.pathname]);

  const isActive = (path) => {
    if (path === '/') return routeLocation.pathname === '/';
    return routeLocation.pathname.startsWith(path);
  };

  const activeLabel = (area || city) ? (area ? `${area}, ${city}` : city) : 'Set Location';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border-b border-slate-200/50 dark:border-slate-700/50'
          : 'bg-white dark:bg-slate-900 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              <motion.div
                className="absolute inset-0 bg-red-400/30 rounded-full blur-md"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-slate-800 dark:text-white">LifeLink</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </Link>

          {/* Location Chip & Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Location Selector Chip */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-full font-semibold text-xs border border-slate-200 dark:border-slate-700/80 hover:border-primary-500/50 dark:hover:border-primary-400/40 transition-all cursor-pointer max-w-[220px]"
            >
              <MapPin className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
              <span className="truncate">📍 {activeLabel}</span>
            </motion.button>

            <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const isSOS = link.name === 'SOS';

              if (isSOS) {
                return (
                  <Link key={link.name} to={link.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative ml-2"
                    >
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-full font-semibold text-sm shadow-lg shadow-red-500/30 hover:bg-red-700 transition-colors">
                        <Phone className="w-4 h-4" />
                        SOS
                      </span>
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-red-400"
                        animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                    </motion.div>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            </div>

            {/* ── Auth Controls (Desktop) ───────────────────────────── */}
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <Link to="/login">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-full shadow-sm shadow-blue-500/20 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </motion.span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div key="mobile-menu-wrapper" className="lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              style={{ top: '64px' }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-16 right-0 bottom-0 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-slate-200/50 dark:border-slate-700/50 overflow-y-auto"
            >
              <div className="p-4 space-y-1">
                {/* Mobile Location Selector */}
                <div className="px-4 py-3 mb-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Location</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{activeLabel}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setShowLocationModal(true);
                      }}
                      className="text-xs font-bold text-primary-500 hover:text-primary-600 flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {navLinks.map((link, index) => {
                  const active = isActive(link.path);
                  const isSOS = link.name === 'SOS';

                  return (
                    <motion.div
                      key={link.name}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isSOS
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700'
                            : active
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                        {isSOS && (
                          <motion.span
                            className="ml-auto w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* ── Auth Controls (Mobile) ──────────────────────── */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <div className="px-4 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed in as</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        to="/my-health"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        <Activity className="w-5 h-5 text-blue-400" />
                        My Health Profile
                      </Link>
                      <Link
                        to="/emergency-contacts"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        Emergency Contacts
                      </Link>
                      <button
                        onClick={() => { setIsOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border-t border-slate-100 dark:border-slate-800 mt-1 pt-1"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      <LogIn className="w-5 h-5" />
                      Sign In / Create Account
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Switcher Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            key="location-modal-container"
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocationModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    Select Location
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Search manually or use your device GPS. All nearby features will update automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Location Search Input */}
              <div className="my-6">
                <LocationSearch onSelectComplete={() => setShowLocationModal(false)} />
              </div>

              {/* GPS accuracy warning */}
              {isApproximate && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[11px] leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Approximate location detected{gpsAccuracy ? ` (±${(gpsAccuracy/1000).toFixed(1)} km)` : ''}. Your browser may be using IP-based positioning. Use the refresh button or search manually.
                  </span>
                </div>
              )}

              {/* Current Address Display */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Current Active Address</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {address}
                </p>
                {coordinates && permissionStatus === 'granted' && (
                  <p className="text-[10px] text-slate-400 tabular-nums">
                    GPS: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    {gpsAccuracy ? ` · ±${gpsAccuracy.toFixed(0)} m` : ''}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
