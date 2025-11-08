'use client';

/**
 * PaperCard - Displays a research paper with AI summary
 * 
 * Shows paper metadata and summary at 1 of 3 detail levels.
 * Includes action buttons: Pass (X), Superlike (Star), Next (Heart)
 * 
 * Design: White card with yuzu yellow accents, warm shadow
 */

import { motion } from 'framer-motion';
import { X, Star, Heart, ExternalLink, BookOpen } from 'lucide-react';
import { Paper } from '@/lib/types';

interface PaperCardProps {
  paper: Paper;
  summary: string;
  level: 1 | 2 | 3;
  onPass: () => void;
  onSuperlike: () => void;
  onNext: () => void;
}

export default function PaperCard({
  paper,
  summary,
  level,
  onPass,
  onSuperlike,
  onNext
}: PaperCardProps) {
  // Format publication date
  const year = new Date(paper.published).getFullYear();
  
  // Truncate author list for display
  const displayAuthors = paper.authors.slice(0, 3);
  const hasMoreAuthors = paper.authors.length > 3;

  return (
    <motion.div
      className="bg-white rounded-card shadow-yuzu-lg p-6 w-full max-w-md mx-auto
                 hover:shadow-yuzu transition-shadow duration-300"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="mb-4">
        {/* Level indicator and PDF link */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-yuzu-500" />
            <span className="text-sm font-medium text-yuzu-600">
              Level {level} of 3
            </span>
          </div>
          
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yuzu-500 hover:text-yuzu-600 transition-colors"
            aria-label="View PDF"
          >
            <ExternalLink size={18} />
          </a>
        </div>

        {/* Paper title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {paper.title}
        </h2>

        {/* Authors */}
        <p className="text-sm text-gray-600 mb-1">
          {displayAuthors.join(', ')}
          {hasMoreAuthors && ` et al.`}
        </p>

        {/* Year and categories */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{year}</span>
          {paper.categories.length > 0 && (
            <>
              <span>•</span>
              <span className="px-2 py-0.5 bg-yuzu-50 text-yuzu-700 rounded-full">
                {paper.categories[0]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary Content */}
      <div className="mb-6 min-h-[180px]">
        <div className="text-sm text-gray-700 leading-relaxed">
          {summary || (
            <div className="text-gray-400 italic">
              Loading summary...
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {/* Pass Button */}
        <button
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 
                     flex items-center justify-center transition-all duration-200
                     hover:scale-105 active:scale-95"
          aria-label="Pass on this paper"
          title="Pass (Left Arrow)"
        >
          <X size={24} className="text-gray-600" />
        </button>
        
        {/* Superlike Button (Star) */}
        <button
          onClick={onSuperlike}
          className="w-16 h-16 rounded-full bg-yuzu-500 hover:bg-yuzu-600 
                     flex items-center justify-center transition-all duration-200
                     hover:scale-110 active:scale-95 shadow-lg hover:shadow-yuzu"
          aria-label="Superlike and save this paper"
          title="Superlike (Space)"
        >
          <Star size={28} className="text-white fill-white" />
        </button>
        
        {/* Next Level Button (Heart) */}
        <button
          onClick={onNext}
          className="w-14 h-14 rounded-full bg-yuzu-100 hover:bg-yuzu-200 
                     flex items-center justify-center transition-all duration-200
                     hover:scale-105 active:scale-95"
          aria-label="See more details"
          title="More Details (Right Arrow)"
        >
          <Heart size={24} className="text-yuzu-600" />
        </button>
      </div>

      {/* Keyboard Hints */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <kbd className="px-2 py-1 bg-gray-100 rounded">←</kbd> Pass •{' '}
        <kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> Superlike •{' '}
        <kbd className="px-2 py-1 bg-gray-100 rounded">→</kbd> More
      </div>
    </motion.div>
  );
}
