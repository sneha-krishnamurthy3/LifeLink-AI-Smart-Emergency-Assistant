import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import ResponseCard from './ResponseCard';

const bubbleVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-surface-400"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function ChatBubble({ message, isUser, isTyping }) {
  const isStructured =
    message &&
    typeof message === 'object' &&
    (message.urgency_level || message.first_aid);

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-end gap-2.5 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* ── Avatar ──────────────────────────────────────────── */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-700'
            : 'bg-gradient-to-br from-primary-400 to-accent-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* ── Bubble ──────────────────────────────────────────── */}
      <div
        className={`max-w-[80%] ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-md shadow-md'
            : 'rounded-2xl rounded-bl-md'
        }`}
      >
        {isTyping ? (
          <div className="bg-white rounded-2xl rounded-bl-md shadow-md border border-surface-100">
            <TypingIndicator />
          </div>
        ) : isUser ? (
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {typeof message === 'string' ? message : JSON.stringify(message)}
            </p>
          </div>
        ) : isStructured ? (
          <ResponseCard data={message} />
        ) : (
          <div className="bg-white rounded-2xl rounded-bl-md shadow-md border border-surface-100 px-4 py-3">
            <p className="text-sm text-surface-800 leading-relaxed whitespace-pre-wrap">
              {typeof message === 'string' ? message : JSON.stringify(message)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
