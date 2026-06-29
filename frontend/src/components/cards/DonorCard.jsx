import { motion } from 'framer-motion';
import { Phone, MapPin, User, CheckCircle, XCircle, Navigation } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function DonorCard({ donor }) {
  if (!donor) return null;

  const { name, blood_group, age, city, area, phone, distance, available, availability } = donor;
  const isAvailable = available !== false && availability !== false;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-surface-100 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* ── Blood Group Badge ────────────────────────────── */}
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-lg leading-none">
              {blood_group || '?'}
            </span>
          </div>

          {/* ── Info ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-surface-900 dark:text-white truncate">{name}</h3>
              {/* Availability Badge */}
              <span
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isAvailable
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-surface-100 text-surface-500 border border-surface-200'
                }`}
              >
                {isAvailable ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Available
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-slate-400" />
                    Unavailable
                  </>
                )}
              </span>
            </div>

            {/* ── Details Row ────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 mt-2">
              {age && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Age {age}
                </span>
              )}
              {(city || area) && (
                <span className="flex items-center gap-1 truncate max-w-[150px]">
                  <MapPin className="w-3 h-3 text-red-500" />
                  {area ? `${area}, ${city}` : city}
                </span>
              )}
              {distance && (
                <span className="flex items-center gap-1 font-semibold text-primary-500">
                  <Navigation className="w-3.5 h-3.5 rotate-45" />
                  {distance}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Call Button ────────────────────────────────────── */}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
          >
            <Phone className="w-4 h-4" />
            Call Donor
          </a>
        )}
      </div>
    </motion.div>
  );
}
