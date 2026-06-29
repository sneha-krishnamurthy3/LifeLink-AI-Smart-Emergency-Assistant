const variantConfig = {
  CRITICAL: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800/60',
    dot: 'bg-red-500',
    pulse: true,
  },
  HIGH: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800/60',
    dot: 'bg-orange-500',
    pulse: false,
  },
  MEDIUM: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800/60',
    dot: 'bg-yellow-500',
    pulse: false,
  },
  LOW: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800/60',
    dot: 'bg-green-500',
    pulse: false,
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
    pulse: false,
  },
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  default: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
    pulse: false,
  },
};

const Badge = ({ children, variant = 'default', icon: Icon, className = '' }) => {
  const config = variantConfig[variant] || variantConfig.default;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        border transition-colors
        ${config.bg} ${config.text} ${config.border}
        ${className}
      `.trim()}
    >
      {/* Status Dot */}
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`absolute inset-0 rounded-full ${config.dot} animate-ping opacity-75`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>

      {Icon && (typeof Icon === 'function' ? <Icon className="w-3 h-3 flex-shrink-0" /> : Icon)}
      {children}
    </span>
  );
};

export default Badge;
