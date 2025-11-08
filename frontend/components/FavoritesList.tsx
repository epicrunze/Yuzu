'use client';

/**
 * FavoritesList - Sidebar showing saved papers
 * 
 * Displays papers saved via superlike
 * Supports BibTeX export and paper removal
 * Persists to localStorage
 */

import { useState, useEffect } from 'react';
import { Heart, Download, X, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedPaper } from '@/lib/types';
import { paperAPI } from '@/lib/api';

export default function FavoritesList() {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<SavedPaper[]>([]);
  const [exporting, setExporting] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const saved = localStorage.getItem('yuzu_favorites');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFavorites(parsed);
          console.log(`Loaded ${parsed.length} favorites from localStorage`);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };

    loadFavorites();

    // Listen for custom event when papers are saved
    const handleNewFavorite = () => loadFavorites();
    window.addEventListener('yuzu:favorite-added', handleNewFavorite);
    
    return () => {
      window.removeEventListener('yuzu:favorite-added', handleNewFavorite);
    };
  }, []);

  const handleExport = async () => {
    if (favorites.length === 0) return;

    setExporting(true);
    try {
      console.log(`Exporting ${favorites.length} papers to BibTeX...`);
      
      // Call backend to generate .bib file
      const blob = await paperAPI.exportBibtex(favorites);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yuzu-references-${Date.now()}.bib`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('BibTeX export successful!');
    } catch (error) {
      console.error('Failed to export BibTeX:', error);
      alert('Failed to export BibTeX. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleRemove = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('yuzu_favorites', JSON.stringify(updated));
    console.log(`Removed paper ${id} from favorites`);
  };

  const handleClearAll = () => {
    if (confirm('Remove all saved papers? This cannot be undone.')) {
      setFavorites([]);
      localStorage.removeItem('yuzu_favorites');
      console.log('Cleared all favorites');
    }
  };

  return (
    <>
      {/* Floating Favorites Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 px-4 py-2 bg-white rounded-full
                   shadow-yuzu-lg hover:shadow-yuzu transition-all duration-200
                   flex items-center gap-2 z-50 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Heart 
          size={18} 
          className="text-yuzu-500 group-hover:fill-yuzu-500 transition-all" 
        />
        <span className="font-semibold text-gray-900">
          {favorites.length}
        </span>
        {favorites.length > 0 && (
          <span className="text-xs text-gray-500 hidden sm:inline">saved</span>
        )}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white 
                         shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-yuzu-100 bg-gradient-to-r from-yuzu-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Heart size={20} className="text-yuzu-500 fill-yuzu-500" />
                      Saved Papers
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {favorites.length} {favorites.length === 1 ? 'paper' : 'papers'} saved
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors
                               p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Action Buttons */}
                {favorites.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      disabled={exporting}
                      className="flex-1 px-4 py-2.5 bg-yuzu-500 hover:bg-yuzu-600
                                 text-white rounded-button font-medium
                                 flex items-center justify-center gap-2
                                 transition-colors duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={16} />
                      {exporting ? 'Exporting...' : 'Export BibTeX'}
                    </button>
                    
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-2.5 border-2 border-gray-200 hover:border-red-300
                                 text-gray-600 hover:text-red-600 rounded-button
                                 transition-colors duration-200"
                      title="Clear all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Papers List */}
              <div className="flex-1 overflow-y-auto p-4">
                {favorites.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <Heart size={64} className="mx-auto mb-4 opacity-10 text-yuzu-500" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No saved papers yet
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Press <kbd className="px-2 py-1 bg-yuzu-50 text-yuzu-700 rounded text-xs">Space</kbd> 
                      {' '}while viewing papers to save them here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favorites.map((paper, index) => (
                      <motion.div
                        key={paper.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-yuzu-50 to-white
                                   rounded-button p-4 relative group
                                   border border-yuzu-100 hover:border-yuzu-300
                                   hover:shadow-yuzu transition-all duration-200"
                      >
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(paper.id)}
                          className="absolute top-3 right-3 text-gray-400
                                     hover:text-red-500 opacity-0 group-hover:opacity-100
                                     transition-all duration-200 p-1 hover:bg-white rounded"
                          title="Remove from favorites"
                        >
                          <X size={16} />
                        </button>
                        
                        {/* Paper Info */}
                        <h3 className="font-semibold text-sm text-gray-900 mb-2 pr-8 
                                       leading-snug line-clamp-2">
                          {paper.title}
                        </h3>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                          {paper.authors.slice(0, 2).join(', ')}
                          {paper.authors.length > 2 && ' et al.'}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {new Date(paper.published).getFullYear()} • 
                            Level {paper.currentLevel}
                          </span>
                          
                          <a
                            href={paper.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yuzu-600 hover:text-yuzu-700
                                       flex items-center gap-1 font-medium"
                          >
                            <ExternalLink size={12} />
                            PDF
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Tip */}
              {favorites.length > 0 && (
                <div className="p-4 border-t border-yuzu-100 bg-yuzu-50">
                  <p className="text-xs text-gray-600 text-center">
                    💡 Export creates a .bib file for easy citation management
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
