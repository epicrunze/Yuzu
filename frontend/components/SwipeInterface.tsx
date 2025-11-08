'use client';

/**
 * SwipeInterface - Main swipe logic for Yuzu
 * 
 * Manages paper queue, summaries, and user interactions
 * Keyboard controls: ← pass, → more details, Space superlike
 * 
 * Pre-fetches summaries for smooth experience
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paper, PaperSummary } from '@/lib/types';
import PaperCard from './PaperCard';
import LoadingState from './LoadingState';
import { paperAPI } from '@/lib/api';

interface SwipeInterfaceProps {
  papers: Paper[];
  onSuperlike: (paper: Paper, level: number) => void;
}

type SwipeDirection = 'left' | 'right' | null;

export default function SwipeInterface({ papers, onSuperlike }: SwipeInterfaceProps) {
  // Current position in paper stack
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Current detail level (1, 2, or 3)
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);
  
  // Cache of summaries: Map<paperId, {level1, level2, level3}>
  const [summaries, setSummaries] = useState<Map<string, Partial<PaperSummary>>>(new Map());
  
  // Loading state for summary generation
  const [loading, setLoading] = useState(false);
  
  // Animation direction
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  
  // Current paper being displayed
  const currentPaper = papers[currentIndex];

  /**
   * Fetch summary for specific paper and level
   * Checks cache first to avoid duplicate API calls
   */
  const fetchSummary = useCallback(async (paper: Paper, level: 1 | 2 | 3) => {
    // Check if we already have this summary cached
    const cached = summaries.get(paper.id);
    if (cached && cached[`level${level}` as keyof PaperSummary]) {
      console.log(`Using cached summary for ${paper.id} level ${level}`);
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching summary for ${paper.id} level ${level}`);
      console.log(`Paper details - ID: "${paper.id}", Title: "${paper.title}"`);
      
      // Validate paper ID exists
      if (!paper.id) {
        throw new Error('Paper ID is missing - cannot fetch summary');
      }
      
      // Call backend API (pass paper_id for levels 2-3 full text analysis)
      const summary = await paperAPI.summarize(paper.abstract, level, paper.id);
      
      // Update cache
      setSummaries(prev => {
        const updated = new Map(prev);
        const paperSummaries = updated.get(paper.id) || {};
        updated.set(paper.id, {
          ...paperSummaries,
          [`level${level}`]: summary,
        });
        return updated;
      });
      
    } catch (error) {
      console.error(`Failed to fetch summary for ${paper.id}:`, error);
      
      // Don't cache failed summaries - let user see the error
      // Optionally show an error message in the UI instead
      // DO NOT fallback to abstract or previous level summaries
    } finally {
      setLoading(false);
    }
  }, [summaries]);

  /**
   * Pre-fetch Level 1 summaries for first 5 papers using batch API
   * Called once on mount to improve initial experience
   */
  useEffect(() => {
    const prefetchInitialSummaries = async () => {
      const firstFive = papers.slice(0, 5);
      
      if (firstFive.length === 0) return;
      
      console.log('Pre-fetching summaries for first 5 papers...');
      
      try {
        // Use batch endpoint for efficiency
        const batchSummaries = await paperAPI.batchSummarize(firstFive, 1);
        
        // Update cache with all summaries at once
        setSummaries(prev => {
          const updated = new Map(prev);
          firstFive.forEach(paper => {
            if (batchSummaries[paper.id]) {
              updated.set(paper.id, {
                level1: batchSummaries[paper.id]
              });
            }
          });
          return updated;
        });
        
        console.log('Pre-fetch complete!');
      } catch (error) {
        console.error('Failed to pre-fetch summaries:', error);
      }
    };

    prefetchInitialSummaries();
  }, [papers]);

  /**
   * Fetch summary for current paper/level if not cached
   */
  useEffect(() => {
    if (currentPaper) {
      fetchSummary(currentPaper, currentLevel);
    }
  }, [currentPaper, currentLevel, fetchSummary]);

  /**
   * Handle PASS action (left arrow)
   * Skip current paper and move to next
   */
  const handlePass = useCallback(() => {
    if (currentIndex >= papers.length - 1) {
      console.log('No more papers to show');
      return;
    }

    setSwipeDirection('left');
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setCurrentLevel(1); // Reset to level 1 for new paper
      setSwipeDirection(null);
    }, 300);
  }, [currentIndex, papers.length]);

  /**
   * Handle NEXT action (right arrow)
   * Go deeper into current paper or save + move to next if at max level
   */
  const handleNext = useCallback(() => {
    if (currentLevel < 3) {
      // Go to next detail level
      setSwipeDirection('right');
      setTimeout(() => {
        setCurrentLevel(prev => (prev + 1) as 1 | 2 | 3);
        setSwipeDirection(null);
      }, 200);
    } else {
      // Already at level 3 - user has read all the way through
      // Auto-save the paper and move to next
      if (currentPaper) {
        console.log(`Auto-saving paper at level 3: ${currentPaper.title}`);
        onSuperlike(currentPaper, currentLevel);
      }
      handlePass();
    }
  }, [currentLevel, currentPaper, onSuperlike, handlePass]);

  /**
   * Handle SUPERLIKE action (space)
   * Save paper and elevate to next level (or next paper if at level 3)
   */
  const handleSuperlike = useCallback(() => {
    if (!currentPaper) return;

    console.log(`Superliked: ${currentPaper.title} at level ${currentLevel}`);
    
    // Always save the paper
    onSuperlike(currentPaper, currentLevel);
    
    if (currentLevel < 3) {
      // Elevate to next level to see more details
      setSwipeDirection('right');
      setTimeout(() => {
        setCurrentLevel(prev => (prev + 1) as 1 | 2 | 3);
        setSwipeDirection(null);
      }, 200);
    } else {
      // Already at max level, move to next paper
      handlePass();
    }
  }, [currentPaper, currentLevel, onSuperlike, handlePass]);

  /**
   * Keyboard event handler
   * Maps keys to actions: ← pass, → next, Space superlike
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle keyboard if loading
      if (loading) return;
      
      // Don't handle if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePass();
          break;
        
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        
        case ' ':
          e.preventDefault();
          handleSuperlike();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePass, handleNext, handleSuperlike, loading]);

  // Handle end of papers
  if (!currentPaper || currentIndex >= papers.length) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-card shadow-yuzu-lg p-8 max-w-md mx-auto"
        >
          <div className="text-6xl mb-4">🍋✨</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            All done!
          </h2>
          <p className="text-gray-600 mb-4">
            You've reviewed all {papers.length} papers.
          </p>
          <p className="text-sm text-yuzu-600">
            Check your favorites or start a new search
          </p>
        </motion.div>
      </div>
    );
  }

  // Get current summary from cache
  const currentSummary = summaries.get(currentPaper.id)?.[`level${currentLevel}`] || '';

  return (
    <div className="relative">
      {/* Progress Indicator */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-yuzu">
          <span className="text-sm font-medium text-gray-700">
            Paper {currentIndex + 1} of {papers.length}
          </span>
          <div className="w-24 h-2 bg-yuzu-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yuzu-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / papers.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Paper Card with Animations */}
      <AnimatePresence mode="wait">
        {loading && !currentSummary ? (
          <LoadingState key="loading" />
        ) : (
          <motion.div
            key={`${currentPaper.id}-${currentLevel}`}
            initial={{ 
              x: swipeDirection === 'right' ? 100 : -100,
              opacity: 0,
              rotate: swipeDirection === 'right' ? 5 : -5
            }}
            animate={{ 
              x: 0,
              opacity: 1,
              rotate: 0
            }}
            exit={{ 
              x: swipeDirection === 'left' ? -400 : swipeDirection === 'right' ? 400 : 0,
              opacity: 0,
              rotate: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <PaperCard
              paper={currentPaper}
              summary={currentSummary}
              level={currentLevel}
              onPass={handlePass}
              onSuperlike={handleSuperlike}
              onNext={handleNext}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint for first-time users */}
      {currentIndex === 0 && currentLevel === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-500">
            👆 Use keyboard arrows or click buttons to navigate
          </p>
        </motion.div>
      )}
    </div>
  );
}
