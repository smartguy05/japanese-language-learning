import { useCallback, useEffect, useState } from 'react';

interface UseSpeechReturn {
  speak: (text: string) => void;
  isSpeaking: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
}

/**
 * Hook for Japanese text-to-speech using Web Speech API
 * Automatically selects Japanese voice if available
 */
export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [japaneseVoice, setJapaneseVoice] = useState<SpeechSynthesisVoice | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Find Japanese voice (prefer ja-JP)
      const jaVoice = voices.find(voice => voice.lang.startsWith('ja')) || null;
      setJapaneseVoice(jaVoice);
    };

    // Voices may load asynchronously
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Use Japanese voice if available
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    // Set language to Japanese
    utterance.lang = 'ja-JP';

    // Adjust speech parameters for clarity
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, japaneseVoice]);

  return {
    speak,
    isSpeaking,
    isSupported,
    availableVoices,
  };
}
