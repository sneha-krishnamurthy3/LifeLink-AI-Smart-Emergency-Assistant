import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Lightbulb,
  Cpu,
  Brain,
  Award,
  TrendingUp,
  Heart,
  Code,
  Layers,
  Database,
  Map,
  Mic,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function About() {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Hero Header */}
          <section className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4"
            >
              <Award className="w-4 h-4" />
              Coding Ninjas × Google for Developers Hackathon
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight"
            >
              About <span className="text-blue-600">LifeLink AI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-4 text-lg text-gray-500 max-w-xl mx-auto"
            >
              Learn about the inspiration, engineering architecture, and vision behind the ultimate AI-powered emergency responder companion.
            </motion.p>
          </section>

          {/* Problem vs Solution Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* The Problem Card */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 flex flex-col justify-between"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">The Problem</h2>
                <p className="text-gray-600 leading-relaxed space-y-4">
                  In medical emergencies, panic often overrides critical thinking. Bystanders do not know basic first-aid protocols, waste precious time searching for ambulance phone numbers, and struggle to locate specialized hospitals nearby.
                  <br /><br />
                  In India, delayed medical assistance contributes to over 1.5 lakh road accident deaths annually. Furthermore, critical patients often suffer from a lack of immediate blood donors. Existing solutions function as basic informational pages, lacking automated emergency coordination.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-6 mt-6">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Immediate Need</span>
                <p className="text-sm font-semibold text-gray-800 mt-1">An intelligent companion that coordinates emergency actions instantly.</p>
              </div>
            </motion.div>

            {/* Our Solution Card */}
            <motion.div
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-between"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                  <Lightbulb className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-4">Our Solution</h2>
                <p className="text-blue-100 leading-relaxed space-y-4">
                  LifeLink AI acts as an active **Agentic Emergency Coordinator** instead of a passive informational site. 
                  <br /><br />
                  Powered by Google Gemini, the platform instantly understands user emergency queries, estimates the urgency level, guides users through visual first-aid instructions, maps open nearby hospitals, matches blood donors, and coordinates emergency contact messaging. Voice synthesis and speech recognition enable hands-free operations in highly critical scenarios.
                </p>
              </div>
              <div className="border-t border-white/20 pt-6 mt-6">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Active Coordinator</span>
                <p className="text-sm font-semibold text-white mt-1">Directing emergency response actions when every second counts.</p>
              </div>
            </motion.div>
          </section>

          {/* AI Coordinator Details Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-100 mb-20">
            <motion.div
              className="max-w-3xl mx-auto space-y-8"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Google Gemini API (AI Studio) Integration</h3>
                  <p className="text-xs text-gray-400 font-medium">Powering the core intelligent agent</p>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Rather than outputting conversational chat scripts, the Gemini model is instructed via system prompt parameters to analyze the user's emergency parameters, extract critical data, and formulate a structured output.
                <br /><br />
                The backend parses this structured data and returns a JSON payload containing categorized first-aid steps, Do's and Don'ts, specialized hospital needs, and direct national helplines. The frontend renders these data structures into highly scannable cards, reducing visual complexity for users under extreme stress.
              </p>
            </motion.div>
          </section>

          {/* Technology Stack Grid */}
          <section className="mb-20">
            <motion.div
              className="text-center mb-12"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Technology Stack</h2>
              <p className="text-gray-500">The modern technologies powering LifeLink AI</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Code, name: 'React (Vite)', desc: 'Modern, high-performance UI library and build tool' },
                { icon: Layers, name: 'Tailwind CSS', desc: 'Utility-first styling with premium UI tokens' },
                { icon: Cpu, name: 'FastAPI', desc: 'High-speed Python microservice architecture' },
                { icon: Brain, name: 'Google Gemini', desc: 'Cognitive reasoning and response generator' },
                { icon: Database, name: 'MongoDB', desc: 'Dynamic database for blood donor profiles' },
                { icon: Map, name: 'Google Places', desc: 'Hospital location discovery API' },
                { icon: Mic, name: 'Web Speech API', desc: 'Local speech recognition and voice reading' },
                { icon: Heart, name: 'Framer Motion', desc: 'Premium micro-interactions and smooth page transitions' },
              ].map((tech, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all text-center group"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <tech.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{tech.name}</h4>
                  <p className="text-xs text-gray-400 leading-normal">{tech.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Hackathon Theme vs Future Scope Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Hackathon Theme */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-md border border-slate-100"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block" />
                Hackathon Theme Alignments
              </h3>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-sm">
                <li>
                  <strong>Agentic AI & Autonomy:</strong> LifeLink AI goes beyond a passive chatbot by autonomously coordinating response tasks, formatting medical advice, and preparing data structures.
                </li>
                <li>
                  <strong>Emerging Tech Integration:</strong> Combines LLMs with geospatial logic (Google Places API) and device capabilities (Web Speech Recognition) to build a unified response platform.
                </li>
                <li>
                  <strong>Real-world Social Impact:</strong> Directly addresses emergency death rates by standardizing immediate first aid before professional healthcare arrives.
                </li>
              </ul>
            </motion.div>

            {/* Future Scope */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-md border border-slate-100"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block" />
                Future Roadmap Scope
              </h3>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-sm">
                <li className="flex gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Real-time Ambulance tracking:</strong> Incorporate live GPS ambulance dispatch coordinates.</span>
                </li>
                <li className="flex gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Wearable smartwatch trigger:</strong> Automate emergency triggers based on sudden fall or pulse spikes.</span>
                </li>
                <li className="flex gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Multi-lingual Voice options:</strong> Support local Indian regional language prompts.</span>
                </li>
                <li className="flex gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>AR Guided First-Aid:</strong> Render animated AR overlay models for CPR or bandaging steps.</span>
                </li>
              </ul>
            </motion.div>
          </section>

          {/* Footer Team */}
          <section className="text-center py-10 border-t border-slate-200">
            <motion.div
              className="flex items-center justify-center gap-2 text-gray-500 font-semibold text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> for Google for Developers × Coding Ninjas Hackathon
            </motion.div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
