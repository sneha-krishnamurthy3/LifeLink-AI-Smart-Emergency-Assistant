import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertCircle, MessageSquare, Sparkles, MapPin } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import SuggestionChips from '@/components/chat/SuggestionChips';
import ResponseCard from '@/components/chat/ResponseCard';
import LocationSearch from '@/components/layout/LocationSearch';
import { sendEmergencyMessage } from '@/services/api';
import { useLocation } from '@/context/LocationContext';

const WELCOME_MESSAGE = {
  id: 'welcome',
  text: "Hello! I'm LifeLink AI, your emergency medical response coordinator.\n\nDescribe your emergency situation and I will compile an instant Emergency Action Plan tailored to your coordinates, locating nearby hospitals, and nearest blood donors.",
  isUser: false,
};

// Animated Generation Progress Timeline
const StatusTimeline = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000);
    const t2 = setTimeout(() => setStep(2), 2000);
    const t3 = setTimeout(() => setStep(3), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const steps = [
    { label: 'Detecting Live Location...', done: step > 0, active: step === 0 },
    { label: 'Finding Nearby Hospitals (OSM Overpass)...', done: step > 1, active: step === 1 },
    { label: 'Searching Blood Donors...', done: step > 2, active: step === 2 },
    { label: 'Generating Emergency Action Plan...', done: step > 3, active: step === 3 },
  ];

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-lg w-full max-w-sm space-y-2.5 mt-3">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
        Emergency Coordination Status
      </p>
      {steps.map((s, idx) => (
        <div key={idx} className="flex items-center gap-2.5 text-xs">
          {s.done ? (
            <span className="text-green-500 font-bold">✅</span>
          ) : s.active ? (
            <span className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          ) : (
            <span className="w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
          )}
          <span className={`font-semibold ${s.done ? 'text-slate-500' : s.active ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-400'}`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function EmergencyAssistant() {
  const { coordinates, address, city, area, pincode } = useLocation();

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
    };

    // Calculate conversation history in Gemini API format
    const history = messages
      .filter((m) => m.id !== 'welcome' && !m.isTyping && !m.isError)
      .map((m) => ({
        role: m.isUser ? 'user' : 'model',
        content: m.text || '',
      }));

    // Package the active location context
    const locationContext = coordinates && coordinates.lat ? {
      coordinates,
      address,
      city,
      area,
      pincode
    } : null;

    setMessages((prev) => [...prev, userMessage]);
    setShowSuggestions(false);
    setIsLoading(true);

    // Add typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: typingId, text: '', isUser: false, isTyping: true },
    ]);

    try {
      const response = await sendEmergencyMessage(text.trim(), history, locationContext);

      // Remove typing indicator and add response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== typingId);
        const aiMessage = {
          id: Date.now(),
          text: response?.action_plan || response?.emergency_type || '',
          isUser: false,
          responseData: response,
        };
        return [...filtered, aiMessage];
      });
    } catch (error) {
      console.error('[EmergencyAssistant] Chat error:', error);
      // Remove typing indicator and add error
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== typingId);
        return [
          ...filtered,
          {
            id: Date.now(),
            text: 'I apologize, but I encountered an error processing your request. Please try again or call emergency services directly at 112.',
            isUser: false,
            isError: true,
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const activeLabel = area ? `${area}, ${city}` : city;

  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 sm:px-6 py-6 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Agentic Emergency Coordinator
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-sm text-blue-100">
                Coordinating medical, hospital, and blood networks instantly
              </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-100 font-medium">Active</span>
            </div>
          </div>
        </motion.div>

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
        >
          <div className="max-w-4xl mx-auto space-y-5">
            
            {/* Active GPS Locator Status */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <MapPin className="w-4 h-4 text-primary-500 animate-bounce" />
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Assistant Coordinate:</span>
                <span className="text-slate-800 dark:text-slate-200">{activeLabel}</span>
              </div>
              <div className="w-full sm:w-72">
                <LocationSearch />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] ${message.isUser ? '' : 'w-full flex flex-col items-start'}`}>
                    {message.isTyping ? (
                      <>
                        <ChatBubble message="" isUser={false} isTyping={true} />
                        <StatusTimeline />
                      </>
                    ) : message.responseData ? (
                      <div className="space-y-3 w-full">
                        {message.responseData.emergency_type && (
                          <ChatBubble message={`Analyzing ${message.responseData.emergency_type} situation. Below is your structured Emergency Action Plan:`} isUser={false} />
                        )}
                        <ResponseCard response={message.responseData} />
                      </div>
                    ) : (
                      <div className={message.isError ? 'relative' : ''}>
                        {message.isError && (
                          <div className="absolute -left-2 -top-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                        <ChatBubble
                          message={message.text}
                          isUser={message.isUser}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Suggestion Chips */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  Quick Emergency Scenarios
                </p>
                <SuggestionChips onSelect={handleSuggestionSelect} />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            <p className="text-xs text-gray-400 text-center mt-2">
              LifeLink AI provides guidance only. Always call emergency services for critical situations.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
