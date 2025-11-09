'use client';

/**
 * ResearchInput - Landing page for Yuzu
 * 
 * Captures user's research interest and initiates paper search
 * Yuzu-themed with encouraging copy and example queries
 */

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResearchInputProps {
  onSubmit: (query: string) => void;
  loading: boolean;
}

export default function ResearchInput({ onSubmit, loading }: ResearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  const exampleQueries = [
    'Transformer architecture',
    'Quantum computing',
    'Climate change modeling',
    'Neural network interpretability',
    'CRISPR gene editing',
    'Renewable energy storage'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full"
      >
        {/* Yuzu Logo/Icon */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="text-7xl mb-4"
          >
            🍋
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to Yuzu
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Squeeze knowledge from every paper
          </p>
          
          <p className="text-sm text-gray-500">
            Discover research papers like never before ✨
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What research topic interests you?"
            className="w-full pl-6 pr-32 py-4 rounded-button bg-white shadow-yuzu
                       border-2 border-transparent focus:border-yuzu-500
                       text-gray-900 placeholder-gray-400 text-lg
                       transition-all duration-200 outline-none"
            disabled={loading}
            autoFocus
          />
          
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2
                       px-6 py-2.5 bg-yuzu-500 hover:bg-yuzu-600 
                       text-white rounded-button font-medium 
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Sparkles size={18} className="animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </form>

        {/* Example Queries */}
        <div>
          <p className="text-sm text-gray-500 mb-3 text-center">
            Or try one of these topics:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {exampleQueries.map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                disabled={loading}
                className="px-4 py-2 bg-white hover:bg-yuzu-50 
                           rounded-full text-sm text-gray-700 hover:text-yuzu-700
                           transition-all duration-200 shadow-sm hover:shadow-yuzu
                           border border-yuzu-100 hover:border-yuzu-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Features Teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-gray-400 mb-3">
            What makes Yuzu special?
          </p>
          <div className="flex gap-6 justify-center text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="text-yuzu-500">🔍</span>
              <span>Smart search</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yuzu-500">✨</span>
              <span>AI summaries</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yuzu-500">💾</span>
              <span>Easy export</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
