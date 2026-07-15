import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getHealthProfile, saveHealthProfile } from '@/services/HealthProfileService';
import Layout from '@/components/layout/Layout';
import {
  User, Calendar, Ruler, Weight, Droplets, Heart,
  AlertCircle, Pill, Scissors, Accessibility, Gift,
  Phone, Users, Shield, Save, CheckCircle, Loader2,
  Edit3, AlertTriangle, Lock, ChevronRight,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: 'easeOut' },
  }),
};

// ── Constants ───────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const EMPTY_FORM = {
  full_name: '',
  date_of_birth: '',
  gender: '',
  height_cm: '',
  weight_kg: '',
  blood_group: '',
  allergies: '',
  chronic_diseases: '',
  current_medications: '',
  past_surgeries: '',
  disabilities: '',
  organ_donor: false,
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: '',
};

// Fields that count toward completion %
const COMPLETION_FIELDS = [
  'full_name', 'date_of_birth', 'gender', 'height_cm', 'weight_kg',
  'blood_group', 'emergency_contact_name', 'emergency_contact_phone',
];

// ── Helper: array field ↔ comma string ──────────────────────────────────────
const arrToStr = (val) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.join(', ');
  return val;
};
const strToArr = (str) =>
  str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];

// ── Profile → form ──────────────────────────────────────────────────────────
function profileToForm(profile) {
  if (!profile) return EMPTY_FORM;
  return {
    full_name: profile.full_name || '',
    date_of_birth: profile.date_of_birth || '',
    gender: profile.gender || '',
    height_cm: profile.height_cm ?? '',
    weight_kg: profile.weight_kg ?? '',
    blood_group: profile.blood_group || '',
    allergies: arrToStr(profile.allergies),
    chronic_diseases: arrToStr(profile.chronic_diseases),
    current_medications: arrToStr(profile.current_medications),
    past_surgeries: arrToStr(profile.past_surgeries),
    disabilities: arrToStr(profile.disabilities),
    organ_donor: profile.organ_donor ?? false,
    emergency_contact_name: profile.emergency_contact_name || '',
    emergency_contact_relationship: profile.emergency_contact_relationship || '',
    emergency_contact_phone: profile.emergency_contact_phone || '',
  };
}

// ── Form → Supabase payload ──────────────────────────────────────────────────
function formToPayload(form) {
  return {
    full_name: form.full_name || null,
    date_of_birth: form.date_of_birth || null,
    gender: form.gender || null,
    height_cm: form.height_cm ? Number(form.height_cm) : null,
    weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
    blood_group: form.blood_group || null,
    allergies: strToArr(form.allergies),
    chronic_diseases: strToArr(form.chronic_diseases),
    current_medications: strToArr(form.current_medications),
    past_surgeries: strToArr(form.past_surgeries),
    disabilities: strToArr(form.disabilities),
    organ_donor: form.organ_donor,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_relationship: form.emergency_contact_relationship || null,
    emergency_contact_phone: form.emergency_contact_phone || null,
  };
}

// ── Completion % ────────────────────────────────────────────────────────────
function calcCompletion(form) {
  const filled = COMPLETION_FIELDS.filter((k) => {
    const v = form[k];
    return v !== '' && v !== null && v !== undefined;
  }).length;
  return Math.round((filled / COMPLETION_FIELDS.length) * 100);
}

// ── Validation ──────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  if (!form.full_name?.trim()) errs.full_name = 'Full name is required.';

  if (form.date_of_birth) {
    const dob = new Date(form.date_of_birth);
    const today = new Date();
    if (dob > today) errs.date_of_birth = 'Date of birth cannot be in the future.';
    const age = today.getFullYear() - dob.getFullYear();
    if (age > 130) errs.date_of_birth = 'Please enter a valid date of birth.';
  }

  if (form.height_cm && (Number(form.height_cm) < 30 || Number(form.height_cm) > 300))
    errs.height_cm = 'Height must be between 30 and 300 cm.';

  if (form.weight_kg && (Number(form.weight_kg) < 1 || Number(form.weight_kg) > 700))
    errs.weight_kg = 'Weight must be between 1 and 700 kg.';

  if (form.emergency_contact_phone) {
    const digits = form.emergency_contact_phone.replace(/\D/g, '');
    if (digits.length < 10) errs.emergency_contact_phone = 'Enter a valid phone number (min. 10 digits).';
  }
  return errs;
}

// ═══════════════════════════════════════════════════════════════════════════
//  SHARED FIELD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
function FieldLabel({ icon: Icon, label, required }) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 mb-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-blue-400" />}
      {label}
      {required && <span className="text-rose-400 text-xs">*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs text-rose-400 font-medium">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {msg}
    </p>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', error, disabled, id }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-rose-500/60' : 'border-slate-700'}`}
    />
  );
}

function TextareaInput({ value, onChange, placeholder, disabled, rows = 2 }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white
        placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40
        focus:border-blue-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function SelectInput({ value, onChange, options, placeholder, disabled, error }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-sm transition-all
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${value ? 'text-white' : 'text-slate-500'}
        ${error ? 'border-rose-500/60' : 'border-slate-700'}`}
    >
      <option value="" className="bg-slate-900">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o} className="bg-slate-900 text-white">
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

// ── Section card wrapper ────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, accentColor = 'blue', children, index }) {
  const accents = {
    blue:    'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400 bg-blue-500/10',
    rose:    'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400 bg-rose-500/10',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
    amber:   'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400 bg-amber-500/10',
  };
  const [iconCls, , , textCls] = accents[accentColor].split(' ');

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={`bg-gradient-to-br ${accents[accentColor].split(' ').slice(0,2).join(' ')} border ${accents[accentColor].split(' ')[2]} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl ${accents[accentColor].split(' ')[3]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${accents[accentColor].split(' ')[3].replace('bg','text').replace('/10','')}`} />
        </div>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MY HEALTH PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function MyHealthPage() {
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [saveState, setSaveState] = useState('idle');    // 'idle' | 'saving' | 'saved' | 'error'
  const [saveMsg, setSaveMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const completion = calcCompletion(form);

  // ── Load profile on mount ─────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoadState('loading');
    const { data, error } = await getHealthProfile();
    if (error) {
      setLoadState('error');
      return;
    }
    if (data) {
      setForm(profileToForm(data));
      setHasProfile(true);
      setIsEditing(false);
    } else {
      setHasProfile(false);
      setIsEditing(true); // New user — open form immediately
    }
    setLoadState('ready');
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    if (saveState === 'saved') setSaveState('idle');
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaveState('saving');
    setSaveMsg('');

    const { data, error } = await saveHealthProfile(formToPayload(form));

    if (error) {
      setSaveState('error');
      setSaveMsg(error);
      return;
    }

    setForm(profileToForm(data));
    setHasProfile(true);
    setIsEditing(false);
    setSaveState('saved');
    setSaveMsg('Profile saved successfully!');
    setTimeout(() => setSaveState('idle'), 3000);
  };

  // ── Cancel edit ───────────────────────────────────────────────────────────
  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Re-load to discard unsaved changes
    loadProfile();
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading your health profile…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loadState === 'error') {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Could not load profile</h2>
            <p className="text-slate-400 text-sm">
              Supabase may not be configured. Please add your{' '}
              <code className="text-blue-400">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-blue-400">VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>.
            </p>
            <button
              onClick={loadProfile}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="mb-8"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">My Health</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Health Profile
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {user?.email} · Private &amp; encrypted
                </p>
              </div>

              {hasProfile && !isEditing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* ── Profile Completion Bar ───────────────────────────────────── */}
          <motion.div
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-300">Profile Completion</span>
              <span className={`text-2xl font-black ${completion >= 80 ? 'text-emerald-400' : completion >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                {completion}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${completion >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : completion >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {completion < 100 ? `Add ${COMPLETION_FIELDS.filter((k) => !form[k]).length} more field${COMPLETION_FIELDS.filter((k) => !form[k]).length !== 1 ? 's' : ''} to complete your profile` : '🎉 Profile is complete!'}
            </p>
          </motion.div>

          {/* ── Save Status Banner ──────────────────────────────────────── */}
          <AnimatePresence>
            {(saveState === 'saved' || saveState === 'error') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium mb-4 ${
                  saveState === 'saved'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {saveState === 'saved'
                  ? <><CheckCircle className="w-4 h-4 flex-shrink-0" />{saveMsg}</>
                  : <><AlertCircle className="w-4 h-4 flex-shrink-0" />{saveMsg}</>}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} noValidate className="space-y-5">
            {/* ── 1. Personal Information ─────────────────────────────── */}
            <SectionCard icon={User} title="Personal Information" accentColor="blue" index={2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldLabel icon={User} label="Full Name" required />
                  <TextInput
                    id="full_name"
                    value={form.full_name}
                    onChange={handleChange('full_name')}
                    placeholder="Your full legal name"
                    error={errors.full_name}
                    disabled={!isEditing}
                  />
                  <FieldError msg={errors.full_name} />
                </div>

                <div>
                  <FieldLabel icon={Calendar} label="Date of Birth" />
                  <TextInput
                    id="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={handleChange('date_of_birth')}
                    error={errors.date_of_birth}
                    disabled={!isEditing}
                  />
                  <FieldError msg={errors.date_of_birth} />
                </div>

                <div>
                  <FieldLabel icon={User} label="Gender" />
                  <SelectInput
                    value={form.gender}
                    onChange={handleChange('gender')}
                    options={GENDERS}
                    placeholder="Select gender"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <FieldLabel icon={Ruler} label="Height (cm)" />
                  <TextInput
                    id="height_cm"
                    type="number"
                    value={form.height_cm}
                    onChange={handleChange('height_cm')}
                    placeholder="e.g. 170"
                    error={errors.height_cm}
                    disabled={!isEditing}
                  />
                  <FieldError msg={errors.height_cm} />
                </div>

                <div>
                  <FieldLabel icon={Weight} label="Weight (kg)" />
                  <TextInput
                    id="weight_kg"
                    type="number"
                    value={form.weight_kg}
                    onChange={handleChange('weight_kg')}
                    placeholder="e.g. 65"
                    error={errors.weight_kg}
                    disabled={!isEditing}
                  />
                  <FieldError msg={errors.weight_kg} />
                </div>

                <div>
                  <FieldLabel icon={Droplets} label="Blood Group" />
                  <SelectInput
                    value={form.blood_group}
                    onChange={handleChange('blood_group')}
                    options={BLOOD_GROUPS}
                    placeholder="Select blood group"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── 2. Medical Information ───────────────────────────────── */}
            <SectionCard icon={Heart} title="Medical Information" accentColor="rose" index={3}>
              <div className="space-y-4">
                <div>
                  <FieldLabel icon={AlertCircle} label="Allergies" />
                  <TextareaInput
                    value={form.allergies}
                    onChange={handleChange('allergies')}
                    placeholder="e.g. Penicillin, Peanuts, Latex (comma separated)"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <FieldLabel icon={Heart} label="Chronic Diseases / Conditions" />
                  <TextareaInput
                    value={form.chronic_diseases}
                    onChange={handleChange('chronic_diseases')}
                    placeholder="e.g. Type 2 Diabetes, Hypertension (comma separated)"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <FieldLabel icon={Pill} label="Current Medications" />
                  <TextareaInput
                    value={form.current_medications}
                    onChange={handleChange('current_medications')}
                    placeholder="e.g. Metformin 500mg, Aspirin 75mg (comma separated)"
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel icon={Scissors} label="Past Surgeries" />
                    <TextareaInput
                      value={form.past_surgeries}
                      onChange={handleChange('past_surgeries')}
                      placeholder="e.g. Appendectomy 2019"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Accessibility} label="Disabilities" />
                    <TextareaInput
                      value={form.disabilities}
                      onChange={handleChange('disabilities')}
                      placeholder="e.g. Visual impairment"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isEditing ? 'bg-slate-800/40 border-slate-700 cursor-pointer hover:border-blue-500/40' : 'bg-slate-800/20 border-slate-800'}`}>
                  <input
                    id="organ_donor"
                    type="checkbox"
                    checked={form.organ_donor}
                    onChange={handleChange('organ_donor')}
                    disabled={!isEditing}
                    className="w-4 h-4 rounded accent-rose-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label htmlFor="organ_donor" className={`flex items-center gap-2 text-sm font-semibold ${isEditing ? 'text-slate-200 cursor-pointer' : 'text-slate-400 cursor-not-allowed'}`}>
                    <Gift className="w-4 h-4 text-rose-400" />
                    I am an Organ Donor
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* ── 3. Emergency Contact ────────────────────────────────── */}
            <SectionCard icon={Phone} title="Emergency Contact" accentColor="emerald" index={4}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel icon={User} label="Contact Name" />
                  <TextInput
                    id="ec_name"
                    value={form.emergency_contact_name}
                    onChange={handleChange('emergency_contact_name')}
                    placeholder="Full name"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <FieldLabel icon={Users} label="Relationship" />
                  <TextInput
                    id="ec_rel"
                    value={form.emergency_contact_relationship}
                    onChange={handleChange('emergency_contact_relationship')}
                    placeholder="e.g. Spouse, Parent, Sibling"
                    disabled={!isEditing}
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel icon={Phone} label="Phone Number" />
                  <TextInput
                    id="ec_phone"
                    type="tel"
                    value={form.emergency_contact_phone}
                    onChange={handleChange('emergency_contact_phone')}
                    placeholder="e.g. +91 9876543210"
                    error={errors.emergency_contact_phone}
                    disabled={!isEditing}
                  />
                  <FieldError msg={errors.emergency_contact_phone} />
                </div>
              </div>
            </SectionCard>

            {/* ── Action Buttons ───────────────────────────────────────── */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 flex-wrap"
                >
                  <motion.button
                    type="submit"
                    disabled={saveState === 'saving'}
                    whileHover={{ scale: saveState === 'saving' ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saveState === 'saving'
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                      : <><Save className="w-4 h-4" />Save Profile</>}
                  </motion.button>

                  {hasProfile && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-3 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* ── Privacy notice ───────────────────────────────────────── */}
          <motion.div
            variants={fadeUp} custom={6} initial="hidden" animate="visible"
            className="flex items-start gap-2.5 mt-6 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
            <span>
              Your health data is stored securely in Supabase with Row Level Security.
              Only you can access this profile. LifeLink AI does not share your medical information with anyone.
            </span>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
