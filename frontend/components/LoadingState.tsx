'use client';

/**
 * LoadingState - Animated loading indicator
 * 
 * Shows while fetching papers or generating summaries
 * Displays random encouraging messages with yuzu theme
 */

import { motion } from 'framer-motion';
import { Sparkles, Zap, Coffee } from 'lucide-react';

const LOADING_MESSAGES = [
  { text: 'Squeezing knowledge from papers...', icon: Sparkles },
  { text: 'Finding the zest of discovery...', icon: Zap },
  { text: 'Brewing your next citation...', icon: Coffee },
  { text: 'Peeling back the research layers...', icon: Sparkles },
  { text: 'Zesting through the archives...', icon: Zap },
];

export default function LoadingState() {
  // Pick random message
  const { text, icon: Icon } = LOADING_MESSAGES[
    Math.floor(Math.random() * LOADING_MESSAGES.length)
  ];

  return (
    <div className="bg-white rounded-card shadow-yuzu-lg p-12 w-full max-w-md mx-auto
                    flex flex-col items-center justify-center min-h-[400px]">
      {/* Animated Icon */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-6"
      >
        <Icon size={48} className="text-yuzu-500" />
      </motion.div>

      {/* Loading Text */}
      <p className="text-gray-600 text-center font-medium">
        {text}
      </p>

      {/* Animated Dots */}
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-yuzu-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
