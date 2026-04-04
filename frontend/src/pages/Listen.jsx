import React, { useState, useEffect } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Settings, Headphones, Globe, Heart,
  Sparkles, MessageCircle, StopCircle, PlayCircle, Loader2, Languages,
  AudioLines, Radio, Waves, Zap, AlertCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/useSpeech';
import AnimatedBackground from '../components/AnimatedBackground';

const NEU = {
  bg: '#E0E5EC',
  text: '#3D4852',
  textMuted: '#6B7280',
  textHeading: '#2D3748',
  accent: '#6C63FF',
  accentLight: '#8B83FF',
  shadowExtruded: '8px 8px 16px rgba(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6)',
  shadowExtrudedSm: '4px 4px 8px rgba(163,177,198,0.7), -4px -4px 8px rgba(255,255,255,0.6)',
  shadowExtrudedLg: '12px 12px 24px rgba(163,177,198,0.7), -12px -12px 24px rgba(255,255,255,0.6)',
  shadowInset: 'inset 4px 4px 8px rgba(163,177,198,0.7), inset -4px -4px 8px rgba(255,255,255,0.6)',
  shadowInsetSm: 'inset 2px 2px 4px rgba(163,177,198,0.7), inset -2px -2px 4px rgba(255,255,255,0.6)',
  shadowHover: '10px 10px 20px rgba(163,177,198,0.7), -10px -10px 20px rgba(255,255,255,0.6)',
};

const NeuCard = ({ children, className = '', hover = true, style = {} }) => (
  <div className={`transition-all duration-300 ${className}`}
    style={{ background: NEU.bg, boxShadow: NEU.shadowExtruded, borderRadius: '24px', ...style }}
    onMouseEnter={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-4px)'; }}}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowExtruded; e.currentTarget.style.transform = 'translateY(0)'; }}}
  >{children}</div>
);

const NeuButton = ({ children, accent = false, small = false, round = false, disabled = false, className = '', ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : NEU.text,
      boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm,
      borderRadius: round ? '50%' : '16px',
      border: 'none',
      padding: round ? '0' : (small ? '10px 20px' : '14px 32px'),
      width: round ? (small ? '48px' : '128px') : undefined,
      height: round ? (small ? '48px' : '128px') : undefined,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: small ? '0.85rem' : '0.95rem',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseDown={e => { if (!disabled) { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; e.currentTarget.style.transform = 'translateY(0)'; }}}
    onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm; }}}
    disabled={disabled} {...props}
  >{children}</button>
);

const NeuIconWell = ({ children, size = 48, accent = false }) => (
  <div className="flex items-center justify-center flex-shrink-0 mx-auto"
    style={{ width: size, height: size, background: accent ? NEU.accent : NEU.bg, boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowInset, borderRadius: '50%', color: accent ? '#fff' : NEU.accent }}>
    {children}
  </div>
);

const Listen = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedCulture, setSelectedCulture] = useState('any');
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [voiceWaveform, setVoiceWaveform] = useState([]);
  const { toast } = useToast();

  // Web Speech API hooks
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    fullTranscript
  } = useSpeechRecognition({
    language: selectedLanguage,
    continuous: false,
    interimResults: true,
  });

  const {
    isSpeaking,
    speak: browserSpeak,
    stop: browserStop,
    isSupported: isSynthesisSupported
  } = useSpeechSynthesis({
    lang: selectedLanguage,
    rate: 0.9,
    pitch: 1
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Animation for voice waveform
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setVoiceWaveform(Array.from({ length: 32 }, () => Math.random() * 100));
      }, 100);
    } else { setVoiceWaveform([]); }
    return () => clearInterval(interval);
  }, [isListening]);

  // Auto-submit when speech recognition completes
  useEffect(() => {
    if (transcript && !isListening && transcript !== userMessage) {
      setUserMessage(transcript);
      handleAiResponse(transcript);
    }
  }, [transcript, isListening]);

  // Show error toast if speech recognition fails
  useEffect(() => {
    if (speechError) {
      toast({ title: "Speech Recognition Error", description: speechError, variant: "destructive" });
    }
  }, [speechError, toast]);

  const languages = [
    { value: 'en-US', label: 'English', flag: '🇺🇸' },
    { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
    { value: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
    { value: 'es-ES', label: 'Spanish', flag: '🇪🇸' },
    { value: 'fr-FR', label: 'French', flag: '🇫🇷' },
    { value: 'de-DE', label: 'German', flag: '🇩🇪' },
    { value: 'it-IT', label: 'Italian', flag: '🇮🇹' },
    { value: 'ja-JP', label: 'Japanese', flag: '🇯🇵' },
    { value: 'ko-KR', label: 'Korean', flag: '🇰🇷' },
    { value: 'zh-CN', label: 'Chinese', flag: '🇨🇳' },
    { value: 'ar-SA', label: 'Arabic', flag: '🇸🇦' },
    { value: 'pt-BR', label: 'Portuguese', flag: '🇧🇷' },
    { value: 'ru-RU', label: 'Russian', flag: '🇷🇺' },
  ];

  const cultures = [
    { value: 'any', label: 'Any Culture' },
    { value: 'khasi', label: 'Khasi' },
    { value: 'maori', label: 'Maori' },
    { value: 'cherokee', label: 'Cherokee' },
    { value: 'inuit', label: 'Inuit' },
    { value: 'zulu', label: 'Zulu' },
    { value: 'aboriginal', label: 'Aboriginal Australian' },
    { value: 'celtic', label: 'Celtic' },
    { value: 'norse', label: 'Norse' },
    { value: 'indian', label: 'Indian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
  ];

  const suggestedQueries = [
    "Tell me a story about the moon",
    "Do you know any stories about animals?",
    "Share a wisdom tale from the elders",
    "What stories do you have about nature?",
    "Tell me about creation myths",
    "Do you have any stories about heroes?"
  ];

  const handleStartListening = () => {
    if (!isSpeechSupported) {
      toast({ title: "Not Supported", description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.", variant: "destructive" });
      return;
    }
    resetTranscript();
    setUserMessage('');
    setAiResponse('');
    startListening();
    toast({ title: "Listening...", description: "Speak your question about stories" });
  };

  const handleStopListening = () => {
    stopListening();
    toast({ title: "Stopped listening" });
  };

  const handleAiResponse = async (query) => {
    setIsProcessing(true);
    setIsResponding(true);

    try {
      // Call the backend API with Gemini
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          culture: selectedCulture,
          language: selectedLanguage.split('-')[0]
        })
      });

      const data = await response.json();

      if (data.success) {
        setAiResponse(data.response);

        // Read the response aloud using ElevenLabs or browser TTS
        await speakResponse(data.response);

        setConversationHistory(prev => [...prev,
          { type: 'user', message: query, timestamp: new Date() },
          { type: 'ai', message: data.response, timestamp: new Date() }
        ]);
      } else {
        // Fallback response
        const fallbackResponse = "I have a treasure trove of stories from indigenous cultures worldwide. What themes interest you?";
        setAiResponse(fallbackResponse);
        await speakResponse(fallbackResponse);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorResponse = "I'm having trouble connecting right now. Please try again.";
      setAiResponse(errorResponse);
    } finally {
      setIsProcessing(false);
      setIsResponding(false);
    }
  };

  const speakResponse = async (text) => {
    if (isMuted) return;

    try {
      // Try ElevenLabs first
      const response = await fetch(`${BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500) }) // Limit to 500 chars
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        await audio.play();

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        // Fallback to browser TTS
        if (isSynthesisSupported) {
          browserSpeak(text);
        }
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Fallback to browser TTS
      if (isSynthesisSupported) {
        browserSpeak(text);
      }
    }
  };

  const handleQuickQuery = (query) => {
    setUserMessage(query);
    handleAiResponse(query);
  };

  const neuSelectStyle = {
    background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '12px',
    border: 'none', padding: '12px 16px', fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem', color: NEU.text, outline: 'none', appearance: 'none',
    cursor: 'pointer', width: '100%',
  };

  return (
    <div className="min-h-screen relative py-12 overflow-hidden" style={{ background: NEU.bg }}>
      <AnimatedBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <NeuIconWell size={96} accent>
            <Headphones className="w-12 h-12" />
          </NeuIconWell>
          <h1 className="text-5xl md:text-6xl font-bold mt-8 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
            Voice Assistant
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: NEU.textMuted }}>
            Ask me about stories, folklore, or myths from any culture using your voice.
          </p>

          {!isSpeechSupported && (
            <div className="mt-4 p-4 rounded-xl flex items-center justify-center gap-2" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <AlertCircle className="w-5 h-5" />
              <span>Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Voice Interface */}
            <NeuCard className="p-8 mb-8 text-center" hover={false}>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                {isListening ? '🎙️ Listening...' : isProcessing ? '🧠 Thinking...' : isResponding ? '💭 Speaking...' : isSpeaking ? '🔊 Speaking...' : '✨ Ready'}
              </h2>
              <p className="mb-8" style={{ color: NEU.textMuted }}>
                {isListening ? 'Speak your question now...' : isProcessing ? 'Understanding your request...' : isResponding ? 'Preparing response...' : isSpeaking ? 'Reading the story...' : 'Click the microphone and speak'}
              </p>

              {/* Waveform */}
              {(isListening || isSpeaking) && (
                <div className="flex items-end justify-center gap-1 mb-8 h-20">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} style={{
                      width: '4px',
                      height: isListening ? `${Math.max(voiceWaveform[i] || 10, 10)}%` : `${Math.random() * 60 + 20}%`,
                      background: NEU.accent,
                      borderRadius: '999px',
                      transition: 'height 150ms'
                    }} />
                  ))}
                </div>
              )}

              {/* Main Button */}
              <div className="mb-8">
                <NeuButton
                  round
                  accent={!isListening}
                  onClick={isListening ? handleStopListening : handleStartListening}
                  disabled={isProcessing || isResponding || !isSpeechSupported}
                  style={{
                    background: isListening ? '#EF4444' : NEU.accent,
                    boxShadow: isListening
                      ? `4px 4px 8px rgba(239,68,68,0.3), -4px -4px 8px rgba(255,255,255,0.6)`
                      : `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)`,
                  }}>
                  {isProcessing || isResponding ? <Loader2 className="w-12 h-12 animate-spin" /> :
                    isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                </NeuButton>
              </div>

              {/* Live Transcript */}
              {(interimTranscript || transcript) && isListening && (
                <div className="mb-4 p-4" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px' }}>
                  <p className="text-lg" style={{ color: NEU.text }}>
                    {transcript}<span style={{ color: NEU.textMuted }}>{interimTranscript}</span>
                  </p>
                </div>
              )}

              {/* Messages */}
              {userMessage && !isListening && (
                <div className="mb-4 p-4 text-left" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4" style={{ color: NEU.accent }} />
                    <span className="font-semibold" style={{ color: NEU.textHeading }}>You asked:</span>
                  </div>
                  <p className="italic" style={{ color: NEU.textMuted }}>"{userMessage}"</p>
                </div>
              )}

              {aiResponse && (
                <div className="mb-4 p-4 text-left" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AudioLines className="w-4 h-4" style={{ color: NEU.accent }} />
                    <span className="font-semibold" style={{ color: NEU.textHeading }}>FolkloreGPT says:</span>
                    {isSpeaking && <span className="text-xs ml-2" style={{ color: NEU.accent }}>🔊 Speaking...</span>}
                  </div>
                  <p className="leading-relaxed" style={{ color: NEU.textMuted }}>{aiResponse}</p>
                </div>
              )}

              {/* Volume */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <NeuButton round small onClick={() => { setIsMuted(!isMuted); if (isMuted) browserStop(); }}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </NeuButton>
                <div className="w-32 cursor-pointer" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '999px', height: '8px', overflow: 'hidden' }}
                  onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - rect.left) / rect.width); setIsMuted(false); }}>
                  <div style={{ width: `${isMuted ? 0 : volume * 100}%`, height: '100%', background: NEU.accent, borderRadius: '999px' }} />
                </div>
                <span className="text-sm font-medium min-w-[3rem]" style={{ color: NEU.textMuted }}>{Math.round(volume * 100)}%</span>
              </div>
            </NeuCard>

            {/* Quick Queries */}
            <NeuCard className="p-8 mb-8" hover={false}>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                <MessageCircle className="w-6 h-6" style={{ color: NEU.accent }} />
                Quick Questions
              </h2>
              <p className="mb-6" style={{ color: NEU.textMuted }}>Try these to begin your storytelling adventure</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedQueries.map((query, index) => (
                  <NeuButton key={index} small onClick={() => handleQuickQuery(query)} disabled={isListening || isProcessing || isResponding}
                    className="text-left justify-start" style={{ padding: '14px 20px' }}>
                    <Radio className="w-4 h-4 flex-shrink-0" style={{ color: NEU.accent }} />
                    <span className="leading-relaxed">{query}</span>
                  </NeuButton>
                ))}
              </div>
            </NeuCard>

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <NeuCard className="p-8" hover={false}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                  <AudioLines className="w-6 h-6" style={{ color: NEU.accent }} />
                  Conversation History
                  <span className="text-sm font-medium px-3 py-1 rounded-full ml-2"
                    style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, color: NEU.accent }}>
                    {conversationHistory.length / 2} exchanges
                  </span>
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {conversationHistory.map((item, index) => (
                    <div key={index} className="p-4 transition-all duration-300"
                      style={{
                        background: NEU.bg,
                        boxShadow: item.type === 'user' ? NEU.shadowInsetSm : NEU.shadowExtrudedSm,
                        borderRadius: '16px',
                        borderLeft: `4px solid ${item.type === 'user' ? NEU.accent : NEU.accentLight}`,
                      }}>
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'user' ? <Mic className="w-4 h-4" style={{ color: NEU.accent }} /> : <AudioLines className="w-4 h-4" style={{ color: NEU.accentLight }} />}
                        <span className="font-semibold" style={{ color: NEU.textHeading }}>{item.type === 'user' ? 'You' : 'FolkloreGPT'}</span>
                        <span className="text-xs ml-auto" style={{ color: NEU.textMuted }}>{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="leading-relaxed" style={{ color: NEU.textMuted }}>{item.message}</p>
                    </div>
                  ))}
                </div>
              </NeuCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Voice Settings */}
            <NeuCard className="p-6" hover={false}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                <Settings className="w-5 h-5" style={{ color: NEU.accent }} />
                Voice Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: NEU.textHeading }}>🗣️ Recognition Language</label>
                  <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} style={neuSelectStyle}>
                    {languages.map(l => <option key={l.value} value={l.value}>{l.flag} {l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: NEU.textHeading }}>🌍 Preferred Culture</label>
                  <select value={selectedCulture} onChange={e => setSelectedCulture(e.target.value)} style={neuSelectStyle}>
                    {cultures.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </NeuCard>

            {/* Tips */}
            <NeuCard className="p-6" hover={false}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                <Sparkles className="w-5 h-5" style={{ color: NEU.accent }} />
                Tips
              </h3>
              <div className="space-y-4 text-sm" style={{ color: NEU.textMuted }}>
                {[
                  { icon: Globe, text: "Ask for stories from specific cultures or regions" },
                  { icon: Heart, text: "Request stories with particular themes or moral lessons" },
                  { icon: Languages, text: "Speak clearly for better recognition" },
                  { icon: PlayCircle, text: "The AI will read responses aloud automatically" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300"
                    style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, borderRadius: '16px' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = NEU.shadowExtrudedSm; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <tip.icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: NEU.accent }} />
                    <p className="leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listen;
