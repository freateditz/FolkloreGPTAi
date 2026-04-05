import axios from 'axios';

// Use environment variable for data server URL, fallback to localhost for development
const DATA_SERVER_URL = process.env.REACT_APP_DATA_SERVER_URL || 'http://localhost:5001';
const API_BASE_URL = `${DATA_SERVER_URL}/api`;

class StoryService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // 60 seconds for file uploads
      headers: {
        'Accept': 'application/json',
      }
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        // Log request data for debugging (excluding file content)
        if (config.data && !(config.data instanceof FormData)) {
          console.log('Request data:', config.data);
        } else if (config.data instanceof FormData) {
          const formDataEntries = {};
          for (let [key, value] of config.data.entries()) {
            formDataEntries[key] = value instanceof File ? `File: ${value.name}` : value;
          }
          console.log('Form data:', formDataEntries);
        }
        return config;
      },
      (error) => {
        console.error('📤 Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and data transformation
    this.api.interceptors.response.use(
      (response) => {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`);
        console.log('Response data:', response.data);
        return response;
      },
      (error) => {
        console.error('📥 Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async submitStory(storyData, audioFiles = [], imageFiles = []) {
    try {
      const formData = new FormData();

      // Map frontend field names to backend field names
      const fieldMapping = {
        storyTitle: 'title',
        community: 'culture',
        location: 'region',
        moralLesson: 'moral',
      };

      // Add text data
      Object.keys(storyData).forEach(key => {
        const mappedKey = fieldMapping[key] || key;
        if (key === 'tags' && Array.isArray(storyData[key])) {
          formData.append('tags', storyData[key].join(','));
        } else if (storyData[key] !== null && storyData[key] !== undefined) {
          formData.append(mappedKey, storyData[key]);
        }
      });

      // Add audio files
      if (audioFiles?.length > 0) {
        audioFiles.forEach((file, index) => {
          if (file instanceof File || file instanceof Blob) {
            formData.append('audioFiles', file, file.name || `audio-${index}.webm`);
          }
        });
      }

      // Add image files
      if (imageFiles?.length > 0) {
        imageFiles.forEach((file, index) => {
          if (file instanceof File || file instanceof Blob) {
            formData.append('imageFiles', file, file.name || `image-${index}.jpg`);
          }
        });
      }

      console.log('📝 Submitting story with form data...');

      const response = await this.api.post('/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      return {
        success: data.success !== false,
        story: data.story || data.data,
        data: data.data,
        message: data.message || 'Story submitted successfully'
      };
    } catch (error) {
      console.error('❌ Error submitting story:', error);
      return this.handleError(error);
    }
  }

  async getStories(params = {}) {
    try {
      const response = await this.api.get('/stories', { params });
      // Normalize response format for frontend
      const data = response.data;
      return {
        success: data.success !== false,
        stories: data.stories || data.data || [],
        data: data.data || data.stories || [],
        pagination: data.pagination || {
          current: data.page || 1,
          total: data.pages || 1,
          hasMore: data.page < data.pages
        },
        total: data.total || 0,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      return this.handleError(error);
    }
  }

  async getStory(id) {
    try {
      const response = await this.api.get(`/stories/${id}`);
      const data = response.data;
      return {
        success: data.success !== false,
        story: data.story || data.data,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error fetching story:', error);
      return this.handleError(error);
    }
  }

  async getStoryStats() {
    try {
      const response = await this.api.get('/stories/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching story stats:', error);
      throw this.handleError(error);
    }
  }

  async submitContact(contactData) {
    try {
      const response = await this.api.post('/contact', contactData);
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting contact:', error);
      throw this.handleError(error);
    }
  }

  // ============================================
  // CULTURAL STORIES AGGREGATOR METHODS
  // ============================================

  /**
   * Seed the database with curated cultural stories
   */
  async seedCulturalStories() {
    try {
      console.log('🌱 Seeding cultural stories...');
      const response = await this.api.post('/stories/seed');
      return {
        success: response.data.success !== false,
        ...response.data
      };
    } catch (error) {
      console.error('❌ Error seeding stories:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get all available cultures with story counts
   */
  async getCultures() {
    try {
      const response = await this.api.get('/cultures');
      return {
        success: response.data.success !== false,
        cultures: response.data.cultures || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('❌ Error fetching cultures:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get stories by specific culture/region
   */
  async getStoriesByCulture(culture, params = {}) {
    try {
      const response = await this.api.get(`/cultures/${encodeURIComponent(culture)}/stories`, { params });
      return {
        success: response.data.success !== false,
        culture: response.data.culture,
        stories: response.data.stories || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('❌ Error fetching culture stories:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get featured story collections
   */
  async getFeaturedCollections() {
    try {
      const response = await this.api.get('/stories/featured/collections');
      return {
        success: response.data.success !== false,
        collections: response.data.collections || []
      };
    } catch (error) {
      console.error('❌ Error fetching collections:', error);
      return this.handleError(error);
    }
  }

  /**
   * Search stories by keyword
   */
  async searchStories(query, params = {}) {
    try {
      const response = await this.api.get('/stories/search', {
        params: { q: query, ...params }
      });
      return {
        success: response.data.success !== false,
        stories: response.data.stories || [],
        query: response.data.query,
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('❌ Error searching stories:', error);
      return this.handleError(error);
    }
  }

  handleError(error) {
    console.error('Handling error:', error);

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        success: false,
        status,
        message: data?.message || data?.error || `Server error (${status})`,
        error: data?.error || 'Unknown server error'
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        status: 0,
        message: 'Network error - please check if the backend server is running on port 5001',
        error: 'Network error'
      };
    } else {
      // Something else happened
      return {
        success: false,
        status: 0,
        message: error?.message || 'An unexpected error occurred',
        error: 'Client error'
      };
    }
  }
}

export default new StoryService();