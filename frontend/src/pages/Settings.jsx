import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { useData } from '../components/DataManager';
import { mockLanguages, mockVoiceSettings } from '../utils/mockData';
import { 
  Settings as SettingsIcon, User, Volume2, Globe, Headphones, Bell,
  Shield, Eye, Download, Trash2, Save, RefreshCw, Languages, Mic,
  Speaker, Moon, Sun, Monitor
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

const NeuInput = ({ label, id, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>{label}</label>}
    <input id={id} className="w-full outline-none transition-all duration-300" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '16px', border: 'none', padding: '14px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: NEU.text }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
      {...props} />
  </div>
);

const NeuSelect = ({ label, id, options, value, onChange }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>{label}</label>}
    <select id={id} value={value} onChange={e => onChange(e.target.value)} className="w-full outline-none transition-all duration-300 cursor-pointer appearance-none" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '16px', border: 'none', padding: '14px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: value ? NEU.text : NEU.textMuted }}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const NeuToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="font-medium" style={{ color: NEU.textHeading }}>{label}</p>
      {description && <p className="text-sm mt-1" style={{ color: NEU.textMuted }}>{description}</p>}
    </div>
    <button type="button" onClick={() => onChange(!checked)} className="relative transition-all duration-300 cursor-pointer"
      style={{ width: '56px', height: '28px', background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '14px', border: 'none', padding: '2px' }}>
      <span className="block transition-all duration-300" style={{
        width: '24px', height: '24px', borderRadius: '50%',
        background: checked ? NEU.accent : '#C4CCD8',
        boxShadow: checked ? `2px 2px 4px rgba(108,99,255,0.3)` : `2px 2px 4px rgba(163,177,198,0.5)`,
        transform: checked ? 'translateX(28px)' : 'translateX(0)',
      }} />
    </button>
  </div>
);

const NeuSlider = ({ label, min, max, step, value, onChange, formatter }) => (
  <div>
    <div className="flex justify-between mb-2">
      <label className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>{label}</label>
      <span className="text-sm font-bold" style={{ color: NEU.accent }}>{formatter ? formatter(value) : value}</span>
    </div>
    <div className="relative">
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer" style={{ accentColor: NEU.accent, height: '6px' }} />
      <div className="flex justify-between text-xs mt-1" style={{ color: NEU.textMuted }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  </div>
);

const NeuButton = ({ children, accent = false, danger = false, small = false, className = '', ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer ${className}`}
    style={{
      background: danger ? '#EF4444' : accent ? NEU.accent : NEU.bg,
      color: danger || accent ? '#fff' : NEU.text,
      boxShadow: danger ? `4px 4px 8px rgba(239,68,68,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm,
      borderRadius: '16px', border: 'none',
      padding: small ? '10px 20px' : '14px 32px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: small ? '0.85rem' : '0.95rem',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseDown={e => { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm; }}
    {...props}>{children}</button>
);

const NeuIconWell = ({ children, size = 48, accent = false }) => (
  <div className="flex items-center justify-center flex-shrink-0 mx-auto"
    style={{ width: size, height: size, background: accent ? NEU.accent : NEU.bg, boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowInset, borderRadius: '50%', color: accent ? '#fff' : NEU.accent }}>
    {children}
  </div>
);

const Settings = () => {
  const { toast } = useToast();
  const { settings: savedSettings, saveSettings } = useData();
  
  const [settings, setSettings] = useState({
    voiceSpeed: mockVoiceSettings.speed, voicePitch: mockVoiceSettings.pitch,
    voiceVolume: mockVoiceSettings.volume, preferredLanguage: mockVoiceSettings.preferredLanguage,
    autoTranslate: mockVoiceSettings.autoTranslate, showTranscript: mockVoiceSettings.showTranscript,
    voiceGender: 'neutral', audioQuality: 'high',
    theme: 'system', fontSize: 'medium', autoPlay: false, continueListening: true, skipIntros: false,
    emailNotifications: true, newStoryAlerts: true, communityUpdates: false, weeklyDigest: true,
    shareListeningHistory: false, allowPersonalization: true, dataCollection: 'minimal',
    displayName: 'Story Lover', email: 'user@example.com',
    preferredCultures: ['Khasi', 'Maori'], interests: ['Creation Myths', 'Nature Stories'],
    ...savedSettings,
  });
  const [activeTab, setActiveTab] = useState('voice');

  useEffect(() => {
    if (savedSettings && Object.keys(savedSettings).length > 0) setSettings(prev => ({ ...prev, ...savedSettings }));
  }, [savedSettings]);

  const handleSettingChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSaveSettings = async () => {
    try {
      const result = await saveSettings(settings);
      if (result) { toast({ title: "Settings saved", description: "Your preferences have been updated." }); }
      else { throw new Error('Failed'); }
    } catch { toast({ title: "Save failed", description: "Please try again.", variant: "destructive" }); }
  };

  const handleResetSettings = () => {
    setSettings(prev => ({ ...prev, voiceSpeed: 1.0, voicePitch: 1.0, voiceVolume: 0.8, preferredLanguage: 'English', autoTranslate: false, showTranscript: true, theme: 'system', fontSize: 'medium', autoPlay: false }));
    toast({ title: "Settings reset", description: "All settings have been reset to defaults." });
  };

  const tabs = [
    { key: 'voice', label: 'Voice', icon: Headphones },
    { key: 'display', label: 'Display', icon: Monitor },
    { key: 'notifications', label: 'Alerts', icon: Bell },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen py-12" style={{ background: NEU.bg }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <NeuIconWell size={80} accent><SettingsIcon className="w-10 h-10" /></NeuIconWell>
          <h1 className="text-4xl md:text-5xl font-bold mt-8 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Settings</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: NEU.textMuted }}>Customize your FolkloreGPT experience</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex flex-wrap gap-2 p-2 rounded-2xl" style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
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

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <NeuCard className="p-8" hover={false}>
                <div className="flex items-center gap-3 mb-2">
                  <Headphones className="w-6 h-6" style={{ color: NEU.accent }} />
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Voice & Audio</h2>
                </div>
                <p className="mb-6" style={{ color: NEU.textMuted }}>Customize narration and voice assistant settings</p>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NeuSlider label="Speaking Speed" min={0.5} max={2.0} step={0.1} value={settings.voiceSpeed} onChange={v => handleSettingChange('voiceSpeed', v)} formatter={v => `${v.toFixed(1)}x`} />
                    <NeuSlider label="Voice Pitch" min={0.5} max={2.0} step={0.1} value={settings.voicePitch} onChange={v => handleSettingChange('voicePitch', v)} formatter={v => `${v.toFixed(1)}x`} />
                    <NeuSlider label="Volume" min={0} max={1} step={0.1} value={settings.voiceVolume} onChange={v => handleSettingChange('voiceVolume', v)} formatter={v => `${Math.round(v * 100)}%`} />
                    <NeuSelect label="Audio Quality" id="audioQuality" value={settings.audioQuality} onChange={v => handleSettingChange('audioQuality', v)}
                      options={[{ value: 'standard', label: 'Standard (128 kbps)' }, { value: 'high', label: 'High (256 kbps)' }, { value: 'premium', label: 'Premium (320 kbps)' }]} />
                  </div>
                  <NeuSelect label="Preferred Language" id="preferredLanguage" value={settings.preferredLanguage} onChange={v => handleSettingChange('preferredLanguage', v)}
                    options={mockLanguages.map(l => ({ value: l, label: l }))} />
                  <NeuSelect label="Voice Gender" id="voiceGender" value={settings.voiceGender} onChange={v => handleSettingChange('voiceGender', v)}
                    options={[{ value: 'neutral', label: 'Neutral' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
                  <NeuToggle label="Auto-Translate" description="Automatically translate stories to your preferred language" checked={settings.autoTranslate} onChange={v => handleSettingChange('autoTranslate', v)} />
                  <NeuToggle label="Show Transcript" description="Display text transcript while stories are playing" checked={settings.showTranscript} onChange={v => handleSettingChange('showTranscript', v)} />
                </div>
              </NeuCard>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <NeuCard className="p-8" hover={false}>
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-6 h-6" style={{ color: NEU.accent }} />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Display & Playback</h2>
              </div>
              <p className="mb-6" style={{ color: NEU.textMuted }}>Configure appearance and playback behavior</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: NEU.textHeading }}>Theme</label>
                  <div className="flex gap-3">
                    {[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: Monitor }].map(theme => (
                      <button key={theme.value} onClick={() => handleSettingChange('theme', theme.value)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                        style={{
                          background: settings.theme === theme.value ? NEU.accent : NEU.bg,
                          color: settings.theme === theme.value ? '#fff' : NEU.textMuted,
                          boxShadow: settings.theme === theme.value ? `inset 3px 3px 6px rgba(90,82,224,0.5), inset -3px -3px 6px rgba(139,131,255,0.3)` : NEU.shadowExtrudedSm,
                          border: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                        <theme.icon className="w-4 h-4" /> {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
                <NeuSelect label="Font Size" id="fontSize" value={settings.fontSize} onChange={v => handleSettingChange('fontSize', v)}
                  options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'xlarge', label: 'Extra Large' }]} />
                <NeuToggle label="Auto-Play" description="Automatically play next story" checked={settings.autoPlay} onChange={v => handleSettingChange('autoPlay', v)} />
                <NeuToggle label="Continue Listening" description="Resume from where you left off" checked={settings.continueListening} onChange={v => handleSettingChange('continueListening', v)} />
                <NeuToggle label="Skip Intros" description="Skip intro segments of stories" checked={settings.skipIntros} onChange={v => handleSettingChange('skipIntros', v)} />
              </div>
            </NeuCard>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <NeuCard className="p-8" hover={false}>
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-6 h-6" style={{ color: NEU.accent }} />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Notifications</h2>
              </div>
              <p className="mb-6" style={{ color: NEU.textMuted }}>Manage your notification preferences</p>
              <div className="space-y-4">
                <NeuToggle label="Email Notifications" description="Receive updates via email" checked={settings.emailNotifications} onChange={v => handleSettingChange('emailNotifications', v)} />
                <NeuToggle label="New Story Alerts" description="Get notified when new stories are published" checked={settings.newStoryAlerts} onChange={v => handleSettingChange('newStoryAlerts', v)} />
                <NeuToggle label="Community Updates" description="Updates about community events" checked={settings.communityUpdates} onChange={v => handleSettingChange('communityUpdates', v)} />
                <NeuToggle label="Weekly Digest" description="Summary of new stories each week" checked={settings.weeklyDigest} onChange={v => handleSettingChange('weeklyDigest', v)} />
              </div>
            </NeuCard>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <NeuCard className="p-8" hover={false}>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6" style={{ color: NEU.accent }} />
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Privacy & Data</h2>
                </div>
                <p className="mb-6" style={{ color: NEU.textMuted }}>Control your data and privacy settings</p>
                <div className="space-y-4">
                  <NeuToggle label="Share Listening History" description="Allow others to see what you listen to" checked={settings.shareListeningHistory} onChange={v => handleSettingChange('shareListeningHistory', v)} />
                  <NeuToggle label="Allow Personalization" description="Get personalized story recommendations" checked={settings.allowPersonalization} onChange={v => handleSettingChange('allowPersonalization', v)} />
                  <NeuSelect label="Data Collection" id="dataCollection" value={settings.dataCollection} onChange={v => handleSettingChange('dataCollection', v)}
                    options={[{ value: 'minimal', label: 'Minimal - Only essential data' }, { value: 'standard', label: 'Standard - Help improve the service' }, { value: 'full', label: 'Full - Personalized recommendations' }]} />
                </div>
              </NeuCard>
              <NeuCard className="p-8" hover={false}>
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Data Management</h3>
                <div className="flex flex-wrap gap-4">
                  <NeuButton small onClick={() => toast({ title: "Data exported" })}><Download className="w-4 h-4" /> Export Data</NeuButton>
                  <NeuButton small danger onClick={() => toast({ title: "Account deletion requested", variant: "destructive" })}><Trash2 className="w-4 h-4" /> Delete Account</NeuButton>
                </div>
              </NeuCard>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <NeuCard className="p-8" hover={false}>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6" style={{ color: NEU.accent }} />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Profile</h2>
              </div>
              <p className="mb-6" style={{ color: NEU.textMuted }}>Manage your personal information</p>
              <div className="space-y-6">
                <NeuInput label="Display Name" id="displayName" value={settings.displayName} onChange={e => handleSettingChange('displayName', e.target.value)} />
                <NeuInput label="Email" id="email" type="email" value={settings.email} onChange={e => handleSettingChange('email', e.target.value)} />
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Preferred Cultures</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.preferredCultures.map((culture, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full"
                        style={{ background: NEU.accent, color: '#fff', boxShadow: `3px 3px 6px rgba(108,99,255,0.3)` }}>{culture}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.interests.map((interest, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full"
                        style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, color: NEU.accent }}>{interest}</span>
                    ))}
                  </div>
                </div>
              </div>
            </NeuCard>
          )}

          {/* Save Bar */}
          <div className="mt-8 flex justify-between items-center">
            <NeuButton small onClick={handleResetSettings}><RefreshCw className="w-4 h-4" /> Reset Defaults</NeuButton>
            <NeuButton accent onClick={handleSaveSettings}><Save className="w-4 h-4" /> Save Settings</NeuButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;