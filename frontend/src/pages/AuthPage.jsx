import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Activity,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const errorVariants = {
  initial: { opacity: 0, height: 0, marginBottom: 0 },
  animate: { opacity: 1, height: 'auto', marginBottom: 16, transition: { duration: 0.3 } },
  exit:    { opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } },
};

// ── Field wrapper ───────────────────────────────────────────────────────────
function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-200">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-1.5 text-xs text-rose-400 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Password input with show/hide toggle ────────────────────────────────────
function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Lock className="w-4.5 h-4.5 text-slate-500" />
      </div>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-3 pl-10 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
      </button>
    </div>
  );
}

// ── Password strength bar ───────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const score = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const textColors = ['', 'text-rose-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400'];

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setGlobalError('');

    const result = await login(form.email.trim(), form.password);

    if (result?.error) {
      setGlobalError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 800);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your LifeLink AI account"
      altText="Don't have an account?"
      altLinkText="Create account"
      altLinkTo="/signup"
    >
      <AnimatePresence>
        {globalError && (
          <motion.div
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{globalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Signed in! Redirecting…
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Email Address" id="login-email" error={errors.email}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm ${errors.email ? 'border-rose-500/60' : 'border-slate-700'}`}
            />
          </div>
        </Field>

        <Field label="Password" id="login-password" error={errors.password}>
          <PasswordInput
            id="login-password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>

        <motion.button
          type="submit"
          disabled={loading || success}
          whileHover={{ scale: loading || success ? 1 : 1.015 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : success ? (
            <><CheckCircle className="w-4 h-4" /> Signed in!</>
          ) : (
            <>Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SIGNUP PAGE
// ═══════════════════════════════════════════════════════════════════════════
export function SignupPage() {
  const { register, login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';

    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';

    if (!form.confirm) errs.confirm = 'Please confirm your password.';
    else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.';

    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setGlobalError('');

    const result = await register(form.email.trim(), form.password);

    if (result?.error) {
      setGlobalError(result.error);
      setLoading(false);
      return;
    }

    // If Supabase returns a user with no session it means email verification is on
    if (result?.user && !result?.session) {
      setEmailVerificationRequired(true);
      setSuccess(true);
      setLoading(false);
      return;
    }

    // Auto login succeeded — redirect home
    setSuccess(true);
    setTimeout(() => navigate('/', { replace: true }), 800);
  };

  if (success && emailVerificationRequired) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="We've sent a verification link to your email"
        altText="Already verified?"
        altLinkText="Sign in"
        altLinkTo="/login"
      >
        <div className="text-center space-y-6 py-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <div>
            <p className="text-slate-300 text-sm leading-relaxed">
              A confirmation email was sent to{' '}
              <span className="font-semibold text-white">{form.email}</span>.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Click the link in the email to activate your account, then sign in.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Go to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join LifeLink AI for personalized emergency coordination"
      altText="Already have an account?"
      altLinkText="Sign in"
      altLinkTo="/login"
    >
      <AnimatePresence>
        {globalError && (
          <motion.div
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{globalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Full Name" id="signup-name" error={errors.name}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="signup-name"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Your full name"
              autoComplete="name"
              className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm ${errors.name ? 'border-rose-500/60' : 'border-slate-700'}`}
            />
          </div>
        </Field>

        <Field label="Email Address" id="signup-email" error={errors.email}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm ${errors.email ? 'border-rose-500/60' : 'border-slate-700'}`}
            />
          </div>
        </Field>

        <Field label="Password" id="signup-password" error={errors.password}>
          <PasswordInput
            id="signup-password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
          <PasswordStrength password={form.password} />
        </Field>

        <Field label="Confirm Password" id="signup-confirm" error={errors.confirm}>
          <PasswordInput
            id="signup-confirm"
            value={form.confirm}
            onChange={handleChange('confirm')}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </Field>

        <motion.button
          type="submit"
          disabled={loading || success}
          whileHover={{ scale: loading || success ? 1 : 1.015 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : success ? (
            <><CheckCircle className="w-4 h-4" /> Account created!</>
          ) : (
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </motion.button>

        <p className="text-xs text-slate-500 text-center pt-1">
          By creating an account you agree that all existing features remain available without signing in.
        </p>
      </form>
    </AuthShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SHARED AUTH SHELL  (background, card, header, footer link)
// ═══════════════════════════════════════════════════════════════════════════
function AuthShell({ title, subtitle, altText, altLinkText, altLinkTo, children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-rose-500/6 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <motion.div
              className="absolute inset-0 bg-red-400/30 rounded-full blur-md"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-white">LifeLink</span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Card header accent */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400" />

          <div className="p-7 sm:p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <p className="text-slate-400 text-sm">{subtitle}</p>
            </div>

            {/* Feature badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {['Emergency AI', 'Hospital Finder', 'Blood Donors'].map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-full px-2.5 py-1">
                  <Activity className="w-3 h-3 text-blue-400" />
                  {f}
                </span>
              ))}
            </div>

            {/* Slot for form content */}
            {children}
          </div>
        </div>

        {/* Alt link */}
        <p className="text-center text-slate-500 text-sm mt-6">
          {altText}{' '}
          <Link
            to={altLinkTo}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            {altLinkText}
          </Link>
        </p>

        {/* No-login note */}
        <p className="text-center text-xs text-slate-600 mt-3">
          All emergency features work without an account.
        </p>
      </motion.div>
    </div>
  );
}

// Keep default export for backward compat — points to Login
export default LoginPage;
