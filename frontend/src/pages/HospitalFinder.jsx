import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Navigation, Building2, AlertCircle, Map, Info, Phone, Clock } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import HospitalCard from '@/components/cards/HospitalCard';
import LocationSearch from '@/components/layout/LocationSearch';
import { getHospitals } from '@/services/api';
import { useLocation } from '@/context/LocationContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Leaflet Custom SVG Markers ────────────────────────────────
const userLocationIcon = L.divIcon({
  className: 'user-gps-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-6 h-6 bg-blue-500/30 rounded-full animate-ping"></div>
      <div class="relative w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const hospitalMarkerIcon = L.divIcon({
  className: 'hospital-marker-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-red-500/20 rounded-full animate-pulse"></div>
      <svg class="w-7 h-9 text-red-500 drop-shadow-md" viewBox="0 0 24 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9.3 12 18 12 18s12-8.7 12-18c0-6.63-5.37-12-12-12zm4 13h-3v3h-2v-3H8v-2h3V8h2v3h3v2z"/>
      </svg>
    </div>
  `,
  iconSize: [28, 35],
  iconAnchor: [14, 35],
  popupAnchor: [0, -32],
});

// Helper component to center Leaflet Map dynamically
const ChangeMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 14, { animate: true });
    }
  }, [center, map]);
  return null;
};

export default function HospitalFinder() {
  const { coordinates, city, area, isDetecting, detectLocation } = useLocation();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  const fetchHospitals = async (lat, lng) => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(null);
    setUsingSampleData(false);

    try {
      const data = await getHospitals(lat, lng);
      if (data && Array.isArray(data) && data.length > 0) {
        setHospitals(data);
      } else {
        setError('No medical facilities found nearby.');
      }
    } catch (err) {
      console.warn('[HospitalFinder] Failed to fetch live hospitals, offline fallback:', err.message);
      setError('Live API unavailable. Showing local mock fallback.');
      setUsingSampleData(true);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch hospitals automatically when coordinates change
  useEffect(() => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      setActiveMarkerId(null); // Close active popups before coordinate change
      fetchHospitals(coordinates.lat, coordinates.lng);
    }
  }, [coordinates]);

  // Clean up overlays on page unmount
  useEffect(() => {
    return () => {
      setHospitals([]);
      setActiveMarkerId(null);
    };
  }, []);

  const activeLabel = area ? `${area}, ${city}` : city;

  return (
    <Layout>
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-16 sm:py-20 relative overflow-hidden">
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
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Nearby Hospitals & Clinics
            </h1>
            <p className="text-lg text-blue-100 max-w-xl mx-auto">
              Real-time medical facilities located via OpenStreetMap live Overpass queries
            </p>
          </motion.div>
        </div>
      </section>

      {/* Reusable Geolocation Search Controller */}
      <section className="relative z-20 -mt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-5 border border-slate-200/50 dark:border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                Active Map Location: <span className="text-slate-700 dark:text-slate-200">{activeLabel}</span>
              </p>
              <LocationSearch />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leaflet OSM Interactive Map Section */}
      <section className="py-8 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 h-[450px] relative z-10"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            {coordinates && coordinates.lat && coordinates.lng ? (
              <MapContainer
                key="osm-emergency-map"
                center={[coordinates.lat, coordinates.lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Dynamically re-center map view */}
                <ChangeMapCenter center={coordinates} />

                {/* User Current Position Pin */}
                <Marker 
                  position={[coordinates.lat, coordinates.lng]} 
                  icon={userLocationIcon}
                  eventHandlers={{
                    click: () => setActiveMarkerId('user')
                  }}
                >
                  {activeMarkerId === 'user' && (
                    <Popup onClose={() => setActiveMarkerId(null)}>
                      <div className="text-xs font-semibold p-1">
                        <p className="text-primary-500 font-bold">You Are Here</p>
                        <p className="text-slate-500 mt-0.5">{activeLabel}</p>
                      </div>
                    </Popup>
                  )}
                </Marker>

                {/* Nearby Hospital Markers */}
                {hospitals.map((hospital, idx) => {
                  if (!hospital.lat || !hospital.lng) return null;
                  const keyId = hospital.place_id || `h-${idx}`;
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    hospital.name + (hospital.address ? ', ' + hospital.address : '')
                  )}`;

                  return (
                    <Marker
                      key={keyId}
                      position={[hospital.lat, hospital.lng]}
                      icon={hospitalMarkerIcon}
                      eventHandlers={{
                        click: () => setActiveMarkerId(keyId)
                      }}
                    >
                      {activeMarkerId === keyId && (
                        <Popup onClose={() => setActiveMarkerId(null)}>
                          <div className="text-xs p-1 max-w-[200px]">
                            <p className="font-bold text-slate-900 leading-snug">{hospital.name}</p>
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                              {hospital.amenity_type || 'Hospital'} • {hospital.distance}
                            </p>
                            <p className="text-slate-500 mt-1 leading-normal">{hospital.address}</p>
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 block text-center px-2 py-1 bg-primary-600 text-white rounded-md text-[10px] font-bold hover:bg-primary-700 transition-colors"
                            >
                              Open in Google Maps
                            </a>
                          </div>
                        </Popup>
                      )}
                    </Marker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="h-full bg-slate-900 flex flex-col items-center justify-center text-center p-6">
                <LoadingSpinner size="lg" message="Resolving GPS Coordinates..." />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Hospital List Results Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" message="Querying OpenStreetMap Overpass live data..." />
            </div>
          ) : hospitals.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Found {hospitals.length} Facilities Nearby
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Showing closest hospitals, clinics, and pharmacies
                  </p>
                </div>
                {(usingSampleData || error) && (
                  <Badge variant="info">Using Mock Fallback</Badge>
                )}
              </div>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {hospitals.map((hospital, index) => (
                  <motion.div key={hospital.place_id || index} variants={fadeUp}>
                    <HospitalCard hospital={hospital} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-md"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                No facilities detected
              </h3>
              <p className="text-slate-500 text-sm">
                We couldn't retrieve medical locations around this coordinate. Try searching for a different city or area.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
