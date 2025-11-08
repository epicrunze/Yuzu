'use client';

/**
 * Main Yuzu App
 * 
 * Flow:
 * 1. Landing page with research input
 * 2. Search papers from backend
 * 3. Display SwipeInterface with papers
 * 4. Handle favorites via localStorage
 */

import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ResearchInput from '@/components/ResearchInput';
import SwipeInterface from '@/components/SwipeInterface';
import FavoritesList from '@/components/FavoritesList';
import ChatWindow from '@/components/ChatWindow';
import { ToastContainer, showToast } from '@/components/Toast';
import { triggerSuperlikeConfetti, triggerFirstSuperlikeConfetti } from '@/lib/confetti';
import { Paper, SavedPaper } from '@/lib/types';
import { paperAPI, APIError } from '@/lib/api';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-yuzu-lg p-8 max-w-md">
        <div className="text-6xl mb-4 text-center">😢</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="w-full px-6 py-3 bg-yuzu-500 hover:bg-yuzu-600 
                     text-white rounded-button font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStarted, setSearchStarted] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    
    try {
      console.log('🔍 [page.tsx] handleSearch called');
      console.log(`   Query: "${query}"`);
      console.log('   Max results: 5');
      
      // Fetch papers from backend
      const fetchedPapers = await paperAPI.search(query, 5);
      
      if (fetchedPapers.length === 0) {
        setError('No papers found for this query. Try different keywords.');
        setSearchStarted(false);
        return;
      }
      
      console.log(`Found ${fetchedPapers.length} papers`);
      setPapers(fetchedPapers);
      setSearchStarted(true);
      
    } catch (err) {
      console.error('Search error:', err);
      
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to search papers. Please check your connection and try again.');
      }
      
      setSearchStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuperlike = async (paper: Paper, level: number) => {
    try {
      console.log(`Saving paper: ${paper.title}`);
      
      // Generate BibTeX for this paper
      const bibtex = await paperAPI.generateBibtex(paper);
      
      const savedPaper: SavedPaper = {
        ...paper,
        savedAt: Date.now(),
        bibtex,
        currentLevel: level,
      };
      
      // Load existing favorites
      const existingJson = localStorage.getItem('yuzu_favorites');
      const existing: SavedPaper[] = existingJson ? JSON.parse(existingJson) : [];
      
      // Check if already saved
      if (existing.some(p => p.id === paper.id)) {
        console.log('Paper already in favorites');
        showToast('Already in favorites!', 'info');
        return;
      }
      
      // Add to favorites
      const updated = [...existing, savedPaper];
      localStorage.setItem('yuzu_favorites', JSON.stringify(updated));
      
      // Dispatch event to update FavoritesList
      window.dispatchEvent(new Event('yuzu:favorite-added'));
      
      // Trigger confetti!
      if (updated.length === 1) {
        triggerFirstSuperlikeConfetti(); // Extra special for first save
        showToast('🎉 First paper saved! Keep going!', 'success');
      } else {
        triggerSuperlikeConfetti();
        showToast('Paper saved to favorites!', 'success');
      }
      
      console.log(`Saved! Total favorites: ${updated.length}`);
      
    } catch (err) {
      console.error('Failed to save paper:', err);
      showToast('Failed to save paper', 'error');
    }
  };

  const handleNewSearch = () => {
    setSearchStarted(false);
    setPapers([]);
    setError(null);
  };

  // Show landing page if not started searching
  if (!searchStarted) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ToastContainer />
        <ResearchInput onSubmit={handleSearch} loading={loading} />
        
        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 
                          max-w-md w-full mx-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-button 
                            p-4 shadow-lg">
              <p className="text-red-700 text-sm text-center">
                {error}
              </p>
            </div>
          </div>
        )}
      </ErrorBoundary>
    );
  }

  // Show swipe interface
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ToastContainer />
      <div className="min-h-screen p-4 sm:p-8">
        {/* Header with query and new search button */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-button shadow-yuzu p-4 
                          flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Searching for:</p>
              <p className="font-medium text-gray-900">{currentQuery}</p>
            </div>
            <button
              onClick={handleNewSearch}
              className="px-4 py-2 text-sm text-yuzu-600 hover:text-yuzu-700
                         hover:bg-yuzu-50 rounded-button transition-colors"
            >
              New Search
            </button>
          </div>
        </div>

        {/* Main Swipe Interface */}
        <SwipeInterface papers={papers} onSuperlike={handleSuperlike} />
        
        {/* Favorites Sidebar */}
        <FavoritesList />
        
        {/* Chat Window (Mock) */}
        <ChatWindow />
      </div>
    </ErrorBoundary>
  );
}
