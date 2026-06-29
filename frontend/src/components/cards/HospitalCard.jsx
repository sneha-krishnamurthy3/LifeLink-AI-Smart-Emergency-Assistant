import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Navigation, Clock } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function StarRating({ rating }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-surface-300'
          }`}
        />
      ))}
      {rating != null && (
        <span className="text-xs text-surface-500 ml-1 font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

export default function HospitalCard({ hospital }) {
  if (!hospital) return null;

  const { name, address, rating, distance, phone, open_now, amenity_type } = hospital;

  const distanceNum = parseFloat(distance);
  const travelTime = !isNaN(distanceNum) ? Math.ceil(distanceNum * 5) : null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    name + (address ? ', ' + address : '')
  )}`;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-surface-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-surface-900 leading-snug truncate">{name}</h3>
              {amenity_type && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-primary-50 text-primary-600 border border-primary-100">
                  {amenity_type}
                </span>
              )}
            </div>
            {address && (
              <p className="text-xs text-surface-500 mt-1.5 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {address}
              </p>
            )}
          </div>

          {/* Open / Closed Badge */}
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              open_now
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            {open_now ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* ── Meta Row ───────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {rating != null && <StarRating rating={rating} />}
          {distance && (
            <span className="text-xs text-surface-500 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {distance}
            </span>
          )}
          {travelTime && (
            <span className="text-xs text-primary-500 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              🚗 ~{travelTime} mins
            </span>
          )}
        </div>

        {/* ── Action Buttons ─────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </a>
        </div>
      </div>
    </motion.div>
  );
}
