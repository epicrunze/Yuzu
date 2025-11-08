'use client';
import PaperCard from '@/components/PaperCard';
import LoadingState from '@/components/LoadingState';
import ChatWindow from '@/components/ChatWindow';

const mockPaper = {
  id: '1706.03762',
  title: 'Attention Is All You Need',
  authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
  abstract: 'The dominant sequence transduction models...',
  published: '2017-06-12T17:57:34Z',
  pdf_url: 'https://arxiv.org/pdf/1706.03762.pdf',
  arxiv_url: 'http://arxiv.org/abs/1706.03762',
  categories: ['cs.CL', 'cs.LG']
};

const mockSummary = "This groundbreaking paper introduces the Transformer architecture, which relies entirely on attention mechanisms instead of recurrence. The approach achieves better translation quality while being more parallelizable and requiring less training time. It's revolutionary because it shows that attention alone is sufficient for building powerful sequence models.";

export default function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Yuzu Components Test
      </h1>
      
      <div className="space-y-8">
        <PaperCard
          paper={mockPaper}
          summary={mockSummary}
          level={1}
          onPass={() => console.log('Pass')}
          onSuperlike={() => console.log('Superlike')}
          onNext={() => console.log('Next')}
        />
        
        <LoadingState />
      </div>
      
      <ChatWindow />
    </div>
  );
}

