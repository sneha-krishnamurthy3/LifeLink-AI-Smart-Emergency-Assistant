import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for browser Text-to-Speech (Web Speech Synthesis API).
 * Automatically selects an English voice when available.
 *
 * @returns {{
 *   isSpeaking: boolean,
 *   isSupported: boolean,
 *   speak: (text: string) => void,
 *   stop: () => void,
 * }}
 */
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  useEffect(() => {
    if (!isSupported) return;

    const selectEnglishVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      const preferred = voices.find(
        (v) => v.lang === 'en-US' && v.localService
      );
      const fallbackUS = voices.find((v) => v.lang === 'en-US');
      const fallbackEN = voices.find((v) => v.lang.startsWith('en'));
      const defaultVoice = voices.find((v) => v.default);

      voiceRef.current = preferred || fallbackUS || fallbackEN || defaultVoice || voices[0];
    };

    selectEnglishVoice();

    window.speechSynthesis.onvoiceschanged = selectEnglishVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (text) => {
      if (!isSupported || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (voiceRef.current) {
        try {
          utterance.voice = voiceRef.current;
        } catch (e) {
          console.warn('[TextToSpeech] Failed to assign voice property:', e.message);
        }
        utterance.lang = voiceRef.current.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        if (event.error !== 'canceled') {
          console.error('Speech synthesis error:', event.error);
        }
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  };
};

export default useTextToSpeech;
