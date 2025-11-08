'use client';
import { useState, useEffect } from 'react';
import SwipeInterface from '@/components/SwipeInterface';
import { paperAPI } from '@/lib/api';
import { Paper } from '@/lib/types';

export default function TestPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        console.log('Fetching papers from API...');
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://api-yuzu.epicrunze.com');
        
        // Search for newest papers sorted by submission date (better HTML availability)
        const results = await paperAPI.search('large language models', 5, 'submittedDate');
        console.log('Received papers:', results.length);
        
        if (!Array.isArray(results)) {
          throw new Error('API returned invalid data: expected array of papers');
        }
        
        setPapers(results);
      } catch (error) {
        console.error('Failed to fetch papers:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error details:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const handleSuperlike = (paper: Paper, level: number) => {
    console.log('Superliked:', paper.title, 'at level', level);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading papers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Papers</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">No Papers Found</h2>
          <p className="text-yellow-600">No papers were returned from the API.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Yuzu Swipe Test
      </h1>
      <p className="text-center text-gray-600 mb-4">
        Testing with newest papers (sorted by submission date) - {papers.length} papers loaded
      </p>
      
      <SwipeInterface papers={papers} onSuperlike={handleSuperlike} />
    </div>
  );
}

