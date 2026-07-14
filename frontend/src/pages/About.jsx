import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Lightbulb,
  Brain,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  MapPin,
  Droplets,
  Phone,
  Mail,
  ArrowRight,
  Smartphone,
  Globe,
  Lock,
  Activity,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const features = [
  {
    icon: Brain,
    title: 'AI Emergency Coordinator',
    description:
      'Powered by Google Gemini, LifeLink AI acts as an intelligent emergency coordinator — not a chatbot. It analyses symptoms, determines severity, and generates a complete Emergency Action Plan tailored to your exact location.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: MapPin,
    title: 'Hospital Finder',
    description:
      'Leveraging OpenStreetMap Overpass API, the platform instantly maps hospitals, clinics, emergency centres, and pharmacies near you — with real distances, estimated travel time, and direct navigation links.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Droplets,
    title: 'Blood Donor Network',
    description:
      'A verified network connecting patients with willing blood donors in real time. Donors register with OTP-verified phone numbers, ensuring authenticity. The search automatically expands its radius to maximise coverage.',
    color: 'from-rose-500 to-red-600',
  },
  {
    icon: Phone,
    title: 'SOS Alert System',
    description:
      'One-touch emergency activation. Instantly generates a structured SOS message with your live GPS coordinates and current address — ready to send to pre-configured emergency contacts.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Smartphone,
    title: 'Progressive Web App',
    description:
      'LifeLink AI is installable on Android and iOS as a native app experience — with offline support and background caching — so it works even in low-connectivity emergency scenarios.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Lock,
    title: 'Privacy by Default',
    description:
      'Your health data, emergency contacts, and medical records are strictly private. LifeLink AI follows a "Private by Default" architecture. Only data you explicitly share is exposed to others.',
    color: 'from-slate-500 to-slate-700',
  },
];

const roadmap = [
  {
    version: 'v2.1',
    title: 'Personal Health Hub',
    items: ['Health Profile', 'Medical Records Vault', 'Medicine & Appointment Reminders'],
  },
  {
    version: 'v2.2',
    title: 'Emergency Assessment Engine',
    items: ['Automated Severity Scoring', 'Risk Level Calculation', 'Structured Gemini Coordination'],
  },
  {
    version: 'v3.0',
    title: 'Emergency Health Card',
    items: ['QR-Coded Emergency Profile', 'No-Login Access for First Responders', 'Family SOS Dashboard'],
  },
  {
    version: 'v4.0',
    title: 'Hospital Integration APIs',
    items: ['Pre-Arrival Emergency Summaries', 'Ambulance Dispatch Architecture', 'Doctor Portal'],
  },
];

export default function About() {
  return (
    <Layout>
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-24 sm:py-32">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-500 rounded-full blur-3xl" />
          </div>
          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
                <Activity className="w-4 h-4 animate-pulse text-rose-400" />
                AI-Powered Emergency Coordination Platform
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-rose-400">LifeLink AI</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                LifeLink AI is a Personal Health & Emergency Coordination Platform built to support users before, during, and after a medical emergency — powered by AI, grounded in privacy, and designed for reliability.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-24">

          {/* ── Problem Statement ── */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">The Problem</h2>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                  In medical emergencies, panic overrides critical thinking. Bystanders don't know first-aid protocols, waste precious minutes searching for phone numbers, and struggle to locate the right hospital.
                  <br /><br />
                  In India, delayed medical assistance contributes to over <strong>1.5 lakh road accident deaths annually</strong>. Critical patients regularly suffer from inadequate emergency coordination — not from a lack of resources, but a lack of information at the right moment.
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Root Cause</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-300 mt-1">The critical window of the first 10 minutes is lost to confusion and poor coordination.</p>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-between"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <Lightbulb className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-4">The Solution</h2>
                <p className="text-blue-100 leading-relaxed">
                  LifeLink AI acts as an <strong>AI Emergency Coordinator</strong> — not a chatbot. Powered by Google Gemini, it analyses emergencies, determines severity, maps nearby hospitals, matches blood donors, and coordinates emergency contacts.
                  <br /><br />
                  Voice synthesis and speech recognition enable hands-free operation in the most critical scenarios. Every response is structured, prioritised, and tailored to the user's exact GPS location.
                </p>
              </div>
              <div className="border-t border-white/20 pt-6 mt-6">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Our Commitment</span>
                <p className="text-sm font-semibold text-white mt-1">Every second counts. LifeLink AI is built for reliability, not impressiveness.</p>
              </div>
            </motion.div>
          </section>

          {/* ── Mission & Vision ── */}
          <section>
            <motion.div
              className="text-center mb-12"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Mission & Vision</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Heart, color: 'from-rose-500 to-red-600',
                  title: 'Our Mission',
                  text: 'To reduce preventable deaths by ensuring every person — regardless of medical knowledge — has access to structured, AI-guided emergency response at the moment they need it most.',
                },
                {
                  icon: Globe, color: 'from-blue-500 to-indigo-600',
                  title: 'Our Vision',
                  text: 'To build the most trusted and privacy-respecting AI health platform in India — one that integrates seamlessly with hospitals, ambulances, family networks, and wearable health devices, keeping human medical professionals at the centre of every critical decision.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border border-slate-100 dark:border-slate-800"
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Features ── */}
          <section>
            <motion.div
              className="text-center mb-12"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                How <span className="text-blue-600">LifeLink AI</span> Works
              </h2>
              <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
                A unified platform that brings together AI, real-time location, and healthcare networks.
              </p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── Technology Stack ── */}
          <section>
            <motion.div
              className="text-center mb-12"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
              <p className="text-gray-500 dark:text-slate-400">Built with modern, production-ready technologies.</p>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-5"
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              {[
                { name: 'React (Vite)', desc: 'Modern SPA framework with code splitting', icon: Zap },
                { name: 'FastAPI', desc: 'High-speed async Python microservice', icon: Activity },
                { name: 'Google Gemini', desc: 'Core AI Emergency Coordinator', icon: Brain },
                { name: 'OpenStreetMap', desc: 'Real-time hospital & location mapping', icon: MapPin },
                { name: 'Supabase', desc: 'PostgreSQL database & authentication', icon: Shield },
                { name: 'Framer Motion', desc: 'Premium animations & micro-interactions', icon: Heart },
                { name: 'Web Speech API', desc: 'Hands-free voice interaction', icon: Smartphone },
                { name: 'PWA / Workbox', desc: 'Offline-first installable web app', icon: Globe },
              ].map((tech, i) => (
                <motion.div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all text-center group"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <tech.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-1">{tech.name}</h4>
                  <p className="text-xs text-gray-400 dark:text-slate-500 leading-normal">{tech.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── Future Roadmap ── */}
          <section>
            <motion.div
              className="text-center mb-12"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                Future Roadmap
              </h2>
              <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
                LifeLink AI is being developed incrementally, with each release independently deployable and verified before the next begins.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roadmap.map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-md border border-slate-100 dark:border-slate-800"
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                      {item.version}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {item.items.map((point, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Contact ── */}
          <section>
            <motion.div
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-center text-white shadow-2xl"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <h2 className="text-3xl font-extrabold mb-3">Get in Touch</h2>
              <p className="text-blue-100 mb-8 max-w-md mx-auto">
                Have a question, partnership inquiry, or want to contribute to LifeLink AI? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:snehakrishnamurthy25@gmail.com"
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/20 font-semibold text-sm"
                >
                  <Mail className="w-4 h-4" />
                  snehakrishnamurthy25@gmail.com
                </a>
                <a
                  href="tel:9036767664"
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/20 font-semibold text-sm"
                >
                  <Phone className="w-4 h-4" />
                  +91 9036767664
                </a>
              </div>
            </motion.div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
