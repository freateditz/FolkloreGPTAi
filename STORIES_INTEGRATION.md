# Cultural Stories Integration

This document explains how the cultural stories feature works in FolkloreGPT.

## Overview

The stories section now integrates cultural stories from different regions and cultures around the world. Users can:

- Browse stories by culture (Indian, African, Asian, Native American, Pacific)
- Search stories by keyword, region, language, or category
- Explore curated collections (Creation Myths, Animal Tales, Trickster Tales, etc.)
- Read full stories with morals, cultural context, and related stories

## Backend API Endpoints

### Seed Cultural Stories
```
POST /api/stories/seed
```
Populates the database with curated cultural stories from various traditions.

### Get All Cultures
```
GET /api/cultures
```
Returns all cultures with story counts and metadata.

### Get Stories by Culture
```
GET /api/cultures/:culture/stories?page=1&limit=20
```
Returns stories for a specific culture.

### Get Featured Collections
```
GET /api/stories/featured/collections
```
Returns curated story collections with themed groupings.

### Search Stories
```
GET /api/stories/search?q=keyword&page=1&limit=20
```
Full-text search across stories.

## Frontend Components

### Stories Page (`/stories`)
- Three view modes: All Stories, By Culture, Collections
- Search and filter by culture, language, category
- Sort by recent, popular, rating
- Featured collections showcase

### Story Detail Page (`/story/:id`)
- Full story text with proper formatting
- Cultural context and moral
- Related stories from same culture
- Audio narration (if available)

## Cultural Stories Included

### Indian Stories
- The Loyal Mongoose (Panchatantra)
- The Golden Deer (Ramayana)
- The Clever Rabbit (Karnataka Folk Tales)
- The Tiger and the Brahmin (Bengali Folk Tales)
- The Birth of Ganesha (Shiva Purana)

### African Stories
- How Anansi Brought Stories to the World (Akan)
- The Lion's Whisker (Ethiopian)
- The Wise Old Man of the Mountain (Yoruba)

### Native American Stories
- How the Coyote Stole Fire (Chinook)
- The Legend of the Dreamcatcher (Ojibwe)

### Asian Stories
- The Crane Wife (Japanese)
- The Stonecutter (Chinese)

### Pacific Stories
- Maui and the Sun (Maori)
- The First Rainbow (Hawaiian)

## Adding More Stories

To add more cultural stories:

1. Edit `/data/server.js` and add to the `culturalStories` array in the seed endpoint
2. Follow the existing story format:
```javascript
{
  title: "Story Title",
  culture: "Culture Name",
  region: "Specific Region",
  language: "Original Language",
  category: "Category",
  description: "Brief description",
  storyText: "Full story text...",
  moral: "The moral of the story",
  tags: ["tag1", "tag2"],
  difficulty: "Easy|Medium|Hard",
  ageGroup: "Children|Teens|Adults|All Ages",
  // ... other fields
}
```

3. Restart the data server and call the seed endpoint

## Future Integrations

Planned integrations with external APIs:
- Project Gutenberg for public domain stories
- Internet Archive for folklore collections
- Wikipedia for cultural context
- Smithsonian Folklife collections

## Running the Integration

1. Start the data server:
```bash
cd /data
node server.js
```

2. The frontend will automatically seed stories on first load

3. Access the stories at: http://localhost:3000/stories
