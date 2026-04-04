import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  description: { type: String, required: true, index: 'text' },

  // Story Content
  storyText: { type: String, index: 'text' },
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
}, { collection: "Stories" });

// Add text search index
storySchema.index({ title: 'text', description: 'text', storyText: 'text', tags: 'text' });

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

// Get All Stories API with SEARCH
app.get("/api/stories", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      culture,
      language,
      submissionType,
      search, // NEW: Search query
      status = 'approved'
    } = req.query;

    const query = { status };

    if (category) query.category = category;
    if (culture) query.culture = culture;
    if (language) query.language = language;
    if (submissionType) query.submissionType = submissionType;

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const stories = await Story.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-submitterEmail');

    const total = await Story.countDocuments(query);

    // Add audio URLs
    const storiesWithUrls = stories.map(story => {
      const storyObj = story.toObject();
      // Convert local paths to full URLs
      if (storyObj.audioFiles && storyObj.audioFiles.length > 0) {
        storyObj.audioFiles = storyObj.audioFiles.map(af => ({
          ...af,
          url: af.localPath ? `http://localhost:5000${af.localPath}` : null
        }));
      }
      return storyObj;
    });

    res.json({
      success: true,
      stories: storiesWithUrls,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: stories.length,
        totalStories: total
      }
    });

  } catch (error) {
    console.error("❌ Error fetching stories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stories",
      error: error.message
    });
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
          url: af.localPath ? `http://localhost:5000${af.localPath}` : null
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
        url: af.localPath ? `http://localhost:5000${af.localPath}` : null
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

app.listen(5000, () => console.log("🚀 Data Server running on http://localhost:5000"));
