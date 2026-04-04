const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');
const storyRoutes = require('./routes/storyRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ——— Load environment variables ———
dotenv.config({ path: './.env' });

// ——— Connect to MongoDB ———
connectDB();

// ——— Initialize Express ———
const app = express();

// ——— Middleware ———
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ——— Multer Configuration for File Uploads ———
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mpeg', 'audio/wav', 'audio/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images and audio files.`), false);
    }
  }
});

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// ——— Routes ———
app.get('/', (req, res) => {
  res.json({
    message: '🌍 FolkloreGPT API is running',
    version: '1.0.0',
    endpoints: {
      stories: '/api/stories',
      filters: '/api/stories/filters',
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'healthy',
    database: dbStatus[dbState] || 'unknown',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// Import controller for direct route handling
const storyController = require('./controllers/storyController');

// Stories routes with file upload support
app.get('/api/stories/filters', storyController.getFilterOptions);
app.get('/api/stories', storyController.getStories);
app.post('/api/stories', upload.fields([
  { name: 'audioFiles', maxCount: 3 },
  { name: 'imageFiles', maxCount: 5 }
]), storyController.createStory);
app.get('/api/stories/stats', (req, res) => {
  res.json({ success: true, data: { totalStories: 0, totalCultures: 0 } });
});
app.get('/api/stories/:id', storyController.getStory);
app.put('/api/stories/:id', storyController.updateStory);
app.delete('/api/stories/:id', storyController.deleteStory);

// ——— Error Handling ———
app.use(notFound);
app.use(errorHandler);

// ——— Start Server ———
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 FolkloreGPT API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`   Stories API:  http://localhost:${PORT}/api/stories`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
});
