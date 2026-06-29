// ─── Blood Groups ───────────────────────────────────────────────
export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

// ─── Emergency Numbers (India) ──────────────────────────────────
export const EMERGENCY_NUMBERS = [
  { label: 'National Emergency', number: '112', description: 'All emergencies' },
  { label: 'Ambulance', number: '108', description: 'Emergency medical services' },
  { label: 'Women Helpline', number: '102', description: 'Pregnancy & women emergencies' },
  { label: 'Fire Brigade', number: '101', description: 'Fire emergencies' },
  { label: 'Police', number: '100', description: 'Law enforcement' },
];

// ─── Navigation Links ──────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home', path: '/', id: 'nav-home' },
  { label: 'Chat', path: '/chat', id: 'nav-chat' },
  { label: 'Hospitals', path: '/hospitals', id: 'nav-hospitals' },
  { label: 'Blood Bank', path: '/blood-bank', id: 'nav-blood-bank' },
  { label: 'SOS', path: '/sos', id: 'nav-sos' },
];

// ─── Platform Features ─────────────────────────────────────────
export const FEATURES = [
  {
    id: 'ai-first-aid',
    icon: 'Bot',
    title: 'AI First-Aid Guidance',
    description:
      'Get instant, step-by-step first-aid instructions powered by Google Gemini AI for any medical emergency.',
  },
  {
    id: 'hospital-finder',
    icon: 'Hospital',
    title: 'Nearby Hospital Finder',
    description:
      'Locate the nearest hospitals and clinics with real-time distance, ratings, and availability information.',
  },
  {
    id: 'blood-bank',
    icon: 'Droplets',
    title: 'Blood Donor Network',
    description:
      'Connect with verified blood donors in your area instantly when every second matters during an emergency.',
  },
  {
    id: 'sos-alert',
    icon: 'AlertTriangle',
    title: 'One-Tap SOS Alert',
    description:
      'Send your live location and emergency details to your emergency contacts with a single tap.',
  },
  {
    id: 'voice-assist',
    icon: 'Mic',
    title: 'Voice-Activated Assistant',
    description:
      'Speak your emergency naturally — our voice AI understands and responds hands-free when you need it most.',
  },
  {
    id: 'emergency-numbers',
    icon: 'Phone',
    title: 'Emergency Quick Dial',
    description:
      'One-tap access to all critical emergency numbers — ambulance, fire, police — organized and always ready.',
  },
];

// ─── Testimonials ───────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: 'testimonial-1',
    name: 'Dr. Priya Sharma',
    role: 'Emergency Physician, AIIMS Delhi',
    avatar: 'PS',
    rating: 5,
    text: 'LifeLink AI is a game-changer for pre-hospital care. The first-aid guidance is accurate and could genuinely save lives before the ambulance arrives.',
  },
  {
    id: 'testimonial-2',
    name: 'Rahul Mehra',
    role: 'First Responder Volunteer',
    avatar: 'RM',
    rating: 5,
    text: 'During a road accident, I used LifeLink to guide bystanders on what to do. The step-by-step instructions were clear and the hospital finder was incredibly fast.',
  },
  {
    id: 'testimonial-3',
    name: 'Anita Desai',
    role: 'Mother & Teacher',
    avatar: 'AD',
    rating: 4,
    text: 'When my child had a severe allergic reaction, LifeLink told me exactly what to do while we rushed to the hospital. Every parent needs this app.',
  },
];

// ─── Platform Stats ─────────────────────────────────────────────
export const STATS = [
  { id: 'stat-users', value: '50K+', label: 'Active Users', icon: 'Users' },
  { id: 'stat-emergencies', value: '10K+', label: 'Emergencies Handled', icon: 'ShieldCheck' },
  { id: 'stat-hospitals', value: '2,500+', label: 'Hospitals Listed', icon: 'Hospital' },
  { id: 'stat-donors', value: '8K+', label: 'Blood Donors', icon: 'Heart' },
];
