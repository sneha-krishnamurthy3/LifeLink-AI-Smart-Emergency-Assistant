import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary:
    'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 focus-visible:ring-blue-500',
  secondary:
    'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-700 hover:to-rose-600 focus-visible:ring-red-500',
  outline:
    'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 focus-visible:ring-slate-400',
  ghost:
    'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400',
  danger:
    'bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700 hover:shadow-red-500/40 focus-visible:ring-red-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      fullWidth = false,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={`
          inline-flex items-center justify-center font-semibold
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          dark:focus-visible:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          ${variantStyles[variant] || variantStyles.primary}
          ${sizeStyles[size] || sizeStyles.md}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : typeof Icon === 'function' ? (
          <Icon className={iconSizes[size]} />
        ) : Icon ? (
          Icon
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
