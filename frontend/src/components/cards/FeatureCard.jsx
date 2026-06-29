import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: delay || 0,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function FeatureCard({ icon, title, description, path, delay = 0 }) {
  const navigate = useNavigate();
  
  const Icon = typeof icon === 'function' || (icon && typeof icon === 'object')
    ? icon
    : (LucideIcons[icon] || LucideIcons.Sparkles);

  const handleNavigate = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ 
        y: -6,
        scale: 1.025,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)'
      }}
      whileTap={{ scale: 0.975 }}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Open ${title}`}
      className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors hover:border-blue-200 dark:hover:border-blue-900 select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 flex flex-col justify-between h-full shadow-sm"
    >
      <div>
        {/* ── Icon Circle ─────────────────────────────────────── */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-blue-600 dark:to-indigo-600 flex items-center justify-center shadow-md mb-5 group-hover:shadow-glow transition-shadow duration-300">
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* ── Title ────────────────────────────────────────────── */}
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 leading-snug flex items-center gap-1.5">
          {title}
        </h3>

        {/* ── Description ──────────────────────────────────────── */}
        <p className="text-sm text-surface-500 dark:text-slate-400 leading-relaxed mb-4">{description}</p>
      </div>

      {/* ── Action Indicator ─────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors mt-auto pt-2">
        <span>Access Feature</span>
        <motion.span
          animate={{ x: 0 }}
          whileHover={{ x: 4 }}
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          <LucideIcons.ArrowRight className="w-4 h-4" />
        </motion.span>
      </div>
    </motion.div>
  );
}
