import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  MapPin,
  Droplets,
  AlertTriangle,
  Mic,
  Shield,
  Zap,
  Heart,
  Star,
  Quote,
  ArrowRight,
  Activity,
  ChevronRight,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import FeatureCard from '@/components/cards/FeatureCard';

const floatingVariants = {
  animate: (i) => ({
    y: [0, -20, 0],
    x: [0, 10, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 5 + i,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    icon: Brain,
    title: 'AI Emergency Assistant',
    description:
      'Get instant AI-powered medical guidance and first aid instructions tailored to your specific emergency situation.',
    path: '/emergency',
  },
  {
    icon: MapPin,
    title: 'Hospital Finder',
    description:
      'Locate nearby hospitals, clinics, and emergency rooms with real-time availability and navigation directions.',
    path: '/hospitals',
  },
  {
    icon: Droplets,
    title: 'Blood Donor Network',
    description:
      'Connect with verified blood donors in your area for urgent transfusion needs and blood bank coordination.',
    path: '/donors',
  },
  {
    icon: AlertTriangle,
    title: 'SOS Alert System',
    description:
      'One-touch emergency alerts that notify your contacts and nearby emergency services instantly.',
    path: '/sos',
  },
  {
    icon: Mic,
    title: 'Voice Assistant',
    description:
      'Hands-free emergency assistance using voice commands when you can\'t type during critical moments.',
    path: '/voice',
  },
  {
    icon: Shield,
    title: 'Safety Guide',
    description:
      'Comprehensive safety guidelines and preventive measures to keep you and your loved ones safe.',
    path: '/about',
  },
];

const whyCards = [
  {
    icon: Zap,
    title: 'Instant Response',
    description:
      'Our AI analyzes your emergency in seconds and provides step-by-step guidance, ensuring no time is wasted when it matters most.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: MapPin,
    title: 'Location Aware',
    description:
      'Automatically detects your location to find the nearest hospitals, pharmacies, and emergency services in real-time.',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Heart,
    title: 'Life-Saving',
    description:
      'Connected to a network of blood donors and emergency contacts, making critical resources available at your fingertips.',
    gradient: 'from-rose-400 to-red-500',
  },
];

const testimonials = [
  {
    initials: 'RK',
    name: 'Rahul Kumar',
    role: 'Emergency Responder',
    quote:
      'LifeLink AI helped me provide critical first aid guidance to an accident victim. The AI\'s response was incredibly accurate and fast.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    initials: 'PS',
    name: 'Priya Sharma',
    role: 'Medical Student',
    quote:
      'As a medical student, I\'m impressed by the accuracy of the AI recommendations. This could genuinely save lives in rural areas.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    initials: 'AM',
    name: 'Arjun Mehta',
    role: 'Parent',
    quote:
      'When my child had a severe allergic reaction, LifeLink AI guided me through every step until the ambulance arrived. Forever grateful.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const stats = [
  { end: 17440, suffix: '+', label: 'Lives Impacted' },
  { end: 872, suffix: '+', label: 'Hospitals Listed' },
  { end: 1197, suffix: '+', label: 'Blood Donors' },
  { end: 24, suffix: '/7', label: 'Emergency Assistance' },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 min-h-[90vh] flex items-center">
        {/* Floating decorative elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingVariants}
            animate="animate"
            className="absolute rounded-full opacity-10"
            style={{
              width: `${40 + i * 30}px`,
              height: `${40 + i * 30}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 16}%`,
              background: `rgba(255,255,255,${0.1 + i * 0.03})`,
            }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`cross-${i}`}
            animate={{
              rotate: [0, 360],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute text-white/10 text-4xl font-bold"
            style={{
              top: `${20 + i * 20}%`,
              right: `${5 + i * 12}%`,
            }}
          >
            +
          </motion.div>
        ))}

        {/* Heartbeat pulse */}
        <motion.div
          className="absolute top-1/2 right-[10%] -translate-y-1/2 hidden lg:block"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Activity className="w-64 h-64 text-white/5" strokeWidth={1} />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-8">
                <Activity className="w-4 h-4" />
                AI-Powered Emergency Response Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Emergency Companion
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-blue-100/90 mb-10 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              LifeLink AI uses advanced artificial intelligence to provide instant emergency
              guidance, connect you with nearby hospitals, and coordinate life-saving responses
              when every second counts.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
            >
              <Link to="/emergency">
                <Button variant="primary" size="lg" icon={<Brain className="w-5 h-5" />}>
                  Get Emergency Help
                </Button>
              </Link>
              <Link to="/hospitals">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  <MapPin className="w-5 h-5" />
                  Find Hospitals
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* Statistics Bar */}
      <section className="relative z-10 -mt-12 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} duration={2000} />
                </div>
                <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for{' '}
              <span className="text-blue-600">Emergency Response</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need in a medical emergency, powered by cutting-edge AI technology
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeUp}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  path={feature.path}
                  delay={index * 0.1}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose LifeLink AI */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">LifeLink AI</span>?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Built with cutting-edge technology to deliver when it matters most
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyCards.map((card, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300 group"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What People <span className="text-blue-600">Say</span>
            </h2>
            <p className="text-lg text-gray-500">
              Trusted by thousands in emergency situations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Quote className="w-10 h-10 text-blue-100 absolute top-6 right-6" />
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-6"
              >
                <Heart className="w-12 h-12 text-red-300" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Stay Prepared?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Join thousands of users who trust LifeLink AI for emergency preparedness and
                response.
              </p>
              <Link to="/emergency">
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Get Emergency Help Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
