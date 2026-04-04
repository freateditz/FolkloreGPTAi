import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat,
  Share2, Heart, Download, Clock, Users, Star, Globe, BookOpen,
  ChevronLeft, Headphones, FileText, Loader2
} from 'lucide-react';
import { mockStories } from '../utils/mockData';
import { useToast } from '../hooks/use-toast';
import storyService from '../services/storyService';

// Neumorphic design tokens
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

const NeuBadge = ({ children, accent = false }) => (
  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
    style={{ background: accent ? NEU.accent : NEU.bg, color: accent ? '#fff' : NEU.textMuted, boxShadow: NEU.shadowExtrudedSm }}>
    {children}
  </span>
);

const NeuButton = ({ children, accent = false, small = false, round = false, active = false, className = '', ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer ${className}`}
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : active ? NEU.accent : NEU.text,
      boxShadow: active ? NEU.shadowInsetSm : (accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm),
      borderRadius: round ? '50%' : '16px',
      border: 'none',
      padding: round ? '0' : (small ? '8px 16px' : '14px 32px'),
      width: round ? (small ? '40px' : '64px') : undefined,
      height: round ? (small ? '40px' : '64px') : undefined,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: small ? '0.8rem' : '0.95rem',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseDown={e => { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm; }}
    {...props}
  >{children}</button>
);

const StoryDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(480);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await storyService.getStory(id);
        if (response.success && response.story) {
          setStory(response.story);
        } else {
          // Fallback to mock data
          const mockStory = mockStories.find(s => s.id.toString() === id.toString());
          if (mockStory) {
            setStory(mockStory);
          } else {
            setError('Story not found');
          }
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        // Fallback to mock data
        const mockStory = mockStories.find(s => s.id.toString() === id.toString());
        if (mockStory) {
          setStory(mockStory);
        } else {
          setError('Story not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => { if (prev >= duration) { setIsPlaying(false); return 0; } return prev + 1; });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NEU.bg }}>
        <NeuCard className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: NEU.accent }} />
          <p style={{ color: NEU.textMuted }}>Loading story...</p>
        </NeuCard>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NEU.bg }}>
        <NeuCard className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: NEU.textHeading }}>Story Not Found</h2>
          <Link to="/stories"><NeuButton accent>Back to Stories</NeuButton></Link>
        </NeuCard>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const relatedStories = mockStories.filter(s => s.id !== story.id && (s.culture === story.culture || s.category === story.category)).slice(0, 3);

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'transcript', label: 'Transcript' },
    { key: 'details', label: 'Details' },
  ];

  return (
    <div className="min-h-screen py-8" style={{ background: NEU.bg }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/stories">
          <NeuButton small className="mb-6"><ChevronLeft className="w-4 h-4" /> Back to Stories</NeuButton>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Story Header */}
            <NeuCard className="p-8 mb-8" hover={false}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <NeuBadge accent>{story.culture}</NeuBadge>
                  <NeuBadge>{story.language}</NeuBadge>
                  <NeuBadge>{story.category}</NeuBadge>
                </div>
                <div className="flex items-center gap-2">
                  <NeuButton round small active={isLiked} onClick={() => { setIsLiked(!isLiked); toast({ title: isLiked ? "Removed from favorites" : "Added to favorites" }); }}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} style={{ color: isLiked ? '#EF4444' : NEU.textMuted }} />
                  </NeuButton>
                  <NeuButton round small onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied" }); }}>
                    <Share2 className="w-4 h-4" />
                  </NeuButton>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                {story.title}
              </h1>
              <p className="text-lg mb-4" style={{ color: NEU.textMuted }}>{story.region} • Narrated by {story.narrator}</p>

              <div className="flex items-center gap-6 text-sm" style={{ color: NEU.textMuted }}>
                {[
                  { icon: Clock, text: story.duration },
                  { icon: Users, text: `${story.listeners} listeners` },
                  { icon: Star, text: story.rating, color: '#F59E0B' },
                  { icon: Headphones, text: story.difficulty },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <item.icon className="w-4 h-4" style={item.color ? { color: item.color, fill: item.color } : {}} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* Audio Player */}
            <NeuCard className="p-8 mb-8" hover={false}>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="cursor-pointer" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '999px', height: '10px', overflow: 'hidden' }}
                  onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); const percent = (e.clientX - rect.left) / rect.width; setCurrentTime(Math.floor(percent * duration)); }}>
                  <div style={{ width: `${(currentTime / duration) * 100}%`, height: '100%', background: NEU.accent, borderRadius: '999px', transition: 'width 0.3s ease' }} />
                </div>
                <div className="flex justify-between text-sm mt-2" style={{ color: NEU.textMuted }}>
                  <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <NeuButton round small onClick={() => setCurrentTime(Math.max(0, currentTime - 30))}><SkipBack className="w-5 h-5" /></NeuButton>
                <NeuButton round accent onClick={() => { setIsPlaying(!isPlaying); toast({ title: isPlaying ? "Paused" : "Playing" }); }}>
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </NeuButton>
                <NeuButton round small onClick={() => setCurrentTime(Math.min(duration, currentTime + 30))}><SkipForward className="w-5 h-5" /></NeuButton>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-3">
                <NeuButton round small onClick={() => setIsMuted(!isMuted)}>
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </NeuButton>
                <div className="w-24 cursor-pointer" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '999px', height: '6px', overflow: 'hidden' }}
                  onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - rect.left) / rect.width); setIsMuted(false); }}>
                  <div style={{ width: `${isMuted ? 0 : volume * 100}%`, height: '100%', background: NEU.accent, borderRadius: '999px' }} />
                </div>
              </div>
            </NeuCard>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex rounded-2xl mb-6" style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, padding: '4px' }}>
                {tabs.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                    style={{
                      background: activeTab === tab.key ? NEU.accent : 'transparent',
                      color: activeTab === tab.key ? '#fff' : NEU.textMuted,
                      boxShadow: activeTab === tab.key ? `inset 3px 3px 6px rgba(90,82,224,0.5), inset -3px -3px 6px rgba(139,131,255,0.3)` : 'none',
                      border: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.9rem',
                    }}>{tab.label}</button>
                ))}
              </div>

              {activeTab === 'description' && (
                <NeuCard className="p-8" hover={false}>
                  <p className="text-lg leading-relaxed mb-6" style={{ color: NEU.textMuted }}>{story.description}</p>
                  <div className="p-4 mb-6" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px' }}>
                    <h4 className="font-semibold mb-2" style={{ color: NEU.textHeading }}>Moral of the Story</h4>
                    <p className="italic" style={{ color: NEU.textMuted }}>"{story.moral}"</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, i) => <NeuBadge key={i}>{tag}</NeuBadge>)}
                  </div>
                </NeuCard>
              )}

              {activeTab === 'transcript' && (
                <NeuCard className="p-8" hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold" style={{ color: NEU.textHeading }}>Story Transcript</h4>
                    <NeuButton small><Download className="w-4 h-4" /> Download</NeuButton>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px' }}>
                    <p className="leading-relaxed whitespace-pre-line" style={{ color: NEU.textMuted }}>
                      {story.transcript}
                      {"\n\n"}The moon, seeing the suffering of the people below, wept tears of silver light. From these tears was born a beautiful daughter, blessed with the power to call forth the rains.
                      {"\n\n"}She chose to sacrifice her immortality, dancing in the fields until the clouds gathered and the rains came. Her spirit lives on in every drop of rain that falls.
                    </p>
                  </div>
                </NeuCard>
              )}

              {activeTab === 'details' && (
                <NeuCard className="p-8" hover={false}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: NEU.textHeading }}>Story Information</h4>
                      <div className="space-y-2 text-sm" style={{ color: NEU.textMuted }}>
                        {[['Duration', story.duration], ['Difficulty', story.difficulty], ['Age Group', story.ageGroup], ['Rating', `${story.rating}/5`]].map(([l, v], i) => (
                          <div key={i} className="flex justify-between"><span>{l}:</span><span>{v}</span></div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: NEU.textHeading }}>Cultural Context</h4>
                      <div className="space-y-2 text-sm" style={{ color: NEU.textMuted }}>
                        {[['Culture', story.culture], ['Region', story.region], ['Language', story.language], ['Submitted by', story.submittedBy]].map(([l, v], i) => (
                          <div key={i} className="flex justify-between"><span>{l}:</span><span>{v}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </NeuCard>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Narrator */}
            <NeuCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center font-bold text-white"
                  style={{ background: NEU.accent, borderRadius: '50%', boxShadow: `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` }}>
                  {story.narrator.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-lg font-bold" style={{ color: NEU.textHeading }}>{story.narrator}</h4>
                  <p className="text-sm" style={{ color: NEU.textMuted }}>Traditional Storyteller</p>
                </div>
              </div>
            </NeuCard>

            {/* Related Stories */}
            <NeuCard className="p-6" hover={false}>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Related Stories</h3>
              <div className="space-y-4">
                {relatedStories.map(rs => (
                  <Link key={rs.id} to={`/story/${rs.id}`}>
                    <div className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer"
                      style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, borderRadius: '16px', marginBottom: '8px' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = NEU.shadowExtrudedSm; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                        style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '12px' }}>
                        <BookOpen className="w-5 h-5" style={{ color: NEU.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1" style={{ color: NEU.textHeading }}>{rs.title}</h4>
                        <p className="text-xs mt-1" style={{ color: NEU.textMuted }}>{rs.culture} • {rs.duration}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;