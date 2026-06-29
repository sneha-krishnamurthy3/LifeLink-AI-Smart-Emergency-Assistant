import { motion } from 'framer-motion';
import {
  Flame,
  HeartPulse,
  Skull,
  Bone,
  Droplets,
  Brain,
  Baby,
  Zap,
} from 'lucide-react';

const SUGGESTIONS = [
  { label: 'Heart Attack', icon: HeartPulse },
  { label: 'Severe Bleeding', icon: Droplets },
  { label: 'Burns & Scalds', icon: Flame },
  { label: 'Choking', icon: Skull },
  { label: 'Fracture / Broken Bone', icon: Bone },
  { label: 'Seizure / Epilepsy', icon: Brain },
  { label: 'Infant Emergency', icon: Baby },
  { label: 'Electric Shock', icon: Zap },
];

const chipVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function SuggestionChips({ onSelect }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {SUGGESTIONS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.label}
            custom={i}
            variants={chipVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(item.label)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium hover:bg-primary-100 hover:border-primary-300 transition-colors duration-200 shadow-sm"
          >
            <Icon className="w-4 h-4 text-primary-500" />
            <span className="whitespace-nowrap">{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
