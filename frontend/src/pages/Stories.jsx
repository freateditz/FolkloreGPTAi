import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, Search, Filter, BookOpen, Globe, Clock, Users, Star,
  Heart, Headphones, Sparkles, Volume2, Eye, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { mockStories, mockCultures, mockCategories, mockLanguages } from '../utils/mockData';
import storyService from '../services/storyService';
import { useToast } from '../hooks/use-toast';
import AnimatedBackground from '../components/AnimatedBackground';

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

const NeuCard = ({ children, className = '', hover = true, style = {}, ...rest }) => (
  <div
    className={`transition-all duration-300 ${className}`}
    style={{ background: NEU.bg, boxShadow: NEU.shadowExtruded, borderRadius: '24px', ...style }}
    onMouseEnter={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-4px)'; }}}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowExtruded; e.currentTarget.style.transform = 'translateY(0)'; }}}
    {...rest}
  >
    {children}
  </div>
);

const NeuBadge = ({ children, accent = false }) => (
  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : NEU.textMuted,
      boxShadow: NEU.shadowExtrudedSm,
    }}>
    {children}
  </span>
);

const NeuButton = ({ children, accent = false, small = false, className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer ${className}`}
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : NEU.text,
      boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm,
      borderRadius: '16px',
      border: 'none',
      padding: small ? '8px 16px' : '14px 32px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: small ? '0.8rem' : '0.95rem',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseDown={e => { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm; }}
    {...props}
  >
    {children}
  </button>
);

const NeuIconWell = ({ children, size = 48, accent = false }) => (
  <div className="flex items-center justify-center flex-shrink-0 mx-auto"
    style={{
      width: size, height: size,
      background: accent ? NEU.accent : NEU.bg,
      boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowInset,
      borderRadius: '50%',
      color: accent ? '#fff' : NEU.accent,
    }}>
    {children}
  </div>
);

const Stories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCulture, setSelectedCulture] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('stories');

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchStories(true); }, []);

  const fetchStories = async (reset = false) => {
    try {
      setLoading(true); setError(null);
      const currentPage = reset ? 1 : page;
      const params = { page: currentPage, limit: 20, status: 'approved' };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedCulture !== 'all') params.culture = selectedCulture;

      console.log('📚 Fetching stories...', params);
      const response = await storyService.getStories(params);
      console.log('📚 Stories response:', response);

      if (response.success) {
        const fetchedStories = response.stories || [];
        if (reset) { setStories(fetchedStories); setPage(2); }
        else { setStories(prev => [...prev, ...fetchedStories]); setPage(prev => prev + 1); }
        setHasMore(response.pagination?.hasMore || fetchedStories.length === params.limit);
        if (fetchedStories.length === 0) {
          console.log('No stories found, using mock data');
          setStories(mockStories);
        }
      } else {
        console.error('Failed to fetch stories:', response.message);
        throw new Error(response.message || 'Failed to load stories');
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err.message || 'Failed to load stories');
      // Always show mock data on error for now
      if (stories.length === 0) {
        console.log('Using mock stories due to error');
        setStories(mockStories);
        toast({ title: "Using offline data", description: "Showing sample stories.", variant: "default" });
      }
    } finally { setLoading(false); }
  };

  const filteredStories = useMemo(() => {
    let filtered = stories;
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.culture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (story.tags && story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    if (selectedCulture !== 'all') filtered = filtered.filter(s => s.culture === selectedCulture);
    if (selectedLanguage !== 'all') filtered = filtered.filter(s => s.language === selectedLanguage);
    if (selectedCategory !== 'all') filtered = filtered.filter(s => s.category === selectedCategory);
    switch (sortBy) {
      case 'popular': filtered.sort((a, b) => parseFloat(b.listeners) - parseFloat(a.listeners)); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'duration': filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration)); break;
      default: filtered.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    }
    return filtered;
  }, [stories, searchTerm, selectedCulture, selectedLanguage, selectedCategory, sortBy]);

  const StoryCard = ({ story }) => (
    <NeuCard className="h-full overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <NeuBadge>{story.culture}</NeuBadge>
            <NeuBadge>{story.language}</NeuBadge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
            <span className="text-sm font-medium" style={{ color: NEU.text }}>{story.rating}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
          {story.title}
        </h3>
        <p className="text-sm mb-1" style={{ color: NEU.textMuted }}>{story.region} • {story.category}</p>
        <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: NEU.textMuted }}>{story.description}</p>

        <div className="flex items-center justify-between text-sm mb-4" style={{ color: NEU.textMuted }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{story.duration}</span></div>
            <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{story.listeners}</span></div>
          </div>
          <div className="flex items-center gap-1"><Headphones className="w-4 h-4" /><span className="text-xs">{story.difficulty}</span></div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {story.tags.slice(0, 3).map((tag, i) => (
            <NeuBadge key={i}>{tag}</NeuBadge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" style={{ color: NEU.accent }} />
            <div style={{ width: 64, height: 4, background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.random() * 60 + 20}%`, height: '100%', background: NEU.accent, borderRadius: '999px' }} />
            </div>
          </div>
          <Link to={`/story/${story._id || story.id}`}>
            <NeuButton accent small>
              <PlayCircle className="w-4 h-4" /> Listen
            </NeuButton>
          </Link>
        </div>
      </div>
    </NeuCard>
  );

  const CultureCard = ({ culture }) => (
    <NeuCard className="text-center h-full">
      <div className="p-6">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 text-3xl animate-neu-float"
          style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '50%' }}>
          {culture.flag}
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>{culture.name}</h3>
        <p className="text-sm mb-3" style={{ color: NEU.textMuted }}>{culture.region}</p>
        <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: NEU.textMuted }}>{culture.description}</p>
        <div className="flex items-center justify-center gap-4 text-sm mb-4" style={{ color: NEU.textMuted }}>
          <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" /><span>{culture.storyCount} stories</span></div>
          <div className="flex items-center gap-1"><Globe className="w-4 h-4" /><span className="text-xs">{culture.language}</span></div>
        </div>
        <NeuButton small onClick={() => setSelectedCulture(culture.name)} className="w-full">
          Explore Stories <Sparkles className="w-4 h-4" />
        </NeuButton>
      </div>
    </NeuCard>
  );

  const neuSelectStyle = {
    background: NEU.bg,
    boxShadow: NEU.shadowInsetSm,
    borderRadius: '12px',
    border: 'none',
    padding: '10px 14px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.85rem',
    color: NEU.text,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    minWidth: '130px',
  };

  return (
    <div className="min-h-screen relative py-12" style={{ background: NEU.bg }}>
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
            Story Collection
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: NEU.textMuted }}>
            Explore thousands of indigenous stories from cultures around the world
          </p>
        </div>

        {/* Search & Filters */}
        <NeuCard className="p-6 mb-8" hover={false}>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4" style={{ color: NEU.textMuted }} />
              <input
                placeholder="Search stories, cultures, or keywords..."
                className="w-full outline-none pl-11"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.shadowInset,
                  borderRadius: '16px',
                  border: 'none',
                  padding: '14px 20px 14px 44px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.95rem',
                  color: NEU.text,
                }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
                onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: selectedCulture, setter: setSelectedCulture, options: [{ value: 'all', label: 'All Cultures' }, ...mockCultures.map(c => ({ value: c.name, label: c.name }))] },
                { value: selectedLanguage, setter: setSelectedLanguage, options: [{ value: 'all', label: 'All Languages' }, ...mockLanguages.map(l => ({ value: l, label: l }))] },
                { value: selectedCategory, setter: setSelectedCategory, options: [{ value: 'all', label: 'All Categories' }, ...mockCategories.map(c => ({ value: c, label: c }))] },
                { value: sortBy, setter: setSortBy, options: [{ value: 'recent', label: 'Recent' }, { value: 'popular', label: 'Popular' }, { value: 'rating', label: 'Rating' }, { value: 'duration', label: 'Duration' }] },
              ].map((sel, i) => (
                <select key={i} value={sel.value} onChange={e => sel.setter(e.target.value)} style={neuSelectStyle}>
                  {sel.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ))}
            </div>
          </div>
        </NeuCard>

        {/* View Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl" style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, padding: '4px' }}>
            {[
              { key: 'stories', label: `Stories (${filteredStories.length})`, icon: BookOpen },
              { key: 'cultures', label: `Cultures (${mockCultures.length})`, icon: Globe },
            ].map(tab => (
              <button key={tab.key} onClick={() => setViewMode(tab.key)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                style={{
                  background: viewMode === tab.key ? NEU.accent : 'transparent',
                  color: viewMode === tab.key ? '#fff' : NEU.textMuted,
                  boxShadow: viewMode === tab.key ? `inset 3px 3px 6px rgba(90,82,224,0.5), inset -3px -3px 6px rgba(139,131,255,0.3)` : 'none',
                  border: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.9rem',
                }}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'stories' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map(story => <StoryCard key={story._id || story.id || Math.random().toString()} story={story} />)}
            </div>

            {filteredStories.length === 0 && (
              <div className="text-center py-16">
                <NeuIconWell size={96}>
                  <BookOpen className="w-12 h-12" />
                </NeuIconWell>
                <h3 className="text-2xl font-semibold mt-6 mb-4" style={{ color: NEU.textHeading }}>No stories found</h3>
                <p className="mb-6 max-w-md mx-auto" style={{ color: NEU.textMuted }}>Try adjusting your search criteria</p>
                <NeuButton onClick={() => { setSearchTerm(''); setSelectedCulture('all'); setSelectedLanguage('all'); setSelectedCategory('all'); }}>
                  <Filter className="w-4 h-4" /> Clear Filters
                </NeuButton>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockCultures.map(culture => <CultureCard key={culture.id} culture={culture} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16">
          <NeuCard className="p-12 text-center" hover={false} style={{ boxShadow: NEU.shadowExtrudedLg }}>
            <NeuIconWell size={64} accent>
              <Heart className="w-8 h-8" />
            </NeuIconWell>
            <h3 className="text-3xl font-bold mt-6 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Share Your Story</h3>
            <p className="mb-8 max-w-2xl mx-auto text-lg" style={{ color: NEU.textMuted }}>
              Help preserve your cultural heritage by sharing your community's stories
            </p>
            <Link to="/submit">
              <NeuButton accent>
                <Sparkles className="w-5 h-5" /> Submit a Story
              </NeuButton>
            </Link>
          </NeuCard>
        </div>
      </div>
    </div>
  );
};

export default Stories;