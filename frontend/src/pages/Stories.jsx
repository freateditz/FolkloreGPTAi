import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle, Search, Filter, BookOpen, Globe, Clock, Users, Star,
  Heart, Headphones, Sparkles, Volume2, Loader2, AlertCircle,
  MapPin, Languages, ChevronRight, Grid3X3, List, Flame
} from 'lucide-react';
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

const NeuBadge = ({ children, accent = false, onClick, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${className}`}
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : NEU.textMuted,
      boxShadow: NEU.shadowExtrudedSm,
      cursor: onClick ? 'pointer' : 'default',
    }}
    onClick={onClick}
  >
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
  const [viewMode, setViewMode] = useState('stories'); // 'stories', 'cultures', 'collections'

  const [stories, setStories] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  // Available filters from backend data
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load stories when filters change
  useEffect(() => {
    fetchStories(true);
  }, [selectedCulture, selectedCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Seed cultural stories if needed (in background)
      storyService.seedCulturalStories().then(result => {
        if (result.success && !result.skipped) {
          toast({
            title: "Cultural Stories Loaded",
            description: `${result.count} stories added to the collection!`,
          });
          fetchStories(true); // Reload stories after seed
        }
      });

      // Fetch all data in parallel
      const [storiesRes, culturesRes, collectionsRes] = await Promise.all([
        storyService.getStories({ page: 1, limit: 20, status: 'approved' }),
        storyService.getCultures(),
        storyService.getFeaturedCollections()
      ]);

      if (storiesRes.success) {
        setStories(storiesRes.stories || []);
        setHasMore(storiesRes.pagination?.hasMore || false);

        // Extract unique languages and categories from stories
        const languages = [...new Set(storiesRes.stories?.map(s => s.language) || [])];
        const categories = [...new Set(storiesRes.stories?.map(s => s.category) || [])];
        setAvailableLanguages(languages);
        setAvailableCategories(categories);
      }

      if (culturesRes.success) {
        setCultures(culturesRes.cultures || []);
      }

      if (collectionsRes.success) {
        setCollections(collectionsRes.collections || []);
      }

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      const params = { page: currentPage, limit: 20, status: 'approved' };

      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedCulture !== 'all') params.culture = selectedCulture;

      // Use search endpoint if search term exists
      let response;
      if (searchTerm) {
        response = await storyService.searchStories(searchTerm, params);
      } else {
        response = await storyService.getStories(params);
      }

      if (response.success) {
        const fetchedStories = response.stories || [];
        if (reset) {
          setStories(fetchedStories);
          setPage(2);
        } else {
          setStories(prev => {
            const currentIds = new Set(prev.map(s => s._id || s.id));
            const distinct = fetchedStories.filter(fs => !currentIds.has(fs._id || fs.id));
            return [...prev, ...distinct];
          });
          setPage(prev => prev + 1);
        }
        setHasMore(response.pagination?.hasMore || fetchedStories.length === params.limit);
      } else {
        throw new Error(response.message || 'Failed to load stories');
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err.message || 'Failed to load stories');
      toast({
        title: "Error",
        description: "Failed to load stories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter stories based on search and language
  const filteredStories = useMemo(() => {
    let filtered = stories;

    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.culture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (story.tags && story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedLanguage !== 'all') filtered = filtered.filter(s => s.language === selectedLanguage);

    // Sort
    switch (sortBy) {
      case 'popular': filtered = [...filtered].sort((a, b) => (b.listeners || 0) - (a.listeners || 0)); break;
      case 'rating': filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'duration': filtered = [...filtered].sort((a, b) => (a.duration || '').localeCompare(b.duration || '')); break;
      default: filtered = [...filtered].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
    }

    return filtered;
  }, [stories, searchTerm, selectedLanguage, sortBy]);

  // Get culture icon/flag
  const getCultureIcon = (culture) => {
    const icons = {
      'Indian': '🇮🇳',
      'African': '🌍',
      'Asian': '🌏',
      'Native American': '🪶',
      'Pacific': '🌺',
    };
    return icons[culture] || '📚';
  };

  // Get culture description
  const getCultureDescription = (culture) => {
    const descriptions = {
      'Indian': 'Rich mythology spanning thousands of years, from the epics of Ramayana and Mahabharata to regional folk tales.',
      'African': 'Diverse oral traditions featuring Anansi the spider, animal wisdom tales, and ancestral stories.',
      'Asian': 'Ancient wisdom from Chinese folklore, Japanese tales, and the spiritual traditions of the East.',
      'Native American': 'Sacred stories connecting humanity to nature, featuring creation myths and animal spirits.',
      'Pacific': 'Island myths of Maui, dreamtime stories, and ocean-connected creation narratives.',
    };
    return descriptions[culture] || 'Ancient stories passed down through generations.';
  };

  const StoryCard = ({ story }) => (
    <NeuCard className="h-full overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <NeuBadge accent>{story.culture}</NeuBadge>
            <NeuBadge>{story.language}</NeuBadge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
            <span className="text-sm font-medium" style={{ color: NEU.text }}>{story.rating || '4.5'}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
          {story.title}
        </h3>
        <p className="text-sm mb-1 flex items-center gap-1" style={{ color: NEU.textMuted }}>
          <MapPin className="w-3 h-3" />
          {story.region} • {story.category}
        </p>
        <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: NEU.textMuted }}>
          {story.description}
        </p>

        {story.moral && (
          <div className="p-3 mb-4 rounded-xl" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm }}>
            <p className="text-xs italic" style={{ color: NEU.textMuted }}>
              "{story.moral.substring(0, 100)}{story.moral.length > 100 ? '...' : ''}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm mb-4" style={{ color: NEU.textMuted }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{story.difficulty || 'Medium'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{story.ageGroup || 'All Ages'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {story.tags?.slice(0, 3).map((tag, i) => (
            <NeuBadge key={i}>{tag}</NeuBadge>
          ))}
        </div>

        <Link to={`/story/${story._id || story.id}`} className="block">
          <NeuButton accent small className="w-full justify-center">
            <BookOpen className="w-4 h-4" /> Read Story
          </NeuButton>
        </Link>
      </div>
    </NeuCard>
  );

  const CultureCard = ({ culture }) => (
    <NeuCard className="text-center h-full">
      <div className="p-6">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 text-4xl animate-neu-float"
          style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '50%' }}>
          {getCultureIcon(culture.name)}
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
          {culture.name}
        </h3>
        <p className="text-sm mb-2" style={{ color: NEU.accent }}>
          {culture.storyCount} stories
        </p>
        <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: NEU.textMuted }}>
          {getCultureDescription(culture.name)}
        </p>
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {culture.regions?.slice(0, 3).map((region, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, color: NEU.textMuted }}>
              {region}
            </span>
          ))}
        </div>
        <NeuButton
          small
          accent={selectedCulture === culture.name}
          onClick={() => {
            setSelectedCulture(culture.name);
            setViewMode('stories');
          }}
          className="w-full"
        >
          Explore {culture.name} Stories
        </NeuButton>
      </div>
    </NeuCard>
  );

  const CollectionCard = ({ collection }) => (
    <NeuCard className="h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 flex items-center justify-center text-2xl"
            style={{ background: NEU.accent, borderRadius: '16px' }}>
            {collection.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: NEU.textHeading }}>{collection.title}</h3>
            <p className="text-sm" style={{ color: NEU.textMuted }}>{collection.stories?.length || 0} stories</p>
          </div>
        </div>
        <p className="text-sm mb-4" style={{ color: NEU.textMuted }}>{collection.description}</p>
        <div className="space-y-2">
          {collection.stories?.slice(0, 3).map((story, i) => (
            <Link key={i} to={`/story/${story._id || story.id}`}>
              <div className="flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer"
                style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}>
                <BookOpen className="w-4 h-4" style={{ color: NEU.accent }} />
                <span className="text-sm line-clamp-1 flex-1" style={{ color: NEU.text }}>{story.title}</span>
                <ChevronRight className="w-4 h-4" style={{ color: NEU.textMuted }} />
              </div>
            </Link>
          ))}
        </div>
        <NeuButton
          small
          className="w-full mt-4"
          onClick={() => {
            // Filter by collection category or tags
            if (collection.id === 'creation-myths') setSelectedCategory('Creation Myth');
            else if (collection.id === 'animal-tales') setSelectedCategory('Folk Tales');
            else if (collection.id === 'trickster-stories') setSearchTerm('trickster');
            setViewMode('stories');
          }}
        >
          View All <ChevronRight className="w-4 h-4" />
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
            Cultural Stories Library
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: NEU.textMuted }}>
            Discover thousands of indigenous stories from cultures around the world.
            Search by culture, region, or explore our curated collections.
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: NEU.accent }}>{cultures.length}+</div>
              <div className="text-sm" style={{ color: NEU.textMuted }}>Cultures</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: NEU.accent }}>{stories.length}+</div>
              <div className="text-sm" style={{ color: NEU.textMuted }}>Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: NEU.accent }}>{availableLanguages.length}+</div>
              <div className="text-sm" style={{ color: NEU.textMuted }}>Languages</div>
            </div>
          </div>
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
                onKeyPress={e => e.key === 'Enter' && fetchStories(true)}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              {selectedCulture !== 'all' && (
                <NeuBadge accent onClick={() => setSelectedCulture('all')}>
                  {selectedCulture} ✕
                </NeuBadge>
              )}
              {selectedCategory !== 'all' && (
                <NeuBadge accent onClick={() => setSelectedCategory('all')}>
                  {selectedCategory} ✕
                </NeuBadge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select value={selectedCulture} onChange={e => setSelectedCulture(e.target.value)} style={neuSelectStyle}>
              <option value="all">All Cultures</option>
              {cultures.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.storyCount})</option>
              ))}
            </select>

            <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} style={neuSelectStyle}>
              <option value="all">All Languages</option>
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={neuSelectStyle}>
              <option value="all">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={neuSelectStyle}>
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>

            <NeuButton
              small
              onClick={() => { fetchStories(true); }}
              className="ml-auto"
            >
              <Search className="w-4 h-4" /> Search
            </NeuButton>
          </div>
        </NeuCard>

        {/* View Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl" style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, padding: '4px' }}>
            {[
              { key: 'stories', label: `All Stories`, icon: BookOpen },
              { key: 'cultures', label: `By Culture`, icon: Globe },
              { key: 'collections', label: `Collections`, icon: Grid3X3 },
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
        {loading && stories.length === 0 ? (
          <div className="flex justify-center py-16">
            <NeuCard className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: NEU.accent }} />
              <p style={{ color: NEU.textMuted }}>Loading stories...</p>
            </NeuCard>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <NeuIconWell size={96}>
              <AlertCircle className="w-12 h-12" />
            </NeuIconWell>
            <h3 className="text-2xl font-semibold mt-6 mb-4" style={{ color: NEU.textHeading }}>Error Loading Stories</h3>
            <p className="mb-6" style={{ color: NEU.textMuted }}>{error}</p>
            <NeuButton onClick={() => fetchStories(true)} accent>
              Try Again
            </NeuButton>
          </div>
        ) : (
          <>
            {viewMode === 'stories' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredStories.map(story => <StoryCard key={story._id || story.id} story={story} />)}
                </div>

                {filteredStories.length === 0 && (
                  <div className="text-center py-16">
                    <NeuIconWell size={96}>
                      <BookOpen className="w-12 h-12" />
                    </NeuIconWell>
                    <h3 className="text-2xl font-semibold mt-6 mb-4" style={{ color: NEU.textHeading }}>No stories found</h3>
                    <p className="mb-6" style={{ color: NEU.textMuted }}>Try adjusting your search criteria</p>
                    <NeuButton onClick={() => { setSearchTerm(''); setSelectedCulture('all'); setSelectedLanguage('all'); setSelectedCategory('all'); }}>
                      <Filter className="w-4 h-4" /> Clear Filters
                    </NeuButton>
                  </div>
                )}

                {hasMore && !loading && (
                  <div className="text-center mt-8">
                    <NeuButton onClick={() => fetchStories()}>
                      Load More Stories
                    </NeuButton>
                  </div>
                )}
              </>
            )}

            {viewMode === 'cultures' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cultures.map(culture => <CultureCard key={culture.name} culture={culture} />)}
              </div>
            )}

            {viewMode === 'collections' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map(collection => <CollectionCard key={collection.id} collection={collection} />)}
              </div>
            )}
          </>
        )}

        {/* Featured Section */}
        {viewMode === 'stories' && !searchTerm && selectedCulture === 'all' && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: NEU.textHeading }}>
              Featured Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.slice(0, 3).map(collection => <CollectionCard key={collection.id} collection={collection} />)}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16">
          <NeuCard className="p-12 text-center" hover={false} style={{ boxShadow: NEU.shadowExtrudedLg }}>
            <NeuIconWell size={64} accent>
              <Heart className="w-8 h-8" />
            </NeuIconWell>
            <h3 className="text-3xl font-bold mt-6 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Share Your Story
            </h3>
            <p className="mb-8 max-w-2xl mx-auto text-lg" style={{ color: NEU.textMuted }}>
              Help preserve your cultural heritage by sharing your community's stories.
              Every story helps keep traditions alive for future generations.
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
