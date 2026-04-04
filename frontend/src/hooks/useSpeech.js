import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for Web Speech API - Speech Recognition
 * Browser-native, no API keys needed!
 */
export const useSpeechRecognition = (options = {}) => {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript((prev) => prev + final);
        if (onResult) onResult(final);
      }
    };

    recognitionRef.current.onerror = (event) => {
      const errorMsg = getErrorMessage(event.error);
      setError(errorMsg);
      setIsListening(false);
      if (onError) onError(event.error);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        setError('Failed to start speech recognition');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    fullTranscript: transcript + interimTranscript,
  };
};

/**
 * Hook for Web Speech API - Speech Synthesis (TTS)
 * Browser-native fallback for ElevenLabs
 */
export const useSpeechSynthesis = (options = {}) => {
  const { lang = 'en-US', pitch = 1, rate = 1, volume = 1 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState([]);

  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text, voiceOptions = {}) => {
      if (!('speechSynthesis' in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.lang = voiceOptions.lang || lang;
      utteranceRef.current.pitch = voiceOptions.pitch || pitch;
      utteranceRef.current.rate = voiceOptions.rate || rate;
      utteranceRef.current.volume = voiceOptions.volume || volume;

      // Select voice if specified
      if (voiceOptions.voiceName) {
        const selectedVoice = voices.find((v) => v.name === voiceOptions.voiceName);
        if (selectedVoice) {
          utteranceRef.current.voice = selectedVoice;
        }
      }

      utteranceRef.current.onstart = () => setIsSpeaking(true);
      utteranceRef.current.onend = () => setIsSpeaking(false);
      utteranceRef.current.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utteranceRef.current);
    },
    [lang, pitch, rate, volume, voices]
  );

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
};

// Error message helper
function getErrorMessage(error) {
  const messages = {
    'no-speech': 'No speech detected. Please try speaking louder.',
    'audio-capture': 'No microphone found or microphone is disabled.',
    'not-allowed': 'Microphone permission denied. Please allow access.',
    'network': 'Network error occurred. Please check your connection.',
    'aborted': 'Speech recognition was aborted.',
    'language-not-supported': 'Selected language is not supported.',
  };
  return messages[error] || `Speech recognition error: ${error}`;
}

export default useSpeechRecognition;
