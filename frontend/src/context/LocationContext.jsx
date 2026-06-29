import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const LocationContext = createContext(null);

const DEFAULT_COORDS  = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_CITY    = 'Bengaluru';
const DEFAULT_AREA    = 'Koramangala';
const DEFAULT_PINCODE = '560034';
const DEFAULT_ADDRESS = 'Koramangala, Bengaluru, Karnataka, 560034, India';

// Only save/display a GPS fix if accuracy is WITHIN this threshold (metres).
// Above this → IP-based junk; we wait for a better fix or ask for manual search.
const GOOD_ACCURACY_M = 2000;   // 2 km — WiFi or GPS quality
const WARN_ACCURACY_M = 500;    // below 500 m → no warning needed

// How long to wait for a good fix via watchPosition before giving up (ms)
const GPS_WATCH_TIMEOUT_MS = 20000;

/* ─────────────────────────────────────────────────────────────────────────────
   LocalStorage helpers
───────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'lifelink_preferred_location';

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Discard any stored record that was saved with poor accuracy (old bad data)
    if (parsed?.gpsAccuracy && parsed.gpsAccuracy > GOOD_ACCURACY_M) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeStorage = (snapshot) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('[LocationContext] localStorage write failed:', e);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   Provider
───────────────────────────────────────────────────────────────────────────── */
export const LocationProvider = ({ children }) => {
  const stored = readStorage(); // bad-accuracy records are already discarded above

  const [coordinates,      setCoordinates]      = useState(stored?.coordinates  ?? DEFAULT_COORDS);
  const [city,             setCity]             = useState(stored?.city          ?? DEFAULT_CITY);
  const [area,             setArea]             = useState(stored?.area          ?? DEFAULT_AREA);
  const [stateName,        setStateName]        = useState(stored?.stateName     ?? 'Karnataka');
  const [pincode,          setPincode]          = useState(stored?.pincode       ?? DEFAULT_PINCODE);
  const [address,          setAddress]          = useState(stored?.address       ?? DEFAULT_ADDRESS);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [isDetecting,      setIsDetecting]      = useState(false);
  const [error,            setError]            = useState(null);
  const [gpsAccuracy,      setGpsAccuracy]      = useState(null);
  const [isApproximate,    setIsApproximate]    = useState(false);

  // Track active watchPosition id so we can cancel it
  const watchIdRef = useRef(null);

  const stopWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  /* ── Sync browser permission status ──────────────────────────────────────── */
  useEffect(() => {
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        setPermissionStatus(status.state);
        status.onchange = () => setPermissionStatus(status.state);
      });
    }
    return () => stopWatch(); // cleanup on unmount
  }, []);

  /* ── Nominatim Reverse Geocoding ─────────────────────────────────────────── */
  const reverseGeocode = useCallback(async (lat, lng) => {
    console.log(`[LocationContext] Reverse-geocoding → Lat: ${lat}, Lng: ${lng}`);
    try {
      const resp = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      console.log('[LocationContext] Nominatim response:', resp.data);

      if (resp.data?.address) {
        const a = resp.data.address;
        const resolvedCity    = a.city || a.town || a.village || a.county || a.state_district || DEFAULT_CITY;
        const resolvedArea    = a.suburb || a.neighbourhood || a.quarter || a.residential || a.subdistrict || a.district || a.road || 'Local Area';
        const resolvedState   = a.state   || 'Unknown';
        const resolvedPincode = a.postcode || '';
        const resolvedAddress = resp.data.display_name || '';

        console.log('[LocationContext] Resolved →', { city: resolvedCity, area: resolvedArea, state: resolvedState, pincode: resolvedPincode });

        setCity(resolvedCity);
        setArea(resolvedArea);
        setStateName(resolvedState);
        setPincode(resolvedPincode);
        setAddress(resolvedAddress);

        return { city: resolvedCity, area: resolvedArea, stateName: resolvedState, pincode: resolvedPincode, address: resolvedAddress };
      }
    } catch (err) {
      console.warn('[LocationContext] Reverse geocode failed:', err.message);
    }

    const fallback = { city: 'Detected Location', area: 'Nearby Area', stateName: '', pincode: '', address: `Near ${lat.toFixed(5)}, ${lng.toFixed(5)}` };
    setCity(fallback.city); setArea(fallback.area); setStateName(fallback.stateName); setAddress(fallback.address);
    return fallback;
  }, []);

  /* ── Core GPS detector using watchPosition ───────────────────────────────── */
  /**
   * Uses watchPosition so the browser can progressively refine the fix:
   *  - First reading: often IP-based (~100 km) → IGNORED
   *  - Later readings: WiFi-based (~50-500 m) or GPS (~10 m) → ACCEPTED
   *
   * A fix is only applied and saved when accuracy ≤ GOOD_ACCURACY_M (2 km).
   * If no good fix arrives within GPS_WATCH_TIMEOUT_MS, we ask for manual search.
   *
   * @param {boolean} forceRefresh - ignored (always uses maximumAge:0 for a fresh watch)
   */
  const detectLocation = useCallback((forceRefresh = false) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setPermissionStatus('unavailable');
      return;
    }

    if (isDetecting) {
      console.log('[LocationContext] Detection already in progress.');
      return;
    }

    // Cancel any previous watch
    stopWatch();

    setIsDetecting(true);
    setError(null);
    setGpsAccuracy(null);
    setIsApproximate(false);

    let bestAccuracy = Infinity;
    let gotGoodFix   = false;

    console.log('[LocationContext] Starting watchPosition for accurate fix…');

    // Timeout: stop watching after GPS_WATCH_TIMEOUT_MS if no good fix
    const timeoutId = setTimeout(() => {
      if (!gotGoodFix) {
        stopWatch();
        setIsDetecting(false);
        setError(
          'Could not detect your exact location automatically. ' +
          'Your device may be using a coarse network estimate. ' +
          'Please search your city or area manually using the search box below.'
        );
        console.warn('[LocationContext] Timed out waiting for accurate GPS fix.');
      }
    }, GPS_WATCH_TIMEOUT_MS);

    const onPosition = async (position) => {
      const { latitude: lat, longitude: lng, accuracy } = position.coords;
      console.log(`[LocationContext] GPS update → Lat: ${lat}, Lng: ${lng}, Accuracy: ${accuracy} m`);

      // Update displayed accuracy even for coarse fixes (debug info only)
      setGpsAccuracy(accuracy);

      // Skip coarse IP-based fixes — keep watching for a better one
      if (accuracy > GOOD_ACCURACY_M) {
        console.log(`[LocationContext] Accuracy ${accuracy.toFixed(0)} m > ${GOOD_ACCURACY_M} m threshold. Waiting for better fix…`);
        return;
      }

      // Only commit if this is better than what we already have
      if (accuracy >= bestAccuracy) return;
      bestAccuracy = accuracy;
      gotGoodFix   = true;

      clearTimeout(timeoutId);
      stopWatch();
      setIsDetecting(false);

      const approximate = accuracy > WARN_ACCURACY_M;
      setIsApproximate(approximate);
      setCoordinates({ lat, lng });
      setPermissionStatus('granted');
      setError(null);

      console.log(`[LocationContext] Good fix accepted (${accuracy.toFixed(0)} m). Reverse-geocoding…`);
      const details = await reverseGeocode(lat, lng);

      // Only persist accurate fixes — never write IP-based junk to localStorage
      writeStorage({
        coordinates: { lat, lng },
        gpsAccuracy: accuracy,
        city:      details?.city      ?? DEFAULT_CITY,
        area:      details?.area      ?? DEFAULT_AREA,
        stateName: details?.stateName ?? 'Karnataka',
        pincode:   details?.pincode   ?? DEFAULT_PINCODE,
        address:   details?.address   ?? DEFAULT_ADDRESS,
      });
    };

    const onError = (err) => {
      clearTimeout(timeoutId);
      stopWatch();
      console.warn('[LocationContext] GPS error:', err.code, err.message);

      let msg;
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setPermissionStatus('denied');
          msg = 'Location access was denied. Please allow it in your browser settings, then try again.';
          break;
        case err.POSITION_UNAVAILABLE:
          setPermissionStatus('unavailable');
          msg = 'Your device could not determine its location. Please search manually.';
          break;
        case err.TIMEOUT:
          setPermissionStatus('unavailable');
          msg = 'Location request timed out. Please try again or search manually.';
          break;
        default:
          setPermissionStatus('unavailable');
          msg = 'An unknown error occurred while detecting location.';
      }

      setError(msg);
      setIsDetecting(false);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      onPosition,
      onError,
      {
        enableHighAccuracy: true,
        timeout:    15000,
        maximumAge: 0,      // always fresh — no cached coarse fixes
      }
    );
  }, [isDetecting, reverseGeocode]);

  /* ── Manual location setter ──────────────────────────────────────────────── */
  const setLocationManually = useCallback((loc) => {
    stopWatch(); // cancel any in-flight GPS watch
    const nextCoords  = (loc.lat && loc.lng) ? { lat: Number(loc.lat), lng: Number(loc.lng) } : coordinates;
    const nextCity    = loc.city      || city;
    const nextArea    = loc.area      || area;
    const nextState   = loc.stateName || loc.state || stateName;
    const nextPincode = loc.pincode   || pincode;
    const nextAddress = loc.address   || [loc.area, loc.city, loc.pincode].filter(Boolean).join(', ');

    setCoordinates(nextCoords);
    setCity(nextCity);
    setArea(nextArea);
    setStateName(nextState);
    setPincode(nextPincode);
    setAddress(nextAddress);
    setError(null);
    setGpsAccuracy(null);
    setIsApproximate(false);
    setIsDetecting(false);

    // Manual selections are always accurate enough to persist
    writeStorage({ coordinates: nextCoords, city: nextCity, area: nextArea, stateName: nextState, pincode: nextPincode, address: nextAddress });
  }, [coordinates, city, area, stateName, pincode]);

  /* ── Forward geocode (query → coords) ───────────────────────────────────── */
  const forwardGeocode = useCallback(async (query) => {
    if (!query?.trim()) return null;
    setIsDetecting(true);
    setError(null);
    try {
      const resp = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
      );
      if (resp.data?.length > 0) {
        const item = resp.data[0];
        const lat  = parseFloat(item.lat);
        const lng  = parseFloat(item.lon);
        const details = await reverseGeocode(lat, lng);
        setCoordinates({ lat, lng });
        setIsDetecting(false);
        return { lat, lng, ...details };
      }
      setError('No locations found matching your search.');
    } catch (err) {
      console.warn('[LocationContext] Forward geocoding failed:', err.message);
      setError('Network error. Unable to search location.');
    }
    setIsDetecting(false);
    return null;
  }, [reverseGeocode]);

  /* ── Auto-detect on first load only when no accurate preference is saved ─── */
  useEffect(() => {
    if (!readStorage()) {
      detectLocation(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Context value ───────────────────────────────────────────────────────── */
  const value = {
    coordinates,
    city,
    area,
    stateName,
    pincode,
    address,
    permissionStatus,
    isDetecting,
    error,
    gpsAccuracy,
    isApproximate,
    detectLocation,
    setLocationManually,
    forwardGeocode,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
};

export default LocationContext;
