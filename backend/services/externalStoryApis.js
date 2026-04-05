/**
 * External Story APIs Integration Service
 * Fetches stories from various external sources and databases
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

class ExternalStoryAPIs {
  constructor() {
    // Wikipedia API for folklore/mythology content
    this.wikipedia = {
      baseUrl: 'https://en.wikipedia.org/api/rest_v1',
      enabled: true,
    };

    // Project Gutenberg for public domain books
    this.gutenberg = {
      baseUrl: 'https://gutendex.com/books',
      enabled: true,
    };

    // Wikisource for texts
    this.wikisource = {
      baseUrl: 'https://en.wikisource.org/w/api.php',
      enabled: true,
    };

    // Internet Archive
    this.archive = {
      baseUrl: 'https://archive.org/advancedsearch.php',
      enabled: true,
    };
  }

  // ============================================
  // INDIAN STORIES SOURCES
  // ============================================

  /**
   * Fetch Indian folklore from Wikipedia
   * This gets real data from Wikipedia pages about Indian folklore
   */
  async fetchIndianFolkloreFromWikipedia() {
    console.log('📚 Fetching Indian folklore from Wikipedia...');

    const indianStoryPages = [
      { title: 'Panchatantra', category: 'Fable', culture: 'Indian', language: 'Sanskrit' },
      { title: 'Jataka_tales', category: 'Buddhist Tale', culture: 'Indian', language: 'Pali' },
      { title: 'Hitopadesha', category: 'Fable', culture: 'Indian', language: 'Sanskrit' },
      { title: 'Katha-sarit-sagara', category: 'Folklore', culture: 'Indian', language: 'Sanskrit' },
      { title: 'Indian_folklore', category: 'Folklore', culture: 'Indian', language: 'Various' },
      { title: 'Folklore_of_India', category: 'Folklore', culture: 'Indian', language: 'Various' },
    ];

    const stories = [];

    for (const page of indianStoryPages) {
      try {
        // Fetch page summary from Wikipedia REST API
        const response = await axios.get(
          `${this.wikipedia.baseUrl}/page/summary/${page.title}`,
          { timeout: 10000 }
        );

        if (response.data && response.data.extract) {
          const storyData = this.transformWikipediaData(response.data, page);
          if (storyData) {
            stories.push(storyData);
            console.log(`✅ Fetched: ${page.title}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${page.title}:`, error.message);
      }
    }

    return stories;
  }

  /**
   * Search Wikipedia for specific Indian stories/topics
   */
  async searchWikipediaForIndianStories(searchTerm) {
    try {
      const params = {
        action: 'query',
        list: 'search',
        srsearch: `${searchTerm} Indian folklore story`,
        format: 'json',
        origin: '*',
        srlimit: 10
      };

      const response = await axios.get('https://en.wikipedia.org/w/api.php', { params });

      if (response.data.query && response.data.query.search) {
        const stories = [];

        for (const result of response.data.query.search.slice(0, 5)) {
          try {
            const summaryResponse = await axios.get(
              `${this.wikipedia.baseUrl}/page/summary/${encodeURIComponent(result.title)}`,
              { timeout: 10000 }
            );

            if (summaryResponse.data.extract) {
              stories.push(this.transformWikipediaData(summaryResponse.data, {
                title: result.title,
                category: 'Folklore',
                culture: 'Indian',
                language: 'Various'
              }));
            }
          } catch (e) {
            console.warn(`Failed to get summary for ${result.title}`);
          }
        }

        return stories;
      }

      return [];
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      return [];
    }
  }

  /**
   * Fetch Indian books from Project Gutenberg
   */
  async fetchIndianBooksFromGutenberg() {
    console.log('📚 Fetching Indian literature from Project Gutenberg...');

    const searchTerms = [
      'Indian folklore',
      'Hindu mythology',
      'Indian fables',
      'Panchatantra',
      'Jataka',
      'Indian tales',
      'Eastern stories'
    ];

    const stories = [];

    for (const term of searchTerms) {
      try {
        const response = await axios.get(
          `${this.gutenberg.baseUrl}?search=${encodeURIComponent(term)}&languages=en`,
          { timeout: 10000 }
        );

        if (response.data.results) {
          for (const book of response.data.results.slice(0, 3)) {
            const storyData = this.transformGutenbergData(book);
            if (storyData) {
              stories.push(storyData);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to search ${term}:`, error.message);
      }
    }

    return stories;
  }

  /**
   * Fetch content from Internet Archive
   */
  async fetchFromInternetArchive(query = 'indian folklore') {
    console.log('📚 Fetching from Internet Archive...');

    try {
      const params = {
        q: query,
        output: 'json',
        rows: 10,
        sort: 'downloads desc'
      };

      const response = await axios.get(this.archive.baseUrl, { params, timeout: 10000 });

      if (response.data.response && response.data.response.docs) {
        return response.data.response.docs.map(doc => ({
          title: doc.title,
          description: doc.description || 'Archive document',
          source: 'Internet Archive',
          sourceUrl: `https://archive.org/details/${doc.identifier}`,
          culture: 'Indian',
          category: 'Archive',
          year: doc.year,
          downloads: doc.downloads
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching from Archive:', error);
      return [];
    }
  }

  // ============================================
  // DATA TRANSFORMERS
  // ============================================

  transformWikipediaData(wikiData, metadata) {
    if (!wikiData || !wikiData.extract) return null;

    return {
      title: wikiData.title || metadata.title,
      culture: metadata.culture,
      region: 'India',
      language: metadata.language,
      category: metadata.category,
      description: wikiData.description || `${wikiData.title} - ${metadata.category}`,
      storyText: wikiData.extract,
      moral: this.extractMoral(wikiData.extract),
      narrator: 'Traditional',
      tags: ['Wikipedia', metadata.category, metadata.culture],
      difficulty: 'Medium',
      ageGroup: 'All Ages',
      submitterName: 'Wikipedia Import',
      submitterEmail: 'import@folkloregpt.com',
      permissions: true,
      attribution: true,
      respectfulUse: true,
      status: 'approved',
      submissionType: 'text',
      source: 'Wikipedia',
      sourceUrl: wikiData.content_urls?.desktop?.page || wikiData.url,
      thumbnail: wikiData.thumbnail?.source || null,
      originalData: wikiData
    };
  }

  transformGutenbergData(book) {
    if (!book || !book.title) return null;

    return {
      title: book.title,
      culture: 'Indian',
      region: 'India',
      language: book.languages?.[0] || 'English',
      category: 'Literature',
      description: book.description || `Public domain book: ${book.title}`,
      storyText: `Download and read full text at: ${book.formats?.['text/html'] || book.formats?.['application/epub+zip']}`,
      moral: '',
      narrator: book.authors?.map(a => a.name).join(', ') || 'Unknown',
      tags: ['Project Gutenberg', 'Public Domain', 'Literature'],
      difficulty: 'Medium',
      ageGroup: 'All Ages',
      submitterName: 'Gutenberg Import',
      submitterEmail: 'import@folkloregpt.com',
      permissions: true,
      attribution: true,
      respectfulUse: true,
      status: 'approved',
      submissionType: 'text',
      source: 'Project Gutenberg',
      sourceUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
      thumbnail: book.formats?.['image/jpeg'] || null,
      gutenbergId: book.id,
      bookshelves: book.bookshelves || []
    };
  }

  extractMoral(text) {
    // Simple heuristic to extract moral from text
    const moralPatterns = [
      /moral[\s\w]*[:\s]+["']?([^"'.]+)["']?/i,
      /lesson[\s\w]*[:\s]+["']?([^"'.]+)["']?/i,
      /teach(?:es)?[\s\w]*[:\s]+["']?([^"'.]+)["']?/i,
    ];

    for (const pattern of moralPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  // ============================================
  // MAIN IMPORT FUNCTIONS
  // ============================================

  /**
   * Import all available Indian stories from external sources
   */
  async importIndianStories() {
    console.log('🚀 Starting Indian stories import from external sources...');

    const allStories = [];

    // Fetch from Wikipedia
    try {
      const wikiStories = await this.fetchIndianFolkloreFromWikipedia();
      allStories.push(...wikiStories);
      console.log(`✅ Wikipedia: ${wikiStories.length} stories`);
    } catch (e) {
      console.error('Wikipedia fetch failed:', e);
    }

    // Fetch from Gutenberg
    try {
      const gutenbergStories = await this.fetchIndianBooksFromGutenberg();
      allStories.push(...gutenbergStories);
      console.log(`✅ Gutenberg: ${gutenbergStories.length} stories`);
    } catch (e) {
      console.error('Gutenberg fetch failed:', e);
    }

    // Fetch from Internet Archive
    try {
      const archiveStories = await this.fetchFromInternetArchive('indian folklore');
      allStories.push(...archiveStories);
      console.log(`✅ Internet Archive: ${archiveStories.length} stories`);
    } catch (e) {
      console.error('Archive fetch failed:', e);
    }

    console.log(`🎉 Total imported: ${allStories.length} stories`);
    return allStories;
  }

  /**
   * Search across all sources
   */
  async searchAllSources(query) {
    const results = [];

    // Search Wikipedia
    try {
      const wikiResults = await this.searchWikipediaForIndianStories(query);
      results.push(...wikiResults);
    } catch (e) {
      console.warn('Wikipedia search failed:', e);
    }

    // Search Gutenberg
    try {
      const response = await axios.get(
        `${this.gutenberg.baseUrl}?search=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      if (response.data.results) {
        results.push(...response.data.results.map(b => this.transformGutenbergData(b)));
      }
    } catch (e) {
      console.warn('Gutenberg search failed:', e);
    }

    return results.filter(s => s !== null);
  }
}

export default new ExternalStoryAPIs();
