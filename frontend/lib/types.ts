export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  pdf_url: string;
  arxiv_url: string;
  categories: string[];
}

export interface PaperSummary {
  level1?: string;  // Abstract summary
  level2?: string;  // Key contributions + methods
  level3?: string;  // Results + conclusions
}

export interface SavedPaper extends Paper {
  savedAt: number;
  bibtex: string;
  currentLevel: number;
}

