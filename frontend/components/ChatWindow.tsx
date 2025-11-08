'use client';

/**
 * ChatWindow - Mock chat interface (non-functional)
 * 
 * Placeholder UI for future Q&A feature about papers
 * Shows "coming soon" message with yuzu branding
 */

import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full 
                   bg-yuzu-500 hover:bg-yuzu-600 shadow-yuzu-lg
                   flex items-center justify-center transition-all duration-200
                   hover:scale-110 active:scale-95 z-50"
        aria-label="Ask questions about paper"
        title="Ask questions (coming soon)"
      >
        <MessageCircle size={24} className="text-white" />
      </button>

      {/* Chat Sidebar (Mock) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50
                       flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-yuzu-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Ask about this paper
                </h3>
                <p className="text-xs text-gray-500">
                  Q&A feature coming soon 🍋
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mock Content */}
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center text-gray-400 max-w-xs">
                <MessageCircle size={64} className="mx-auto mb-4 opacity-20" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  Chat Coming Soon!
                </h4>
                <p className="text-sm leading-relaxed">
                  Soon you&apos;ll be able to ask questions about papers and get 
                  instant answers powered by AI. 
                </p>
                <p className="text-xs mt-3 text-yuzu-600">
                  Stay tuned for this feature 🍋✨
                </p>
              </div>
            </div>

            {/* Mock Input */}
            <div className="p-4 border-t border-yuzu-100">
              <input
                type="text"
                placeholder="Ask a question..."
                disabled
                className="w-full px-4 py-3 border-2 border-yuzu-100 rounded-button
                           bg-gray-50 text-gray-400 cursor-not-allowed
                           focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Feature in development
              </p>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
