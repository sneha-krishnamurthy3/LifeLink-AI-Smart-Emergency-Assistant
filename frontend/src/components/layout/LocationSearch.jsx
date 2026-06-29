import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, MapPin, Loader2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

export default function LocationSearch({ onSelectComplete }) {
  const {
    coordinates,
    city,
    area,
    pincode,
    gpsAccuracy,
    isApproximate,
    detectLocation,
    setLocationManually,
    isDetecting,
    permissionStatus,
    error: locationError,
  } = useLocation();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearch, setActiveSearch] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setActiveSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query to Nominatim
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`
        );
        setSuggestions(resp.data || []);
      } catch (err) {
        console.warn('[LocationSearch] Suggestion fetch failed:', err.message);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const a   = item.address || {};

    const resolvedCity     = a.city || a.town || a.village || a.suburb || item.display_name.split(',')[0];
    const resolvedArea     = a.suburb || a.neighbourhood || a.residential || a.state_district || 'Local Area';
    const resolvedState    = a.state || '';
    const resolvedPincode  = a.postcode || '';

    setLocationManually({
      lat, lng,
      city:      resolvedCity,
      area:      resolvedArea,
      stateName: resolvedState,
      pincode:   resolvedPincode,
      address:   item.display_name,
    });

    setQuery('');
    setSuggestions([]);
    setActiveSearch(false);

    if (onSelectComplete) onSelectComplete();
  };

  const handleUseGPS = () => {
    // forceRefresh=false → allows browser to serve a cached accurate fix (up to 30s old)
    // This prevents falling back to a coarse IP estimate while the GPS chip warms up
    detectLocation(false);
  };

  const handleRefreshGPS = () => {
    // forceRefresh=true → maximumAge:0, forces a completely fresh hardware GPS reading
    detectLocation(true);
  };

  const activeLabel = area ? `${area}, ${city}` : city;
  const denied      = permissionStatus === 'denied';

  return (
    <div ref={searchRef} className="w-full relative space-y-3">

      {/* ── Accuracy warning (non-blocking, soft) ── */}
      <AnimatePresence>
        {isApproximate && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] leading-relaxed"
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Approximate location</strong>{gpsAccuracy ? ` (±${(gpsAccuracy / 1000).toFixed(1)} km)` : ''}.
              Your device may be using network-based positioning instead of GPS.
              For best accuracy, search your city manually below.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Permission denied ── */}
      <AnimatePresence>
        {permissionStatus === 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] leading-relaxed"
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Location access is disabled. Please enable it in your browser settings to use GPS, or search manually.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Generic error ── */}
      <AnimatePresence>
        {locationError && permissionStatus !== 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[11px]"
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{locationError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search Input ── */}
      <div className="relative flex items-center bg-slate-900/40 dark:bg-slate-950/60 rounded-xl border border-slate-700/60 focus-within:border-primary-500/80 px-4 py-3 transition-colors duration-200">
        <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveSearch(true); }}
          onFocus={() => setActiveSearch(true)}
          placeholder="Search City, Area, or Pincode…"
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
        />
        {isSearching && <Loader2 className="w-4 h-4 text-primary-500 animate-spin flex-shrink-0" />}
      </div>

      {/* ── GPS Buttons ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Detect (first time) */}
        <button
          type="button"
          onClick={handleUseGPS}
          disabled={isDetecting}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold
            bg-primary-600/10 hover:bg-primary-600/20 border border-primary-500/20 hover:border-primary-500/40
            text-primary-400 transition-all duration-200 disabled:opacity-50"
        >
          {isDetecting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Detecting…</span></>
          ) : (
            <><Compass className="w-3.5 h-3.5" /><span>Use GPS</span></>
          )}
        </button>

        <button
          type="button"
          onClick={handleRefreshGPS}
          disabled={isDetecting}
          title="Force a fresh GPS reading"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold
            bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/40 hover:border-slate-500/60
            text-slate-300 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Live detection progress ── */}
      <AnimatePresence>
        {isDetecting && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px]"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">
                Scanning for your exact location…
                {gpsAccuracy ? ` (current: ±${gpsAccuracy > 999 ? (gpsAccuracy/1000).toFixed(0)+'km' : gpsAccuracy.toFixed(0)+'m'})` : ''}
              </span>
              <span className="text-blue-500/70">Waiting for WiFi/GPS signal — up to 20 seconds</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active location badge ── */}
      {!isDetecting && (city || area) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate font-semibold">Active: {activeLabel}</span>
          {gpsAccuracy && (
            <span className={`ml-auto whitespace-nowrap ${isApproximate ? 'text-amber-500' : 'text-emerald-600'}`}>
              ±{gpsAccuracy > 999 ? (gpsAccuracy/1000).toFixed(1)+'km' : gpsAccuracy.toFixed(0)+'m'}
            </span>
          )}
        </div>
      )}

      {/* ── Suggestion Dropdown ── */}
      <AnimatePresence>
        {activeSearch && (query.trim().length >= 3 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-[1050] mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
              {isSearching && suggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                  <span>Searching locations…</span>
                </div>
              )}
              {!isSearching && suggestions.length === 0 && query.trim().length >= 3 && (
                <div className="p-4 text-center text-xs text-slate-500">No matching locations found</div>
              )}
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left p-3.5 hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors group"
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-primary-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {item.address?.suburb || item.address?.neighbourhood || item.address?.city || item.display_name.split(',')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
