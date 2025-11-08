import axios, { AxiosError } from 'axios';
import { Paper } from './types';

// Always use the production API endpoint - no localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-yuzu.epicrunze.com';

// Log the API URL being used (only in development)
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:');
  console.log('  - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('  - Using API Base URL:', API_BASE_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    const paramsString = new URLSearchParams(config.params as any).toString();
    const completeUrl = paramsString ? `${fullUrl}?${paramsString}` : fullUrl;
    
    console.log('🚀 [axios interceptor] Request about to be sent:');
    console.log(`   Method: ${config.method?.toUpperCase()}`);
    console.log(`   Complete URL: ${completeUrl}`);
    console.log('   Params object:', config.params);
    
    return config;
  },
  (error) => {
    console.error('❌ [axios interceptor] Request error:', error);
    return Promise.reject(error);
  }
);

// Error handler
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const handleError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    throw new APIError(
      axiosError.response?.data?.detail || 'API request failed',
      axiosError.response?.status,
      axiosError.response?.data
    );
  }
  throw new APIError(error.message || 'Unknown error occurred');
};

// API Methods
export const paperAPI = {
  /**
   * Search for papers on ArXiv
   */
  search: async (
    query: string, 
    maxResults: number,
    sortBy: 'relevance' | 'submittedDate' | 'lastUpdatedDate' = 'relevance'
  ): Promise<Paper[]> => {
    try {
      console.log('📡 [api.ts] paperAPI.search called');
      console.log('   Parameters received:');
      console.log(`     - query: "${query}"`);
      console.log(`     - maxResults: ${maxResults} (type: ${typeof maxResults})`);
      console.log(`     - sortBy: ${sortBy}`);
      
      const requestParams = { 
        query, 
        max_results: maxResults,
        sort_by: sortBy
      };
      console.log('   Axios params object:', JSON.stringify(requestParams, null, 2));
      
      const response = await api.get('/api/search', {
        params: requestParams
      });
      
      console.log('✅ [api.ts] Response received');
      console.log('   Papers count:', response.data.papers?.length);
      console.log('   Full URL used:', response.config.url);
      console.log('   ----------------------------------------');
      
      if (!response.data || !response.data.papers) {
        throw new Error('Invalid response format: missing papers array');
      }
      
      return response.data.papers;
    } catch (error) {
      console.error('❌ [api.ts] Search error:', error);
      return handleError(error);
    }
  },

  /**
   * Generate summary for a paper
   */
  summarize: async (abstract: string, level: 1 | 2 | 3, paperId?: string): Promise<string> => {
    try {
      const requestBody: any = {
        abstract,
        level,
      };
      
      // Always include paper_id if provided (required for levels 2-3)
      if (paperId) {
        requestBody.paper_id = paperId;
      }
      
      console.log(`API: Summarize request - Level ${level}, Paper ID: ${paperId || 'none'}`);
      console.log('API: Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await api.post('/api/summarize', requestBody);
      return response.data.summary;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Batch summarize multiple papers (for initial load)
   */
  batchSummarize: async (papers: Paper[], level: number = 1): Promise<Record<string, string>> => {
    try {
      const response = await api.post('/api/summarize/batch', {
        papers,
        level
      });
      return response.data.summaries;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Generate BibTeX for a paper
   */
  generateBibtex: async (paper: Paper): Promise<string> => {
    try {
      const response = await api.post('/api/bibtex/generate', paper);
      return response.data.bibtex;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Export BibTeX for multiple papers
   */
  exportBibtex: async (papers: Paper[]): Promise<Blob> => {
    try {
      const response = await api.post('/api/bibtex/export', papers, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

