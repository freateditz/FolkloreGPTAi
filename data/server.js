import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import NodeCache from 'node-cache';
const storyCache = new NodeCache({ stdTTL: 900 });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: "./config.env" });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directories
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Configure Cloudinary (for images only now)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isAudio = file.fieldname === 'audioFiles';
    const dest = isAudio ? audioDir : imagesDir;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for audio
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm', 'audio/ogg'];

    if (file.fieldname === 'audioFiles') {
      if (allowedAudioTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid audio file type'), false);
      }
    } else if (file.fieldname === 'imageFiles') {
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid image file type'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// Connect to MongoDB Atlas
// Use ATLAS_URI as-is (it already contains connection params from config.env)
const mongoUri = process.env.ATLAS_URI;
mongoose.connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Enhanced Story Schema with better indexing
const storySchema = new mongoose.Schema({
  // Basic Information
  title: { type: String, required: true, index: true },
  culture: { type: String, required: true, index: true },
  language: { type: String, required: true, index: true },
  region: { type: String, required: true },
  category: { type: String, required: true, index: true },
  ageGroup: String,
  difficulty: String,
  description: { type: String, required: true },

  // Story Content
  storyText: { type: String },
  moral: String,

  // Audio Files - STORED LOCALLY
  audioFiles: [{
    filename: String,
    originalName: String,
    localPath: String,  // Path to local file
    duration: Number,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Image Files - STORED ON CLOUDINARY
  imageFiles: [{
    filename: String,
    originalName: String,
    cloudinaryUrl: String,
    cloudinaryPublicId: String,
    width: Number,
    height: Number,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Metadata
  tags: [{ type: String, index: true }],
  narrator: String,
  submitterName: { type: String, required: true },
  submitterEmail: { type: String, required: true },
  culturalContext: String,

  // Permissions
  permissions: { type: Boolean, required: true },
  attribution: { type: Boolean, required: true },
  respectfulUse: { type: Boolean, required: true },

  // Submission Info
  submissionType: { type: String, enum: ['text', 'audio', 'mixed'], default: 'text', index: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  submittedAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, { collection: "Folklore" });

// Add text search index
storySchema.index(
  { title: 'text', description: 'text', storyText: 'text', tags: 'text' },
  { language_override: 'dummy_language_override_field' }
);

const Story = mongoose.model("Story", storySchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  category: String,
  message: String,
  culture: String,
  consent: Boolean,
  submittedAt: String,
}, { collection: "Contact" });

const Contact = mongoose.model("Contact", contactSchema);

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (filePath, resourceType = 'auto', folder = 'folklore') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      folder: folder,
      quality: 'auto',
      fetch_format: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Helper function to delete local file
const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted local file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting local file ${filePath}:`, error);
  }
};

// Serve audio files statically
app.use('/uploads/audio', express.static(audioDir));

// Enhanced Story Submission API
app.post("/api/stories", upload.fields([
  { name: 'audioFiles', maxCount: 5 },
  { name: 'imageFiles', maxCount: 10 }
]), async (req, res) => {
  const uploadedFiles = [];

  try {
    console.log('📝 Received story submission:', req.body);
    console.log('📁 Received files:', req.files);

    // Parse form data
    const storyData = {
      title: req.body.title,
      culture: req.body.culture,
      language: req.body.language,
      region: req.body.region,
      category: req.body.category,
      ageGroup: req.body.ageGroup,
      difficulty: req.body.difficulty,
      description: req.body.description,
      storyText: req.body.storyText,
      moral: req.body.moral,
      narrator: req.body.narrator,
      submitterName: req.body.submitterName,
      submitterEmail: req.body.submitterEmail,
      culturalContext: req.body.culturalContext,
      permissions: req.body.permissions === 'true',
      attribution: req.body.attribution === 'true',
      respectfulUse: req.body.respectfulUse === 'true',
      submissionType: req.body.submissionType || 'text',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      audioFiles: [],
      imageFiles: [],
      status: 'approved' // Auto-approve for now
    };

    // Process audio files - SAVE LOCALLY
    if (req.files && req.files.audioFiles) {
      for (const audioFile of req.files.audioFiles) {
        try {
          console.log(`🎵 Processing audio file: ${audioFile.originalname}`);

          // Store locally only - no Cloudinary upload for audio
          const relativePath = `/uploads/audio/${path.basename(audioFile.path)}`;

          storyData.audioFiles.push({
            filename: path.basename(audioFile.filename),
            originalName: audioFile.originalname,
            localPath: relativePath,
            duration: 0, // Could extract this with ffprobe
            size: audioFile.size,
            mimeType: audioFile.mimetype
          });

          uploadedFiles.push(audioFile.path);
          console.log(`✅ Audio saved locally: ${relativePath}`);
        } catch (error) {
          console.error(`❌ Error processing audio file ${audioFile.originalname}:`, error);
        }
      }
    }

    // Process image files - UPLOAD TO CLOUDINARY
    if (req.files && req.files.imageFiles) {
      for (const imageFile of req.files.imageFiles) {
        try {
          console.log(`🖼️ Uploading image file: ${imageFile.originalname}`);

          const cloudinaryResult = await uploadToCloudinary(
            imageFile.path,
            'image',
            'folklore/images'
          );

          storyData.imageFiles.push({
            filename: imageFile.filename,
            originalName: imageFile.originalname,
            cloudinaryUrl: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            size: imageFile.size
          });

          uploadedFiles.push(imageFile.path);
          console.log(`✅ Image uploaded to Cloudinary: ${cloudinaryResult.secure_url}`);
        } catch (error) {
          console.error(`❌ Error uploading image file ${imageFile.originalname}:`, error);
          uploadedFiles.push(imageFile.path);
        }
      }
    }

    // Save story to database
    const story = new Story(storyData);
    const savedStory = await story.save();

    // Clean up uploaded files after successful save
    uploadedFiles.forEach(filePath => deleteLocalFile(filePath));

    console.log(`✅ Story saved successfully with ID: ${savedStory._id}`);

    res.status(201).json({
      success: true,
      message: "Story submitted successfully",
      story: {
        id: savedStory._id,
        title: savedStory.title,
        submissionType: savedStory.submissionType,
        audioFiles: savedStory.audioFiles.length,
        imageFiles: savedStory.imageFiles.length,
        submittedAt: savedStory.submittedAt
      }
    });

  } catch (error) {
    console.error("❌ Error saving story:", error);

    // Clean up files on error
    uploadedFiles.forEach(filePath => deleteLocalFile(filePath));

    res.status(500).json({
      success: false,
      message: "Error saving story",
      error: error.message
    });
  }
});

// Get All Stories API with SEARCH and Multi-Source
app.get("/api/stories", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      culture,
      language,
      submissionType,
      search, // Search query
      status = 'approved',
      length // requested length filter
    } = req.query;

    const cacheKey = `stories_${search||'none'}_${category||'all'}_${culture||'all'}_${language||'all'}_${length||'all'}`;
    let allAggregatedStories = storyCache.get(cacheKey);

    if (!allAggregatedStories) {
      allAggregatedStories = [];

      // 1. Fetch from Local Database
      const query = { status };
      if (category) query.category = category;
      if (culture) query.culture = culture;
      if (language) query.language = language;
      if (submissionType) query.submissionType = submissionType;
      if (search) query.$text = { $search: search };

      const dbStories = await Story.find(query).sort({ submittedAt: -1 }).select('-submitterEmail');
      const normalizedDb = dbStories.map(story => {
        const obj = story.toObject();
        if (obj.audioFiles && obj.audioFiles.length > 0) {
          obj.audioFiles = obj.audioFiles.map(af => ({
            ...af, url: af.localPath ? `http://localhost:5001${af.localPath}` : null
          }));
        }
        return {
          ...obj,
          id: obj._id.toString(),
          source: 'database',
          link: `/story/${obj._id}`,
          length: obj.storyText && obj.storyText.length > 3000 ? 'long' : 'short',
        };
      });
      allAggregatedStories = allAggregatedStories.concat(normalizedDb);

      // Only fetch from external APIs if search is present, or globally mix
      const fetchPromises = [];
      const safeQuery = search || 'folklore';

      // 2. Fetch from Project Gutenberg via RapidAPI
      fetchPromises.push((async () => {
        if (!process.env.RAPIDAPI_KEY) return [];
        try {
           const response = await axios.get(`https://${process.env.RAPIDAPI_HOST || 'project-gutenberg.p.rapidapi.com'}/getBooks`, {
             params: { search: safeQuery },
             headers: {
               'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
               'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'project-gutenberg.p.rapidapi.com'
             }
           });
           const books = Array.isArray(response.data) ? response.data : (response.data.books || []);
           return books.map(book => ({
             id: `gutenberg_${book.id || Math.random()}`,
             title: book.title || 'Unknown',
             description: 'Classic literature from Project Gutenberg.',
             image: null,
             source: 'gutenberg',
             link: book.url || `https://gutenberg.org/ebooks/${book.id}`,
             length: 'long',
             category: 'Literature',
             tags: ['Gutenberg', 'Classic']
           })).slice(0, 10);
        } catch(e) { console.error('Gutenberg API failed', e.message); return []; }
      })());

      // 3. Internet Archive API
      fetchPromises.push((async () => {
        try {
           const q = encodeURIComponent(`${safeQuery} AND mediatype:texts`);
           const url = `${process.env.ARCHIVE_BASE_URL || 'https://archive.org/advancedsearch.php'}?q=${q}&output=json&rows=10`;
           const response = await axios.get(url);
           const docs = response.data?.response?.docs || [];
           return docs.map(doc => ({
             id: `archive_${doc.identifier}`,
             title: doc.title || 'Internet Archive Match',
             description: (doc.description && doc.description[0]) ? doc.description[0].substring(0, 300) : 'Internet archive publication',
             image: null,
             source: 'archive',
             link: `https://archive.org/details/${doc.identifier}`,
             length: 'long',
             category: 'Archive',
             tags: doc.subject ? (Array.isArray(doc.subject) ? doc.subject : [doc.subject]) : []
           }));
        } catch(e) { console.error('Archive API failed', e.message); return []; }
      })());

      // 4. Wikipedia API
      fetchPromises.push((async () => {
        try {
           if (!search) return []; // Only fallback to Wikipedia if user explicitly searched for a term
           const url = `${process.env.WIKIPEDIA_BASE_URL || 'https://en.wikipedia.org/api/rest_v1'}/page/summary/${encodeURIComponent(search)}`;
           const response = await axios.get(url);
           if (!response.data || !response.data.title) return [];
           return [{
             id: `wiki_${response.data.pageid || (Math.random() * 10000)}`,
             title: response.data.title,
             description: response.data.extract || '',
             image: response.data.thumbnail?.source || null,
             source: 'wikipedia',
             link: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${search}`,
             length: 'short',
             category: 'Encyclopedia',
             tags: ['Wikipedia', 'Fact']
           }];
        } catch(e) { console.error('Wikipedia API failed', e.message); return []; }
      })());

      const externalResults = await Promise.allSettled(fetchPromises);
      externalResults.forEach(res => {
         if (res.status === 'fulfilled') {
             allAggregatedStories = allAggregatedStories.concat(res.value);
         }
      });

      // Relevance sorting
      allAggregatedStories.sort((a, b) => {
         if (search) {
             const lowerSearch = search.toLowerCase();
             const aTitle = (a.title||'').toLowerCase();
             const bTitle = (b.title||'').toLowerCase();
             if (aTitle === lowerSearch && bTitle !== lowerSearch) return -1;
             if (bTitle === lowerSearch && aTitle !== lowerSearch) return 1;
             
             if (aTitle.includes(lowerSearch) && !bTitle.includes(lowerSearch)) return -1;
             if (bTitle.includes(lowerSearch) && !aTitle.includes(lowerSearch)) return 1;
         }
         if (a.length === 'short' && b.length !== 'short') return -1;
         if (b.length === 'short' && a.length !== 'short') return 1;
         
         return 0; 
      });

      if (length && length !== 'all') {
          allAggregatedStories = allAggregatedStories.filter(s => s.length === length);
      }

      storyCache.set(cacheKey, allAggregatedStories);
    }

    // Pagination
    const total = allAggregatedStories.length;
    const startIndex = (page - 1) * limit;
    const paginatedStories = allAggregatedStories.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      stories: paginatedStories,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: paginatedStories.length,
        totalStories: total,
        hasMore: (startIndex + Number(limit)) < total
      }
    });

  } catch (error) {
    console.error("❌ Error fetching stories:", error);
    res.status(500).json({ success: false, message: "Error fetching stories", error: error.message });
  }
});

// Search Stories API (dedicated endpoint)
app.get("/api/stories/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required"
      });
    }

    const query = {
      status: 'approved',
      $text: { $search: q }
    };

    const stories = await Story.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-submitterEmail');

    const total = await Story.countDocuments(query);

    // Add audio URLs
    const storiesWithUrls = stories.map(story => {
      const storyObj = story.toObject();
      if (storyObj.audioFiles && storyObj.audioFiles.length > 0) {
        storyObj.audioFiles = storyObj.audioFiles.map(af => ({
          ...af,
          url: af.localPath ? `http://localhost:5001${af.localPath}` : null
        }));
      }
      return storyObj;
    });

    res.json({
      success: true,
      stories: storiesWithUrls,
      query: q,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: stories.length,
        totalStories: total
      }
    });

  } catch (error) {
    console.error("❌ Error searching stories:", error);
    res.status(500).json({
      success: false,
      message: "Error searching stories",
      error: error.message
    });
  }
});

// Get Single Story API
app.get("/api/stories/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).select('-submitterEmail');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    // Convert to object and add audio URLs
    const storyObj = story.toObject();
    if (storyObj.audioFiles && storyObj.audioFiles.length > 0) {
      storyObj.audioFiles = storyObj.audioFiles.map(af => ({
        ...af,
        url: af.localPath ? `http://localhost:5001${af.localPath}` : null
      }));
    }

    res.json({
      success: true,
      story: storyObj
    });

  } catch (error) {
    console.error("❌ Error fetching story:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching story",
      error: error.message
    });
  }
});

// Get Stories Statistics API
app.get("/api/stories/stats", async (req, res) => {
  try {
    const totalStories = await Story.countDocuments({ status: 'approved' });
    const pendingStories = await Story.countDocuments({ status: 'pending' });

    const categoriesStats = await Story.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const culturesStats = await Story.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$culture', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const submissionTypeStats = await Story.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$submissionType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalStories,
        pendingStories,
        categoriesStats,
        culturesStats,
        submissionTypeStats
      }
    });

  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message
    });
  }
});

// Contact API
app.post("/api/contact", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// CULTURAL STORIES AGGREGATOR API
// ============================================

// Seed cultural stories endpoint
app.post("/api/stories/seed", async (req, res) => {
  try {
    console.log('🌱 Starting cultural stories seed...');

    // Cultural stories data
    const culturalStories = [
      // Indian Stories
      {
        title: "The Loyal Mongoose",
        culture: "Indian",
        region: "Maharashtra",
        language: "Marathi",
        category: "Panchatantra",
        description: "A story about a loyal mongoose who protects a farmer's child from a snake, but is tragically misunderstood.",
        storyText: `Once upon a time, there lived a farmer and his wife in a village. They had a newborn baby. One day, the farmer brought home a mongoose to be a companion for his son.\n\nThe farmer and his wife came to love the mongoose like their own child. One day, the farmer's wife went to the market, leaving the baby in the care of the mongoose. The farmer was working in the fields.\n\nA snake entered the house and approached the cradle. The mongoose, ever vigilant, fought the snake and killed it to protect the child. When the farmer's wife returned, she saw the mongoose with blood on its mouth near the cradle. Thinking the mongoose had harmed her baby, she threw a heavy stick at it in anger.\n\nThe mongoose died from the blow. When she checked the cradle, she found the baby safe and the dead snake nearby. She realized her terrible mistake - the mongoose had saved her child's life.\n\nThe moral: Never act in haste and anger without knowing the full truth.`,
        moral: "Never act in haste and anger without knowing the full truth.",
        narrator: "Traditional",
        tags: ["Loyalty", "Animals", "Tragedy", "Wisdom"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Panchatantra",
        sourceUrl: "https://en.wikipedia.org/wiki/Panchatantra"
      },
      {
        title: "The Golden Deer",
        culture: "Indian",
        region: "All India",
        language: "Sanskrit",
        category: "Ramayana",
        description: "The story of Mareecha, the golden deer who helped Ravana kidnap Sita.",
        storyText: `In the great epic Ramayana, Ravana devised a plan to kidnap Sita, the wife of Lord Rama. He sought the help of his uncle Mareecha, who had the power to transform into a golden deer.\n\nMareecha took the form of a magnificent golden deer with silver spots. When Sita saw this beautiful creature in the forest, she was enchanted and asked Rama to capture it for her. Lakshmana, Rama's brother, warned them that it might be a trick, but Sita was adamant.\n\nRama went after the deer, which led him deep into the forest. When Rama struck the deer with his arrow, Mareecha cried out in Rama's voice, "Lakshmana! Help me!"\n\nHearing the cry, Sita became worried and insisted that Lakshmana go to help Rama. Lakshmana was reluctant to leave her alone, but eventually agreed after drawing a protective line around their hut - the famous Lakshmana Rekha.\n\nAs soon as Lakshmana left, Ravana came disguised as a sage and crossed the line to abduct Sita. This event set in motion the great war between Rama and Ravana.`,
        moral: "Be cautious of desires that seem too perfect; they may hide danger.",
        narrator: "Valmiki (Traditional)",
        tags: ["Epic", "Mythology", "Deception", "War"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Ramayana",
        sourceUrl: "https://en.wikipedia.org/wiki/Ramayana"
      },
      {
        title: "The Clever Rabbit",
        culture: "Indian",
        region: "Karnataka",
        language: "Kannada",
        category: "Folk Tales",
        description: "A tale of how a small rabbit outwitted a mighty elephant to save the forest.",
        storyText: `Long ago in a dense forest in Karnataka, the animals lived in peace until a rogue elephant arrived. This elephant was arrogant and destructive, trampling the smaller animals' homes and eating all the vegetation without care.\n\nThe animals held a meeting to discuss what to do. The wise old owl suggested they seek help from a rabbit known for his cleverness. The rabbit agreed to help and devised a plan.\n\nThe next day, the rabbit went to the elephant and said, "O Mighty One, the animals of the forest have sent me to invite you to a grand feast hosted by the Moon God himself. He has heard of your greatness and wishes to honor you."\n\nThe elephant was flattered and followed the rabbit to a pond. The rabbit pointed to the reflection of the moon in the water and said, "Look, the Moon God awaits you below. But you must enter alone to show respect."\n\nThe elephant, eager to meet the Moon God, stepped into the water, causing ripples that broke the reflection. The rabbit exclaimed, "Oh no! You have angered the Moon God by disturbing his reflection! He will surely curse you!"\n\nFrightened, the elephant ran away and never returned to that forest. The rabbit's clever thinking had saved everyone.`,
        moral: "Intelligence and wisdom can overcome brute strength.",
        narrator: "Traditional",
        tags: ["Cleverness", "Animals", "Wisdom", "Courage"],
        difficulty: "Easy",
        ageGroup: "Children",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Indian Folktales"
      },
      {
        title: "The Tiger and the Brahmin",
        culture: "Indian",
        region: "Bengal",
        language: "Bengali",
        category: "Folk Tales",
        description: "A classic tale of how a clever jackal outsmarts both a tiger and a brahmin.",
        storyText: `A long time ago, a tiger was caught in a cage trap set by hunters. For days he remained trapped, growing hungrier and more desperate. One day, a Brahmin (a learned priest) walked by the cage.\n\nThe tiger pleaded, "O noble Brahmin, please open the cage and set me free. I am starving and will surely die."\n\nThe Brahmin was hesitant, saying, "But you are a tiger. If I free you, you will eat me."\n\nThe tiger promised, "I swear on my ancestors that I will not harm you. Please, have mercy."\n\nMoved by compassion, the Brahmin opened the cage. Immediately, the tiger leaped out and grabbed the Brahmin. "Now I shall eat you, for I am starving!" the tiger said.\n\nThe Brahmin protested, "This is not fair! You promised not to harm me. Let us ask the first three things we meet to judge this matter."\n\nThey came across a pipal tree, a buffalo, and then a jackal. The tree and buffalo both said, "Humans are ungrateful. The tiger should eat the Brahmin."\n\nFinally, they asked the jackal. The clever jackal pretended not to understand the situation. "Show me exactly where you were," the jackal said.\n\nThe tiger got back into the cage to demonstrate. "Was the cage door open or closed?" asked the jackal.\n\n"Open," said the tiger, still in the cage.\n\nThe jackal quickly said, "Brahmin, close the door!" The Brahmin did so, trapping the tiger again. The jackal turned to the Brahmin and said, "Learn to be wiser about whom you trust."`,
        moral: "Be careful whom you trust; compassion must be tempered with wisdom.",
        narrator: "Traditional",
        tags: ["Cleverness", "Trust", "Animals", "Wisdom"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Bengali Folktales"
      },
      {
        title: "The Birth of Ganesha",
        culture: "Indian",
        region: "All India",
        language: "Sanskrit",
        category: "Mythology",
        description: "The origin story of Lord Ganesha, the elephant-headed god of wisdom and remover of obstacles.",
        storyText: `Parvati, the consort of Lord Shiva, wished to take a bath. Not wanting to be disturbed, she created a boy from the turmeric paste she used for her bath and breathed life into him.\n\n"Guard the door and let no one enter while I bathe," she instructed the boy. The boy stood faithfully at the door.\n\nMeanwhile, Lord Shiva returned home after a long meditation. When he tried to enter, the boy stopped him, saying, "Mother has instructed me not to let anyone in."\n\nShiva, not knowing this was his wife's creation, became angry. He demanded entry, but the boy stood firm. Enraged by this defiance, Shiva cut off the boy's head with his trident.\n\nWhen Parvati emerged from her bath and saw what had happened, she was devastated. Her grief turned to fury, and she threatened to destroy all creation.\n\nTo appease her, Shiva promised to bring the boy back to life. He sent his attendants to find the first living creature they encountered and bring back its head.\n\nThe attendants found an elephant, and they brought back its head. Shiva placed the elephant head on the boy's body and brought him back to life. He named the boy Ganesha and declared that Ganesha would be worshipped first before all other gods.\n\nSince then, Ganesha is honored at the beginning of every important undertaking.`,
        moral: "Even in tragedy, new beginnings and blessings can emerge.",
        narrator: "Traditional",
        tags: ["Mythology", "Gods", "Creation", "Wisdom"],
        difficulty: "Medium",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Shiva Purana",
        sourceUrl: "https://en.wikipedia.org/wiki/Ganesha"
      },
      // African Stories
      {
        title: "How Anansi Brought Stories to the World",
        culture: "African",
        region: "West Africa",
        language: "Akan",
        category: "Anansi Stories",
        description: "The tale of how the spider Anansi won all the world's stories from Nyame, the Sky God.",
        storyText: `Long ago, all stories belonged to Nyame, the Sky God. They were kept safe in golden boxes at the edge of the sky. Anansi the spider, who was clever and ambitious, decided he wanted to own all the stories.\n\nHe went to Nyame and asked to buy the stories. Nyame laughed and said, "I will sell them to you, but the price is high. You must bring me three things: Mmoboro the hornet who stings, Mmoatia the fairy whom men never see, and Osebo the leopard with teeth like spears."\n\nAnansi accepted the challenge. First, he filled a gourd with water and cut a plantain leaf to cover the top. He went to the hornets' nest and called out, "Is it raining? I think I feel rain!" The hornets said no, but Anansi argued that rain was coming. He offered them the gourd as shelter.\n\nWhen the hornets flew into the gourd, Anansi quickly covered it with the leaf and took them to Nyame.\n\nNext, Anansi carved a wooden doll and covered it with sticky gum. He placed the doll near the forest where the fairy played, with yams in the doll's lap. When the fairy took the yams, her hands got stuck to the gum doll. Anansi captured her and took her to Nyame.\n\nFinally, Anansi dug a deep pit and covered it with branches. When Osebo the leopard fell in, Anansi offered to rescue him with his cobweb ladder. Once the leopard was out, Anansi trapped him and delivered him to Nyame.\n\nNyame was amazed. He said, "You are truly clever, Anansi. From this day forward, all stories belong to you. Share them wisely with the people of the earth."\n\nAnd that is why stories are called "Anansi stories" in many parts of Africa.`,
        moral: "Cleverness and determination can achieve what seems impossible.",
        narrator: "Traditional Akan",
        tags: ["Trickster", "Spider", "Wisdom", "Stories"],
        difficulty: "Medium",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Akan Folklore"
      },
      {
        title: "The Lion's Whisker",
        culture: "African",
        region: "East Africa",
        language: "Amharic",
        category: "Wisdom Tales",
        description: "A story about patience, trust, and the journey of building love in a family.",
        storyText: `There was once a woman named Kisa who married a widower with a son. She tried to be a good mother to the boy, but he rejected her at every turn. The boy was still grieving his mother and would not accept Kisa's love.\n\nDesperate, Kisa went to a wise old medicine man. "Please give me a potion that will make my stepson love me," she begged.\n\nThe medicine man listened and said, "I can make such a medicine, but I need one special ingredient: a whisker from a living lion."\n\nKisa was terrified, but her love for the boy was strong. She went to the place where lions were known to drink. Night after night, she brought meat and sat quietly, watching the lions from a distance.\n\nWeeks passed. The lions grew accustomed to her presence. One particularly brave lion even ate the meat she left while she watched. Slowly, over many months, she gained his trust.\n\nOne night, while the lion ate peacefully, Kisa reached out with trembling hand and quickly plucked a single whisker. The lion barely noticed. She ran all the way to the medicine man, clutching the whisker.\n\n"Here it is!" she said, breathless.\n\nThe medicine man took the whisker and threw it into the fire. "You don't need a potion," he said. "You have already learned what you need. You won the lion's trust through patience and consistency. Do the same with your stepson. Love cannot be forced; it must be earned through patience and understanding."\n\nKisa understood. She went home and applied the same patience with her stepson. Gradually, over time, the boy opened his heart to her, and they became a true family.`,
        moral: "Love and trust are earned through patience, not forced through magic.",
        narrator: "Traditional Ethiopian",
        tags: ["Family", "Patience", "Love", "Wisdom"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Ethiopian Folktales"
      },
      {
        title: "The Wise Old Man of the Mountain",
        culture: "African",
        region: "West Africa",
        language: "Yoruba",
        category: "Wisdom Tales",
        description: "A story about the value of wisdom over strength and the true meaning of respect.",
        storyText: `In a village at the foot of a great mountain, there lived an old man named Obi. He was neither strong nor wealthy, but he was known throughout the land for his wisdom.\n\nOne day, a young warrior named Ogun came to the village, boasting that he was the strongest man in the world. "I can defeat anyone in combat!" he declared. "I have no need for wisdom when I have strength!"\n\nObi said gently, "Strength is good, young man, but wisdom is better."\n\nOgun laughed. "Old man, I could crush you like an insect. What good is your wisdom against my muscles?"\n\nObi smiled. "Let us have a contest. If you can carry this basket up the mountain before sunset, you are the victor."\n\nOgun scoffed. "That's too easy!" He picked up the basket, which was filled with stones, and began climbing. But the stones were heavy, and the path was steep. By noon, he was exhausted and had to stop.\n\nMeanwhile, Obi walked slowly up a different path. He carried nothing but a small bag of seeds. As he walked, he scattered them along the way.\n\nWhen Ogun finally gave up and came down, he found Obi already at the top of the mountain, enjoying the view.\n\n"How did you get there?" Ogun demanded.\n\n"I took the longer path, but it was gentler," Obi explained. "And the seeds I planted will grow into trees that will make the path easier for future generations. True strength is not in lifting heavy burdens, but in making the journey easier for others."\n\nOgun understood at last and became Obi's student.`,
        moral: "Wisdom and foresight are more valuable than brute strength.",
        narrator: "Traditional Yoruba",
        tags: ["Wisdom", "Strength", "Humility", "Learning"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Yoruba Oral Tradition"
      },
      // Native American Stories
      {
        title: "How the Coyote Stole Fire",
        culture: "Native American",
        region: "Pacific Northwest",
        language: "Chinook",
        category: "Creation Stories",
        description: "A tale of how Coyote brought fire to the people, helping them survive the cold.",
        storyText: `Long ago, before humans had fire, the world was cold and dark at night. The People huddled together for warmth, and their food was raw and hard to eat.\n\nIn those days, fire belonged only to the Fire Beings who lived on top of a great mountain. They guarded it jealously and would not share it with anyone.\n\nCoyote was troubled by seeing the People suffer. He decided he would steal fire from the mountain top. He called his friends to help: Squirrel, Chipmunk, Frog, and Wood.\n\nCoyote went up the mountain and distracted the Fire Beings with clever talk while his friends snuck past. But the Fire Beings discovered them and gave chase, throwing fire at them.\n\nSquirrel caught a coal on her back, which is why squirrels have black stripes on their backs. She passed it to Chipmunk, who caught it in her hands, which is why chipmunks have black stripes on their backs. Chipmunk threw it to Frog, who swallowed the coal and escaped by jumping into a pond. That's why frogs have no tail and say "Kolah, kolah" - which means "I have it!"\n\nFinally, Wood received the coal and hid it within himself. The Fire Beings could not get it back. Wood would carry fire and give it to anyone who rubbed two sticks together.\n\nCoyote showed the People how to make fire by rubbing sticks. Since that day, fire has belonged to all the People, and they never forgot the sacrifice of Coyote's friends.`,
        moral: "Courage and cleverness can bring gifts that benefit all people.",
        narrator: "Traditional Chinook",
        tags: ["Fire", "Creation", "Animals", "Courage"],
        difficulty: "Medium",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Chinook Oral Tradition"
      },
      {
        title: "The Legend of the Dreamcatcher",
        culture: "Native American",
        region: "Great Lakes",
        language: "Ojibwe",
        category: "Spiritual",
        description: "The origin story of the dreamcatcher, woven by Spider Woman to protect children from bad dreams.",
        storyText: `Long ago, when the world was still young, the Spider Woman watched over the people. She took care of the children and the adults, but as the people spread across the land, she could not reach everyone.\n\nSpider Woman spoke to the elders. "I cannot watch over all your children as they sleep. You must help me protect them."\n\nShe taught the mothers and grandmothers how to weave a special web. "Make a hoop from willow," she instructed, "and weave a web within it like mine. Hang it above where the children sleep."\n\n"The web will catch the bad dreams, like a spider's web catches insects. The bad dreams will get tangled in the web and fade away with the morning light. But the good dreams will find the hole in the center and slide down the feather to the sleeping child."\n\nThe people did as Spider Woman taught them. They decorated the dreamcatchers with feathers and beads, each one unique. And it worked - the children slept peacefully, and the good dreams brought them wisdom and guidance.\n\nTo this day, the Ojibwe people and many others hang dreamcatchers to protect their sleepers and catch the good dreams from the night sky.`,
        moral: "Protection and love can be woven into physical forms to care for those we love.",
        narrator: "Traditional Ojibwe",
        tags: ["Dreams", "Protection", "Spider", "Spiritual"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Ojibwe Tradition"
      },
      // Asian Stories
      {
        title: "The Crane Wife",
        culture: "Asian",
        region: "Japan",
        language: "Japanese",
        category: "Fairy Tales",
        description: "A touching story about gratitude, trust, and the danger of breaking a sacred promise.",
        storyText: `Once upon a time, a poor but kind woodcutter lived alone in the mountains. One winter day, he found a crane caught in a trap. Its wing was injured, and it looked at him with pleading eyes.\n\nThe woodcutter freed the crane and nursed it back to health. When the crane could fly again, it circled him three times and flew away toward the sunset.\n\nA few days later, a beautiful young woman appeared at his door. She was lost and asked for shelter. The woodcutter, being kind, agreed. She stayed and eventually became his wife.\n\nThough they had little money, they were happy. One day, the wife said she could weave beautiful cloth that they could sell. But she made him promise never to watch her while she worked.\n\nShe went into a room and wove for seven days. When she emerged, she held the most beautiful cloth anyone had ever seen. They sold it for a fortune. But the money soon ran out, so she agreed to weave again.\n\nThis time, she wove for seven more days. The woodcutter, curious and worried about his wife's growing weakness, peeked through a crack in the door. He was shocked to see not his wife, but the crane he had saved, plucking its own feathers to weave into the cloth.\n\nWhen she emerged, she was pale and thin. She knew he had broken his promise. "I am the crane you saved," she said. "I stayed to repay your kindness. But now that you have seen my true form, I must leave."\n\nShe transformed back into a crane and flew away, leaving the woodcutter alone with his regret.`,
        moral: "Gratitude is precious, and promises should never be broken.",
        narrator: "Traditional Japanese",
        tags: ["Gratitude", "Promises", "Transformation", "Love"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Japanese Folktales"
      },
      {
        title: "The Stonecutter",
        culture: "Asian",
        region: "China",
        language: "Mandarin",
        category: "Fairy Tales",
        description: "A story about ambition, power, and finding contentment in one's true nature.",
        storyText: `There was once a stonecutter who worked hard every day, cutting stone from the mountain. One day, as he sweated under the hot sun, he saw a wealthy merchant pass by in a comfortable carriage.\n\n"I wish I were that merchant," the stonecutter thought. "He has wealth and comfort."\n\nA spirit heard his wish and granted it. The stonecutter became the merchant, with fine clothes and a grand house. He was happy until he saw a prince pass by, surrounded by guards and bowed to by all.\n\n"I wish I were a prince," he thought. "He has power and respect."\n\nAgain the spirit granted his wish. He became a prince, living in a palace with servants. But one day, he saw the sun scorching the crops in the fields. Even princes must bow to the sun's power.\n\n"I wish I were the sun," he thought. "Nothing is more powerful."\n\nHe became the sun, shining down on the earth. He was powerful until a cloud blocked his rays. The cloud was more powerful.\n\n"I wish I were a cloud," he thought, and became one. He rained on the earth, but the mountain stood firm against his storms.\n\n"The mountain is the strongest of all," he thought, and became the mountain. Nothing could move him. Until one day, he felt something chipping away at his base - a stonecutter with a chisel.\n\n"Ah," he realized, "the stonecutter can shape even the mountain." He wished to be himself again.\n\nThe spirit granted his final wish, and he returned to his life as a stonecutter, now content with who he was.`,
        moral: "True contentment comes from accepting who you are, not from seeking power over others.",
        narrator: "Traditional Chinese",
        tags: ["Ambition", "Contentment", "Power", "Wisdom"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Chinese Folktales"
      },
      // Pacific Stories
      {
        title: "Maui and the Sun",
        culture: "Pacific",
        region: "New Zealand",
        language: "Maori",
        category: "Hero Myths",
        description: "The tale of how the demigod Maui slowed the sun to give people longer days.",
        storyText: `In the early days, the sun crossed the sky too quickly. The days were short, and the people did not have enough time to cook their food or do their work.\n\nMaui, the clever demigod, decided to slow the sun. His brothers laughed at him. "No one can catch the sun!" they said.\n\nBut Maui was determined. He and his brothers went to the pit where the sun rose each morning. They took with them strong ropes made from their sister's hair.\n\nAs the sun rose, Maui and his brothers threw the ropes around it. The sun struggled and burned, but they held on tight. The ropes smoked and sizzled, but did not break.\n\n"Let me go!" the sun cried. "Why do you capture me?"\n\n"You travel too fast across the sky," Maui said. "Give us longer days so our people can live properly."\n\nThe sun agreed, and Maui made him promise to travel more slowly. From that day forward, the sun moved at a gentler pace across the sky, giving the people of the Pacific longer days to work and play.\n\nYou can still see the marks of the ropes on the sun's surface if you look carefully.`,
        moral: "Courage and determination can change even the mightiest forces of nature.",
        narrator: "Traditional Maori",
        tags: ["Hero", "Sun", "Courage", "Creation"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Maori Mythology"
      },
      {
        title: "The First Rainbow",
        culture: "Pacific",
        region: "Hawaii",
        language: "Hawaiian",
        category: "Creation Myths",
        description: "How the goddess Anuenue brought the first rainbow to Hawaii as a bridge between heaven and earth.",
        storyText: `In the ancient days of Hawaii, when the gods walked among the people, there was a beautiful goddess named Anuenue. She was the goddess of rainbows, and she lived in the clouds with her parents, Kane and Lono.\n\nAnuenue loved to watch the people below, but she could not visit them because the path between heaven and earth was too steep and dangerous. She wept with longing, and her tears became the gentle rain of Hawaii.\n\nHer father, Kane, saw her sadness and said, "I will create a bridge for you to visit the earth." He took all the colors of the flowers - the red of the lehua, the yellow of the ilima, the green of the ti leaf, and the blue of the ocean.\n\nHe wove these colors together into a great arc that stretched from the clouds to the mountains. "This is your pathway, my daughter. Walk down it whenever you wish to visit the people."\n\nAnuenue was overjoyed. She danced down the rainbow bridge, her feet barely touching the colors. When she reached the earth, the people were amazed by her beauty and the gift of the rainbow.\n\nTo this day, when a rainbow appears in the Hawaiian sky, the people say, "Anuenue is visiting us again." And they know that blessings follow the rainbow's path.`,
        moral: "Love finds ways to bridge even the greatest distances.",
        narrator: "Traditional Hawaiian",
        tags: ["Rainbow", "Creation", "Love", "Gods"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Hawaiian Mythology"
      }
    ];

    // Check if stories already exist
    const existingCount = await Story.countDocuments({ source: { $exists: true } });

    if (existingCount > 0) {
      console.log(`ℹ️ ${existingCount} cultural stories already exist. Skipping seed.`);
      return res.json({
        success: true,
        message: 'Stories already seeded',
        count: existingCount,
        skipped: true
      });
    }

    // Insert all stories
    const result = await Story.insertMany(culturalStories);
    console.log(`✅ Successfully seeded ${result.length} cultural stories`);

    res.json({
      success: true,
      message: `Seeded ${result.length} cultural stories`,
      count: result.length,
      cultures: [...new Set(culturalStories.map(s => s.culture))]
    });

  } catch (error) {
    console.error('❌ Error seeding cultural stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding stories',
      error: error.message
    });
  }
});

// Get cultures with story counts
app.get("/api/cultures", async (req, res) => {
  try {
    const cultures = await Story.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$culture',
          storyCount: { $sum: 1 },
          regions: { $addToSet: '$region' },
          languages: { $addToSet: '$language' },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { storyCount: -1 } }
    ]);

    // Format the response
    const formattedCultures = cultures.map(c => ({
      name: c._id,
      storyCount: c.storyCount,
      regions: c.regions.slice(0, 5), // Top 5 regions
      languages: c.languages.slice(0, 5), // Top 5 languages
      categories: c.categories
    }));

    res.json({
      success: true,
      cultures: formattedCultures,
      total: formattedCultures.length
    });

  } catch (error) {
    console.error("❌ Error fetching cultures:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cultures",
      error: error.message
    });
  }
});

// Get stories by culture
app.get("/api/cultures/:culture/stories", async (req, res) => {
  try {
    const { culture } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = {
      culture: { $regex: culture, $options: 'i' },
      status: 'approved'
    };

    const stories = await Story.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-submitterEmail');

    const total = await Story.countDocuments(query);

    // Add audio URLs
    const storiesWithUrls = stories.map(story => {
      const storyObj = story.toObject();
      if (storyObj.audioFiles && storyObj.audioFiles.length > 0) {
        storyObj.audioFiles = storyObj.audioFiles.map(af => ({
          ...af,
          url: af.localPath ? `http://localhost:5001${af.localPath}` : null
        }));
      }
      return storyObj;
    });

    res.json({
      success: true,
      culture,
      stories: storiesWithUrls,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: stories.length,
        totalStories: total
      }
    });

  } catch (error) {
    console.error("❌ Error fetching culture stories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stories",
      error: error.message
    });
  }
});

// Get featured collections
app.get("/api/stories/featured/collections", async (req, res) => {
  try {
    const collections = [
      {
        id: 'creation-myths',
        title: 'Creation Myths',
        description: 'Stories of how the world began from different cultures',
        icon: '🌍',
        stories: await Story.find({
          category: { $in: ['Creation Myth', 'Creation Stories'] },
          status: 'approved'
        }).limit(6).select('-submitterEmail -storyText')
      },
      {
        id: 'animal-tales',
        title: 'Animal Tales',
        description: 'Wisdom stories featuring animals as teachers',
        icon: '🦁',
        stories: await Story.find({
          $or: [
            { category: { $in: ['Animal Story', 'Panchatantra'] } },
            { tags: { $in: ['Animals'] } }
          ],
          status: 'approved'
        }).limit(6).select('-submitterEmail -storyText')
      },
      {
        id: 'trickster-stories',
        title: 'Trickster Tales',
        description: 'Clever characters who outwit the powerful',
        icon: '🕷️',
        stories: await Story.find({
          $or: [
            { tags: { $in: ['Trickster', 'Cleverness'] } },
            { category: 'Anansi Stories' }
          ],
          status: 'approved'
        }).limit(6).select('-submitterEmail -storyText')
      },
      {
        id: 'wisdom-teachings',
        title: 'Wisdom Teachings',
        description: 'Stories that teach important life lessons',
        icon: '📚',
        stories: await Story.find({
          $or: [
            { category: { $in: ['Wisdom Tales', 'Folk Tales'] } },
            { tags: { $in: ['Wisdom'] } }
          ],
          status: 'approved'
        }).limit(6).select('-submitterEmail -storyText')
      },
      {
        id: 'hero-journeys',
        title: 'Hero Journeys',
        description: 'Epic tales of courage and adventure',
        icon: '⚔️',
        stories: await Story.find({
          $or: [
            { category: { $in: ['Hero Myths', 'Epic'] } },
            { tags: { $in: ['Hero', 'Courage'] } }
          ],
          status: 'approved'
        }).limit(6).select('-submitterEmail -storyText')
      },
      {
        id: 'love-transformation',
        title: 'Love & Transformation',
        description: 'Stories of change, sacrifice, and devotion',
        icon: '💫',
        stories: await Story.find({
          $or: [
            { tags: { $in: ['Love', 'Transformation', 'Sacrifice'] } },
            { category: 'Fairy Tales' }
          ],
          status: 'approved'
        }).limit(6).select('-submitterEmail -storyText')
      }
    ];

    res.json({
      success: true,
      collections
    });

  } catch (error) {
    console.error("❌ Error fetching featured collections:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching collections",
      error: error.message
    });
  }
});

// ============================================
// EXTERNAL API INTEGRATION - INDIAN STORIES
// ============================================

// Wikipedia API configuration
const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';
const GUTENBERG_API = 'https://gutendex.com/books';

/**
 * Transform Wikipedia summary data to story format
 */
function transformWikipediaStory(wikiData, metadata = {}) {
  return {
    title: wikiData.title,
    culture: metadata.culture || 'Indian',
    region: metadata.region || 'India',
    language: metadata.language || 'Various',
    category: metadata.category || 'Folklore',
    description: wikiData.description || `${wikiData.title} - Indian folklore`,
    storyText: wikiData.extract,
    moral: extractMoral(wikiData.extract),
    narrator: metadata.narrator || 'Traditional',
    tags: [...(metadata.tags || []), 'Wikipedia', 'External API'],
    difficulty: 'Medium',
    ageGroup: 'All Ages',
    submitterName: 'Wikipedia API',
    submitterEmail: 'api@folkloregpt.com',
    permissions: true,
    attribution: true,
    respectfulUse: true,
    status: 'approved',
    submissionType: 'text',
    source: 'Wikipedia',
    sourceUrl: wikiData.content_urls?.desktop?.page || wikiData.url,
    thumbnail: wikiData.thumbnail?.source || null,
    fetchedAt: new Date()
  };
}

function extractMoral(text) {
  if (!text) return '';
  const patterns = [
    /moral[\s\w]*[:\s]+["']?([^"'.]+)["']?/i,
    /lesson[\s\w]*[:\s]+["']?([^"'.]+)["']?/i,
    /teach(?:es)?[\s\w]*[:\s]+["']?([^"'.]+)["']?/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return '';
}

/**
 * Import Indian stories from Wikipedia
 * GET /api/stories/import/wikipedia
 */
app.get("/api/stories/import/wikipedia", async (req, res) => {
  try {
    console.log('🌐 Fetching Indian stories from Wikipedia...');

    const indianStoryPages = [
      { title: 'Panchatantra', category: 'Fable', culture: 'Indian', language: 'Sanskrit', tags: ['Animals', 'Wisdom'] },
      { title: 'Jataka_tales', category: 'Buddhist Tale', culture: 'Indian', language: 'Pali', tags: ['Buddha', 'Previous Lives'] },
      { title: 'Hitopadesha', category: 'Fable', culture: 'Indian', language: 'Sanskrit', tags: ['Animals', 'Wisdom'] },
      { title: 'Folklore_of_India', category: 'Folklore', culture: 'Indian', language: 'Various', tags: ['Culture', 'Traditions'] },
      { title: 'Mahabharata', category: 'Epic', culture: 'Indian', language: 'Sanskrit', tags: ['Epic', 'War'] },
      { title: 'Ramayana', category: 'Epic', culture: 'Indian', language: 'Sanskrit', tags: ['Epic', 'Rama'] },
      { title: 'Vishnu_Sharma', category: 'Historical', culture: 'Indian', language: 'Sanskrit', tags: ['Author', 'Panchatantra'] },
      { title: 'Akbar_and_Birbal', category: 'Folk Tale', culture: 'Indian', language: 'Hindi', tags: ['Clever', 'Humor'] },
      { title: 'Tenali_Rama', category: 'Folk Tale', culture: 'Indian', language: 'Telugu', tags: ['Clever', 'Poet'] },
      { title: 'Vikram_and_Vetala', category: 'Folk Tale', culture: 'Indian', language: 'Sanskrit', tags: ['King', 'Vampire'] },
    ];

    const stories = [];
    let imported = 0;
    let skipped = 0;

    for (const page of indianStoryPages) {
      try {
        // Check if story already exists
        const existing = await Story.findOne({ title: page.title, source: 'Wikipedia' });
        if (existing) {
          console.log(`⏭️ Skipping existing: ${page.title}`);
          skipped++;
          continue;
        }

        // Fetch from Wikipedia
        const response = await axios.get(
          `${WIKIPEDIA_API}/page/summary/${page.title}`,
          { timeout: 15000 }
        );

        if (response.data && response.data.extract) {
          const storyData = transformWikipediaStory(response.data, page);

          // Save to database
          const story = new Story(storyData);
          await story.save();
          stories.push(storyData);
          imported++;
          console.log(`✅ Imported: ${page.title}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${page.title}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `Wikipedia import complete`,
      imported,
      skipped,
      total: stories.length,
      stories: stories.map(s => ({ title: s.title, source: s.sourceUrl }))
    });

  } catch (error) {
    console.error('❌ Wikipedia import error:', error);
    res.status(500).json({
      success: false,
      message: 'Wikipedia import failed',
      error: error.message
    });
  }
});

/**
 * Import from Project Gutenberg
 * GET /api/stories/import/gutenberg
 */
app.get("/api/stories/import/gutenberg", async (req, res) => {
  try {
    console.log('📚 Fetching Indian stories from Project Gutenberg...');

    const searchTerms = [
      'Indian folklore',
      'Hindu mythology',
      'Indian fables',
      'Panchatantra',
      'Jataka',
      'Indian tales',
      'Eastern stories',
      'India legends'
    ];

    const stories = [];
    let imported = 0;

    for (const term of searchTerms) {
      try {
        const response = await axios.get(
          `${GUTENBERG_API}?search=${encodeURIComponent(term)}&languages=en`,
          { timeout: 10000 }
        );

        if (response.data.results) {
          for (const book of response.data.results.slice(0, 2)) {
            // Check if already exists
            const existing = await Story.findOne({ title: book.title, source: 'Project Gutenberg' });
            if (existing) continue;

            const storyData = {
              title: book.title,
              culture: 'Indian',
              region: 'India',
              language: book.languages?.[0] || 'English',
              category: 'Literature',
              description: book.description || `Public domain book: ${book.title}`,
              storyText: `Full text available at Project Gutenberg.\n\nAuthors: ${book.authors?.map(a => a.name).join(', ') || 'Unknown'}\n\nThis is a public domain work available for free reading and distribution.`,
              moral: '',
              narrator: book.authors?.map(a => a.name).join(', ') || 'Unknown',
              tags: ['Project Gutenberg', 'Public Domain', 'Literature', ...book.bookshelves.slice(0, 3)],
              difficulty: 'Medium',
              ageGroup: 'All Ages',
              submitterName: 'Project Gutenberg API',
              submitterEmail: 'api@folkloregpt.com',
              permissions: true,
              attribution: true,
              respectfulUse: true,
              status: 'approved',
              submissionType: 'text',
              source: 'Project Gutenberg',
              sourceUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
              thumbnail: book.formats?.['image/jpeg'] || null,
              fetchedAt: new Date()
            };

            const story = new Story(storyData);
            await story.save();
            stories.push(storyData);
            imported++;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to search ${term}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: 'Gutenberg import complete',
      imported,
      stories: stories.map(s => ({ title: s.title, source: s.sourceUrl }))
    });

  } catch (error) {
    console.error('❌ Gutenberg import error:', error);
    res.status(500).json({
      success: false,
      message: 'Gutenberg import failed',
      error: error.message
    });
  }
});

/**
 * Search Wikipedia for specific topics
 * GET /api/stories/search/wikipedia?q=searchterm
 */
app.get("/api/stories/search/wikipedia", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query required' });
    }

    console.log(`🔍 Searching Wikipedia for: ${q}`);

    const params = {
      action: 'query',
      list: 'search',
      srsearch: `${q} Indian folklore`,
      format: 'json',
      origin: '*',
      srlimit: 10
    };

    const response = await axios.get('https://en.wikipedia.org/w/api.php', { params });

    if (response.data.query?.search) {
      const results = await Promise.all(
        response.data.query.search.slice(0, 5).map(async (result) => {
          try {
            const summary = await axios.get(
              `${WIKIPEDIA_API}/page/summary/${encodeURIComponent(result.title)}`,
              { timeout: 10000 }
            );
            return {
              title: result.title,
              snippet: result.snippet.replace(new RegExp('</?span[^>]*>', 'g'), ''),
              summary: summary.data.extract?.substring(0, 500),
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`
            };
          } catch (e) {
            return null;
          }
        })
      );

      res.json({
        success: true,
        query: q,
        results: results.filter(r => r !== null)
      });
    } else {
      res.json({ success: true, results: [] });
    }

  } catch (error) {
    console.error('❌ Wikipedia search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * Import all external sources at once
 * POST /api/stories/import/all
 */
app.post("/api/stories/import/all", async (req, res) => {
  try {
    console.log('🚀 Starting full external import...');

    const results = {
      wikipedia: { imported: 0, error: null },
      gutenberg: { imported: 0, error: null }
    };

    // Import Wikipedia
    try {
      const wikiPages = [
        { title: 'Panchatantra', category: 'Fable', culture: 'Indian', language: 'Sanskrit' },
        { title: 'Jataka_tales', category: 'Buddhist Tale', culture: 'Indian', language: 'Pali' },
        { title: 'Folklore_of_India', category: 'Folklore', culture: 'Indian', language: 'Various' },
        { title: 'Indian_folklore', category: 'Folklore', culture: 'Indian', language: 'Various' },
        { title: 'Akbar_and_Birbal', category: 'Folk Tale', culture: 'Indian', language: 'Hindi' },
        { title: 'Tenali_Rama', category: 'Folk Tale', culture: 'Indian', language: 'Telugu' },
        { title: 'Vikram_and_Vetala', category: 'Folk Tale', culture: 'Indian', language: 'Sanskrit' },
        { title: 'Baital_Pachisi', category: 'Folk Tale', culture: 'Indian', language: 'Sanskrit' },
        { title: 'Singhasan_Battisi', category: 'Folk Tale', culture: 'Indian', language: 'Hindi' },
        { title: 'Mahabharata', category: 'Epic', culture: 'Indian', language: 'Sanskrit' },
        { title: 'Ramayana', category: 'Epic', culture: 'Indian', language: 'Sanskrit' },
        { title: 'Bhagavata_Purana', category: 'Purana', culture: 'Indian', language: 'Sanskrit' },
        { title: 'Shiva_Purana', category: 'Purana', culture: 'Indian', language: 'Sanskrit' },
        { title: 'Vishnu_Purana', category: 'Purana', culture: 'Indian', language: 'Sanskrit' },
      ];

      for (const page of wikiPages) {
        const existing = await Story.findOne({ title: page.title, source: 'Wikipedia' });
        if (existing) continue;

        const response = await axios.get(
          `${WIKIPEDIA_API}/page/summary/${page.title}`,
          { timeout: 15000 }
        );

        if (response.data?.extract) {
          const storyData = transformWikipediaStory(response.data, page);
          await new Story(storyData).save();
          results.wikipedia.imported++;
        }
      }
    } catch (e) {
      results.wikipedia.error = e.message;
    }

    // Import Gutenberg
    try {
      const response = await axios.get(
        `${GUTENBERG_API}?search=Indian+folklore&languages=en`,
        { timeout: 10000 }
      );

      if (response.data.results) {
        for (const book of response.data.results.slice(0, 5)) {
          const existing = await Story.findOne({ title: book.title, source: 'Project Gutenberg' });
          if (existing) continue;

          const storyData = {
            title: book.title,
            culture: 'Indian',
            region: 'India',
            language: book.languages?.[0] || 'English',
            category: 'Literature',
            description: book.description || `Public domain: ${book.title}`,
            storyText: `Available at Project Gutenberg: https://www.gutenberg.org/ebooks/${book.id}`,
            narrator: book.authors?.map(a => a.name).join(', ') || 'Unknown',
            tags: ['Public Domain', 'Literature'],
            difficulty: 'Medium',
            ageGroup: 'All Ages',
            submitterName: 'Gutenberg API',
            submitterEmail: 'api@folkloregpt.com',
            permissions: true,
            attribution: true,
            respectfulUse: true,
            status: 'approved',
            submissionType: 'text',
            source: 'Project Gutenberg',
            sourceUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
            fetchedAt: new Date()
          };

          await new Story(storyData).save();
          results.gutenberg.imported++;
        }
      }
    } catch (e) {
      results.gutenberg.error = e.message;
    }

    const totalImported = results.wikipedia.imported + results.gutenberg.imported;

    res.json({
      success: true,
      message: `Import complete. ${totalImported} stories imported.`,
      results,
      totalImported
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({
      success: false,
      message: 'Import failed',
      error: error.message
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    mongodb: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 100MB.'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: error.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Data Server running on http://localhost:${PORT}`));
