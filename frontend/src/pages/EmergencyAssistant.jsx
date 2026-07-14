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

  // Client-side fallback for when the backend AI is unreachable
  const generateOfflineFallback = (text) => {
    const lower = text.toLowerCase();
    let emergency_type = 'General Emergency';
    let urgency_level = 'MEDIUM';
    let first_aid = ['Stay calm and assess the situation.', 'Call 112 (Emergency) or 108 (Ambulance).', 'Keep the patient comfortable and monitor breathing.'];
    let dos = ['Stay calm', 'Call for help immediately', 'Stay with the person'];
    let donts = ["Don't panic", "Don't leave the person alone", "Don't give food or water"];
    let hospital_advice = 'Please visit the nearest hospital for professional evaluation.';

    if (lower.includes('heart') || lower.includes('chest pain') || lower.includes('cardiac')) {
      emergency_type = 'Cardiac Emergency'; urgency_level = 'CRITICAL';
      first_aid = ['Call 108 (Ambulance) IMMEDIATELY.', 'Have the person sit or lie down comfortably.', 'Loosen tight clothing around the chest.', 'Begin CPR if the person becomes unresponsive and stops breathing normally.'];
      dos = ['Call 108 immediately', 'Keep the person calm and still', 'Administer aspirin (325mg) if available and not allergic'];
      donts = ["Don't leave the person alone", "Don't give food or water", "Don't delay calling emergency services"];
    } else if (lower.includes('stroke') || lower.includes('face drooping') || lower.includes('slurred speech')) {
      emergency_type = 'Suspected Stroke'; urgency_level = 'CRITICAL';
      first_aid = ['Call 108 immediately — every minute matters.', 'Use FAST: Face drooping, Arm weakness, Speech difficulty, Time to call.', 'Keep the person lying down with head slightly elevated.'];
      dos = ['Note the time symptoms started', 'Keep them calm', 'Loosen tight clothing'];
      donts = ["Don't give food or drink", "Don't let them sleep without monitoring", "Don't delay emergency call"];
    } else if (lower.includes('burn') || lower.includes('scald')) {
      emergency_type = 'Burn Injury'; urgency_level = 'HIGH';
      first_aid = ['Cool the burn under cool (not cold) running water for 10-20 minutes.', 'Remove jewelry/clothing near the burn.', 'Cover loosely with a clean bandage.', 'For severe burns, call 108 immediately.'];
      dos = ['Cool with running water', 'Cover the burn loosely', 'Seek medical help for severe burns'];
      donts = ["Don't use ice", "Don't pop blisters", "Don't apply butter or toothpaste"];
    } else if (lower.includes('bleed') || lower.includes('cut') || lower.includes('wound')) {
      emergency_type = 'Bleeding / Wound'; urgency_level = 'HIGH';
      first_aid = ['Apply firm pressure with a clean cloth.', 'Elevate the injured area above the heart if possible.', 'Keep pressure for at least 10 minutes without lifting.'];
      dos = ['Apply direct pressure', 'Elevate the limb', 'Call 108 for severe bleeding'];
      donts = ["Don't remove the cloth if soaked — add more", "Don't apply a tourniquet unless bleeding is life-threatening", "Don't remove embedded objects"];
    } else if (lower.includes('fracture') || lower.includes('broken bone') || lower.includes('fall')) {
      emergency_type = 'Suspected Fracture'; urgency_level = 'MEDIUM';
      first_aid = ['Immobilize the injured area — do not try to realign the bone.', 'Apply ice wrapped in cloth for 20 minutes.', 'Seek medical care.'];
      dos = ['Immobilize the area', 'Apply ice to reduce swelling', 'Visit a hospital for X-ray'];
      donts = ["Don't try to straighten the limb", "Don't move the person if spinal injury is suspected"];
    }

    const activeLocation = `${area || 'your area'}, ${city || 'your city'}`;
    return {
      emergency_type,
      urgency_level,
      first_aid,
      dos,
      donts,
      hospital_advice,
      emergency_numbers: ['112 - National Emergency', '108 - Ambulance (Free)', '102 - Medical Helpline', '1800-180-1104 - Poison Control'],
      disclaimer: 'This is AI-generated first aid guidance. Always consult a medical professional. Call emergency services immediately for life-threatening situations.',
      action_plan: `# 🚨 Emergency Action Plan: ${emergency_type}\n\n## ⚡ Urgency Level: ${urgency_level}\n\n## 📍 Your Location\nCurrently detected near **${activeLocation}**. Please use the **Hospital Finder** tab to view nearest hospitals on your map.\n\n## 🩹 Immediate First Aid\n${first_aid.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n## ✅ Do's\n${dos.map(d => `- ${d}`).join('\n')}\n\n## ❌ Don'ts\n${donts.map(d => `- ${d}`).join('\n')}\n\n## 🏥 Hospital Recommendation\n${hospital_advice}\n\n## 📞 Emergency Contacts\n- **112** – National Emergency\n- **108** – Free Ambulance Service\n- **102** – Medical Helpline\n\n---\n*⚠️ Note: The AI backend is currently offline. This is a pre-compiled emergency guidance card. For a real-time, location-specific action plan, please ensure the backend service is running.*\n\n> **Medical Disclaimer:** This AI provides guidance only. Always call emergency services for critical situations.`
    };
  };

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
      console.warn('[EmergencyAssistant] Backend unreachable, using client-side fallback:', error.message);
      // Generate a structured offline fallback instead of showing a raw error
      const fallback = generateOfflineFallback(text.trim());
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== typingId);
        return [...filtered, {
          id: Date.now(),
          text: fallback.action_plan,
          isUser: false,
          responseData: fallback,
        }];
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
