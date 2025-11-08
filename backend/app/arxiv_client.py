"""
ArXiv API Client for Yuzu

Handles searching papers on ArXiv and parsing results into structured format.
Uses feedparser to parse ArXiv's Atom feed responses.
"""

import feedparser
import re
from typing import List, Optional, Dict
from datetime import datetime
from urllib.parse import urlencode
import httpx
from bs4 import BeautifulSoup
from app.models import Paper


class ArxivClient:
    """Client for interacting with ArXiv API"""
    
    BASE_URL = "http://export.arxiv.org/api/query"
    
    def __init__(self):
        # Simple in-memory cache to avoid duplicate API calls
        # Key format: "query:max_results:sort_by"
        self.cache: Dict[str, List[Paper]] = {}
        # Cache for full text content
        self.fulltext_cache: Dict[str, str] = {}
    
    def search(
        self, 
        query: str, 
        max_results: int = 20,
        sort_by: str = "relevance"
    ) -> List[Paper]:
        """
        Search ArXiv for papers matching query
        
        Args:
            query: Search keywords (e.g., "transformer neural networks")
            max_results: Number of papers to return (1-100)
            sort_by: Sort order - "relevance", "lastUpdatedDate", or "submittedDate"
        
        Returns:
            List of Paper objects with metadata
            
        Raises:
            Exception: If ArXiv API fails or returns invalid data
        """
        # Check cache first
        cache_key = f"{query}:{max_results}:{sort_by}"
        if cache_key in self.cache:
            print(f"Cache hit for query: {query}")
            return self.cache[cache_key]
        
        # Build ArXiv API query
        # Format: all:keyword searches all fields
        search_query = f"all:{query}"
        
        params = {
            "search_query": search_query,
            "start": 0,
            "max_results": max_results,
            "sortBy": sort_by,
            "sortOrder": "descending"
        }
        
        # Construct full URL with proper URL encoding
        param_str = urlencode(params)
        url = f"{self.BASE_URL}?{param_str}"
        
        print(f"Fetching papers from ArXiv: {url}")
        
        try:
            # Parse RSS/Atom feed from ArXiv
            feed = feedparser.parse(url)
            
            # Check for parsing errors
            if feed.bozo:
                raise Exception(f"Feed parsing error: {feed.bozo_exception}")
            
            # Check if we got any entries
            if not feed.entries:
                print(f"No papers found for query: {query}")
                return []
            
            # Convert entries to Paper objects
            papers = []
            for entry in feed.entries:
                paper = self._parse_entry(entry)
                if paper:
                    papers.append(paper)
            
            print(f"Successfully parsed {len(papers)} papers")
            
            # Cache results
            self.cache[cache_key] = papers
            
            return papers
            
        except Exception as e:
            print(f"ArXiv search error: {e}")
            raise Exception(f"Failed to search ArXiv: {str(e)}")
    
    def _parse_entry(self, entry) -> Optional[Paper]:
        """
        Parse a single feedparser entry into a Paper object
        
        Entry structure from ArXiv:
        - entry.id: ArXiv URL (e.g., http://arxiv.org/abs/1706.03762v5)
        - entry.title: Paper title
        - entry.authors: List of author objects with .name attribute
        - entry.summary: Abstract text
        - entry.published: Publication date
        - entry.links: List of links including PDF
        - entry.tags: List of category tags
        """
        try:
            # Extract ArXiv ID from URL
            # Example: http://arxiv.org/abs/1706.03762v5 -> 1706.03762
            arxiv_id = entry.id.split("/abs/")[-1]
            # Remove version suffix
            arxiv_id = re.sub(r'v\d+$', '', arxiv_id)
            
            # Extract authors
            authors = []
            if hasattr(entry, 'authors'):
                authors = [author.name for author in entry.authors]
            
            # Extract categories (tags)
            categories = []
            if hasattr(entry, 'tags'):
                categories = [tag.term for tag in entry.tags]
            
            # Find PDF link
            pdf_url = None
            arxiv_url = entry.id
            
            for link in entry.links:
                if link.get('title') == 'pdf':
                    pdf_url = link.href
                    break
            
            # Fallback: construct PDF URL from ID
            if not pdf_url:
                pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
            
            # Clean abstract text
            # Remove excessive whitespace and newlines
            abstract = re.sub(r'\s+', ' ', entry.summary).strip()
            
            # Parse published date
            published = entry.published
            
            # Create Paper object
            return Paper(
                id=arxiv_id,
                title=entry.title.strip(),
                authors=authors,
                abstract=abstract,
                published=published,
                pdf_url=pdf_url,
                arxiv_url=arxiv_url,
                categories=categories
            )
            
        except Exception as e:
            print(f"Error parsing entry: {e}")
            return None
    
    async def get_full_text(self, paper_id: str) -> Optional[str]:
        """
        Fetch full text content from ArXiv HTML page
        
        Args:
            paper_id: ArXiv paper ID (e.g., "1706.03762")
        
        Returns:
            Full text of the paper, or None if not available
        """
        # Check cache first
        if paper_id in self.fulltext_cache:
            print(f"Full text cache hit for {paper_id}")
            return self.fulltext_cache[paper_id]
        
        # Try HTML version first (newer papers have this)
        html_url = f"https://arxiv.org/html/{paper_id}"
        
        try:
            print(f"Fetching full text from {html_url}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(html_url, follow_redirects=True)
                
                # Check if HTML version exists
                if response.status_code == 200 and 'text/html' in response.headers.get('content-type', ''):
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract main article content
                    # ArXiv HTML typically has content in article tags or main content divs
                    article = soup.find('article') or soup.find('div', class_='ltx_page_main')
                    
                    if article:
                        # Remove script and style elements
                        for script in article(['script', 'style', 'nav', 'header', 'footer']):
                            script.decompose()
                        
                        # Get text content
                        text = article.get_text(separator='\n', strip=True)
                        
                        # Clean up excessive whitespace
                        text = re.sub(r'\n\s*\n', '\n\n', text)
                        text = re.sub(r' +', ' ', text)
                        
                        # Limit to reasonable size (first 50k chars to avoid token limits)
                        if len(text) > 50000:
                            text = text[:50000] + "\n\n[Content truncated due to length...]"
                        
                        # Cache the result
                        self.fulltext_cache[paper_id] = text
                        
                        print(f"Successfully fetched full text for {paper_id} ({len(text)} chars)")
                        return text
                    
                # If HTML version not available, try to extract from abs page
                print(f"HTML version not available for {paper_id}, trying abstract page")
                abs_url = f"https://arxiv.org/abs/{paper_id}"
                response = await client.get(abs_url)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Get abstract as fallback
                    abstract_block = soup.find('blockquote', class_='abstract')
                    if abstract_block:
                        abstract_text = abstract_block.get_text(strip=True)
                        # Remove "Abstract:" prefix if present
                        abstract_text = re.sub(r'^Abstract:\s*', '', abstract_text)
                        
                        print(f"Falling back to abstract for {paper_id} (full text not available)")
                        return abstract_text
                
                print(f"Could not fetch full text for {paper_id}")
                return None
                
        except Exception as e:
            print(f"Error fetching full text for {paper_id}: {e}")
            return None


# Create singleton instance
arxiv_client = ArxivClient()
