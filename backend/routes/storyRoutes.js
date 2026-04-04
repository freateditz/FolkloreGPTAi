const express = require('express');
const router = express.Router();
const {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  getFilterOptions,
} = require('../controllers/storyController');

// /api/stories/filters — must be BEFORE /:id to avoid collision
router.get('/filters', getFilterOptions);

// CRUD
router.route('/')
  .get(getStories)
  .post(createStory);

router.route('/:id')
  .get(getStory)
  .put(updateStory)
  .delete(deleteStory);

module.exports = router;
