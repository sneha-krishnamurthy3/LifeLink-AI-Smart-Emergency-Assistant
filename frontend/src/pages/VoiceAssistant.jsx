import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  AlertTriangle,
  Brain,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ResponseCard from '@/components/chat/ResponseCard';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import { sendEmergencyMessage } from '@/services/api';

export default function VoiceAssistant() {
  const {
    transcript,
    isListening,
    isSupported: speechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const {
    isSpeaking,
    isSupported: ttsSupported,
    speak,
    stop: stopSpeaking,
  } = useTextToSpeech();

  // Voice Flow States: 'idle' | 'permission' | 'listening' | 'processing' | 'sending' | 'speaking'
  const [voiceState, setVoiceState] = useState('idle');
  const [spokenText, setSpokenText] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [audioVolume, setAudioVolume] = useState(0);

  // Web Audio Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Flow control refs
  const silenceTimeoutRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  // Sync transcript to local state in real-time
  useEffect(() => {
    if (transcript) {
      setSpokenText(transcript);
    }
  }, [transcript]);

  // Handle SpeechRecognition error sync
  useEffect(() => {
    if (speechError) {
      setError(speechError);
      setVoiceState('idle');
      stopAudioAnalyser();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    }
  }, [speechError]);

  // Transition out of 'speaking' state when SpeechSynthesis finishes
  useEffect(() => {
    if (voiceState === 'speaking' && !isSpeaking) {
      setVoiceState('idle');
    }
  }, [isSpeaking, voiceState]);

  // Clean up all audio and timer resources on unmount
  useEffect(() => {
    return () => {
      stopAudioAnalyser();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Web Audio Analyser
  const startAudioAnalyser = (stream) => {
    try {
      stopAudioAnalyser(); // Clear any existing analyser
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
      streamRef.current = stream;

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        let values = 0;
        const length = dataArrayRef.current.length;
        for (let i = 0; i < length; i++) {
          values += dataArrayRef.current[i];
        }
        const average = values / length;
        setAudioVolume(average);
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('[Web Audio] Analyser creation failed:', err);
    }
  };

  const stopAudioAnalyser = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {}
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setAudioVolume(0);
  };

  // Silence Auto-Submit Handler
  useEffect(() => {
    if (voiceState === 'listening' && spokenText.trim()) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Auto-stop and submit after 3.5 seconds of silence
      silenceTimeoutRef.current = setTimeout(() => {
        console.log('[VoiceAssistant] 3.5s silence detected. Auto-submitting...');
        handleStopRecording();
      }, 3500);
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [spokenText, voiceState]);

  // Action Controllers
  const handleStartRecording = async () => {
    // Speaking interruption: immediately stop SpeechSynthesis and reset
    stopSpeaking();
    
    setError(null);
    setResponse(null);
    resetTranscript();
    setSpokenText('');
    hasSubmittedRef.current = false;
    
    setVoiceState('permission');

    try {
      // Prompt microphone permissions explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Audio Waveform Analyser
      startAudioAnalyser(stream);
      
      // Start Web Speech API recognition
      const success = await startListening();
      if (success) {
        setVoiceState('listening');
      } else {
        stopAudioAnalyser();
        setVoiceState('idle');
      }
    } catch (permError) {
      console.error('[VoiceAssistant] Mic permission or device check failed:', permError);
      let errorMsg = 'Microphone permission denied. Please allow mic access in browser settings to continue.';
      if (permError.name === 'NotFoundError' || permError.name === 'DevicesNotFoundError') {
        errorMsg = 'Microphone hardware not found. Please plug in an audio input device and try again.';
      }
      setError(errorMsg);
      setVoiceState('idle');
    }
  };

  const handleStopRecording = async () => {
    if (hasSubmittedRef.current) return; // Prevent duplicate execution
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    setVoiceState('processing');
    stopListening();
    stopAudioAnalyser();

    // Check if we have gathered any spoken text
    // Fall back to current transcript just in case state isn't synced
    const finalQuery = spokenText.trim() || transcript.trim();
    if (!finalQuery) {
      setError('No speech was detected. Please click the mic and try speaking again.');
      setVoiceState('idle');
      return;
    }

    setVoiceState('sending');
    hasSubmittedRef.current = true;

    try {
      const data = await sendEmergencyMessage(finalQuery);
      setResponse(data);

      if (ttsSupported && data) {
        setVoiceState('speaking');
        const firstAidSteps = data.first_aid ? data.first_aid.join('. ') : '';
        const textToSpeak = `Identified emergency: ${data.emergency_type || 'unspecified'}. Urgency level is ${data.urgency_level || 'Medium'}. Key first aid steps: ${firstAidSteps}. ${data.hospital_advice || ''}`;
        speak(textToSpeak);
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      console.error('[VoiceAssistant] Gemini submission error:', err);
      setError(err.message || 'Failed to submit voice request to AI. Please verify network connectivity.');
      setVoiceState('idle');
    }
  };

  const handleCancelRecording = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    stopListening();
    stopAudioAnalyser();
    resetTranscript();
    setSpokenText('');
    setVoiceState('idle');
    hasSubmittedRef.current = false;
  };

  const handleMicClick = () => {
    if (voiceState === 'listening') {
      handleStopRecording();
    } else if (voiceState === 'speaking' || isSpeaking) {
      // Interruption: instantly stop reading and restart listening
      stopSpeaking();
      handleStartRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleSpeakResponse = () => {
    if (!response) return;

    if (isSpeaking) {
      stopSpeaking();
      setVoiceState('idle');
    } else {
      setVoiceState('speaking');
      const textToSpeak = `${response.emergency_type || 'Emergency Guidance'}. ${response.first_aid ? response.first_aid.join('. ') : 'Please seek professional help.'} ${response.hospital_advice || ''}`;
      speak(textToSpeak);
    }
  };

  // Status message lookup based on active state
  const getStatusText = () => {
    switch (voiceState) {
      case 'permission':
        return 'Requesting microphone access...';
      case 'listening':
        return 'Listening... Speak naturally.';
      case 'processing':
        return 'Analyzing speech transcript...';
      case 'sending':
        return 'Querying LifeLink AI Emergency Response...';
      case 'speaking':
        return 'Speaking response aloud...';
      default:
        return 'Tap microphone to start speaking';
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header Banner */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 border border-blue-100 dark:border-blue-800"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              Voice Emergency Coordinator
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Emergency Voice Assistant
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Hands-free voice assistant. Describe your medical crisis out loud, and our agentic AI will compile an Emergency Action Plan and speak the guidance back to you.
            </p>
          </div>

          {/* Compatibility warning */}
          {!speechSupported && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 text-center max-w-lg mx-auto mb-10 shadow-lg">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
              <h4 className="font-bold text-amber-800 dark:text-amber-400">Voice Recognition Unsupported</h4>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
                Your browser does not support the Web Speech API. Please switch to Google Chrome, Microsoft Edge, or Brave Browser, or use our text assistant.
              </p>
            </div>
          )}

          {speechSupported && (
            <div className="flex flex-col items-center gap-8">
              
              {/* Voice Status Indicator */}
              <div className="text-center">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                  {getStatusText()}
                </span>
              </div>

              {/* Mic Control Circle */}
              <div className="relative flex items-center justify-center w-64 h-64">
                <AnimatePresence>
                  {(voiceState === 'listening' || voiceState === 'permission') && (
                    <>
                      {/* Pulse waves */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full bg-blue-500/20 dark:bg-blue-500/10 border border-blue-500/30"
                          initial={{ opacity: 0.6, scale: 0.8 }}
                          animate={{
                            opacity: 0,
                            scale: [0.8, 1.8],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            delay: i * 0.7,
                            ease: 'easeOut',
                          }}
                        />
                      ))}

                      {/* Web Audio Analyser Waveform */}
                      {voiceState === 'listening' && (
                        <div className="absolute -bottom-6 flex items-center gap-1.5 h-12">
                          {[...Array(9)].map((_, idx) => {
                            // Scale bar height based on real average mic volume level
                            const factor = 0.4 + Math.sin(idx * 0.75) * 0.3;
                            const heightVal = Math.max(8, Math.min(48, 8 + audioVolume * factor * 1.1));
                            return (
                              <motion.div
                                key={idx}
                                className="w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-75"
                                style={{ height: `${heightVal}px` }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </AnimatePresence>

                {/* Primary Mic Button */}
                <motion.button
                  onClick={handleMicClick}
                  className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all duration-300 ${
                    voiceState === 'listening'
                      ? 'bg-red-500 hover:bg-red-600 border-red-200 dark:border-red-900/40 text-white'
                      : voiceState === 'permission'
                      ? 'bg-amber-400 border-amber-100 text-white cursor-wait animate-pulse'
                      : voiceState === 'speaking' || isSpeaking
                      ? 'bg-blue-600 border-blue-200 text-white hover:bg-blue-700'
                      : 'bg-white dark:bg-slate-900 border-blue-50 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:shadow-2xl'
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {voiceState === 'listening' ? (
                    <>
                      <MicOff className="w-14 h-14" />
                      <span className="text-[10px] font-bold tracking-wider uppercase mt-2">Stop & Send</span>
                    </>
                  ) : voiceState === 'speaking' || isSpeaking ? (
                    <>
                      <Mic className="w-14 h-14 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-wider uppercase mt-2">Speak Now</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-14 h-14" />
                      <span className="text-[10px] font-bold tracking-wider uppercase mt-2">Tap to Talk</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Action Buttons Panel */}
              {voiceState === 'listening' && (
                <div className="flex gap-4">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancelRecording}
                    icon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStopRecording}
                    icon={<Brain className="w-4 h-4" />}
                  >
                    Stop & Process
                  </Button>
                </div>
              )}

              {/* Live Transcript / Speech Preview Box */}
              {(spokenText || voiceState === 'listening') && (
                <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl p-6 w-full max-w-2xl transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-blue-500" />
                      Live Speech Transcript
                    </h4>
                    {voiceState === 'listening' && (
                      <span className="text-[10px] bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 px-2.5 py-1 rounded-full font-bold animate-pulse uppercase tracking-wider">
                        Recording...
                      </span>
                    )}
                  </div>

                  <div className="min-h-24 max-h-40 overflow-y-auto text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                    {spokenText || 'Start speaking. Your live transcript will appear here in real-time...'}
                  </div>

                  {spokenText && voiceState === 'idle' && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelRecording}
                        icon={<RotateCcw className="w-4 h-4" />}
                      >
                        Reset / Clear
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStopRecording}
                        loading={voiceState === 'sending'}
                        icon={<Brain className="w-4 h-4" />}
                      >
                        Re-Submit
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Processing and loading overlays */}
              {(voiceState === 'processing' || voiceState === 'sending') && (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <LoadingSpinner size="lg" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold animate-pulse">
                    {voiceState === 'processing'
                      ? 'Compiling final voice transcript...'
                      : 'LifeLink AI Emergency Assistant is analyzing details...'}
                  </p>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-3xl p-6 text-center max-w-2xl w-full shadow-md">
                  <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <h4 className="font-bold text-red-800 dark:text-red-400">Assistant Notice</h4>
                  <p className="text-sm text-red-700 dark:text-red-500 mt-1 leading-relaxed">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleStartRecording}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Retry Voice
                  </Button>
                </div>
              )}

              {/* Emergency Response Readout Cards */}
              <AnimatePresence>
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="w-full max-w-2xl space-y-6"
                  >
                    {/* TTS Audio bar */}
                    <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-3xl p-5 flex items-center justify-between shadow-lg border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                          {isSpeaking ? (
                            <Volume2 className="w-5 h-5 text-white animate-bounce" />
                          ) : (
                            <VolumeX className="w-5 h-5 text-blue-200" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">AI Voice Guidance</h4>
                          <p className="text-xs text-blue-100 mt-0.5">
                            {isSpeaking ? 'Reading instructions aloud...' : 'Voice readback ready'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSpeakResponse}
                        icon={isSpeaking ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                      >
                        {isSpeaking ? 'Stop Audio' : 'Play Audio'}
                      </Button>
                    </div>

                    {/* Response Card details */}
                    <ResponseCard response={response} />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
