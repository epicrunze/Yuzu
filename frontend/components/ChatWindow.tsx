'use client';

/**
 * ChatWindow - Functional chat interface for Q&A about papers
 * 
 * Users can ask questions about the current paper
 * Chat history persists per paper in localStorage
 * First message automatically includes full paper context
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Paper, ChatMessage } from '@/lib/types';
import { paperAPI } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // KaTeX styles for math rendering

interface ChatWindowProps {
  currentPaper: Paper | null;
}

export default function ChatWindow({ currentPaper }: ChatWindowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history for current paper from localStorage
  useEffect(() => {
    if (currentPaper) {
      const storageKey = `yuzu_chat_${currentPaper.id}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed);
          console.log(`📚 Loaded ${parsed.length} messages for paper ${currentPaper.id}`);
        } catch (e) {
          console.error('Failed to parse chat history:', e);
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    }
  }, [currentPaper]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (currentPaper && messages.length > 0) {
      const storageKey = `yuzu_chat_${currentPaper.id}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, currentPaper]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentPaper || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Check if this is the first message (auto-include full paper context)
      const isFirstMessage = messages.length === 0;
      
      console.log(`💬 Sending message for paper ${currentPaper.id}`);
      console.log(`   First message: ${isFirstMessage}`);
      console.log(`   Message: "${userMessage.content}"`);

      // Call chat API with full conversation history
      const assistantResponse = await paperAPI.chat(
        userMessage.content,
        currentPaper,
        messages, // Previous messages (empty for first message)
        isFirstMessage // Include full text on first message
      );

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
      
      // Remove the user message if API call failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't show button if no paper is selected
  if (!currentPaper) {
    return null;
  }

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
        title="Ask questions about this paper"
      >
        <MessageCircle size={24} className="text-white" />
      </button>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {currentPaper.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">
                      Ask a question about this paper!
                    </p>
                    <p className="text-xs mt-2 text-gray-500">
                      I have access to the full paper content 🍋
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-yuzu-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              // Prevent external links from opening in same tab
                              a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                              // Custom code rendering
                              code: ({ node, ...props }: any) => <code {...props} />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 size={16} className="animate-spin text-gray-500" />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-yuzu-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border-2 border-yuzu-100 rounded-button
                               focus:outline-none focus:border-yuzu-500 transition-colors
                               disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="px-4 py-3 bg-yuzu-500 hover:bg-yuzu-600 
                               text-white rounded-button transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed
                               hover:scale-105 active:scale-95"
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {messages.length === 0 
                    ? 'First message includes full paper context'
                    : `${messages.length} message${messages.length === 1 ? '' : 's'} in history`
                  }
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
