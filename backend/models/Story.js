const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    region: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    culture: {
      type: String,
      trim: true,
      default: 'General',
    },
    content: {
      type: String,
      required: [true, 'Story content is required'],
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    moral: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ['verified', 'generated', 'community'],
      default: 'community',
    },
    quality: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: String,
      default: '',
    },
    listenerCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,  // adds createdAt & updatedAt automatically
  }
);

// ——— INDEXES ———

// Full-text search index on title, content, summary, culture
storySchema.index(
  { title: 'text', content: 'text', summary: 'text', culture: 'text' },
  { weights: { title: 10, culture: 5, summary: 3, content: 1 }, name: 'story_text_search' }
);

// Compound indexes for common filter queries
storySchema.index({ region: 1, createdAt: -1 });
storySchema.index({ language: 1, createdAt: -1 });
storySchema.index({ quality: 1, createdAt: -1 });
storySchema.index({ isFeatured: 1, createdAt: -1 });
storySchema.index({ culture: 1, createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
