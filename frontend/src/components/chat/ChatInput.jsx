import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Loader2 } from 'lucide-react';

export default function ChatInput({ onSend, isLoading, onVoiceStart, isListening, suggestion }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  // Sync external suggestion into the input
  useEffect(() => {
    if (suggestion && typeof suggestion === 'string') {
      setMessage(suggestion);
      inputRef.current?.focus();
    }
  }, [suggestion]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !isLoading;

  return (
    <div className="w-full px-4 pb-4 pt-2">
      <div className="relative flex items-center gap-2 bg-white rounded-full shadow-lg border border-surface-200 pl-5 pr-2 py-2 focus-within:border-primary-300 focus-within:shadow-glow transition-all duration-200">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your emergency..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-surface-800 placeholder:text-surface-400 outline-none disabled:opacity-50"
        />

        {/* ── Mic Button ─────────────────────────────────────── */}
        {onVoiceStart && (
          <motion.button
            type="button"
            onClick={onVoiceStart}
            whileTap={{ scale: 0.9 }}
            className={`relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isListening
                ? 'bg-red-500 text-white'
                : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <Mic className="w-4 h-4 relative z-10" />
            <AnimatePresence>
              {isListening && (
                <motion.span
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-red-500"
                />
              )}
            </AnimatePresence>
          </motion.button>
        )}

        {/* ── Send Button ────────────────────────────────────── */}
        <motion.button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.9 } : {}}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            canSend
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg'
              : 'bg-surface-100 text-surface-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
