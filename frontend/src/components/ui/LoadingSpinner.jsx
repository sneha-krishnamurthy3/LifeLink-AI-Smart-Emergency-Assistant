import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const sizeConfig = {
  sm: {
    heart: 'w-6 h-6',
    dots: 'w-1.5 h-1.5',
    text: 'text-xs',
    gap: 'gap-2',
    container: 'p-4',
  },
  md: {
    heart: 'w-10 h-10',
    dots: 'w-2 h-2',
    text: 'text-sm',
    gap: 'gap-3',
    container: 'p-6',
  },
  lg: {
    heart: 'w-14 h-14',
    dots: 'w-2.5 h-2.5',
    text: 'text-base',
    gap: 'gap-4',
    container: 'p-8',
  },
};

const LoadingSpinner = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      className={`flex flex-col items-center justify-center ${config.gap} ${config.container} ${className}`}
    >
      {/* Pulsing Heart */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.2, 1, 1.15, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Heart className={`${config.heart} text-red-500 fill-red-500`} />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className={`${config.heart} bg-red-400/30 rounded-full blur-lg`}
          />
        </motion.div>
      </motion.div>

      {/* Bouncing Dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className={`${config.dots} rounded-full bg-blue-500`}
            animate={{
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <motion.p
          className={`${config.text} text-slate-500 dark:text-slate-400 font-medium`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
