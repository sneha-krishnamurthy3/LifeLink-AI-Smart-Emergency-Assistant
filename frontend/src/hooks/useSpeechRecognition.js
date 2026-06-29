import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for browser Speech Recognition (Web Speech API).
 * Supports continuous listening with interim results.
 *
 * @returns {{
 *   transcript: string,
 *   isListening: boolean,
 *   isSupported: boolean,
 *   error: string|null,
 *   startListening: () => void,
 *   stopListening: () => void,
 *   resetTranscript: () => void,
 * }}
 */
const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = typeof navigator !== 'undefined' ? (navigator.language || 'en-IN') : 'en-IN';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('[SpeechRecognition ERROR]:', event.error);
      let message;
      switch (event.error) {
        case 'no-speech':
          // Just log no-speech and do not force terminate state immediately.
          // The auto-stop silence handler in the page will deal with it.
          console.warn('[SpeechRecognition] No speech detected in this interval.');
          return;
        case 'audio-capture':
          message = 'Microphone hardware not found or unavailable.';
          break;
        case 'not-allowed':
          message = 'Microphone access denied. Please allow microphone permissions.';
          break;
        case 'network':
          message = 'Network error during speech recognition. Please check your connection.';
          break;
        case 'aborted':
          // Aborted by user or cancel event, silence message
          message = null;
          break;
        default:
          message = `Speech recognition error: ${event.error}`;
          break;
      }
      if (message) setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[SpeechRecognition] Session naturally ended.');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {
        // Safe ignore
      }
      recognitionRef.current = null;
    };
  }, [isSupported]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return false;
    }

    setError(null);

    // Request permissions explicitly using getUserMedia before starting SpeechRecognition
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release permissions lock immediately, standard behavior
      stream.getTracks().forEach((track) => track.stop());
    } catch (permError) {
      console.error('[SpeechRecognition] Microphone access check failed:', permError);
      let errorMsg = 'Microphone permission denied. Please allow mic access in browser settings.';
      if (permError.name === 'NotFoundError' || permError.name === 'DevicesNotFoundError') {
        errorMsg = 'Microphone hardware not found or unavailable.';
      }
      setError(errorMsg);
      setIsListening(false);
      return false;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return false;

    try {
      recognition.start();
      setIsListening(true);
      return true;
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        // Recognition is already active
        setIsListening(true);
        return true;
      } else {
        setError(`Failed to start speech recognition: ${err.message}`);
        setIsListening(false);
        return false;
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Safe ignore
      }
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
