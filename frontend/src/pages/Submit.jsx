import React, { useState, useCallback } from 'react';
import { useToast } from '../hooks/use-toast';
import { useData } from '../components/DataManager';
import { mockCultures, mockLanguages, mockCategories } from '../utils/mockData';
import AudioRecorder from '../components/AudioRecorder';
import storyService from '../services/storyService';
import { ocrService } from '../services/ocrService';
import AnimatedBackground from '../components/AnimatedBackground';
import {
  Upload, Mic, Play, Pause, StopCircle, FileText, Image as ImageIcon, Heart, Shield,
  CheckCircle, AlertCircle, Loader2, X, FileAudio, Camera, Sparkles, Star,
  Globe, BookOpen, Users, Zap, Volume2, Scan, FileImage, Languages
} from 'lucide-react';

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
    onMouseEnter={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowExtruded; e.currentTarget.style.transform = 'translateY(0)'; }}}
  >{children}</div>
);

const NeuInput = ({ label, id, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
      {label} {required && <span style={{ color: NEU.accent }}>*</span>}
    </label>
    <input id={id} required={required} className="w-full outline-none transition-all duration-300"
      style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '16px', border: 'none', padding: '14px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: NEU.text }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
      {...props} />
  </div>
);

const NeuTextarea = ({ label, id, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
      {label} {required && <span style={{ color: NEU.accent }}>*</span>}
    </label>
    <textarea id={id} required={required} className="w-full outline-none transition-all duration-300 resize-none"
      style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '16px', border: 'none', padding: '14px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: NEU.text, minHeight: '120px' }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
      {...props} />
  </div>
);

const NeuSelect = ({ label, id, required, options, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
      {label} {required && <span style={{ color: NEU.accent }}>*</span>}
    </label>
    <select id={id} required={required} value={value} onChange={e => onChange(e.target.value)}
      className="w-full outline-none transition-all duration-300 cursor-pointer appearance-none"
      style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '16px', border: 'none', padding: '14px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: value ? NEU.text : NEU.textMuted }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}>
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>{typeof opt === 'string' ? opt : opt.label}</option>)}
    </select>
  </div>
);

const NeuButton = ({ children, accent = false, disabled = false, className = '', ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : NEU.text,
      boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm,
      borderRadius: '16px', border: 'none', padding: '14px 32px',
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseDown={e => { if (!disabled) { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; e.currentTarget.style.transform = 'translateY(0)'; }}}
    onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm; }}}
    disabled={disabled} {...props}>{children}</button>
);

const NeuIconWell = ({ children, size = 48, accent = false }) => (
  <div className="flex items-center justify-center flex-shrink-0 mx-auto"
    style={{ width: size, height: size, background: accent ? NEU.accent : NEU.bg, boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowInset, borderRadius: '50%', color: accent ? '#fff' : NEU.accent }}>
    {children}
  </div>
);

const Submit = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', culture: '', language: '', region: '', category: '', ageGroup: '', difficulty: '',
    description: '', storyText: '', moral: '', tags: [], narrator: '', submitterName: '', submitterEmail: '',
    culturalContext: '', permissions: false, attribution: false, respectfulUse: false,
  });
  const [audioFiles, setAudioFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const { toast } = useToast();
  const { saveSubmission } = useData();

  const ageGroups = ['Children', 'Young Adults', 'Adults', 'All Ages'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const tagSuggestions = ['Creation', 'Nature', 'Animals', 'Wisdom', 'Love', 'Adventure', 'Magic', 'Heroes', 'Spirits', 'Family'];

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleTagAdd = (tag) => { if (!formData.tags.includes(tag)) setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] })); };
  const handleTagRemove = (tagToRemove) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));

  const handleRecordingComplete = (audioFile, duration) => {
    setAudioFiles(prev => [...prev, { id: Date.now(), file: audioFile, name: `Recording ${audioFiles.length + 1}`, duration, size: audioFile.size }]);
    toast({ title: "Recording saved" });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      setImageFiles(prev => [...prev, { id: Date.now() + Math.random(), file, name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, type: file.type, url: URL.createObjectURL(file) }]);
    });
    toast({ title: "Images uploaded", description: `${files.length} image(s) added` });
  };

  const handleOCR = useCallback(async (imageFile) => {
    if (!ocrService.isValidImage(imageFile.file)) {
      toast({ title: "Invalid file", description: "Please upload a valid image file (JPG, PNG, WebP)", variant: "destructive" });
      return;
    }

    setIsProcessingOCR(true);
    setOcrProgress(0);
    setShowOCRModal(true);

    try {
      const result = await ocrService.extractText(imageFile.file, selectedLanguage);

      if (result.success) {
        setExtractedText(result.text);
        toast({ title: "Text extracted!", description: `Confidence: ${Math.round(result.confidence)}%` });

        // Auto-fill story text if empty
        if (!formData.storyText && result.text.trim()) {
          handleInputChange('storyText', result.text.trim());
          toast({ title: "Story text auto-filled", description: "Review and edit as needed" });
        }
      } else {
        toast({ title: "OCR failed", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "OCR error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessingOCR(false);
    }
  }, [selectedLanguage, formData.storyText, toast]);

  const removeAudioFile = (id) => setAudioFiles(prev => prev.filter(a => a.id !== id));
  const removeImageFile = (id) => { setImageFiles(prev => { const f = prev.find(i => i.id === id); if (f?.url) URL.revokeObjectURL(f.url); return prev.filter(i => i.id !== id); }); };

  const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}:${s.toString().padStart(2, '0')}`; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const storyData = { ...formData, submissionType: activeTab };
      const audioFilesToUpload = audioFiles.map(a => a.file);
      const imageFilesToUpload = imageFiles.map(i => i.file);
      const progressInterval = setInterval(() => { setUploadProgress(prev => { if (prev >= 90) { clearInterval(progressInterval); return 90; } return prev + 10; }); }, 200);
      const result = await storyService.submitStory(storyData, audioFilesToUpload, imageFilesToUpload);
      clearInterval(progressInterval); setUploadProgress(100);
      if (result.success) {
        toast({ title: "Story submitted!", description: `"${formData.title}" is pending review.` });
        setFormData({ title: '', culture: '', language: '', region: '', category: '', ageGroup: '', difficulty: '', description: '', storyText: '', moral: '', tags: [], narrator: '', submitterName: '', submitterEmail: '', culturalContext: '', permissions: false, attribution: false, respectfulUse: false });
        setAudioFiles([]); setImageFiles([]); setActiveTab('text');
      } else throw new Error(result.message || 'Failed');
    } catch (error) {
      try {
        await saveSubmission({ ...formData, activeTab, audioFiles: audioFiles.map(a => ({ ...a, file: null })), imageFiles: imageFiles.map(i => ({ ...i, file: null })), submissionType: activeTab });
        toast({ title: "Saved locally", description: "Couldn't connect to server.", variant: "destructive" });
      } catch { toast({ title: "Submission failed", description: error.message || "Please try again.", variant: "destructive" }); }
    } finally { setIsSubmitting(false); setUploadProgress(0); }
  };

  const tabs = [
    { key: 'text', label: 'Text Story', icon: FileText },
    { key: 'audio', label: 'Audio Recording', icon: Mic },
    { key: 'mixed', label: 'Mixed Media', icon: Camera },
  ];

  return (
    <div className="min-h-screen relative py-12 overflow-hidden" style={{ background: NEU.bg }}>
      <AnimatedBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <NeuIconWell size={96} accent><Heart className="w-12 h-12" /></NeuIconWell>
          <h1 className="text-5xl md:text-6xl font-bold mt-8 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Share Your Story</h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: NEU.textMuted }}>Help preserve cultural heritage by sharing your community's stories and folklore</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-2 rounded-2xl" style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm }}>
              {tabs.map(tab => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                  style={{
                    background: activeTab === tab.key ? NEU.accent : 'transparent',
                    color: activeTab === tab.key ? '#fff' : NEU.textMuted,
                    boxShadow: activeTab === tab.key ? `inset 3px 3px 6px rgba(90,82,224,0.5), inset -3px -3px 6px rgba(139,131,255,0.3)` : 'none',
                    border: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem',
                  }}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Story Information */}
          <NeuCard className="p-8 mb-8" hover={false}>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6" style={{ color: NEU.accent }} />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Story Information</h2>
            </div>
            <p className="mb-6" style={{ color: NEU.textMuted }}>Tell us about your story and its cultural background</p>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NeuInput label="Story Title" id="title" required value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="e.g., The Moon's Daughter" />
                <NeuSelect label="Culture" id="culture" required options={mockCultures.map(c => ({ value: c.name, label: c.name }))} value={formData.culture} onChange={v => handleInputChange('culture', v)} placeholder="Select culture" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NeuSelect label="Language" id="language" required options={mockLanguages.map(l => ({ value: l, label: l }))} value={formData.language} onChange={v => handleInputChange('language', v)} placeholder="Select language" />
                <NeuInput label="Region" id="region" required value={formData.region} onChange={e => handleInputChange('region', e.target.value)} placeholder="e.g., Northeast India" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <NeuSelect label="Category" id="category" required options={mockCategories.map(c => ({ value: c, label: c }))} value={formData.category} onChange={v => handleInputChange('category', v)} placeholder="Select category" />
                <NeuSelect label="Age Group" id="ageGroup" options={ageGroups.map(a => ({ value: a, label: a }))} value={formData.ageGroup} onChange={v => handleInputChange('ageGroup', v)} placeholder="Select age group" />
                <NeuSelect label="Difficulty" id="difficulty" options={difficulties.map(d => ({ value: d, label: d }))} value={formData.difficulty} onChange={v => handleInputChange('difficulty', v)} placeholder="Select difficulty" />
              </div>
              <NeuTextarea label="Description" id="description" required value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Brief description of your story..." />

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Tags</label>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full"
                        style={{ background: NEU.accent, color: '#fff', boxShadow: `3px 3px 6px rgba(108,99,255,0.3)` }}>
                        {tag}
                        <button type="button" onClick={() => handleTagRemove(tag)} className="ml-1 opacity-80 hover:opacity-100 cursor-pointer" style={{ background: 'none', border: 'none', color: '#fff' }}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {tagSuggestions.filter(t => !formData.tags.includes(t)).map(tag => (
                    <button key={tag} type="button" onClick={() => handleTagAdd(tag)}
                      className="text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 cursor-pointer"
                      style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, border: 'none', color: NEU.textMuted }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.color = NEU.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = NEU.shadowExtrudedSm; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.color = NEU.textMuted; }}>
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Story Content */}
          <NeuCard className="p-8 mb-8" hover={false}>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6" style={{ color: NEU.accent }} />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Story Content</h2>
            </div>
            <p className="mb-6" style={{ color: NEU.textMuted }}>
              {activeTab === 'text' ? 'Write or paste your story text below' : activeTab === 'audio' ? 'Record your story using the audio recorder' : 'Add text, audio, and images'}
            </p>

            {(activeTab === 'text' || activeTab === 'mixed') && (
              <div className="space-y-5">
                <NeuTextarea label="Story Text" id="storyText" required={activeTab === 'text'} value={formData.storyText}
                  onChange={e => handleInputChange('storyText', e.target.value)} placeholder="Write your story here..."
                  style={{ minHeight: '240px' }} />
                <NeuInput label="Moral of the Story" id="moral" value={formData.moral} onChange={e => handleInputChange('moral', e.target.value)} placeholder="What lesson does this story teach?" />
                <NeuTextarea label="Cultural Context" id="culturalContext" value={formData.culturalContext}
                  onChange={e => handleInputChange('culturalContext', e.target.value)} placeholder="Provide cultural background for this story..." />
              </div>
            )}

            {(activeTab === 'audio' || activeTab === 'mixed') && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: NEU.textHeading }}>Audio Recordings</h3>
                <div className="p-6 mb-4" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '20px' }}>
                  <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                </div>
                {audioFiles.length > 0 && (
                  <div className="space-y-3">
                    {audioFiles.map(audio => (
                      <div key={audio.id} className="flex items-center justify-between p-4 transition-all duration-300"
                        style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, borderRadius: '16px' }}>
                        <div className="flex items-center gap-3">
                          <FileAudio className="w-5 h-5" style={{ color: NEU.accent }} />
                          <div>
                            <p className="font-medium" style={{ color: NEU.textHeading }}>{audio.name}</p>
                            <p className="text-xs" style={{ color: NEU.textMuted }}>{formatTime(audio.duration)} • {(audio.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeAudioFile(audio.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300"
                          style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, border: 'none', color: '#EF4444' }}
                          onMouseDown={e => { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; }}
                          onMouseUp={e => { e.currentTarget.style.boxShadow = NEU.shadowExtrudedSm; }}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mixed' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: NEU.textHeading }}>Images</h3>
                    <p className="text-xs" style={{ color: NEU.textMuted }}>Upload images with text to auto-extract using OCR</p>
                  </div>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-sm px-3 py-1 rounded-lg cursor-pointer"
                    style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, border: 'none', color: NEU.text }}
                  >
                    <option value="eng">🇺🇸 English</option>
                    <option value="spa">🇪🇸 Spanish</option>
                    <option value="fra">🇫🇷 French</option>
                    <option value="deu">🇩🇪 German</option>
                    <option value="ita">🇮🇹 Italian</option>
                    <option value="por">🇵🇹 Portuguese</option>
                    <option value="rus">🇷🇺 Russian</option>
                    <option value="chi_sim">🇨🇳 Chinese (Simp)</option>
                    <option value="jpn">🇯🇵 Japanese</option>
                    <option value="kor">🇰🇷 Korean</option>
                    <option value="ara">🇸🇦 Arabic</option>
                    <option value="hin">🇮🇳 Hindi</option>
                  </select>
                </div>
                <label className="flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300"
                  style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '20px', border: `2px dashed ${NEU.textMuted}40` }}>
                  <ImageIcon className="w-10 h-10 mb-3" style={{ color: NEU.textMuted }} />
                  <span className="font-medium" style={{ color: NEU.textMuted }}>Click to upload images</span>
                  <span className="text-xs mt-1" style={{ color: NEU.textMuted }}>PNG, JPG, WebP - Extract text with OCR!</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {imageFiles.map(img => (
                      <div key={img.id} className="relative group" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: NEU.shadowExtrudedSm }}>
                        <img src={img.url} alt={img.name} className="w-full h-32 object-cover" />
                        {/* OCR Button */}
                        <button
                          type="button"
                          onClick={() => handleOCR(img)}
                          disabled={isProcessingOCR}
                          className="absolute bottom-2 left-2 px-2 py-1 flex items-center gap-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-xs font-medium"
                          style={{ background: NEU.accent, color: '#fff', border: 'none' }}
                        >
                          {isProcessingOCR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scan className="w-3 h-3" />}
                          OCR
                        </button>
                        {/* Delete Button */}
                        <button type="button" onClick={() => removeImageFile(img.id)}
                          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          style={{ background: '#EF4444', color: '#fff', border: 'none' }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* OCR Modal */}
                {showOCRModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="max-w-lg w-full p-6" style={{ background: NEU.bg, borderRadius: '24px', boxShadow: NEU.shadowExtrudedLg }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: NEU.textHeading }}>
                          <Scan className="w-5 h-5" style={{ color: NEU.accent }} />
                          OCR Result
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowOCRModal(false)}
                          className="p-1 rounded-full"
                          style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, border: 'none' }}
                        >
                          <X className="w-5 h-5" style={{ color: NEU.textMuted }} />
                        </button>
                      </div>

                      {isProcessingOCR ? (
                        <div className="py-8 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: NEU.accent }} />
                          <p style={{ color: NEU.textMuted }}>Extracting text from image...</p>
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={extractedText}
                            onChange={(e) => setExtractedText(e.target.value)}
                            className="w-full p-4 mb-4 resize-none"
                            style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '12px', border: 'none', minHeight: '150px', color: NEU.text }}
                            placeholder="Extracted text will appear here..."
                          />
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange('storyText', extractedText);
                                setShowOCRModal(false);
                                toast({ title: "Text added to story!" });
                              }}
                              className="flex-1 py-2 rounded-lg font-medium"
                              style={{ background: NEU.accent, color: '#fff', border: 'none' }}
                              disabled={!extractedText.trim()}
                            >
                              Add to Story
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowOCRModal(false)}
                              className="flex-1 py-2 rounded-lg font-medium"
                              style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, border: 'none', color: NEU.text }}
                            >
                              Close
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </NeuCard>

          {/* Submitter Information */}
          <NeuCard className="p-8 mb-8" hover={false}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6" style={{ color: NEU.accent }} />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Submitter Information</h2>
            </div>
            <p className="mb-6" style={{ color: NEU.textMuted }}>Tell us about yourself and the narrator</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <NeuInput label="Your Name" id="submitterName" required value={formData.submitterName} onChange={e => handleInputChange('submitterName', e.target.value)} placeholder="Your full name" />
              <NeuInput label="Your Email" id="submitterEmail" type="email" required value={formData.submitterEmail} onChange={e => handleInputChange('submitterEmail', e.target.value)} placeholder="your.email@example.com" />
              <NeuInput label="Narrator Name" id="narrator" value={formData.narrator} onChange={e => handleInputChange('narrator', e.target.value)} placeholder="Traditional storyteller name" />
            </div>
          </NeuCard>

          {/* Agreements */}
          <NeuCard className="p-8 mb-8" hover={false}>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6" style={{ color: NEU.accent }} />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Cultural Agreements</h2>
            </div>
            <p className="mb-6" style={{ color: NEU.textMuted }}>Please confirm the following before submitting</p>
            <div className="space-y-4">
              {[
                { key: 'permissions', label: 'I have proper permission from my community to share this story' },
                { key: 'attribution', label: 'I agree to proper cultural attribution being included' },
                { key: 'respectfulUse', label: 'I understand this story will be used for educational and cultural preservation purposes only' },
              ].map(item => (
                <div key={item.key} className="flex items-start gap-3 p-4"
                  style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px' }}>
                  <input type="checkbox" id={item.key} checked={formData[item.key]} onChange={e => handleInputChange(item.key, e.target.checked)}
                    className="mt-1" style={{ accentColor: NEU.accent }} required />
                  <label htmlFor={item.key} className="text-sm leading-relaxed cursor-pointer" style={{ color: NEU.textMuted }}>{item.label}</label>
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="mb-8 p-6" style={{ background: NEU.bg, boxShadow: NEU.shadowExtruded, borderRadius: '24px' }}>
              <div className="flex justify-between mb-2">
                <span className="font-medium" style={{ color: NEU.textHeading }}>Uploading...</span>
                <span className="font-bold" style={{ color: NEU.accent }}>{uploadProgress}%</span>
              </div>
              <div style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: NEU.accent, borderRadius: '999px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <NeuButton type="submit" accent disabled={isSubmitting} className="text-lg px-12 py-4">
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="w-5 h-5" /> Submit Story</>
              )}
            </NeuButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Submit;