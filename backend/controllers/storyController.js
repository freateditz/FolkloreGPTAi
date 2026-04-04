const Story = require('../models/Story');

// @desc    Get all stories (with search, filter, pagination)
// @route   GET /api/stories
// @access  Public
const getStories = async (req, res, next) => {
  try {
    const {
      search,
      region,
      language,
      culture,
      quality,
      source,
      featured,
      tags,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    // Build the filter object
    const filter = {};

    // Full-text search
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Field-level filters
    if (region)   filter.region   = { $regex: new RegExp(region, 'i') };
    if (language) filter.language = { $regex: new RegExp(language, 'i') };
    if (culture)  filter.culture  = { $regex: new RegExp(culture, 'i') };
    if (quality)  filter.quality  = quality;
    if (source)   filter.source   = source;

    // Boolean featured filter
    if (featured === 'true')  filter.isFeatured = true;
    if (featured === 'false') filter.isFeatured = false;

    // Tags filter — comma-separated
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip     = (pageNum - 1) * limitNum;

    // Sort — support text-score relevance when searching
    let sortObj;
    if (search && search.trim()) {
      sortObj = { score: { $meta: 'textScore' }, createdAt: -1 };
    } else {
      // Parse sort string: e.g. "-createdAt" → { createdAt: -1 }
      sortObj = {};
      sort.split(',').forEach(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          sortObj[trimmed.slice(1)] = -1;
        } else {
          sortObj[trimmed] = 1;
        }
      });
    }

    // Build query
    let query = Story.find(filter);

    // Include text score for relevance ranking
    if (search && search.trim()) {
      query = query.select({ score: { $meta: 'textScore' } });
    }

    const [stories, total] = await Promise.all([
      query.sort(sortObj).skip(skip).limit(limitNum).lean(),
      Story.countDocuments(filter),
    ]);

    // Map stories to match frontend expectations
    const mappedStories = stories.map(story => ({
      id: story._id.toString(),
      title: story.title,
      description: story.summary || story.content?.substring(0, 200) + '...' || '',
      content: story.content,
      culture: story.culture,
      language: story.language,
      region: story.region,
      rating: story.rating,
      listeners: story.listenerCount || 0,
      duration: story.duration || '5 min',
      difficulty: story.quality === 'high' ? 'Advanced' : story.quality === 'medium' ? 'Intermediate' : 'Beginner',
      tags: story.tags || [],
      source: story.source,
      submittedDate: story.createdAt,
      category: story.source || 'community',
      ...story
    }));

    res.status(200).json({
      success: true,
      count: stories.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: stories,
      stories: mappedStories, // Frontend expects this
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        hasMore: pageNum < Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single story by ID
// @route   GET /api/stories/:id
// @access  Public
const getStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).lean();

    if (!story) {
      const err = new Error('Story not found');
      err.statusCode = 404;
      throw err;
    }

    // Map to frontend expectations
    const mappedStory = {
      id: story._id.toString(),
      title: story.title,
      description: story.summary || story.content?.substring(0, 200) + '...' || '',
      content: story.content,
      culture: story.culture,
      language: story.language,
      region: story.region,
      rating: story.rating,
      listeners: story.listenerCount || 0,
      duration: story.duration || '5 min',
      difficulty: story.quality === 'high' ? 'Advanced' : story.quality === 'medium' ? 'Intermediate' : 'Beginner',
      tags: story.tags || [],
      source: story.source,
      submittedDate: story.createdAt,
      category: story.source || 'community',
      ...story
    };

    res.status(200).json({ success: true, data: story, story: mappedStory });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new story
// @route   POST /api/stories
// @access  Public
const createStory = async (req, res, next) => {
  try {
    // Get the story data from request body or form-data
    const storyData = req.body || {};

    // Parse tags if they come as comma-separated string
    let tags = storyData.tags || [];
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(t => t);
    }

    // Handle file uploads
    const audioFiles = req.files?.audioFiles || [];
    const imageFiles = req.files?.imageFiles || [];

    // Map frontend field names to backend schema
    const storyPayload = {
      title: storyData.title || storyData.storyTitle || 'Untitled Story',
      content: storyData.content || storyData.storyText || storyData.description || '',
      region: storyData.region || storyData.location || 'Unknown',
      language: storyData.language || 'English',
      culture: storyData.culture || storyData.community || 'General',
      summary: storyData.summary || '',
      moral: storyData.moral || storyData.moralLesson || '',
      tags: tags,
      source: storyData.source || 'community',
      quality: storyData.quality || 'medium',
      // Store file info as metadata
      hasAudio: audioFiles.length > 0,
      hasImages: imageFiles.length > 0,
      audioFileCount: audioFiles.length,
      imageFileCount: imageFiles.length,
    };

    const story = await Story.create(storyPayload);

    res.status(201).json({
      success: true,
      message: 'Story submitted successfully',
      data: story,
      story: story // Include both for compatibility
    });
  } catch (error) {
    console.error('Story creation error:', error);
    next(error);
  }
};

// @desc    Update a story
// @route   PUT /api/stories/:id
// @access  Public
const updateStory = async (req, res, next) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, req.body, {
      new: true,            // return the updated document
      runValidators: true,  // re-run schema validators
    });

    if (!story) {
      const err = new Error('Story not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Public
const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      const err = new Error('Story not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, message: 'Story deleted', data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct values for filter dropdowns
// @route   GET /api/stories/filters
// @access  Public
const getFilterOptions = async (req, res, next) => {
  try {
    const [regions, languages, cultures] = await Promise.all([
      Story.distinct('region'),
      Story.distinct('language'),
      Story.distinct('culture'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        regions: regions.filter(Boolean).sort(),
        languages: languages.filter(Boolean).sort(),
        cultures: cultures.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  getFilterOptions,
};
