import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Phone, Shield, Info, Siren, FileText, ClipboardList } from 'lucide-react';

const urgencyConfig = {
  critical: {
    gradient: 'from-red-600 to-red-800',
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-200',
    label: '🔴 CRITICAL',
  },
  high: {
    gradient: 'from-orange-500 to-red-600',
    badge: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
    label: '🟠 HIGH',
  },
  moderate: {
    gradient: 'from-yellow-500 to-orange-500',
    badge: 'bg-yellow-100 text-yellow-700',
    border: 'border-yellow-200',
    label: '🟡 MODERATE',
  },
  low: {
    gradient: 'from-green-500 to-emerald-600',
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-200',
    label: '🟢 LOW',
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

const parseInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const MarkdownRenderer = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;

        // Header H1
        if (trimmed.startsWith('# ')) {
          return (
            <h3 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              {trimmed.substring(2)}
            </h3>
          );
        }

        // Header H2
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={i} className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-4 mb-2">
              {trimmed.substring(3)}
            </h4>
          );
        }

        // Header H3
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={i} className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">
              {trimmed.substring(4)}
            </h5>
          );
        }

        // Bullet Point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-primary-500 mt-2 w-1 h-1 rounded-full bg-primary-500 flex-shrink-0" />
              <span>{parseInlineMarkdown(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2.5 pl-1 mt-1.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1">{parseInlineMarkdown(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={i}>{parseInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
};

export default function ResponseCard({ data: propData, response }) {
  const data = propData || response;
  const [activeTab, setActiveTab] = useState('plan'); // 'card' or 'plan'

  if (!data) return null;

  const urgency = urgencyConfig[data?.urgency_level?.toLowerCase()] || urgencyConfig.moderate;
  const hasActionPlan = !!data.action_plan;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`w-full max-w-md ${hasActionPlan ? 'md:max-w-2xl' : ''} rounded-2xl overflow-hidden border ${urgency.border} bg-white dark:bg-slate-900 shadow-xl transition-all duration-300`}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${urgency.gradient} px-5 py-4 flex items-center gap-3`}>
        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
          <Siren className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${urgency.badge} mb-1`}
          >
            {urgency.label}
          </span>
          <h3 className="text-white font-bold text-base leading-tight truncate">
            {data?.emergency_type || 'Emergency Response'}
          </h3>
        </div>
      </div>

      {/* ── Tabs Navigation (if Action Plan is present) ─────────── */}
      {hasActionPlan && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'plan'
                ? 'bg-white dark:bg-slate-900 text-primary-500 shadow-sm border border-slate-200 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Emergency Action Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'card'
                ? 'bg-white dark:bg-slate-900 text-primary-500 shadow-sm border border-slate-200 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            Quick Guidelines
          </button>
        </div>
      )}

      {/* ── Content Body ──────────────────────────────────────── */}
      <div className="p-5 space-y-5">
        {hasActionPlan && activeTab === 'plan' ? (
          /* Render Detailed Agentic Action Plan */
          <div className="py-2">
            <MarkdownRenderer text={data.action_plan} />
          </div>
        ) : (
          /* Render standard Quick Guidelines fields */
          <>
            {/* ── First Aid Steps ────────────────────────────────── */}
            {data?.first_aid?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  First Aid Steps
                </h4>
                <ol className="space-y-2.5">
                  {data.first_aid.map((step, i) => (
                    <motion.li
                      key={i}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white text-xs font-bold flex items-center justify-center shadow-sm mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed">{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>
            )}

            {/* ── Do's ───────────────────────────────────────────── */}
            {data?.dos?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-2.5 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Do&apos;s
                </h4>
                <ul className="space-y-2">
                  {data.dos.map((item, i) => (
                    <motion.li
                      key={i}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-350"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Don'ts ─────────────────────────────────────────── */}
            {data?.donts?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-2.5 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Don&apos;ts
                </h4>
                <ul className="space-y-2">
                  {data.donts.map((item, i) => (
                    <motion.li
                      key={i}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-350"
                    >
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Hospital Advice ────────────────────────────────── */}
            {data?.hospital_advice && (
              <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 uppercase tracking-wide mb-1">
                    Hospital Advice
                  </p>
                  <p className="text-sm text-primary-800 dark:text-primary-300 leading-relaxed">{data.hospital_advice}</p>
                </div>
              </div>
            )}

            {/* ── Emergency Numbers ──────────────────────────────── */}
            {data?.emergency_numbers?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  Emergency Numbers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.emergency_numbers.map((num, i) => {
                    const number = typeof num === 'object' ? num.number || num.phone : num;
                    const label = typeof num === 'object' ? num.label || num.name : num;
                    return (
                      <a
                        key={i}
                        href={`tel:${number}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Disclaimer ─────────────────────────────────────── */}
        {data?.disclaimer && (
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg p-3 border border-slate-200 dark:border-slate-850">
            <Shield className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 italic leading-relaxed">{data.disclaimer}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
