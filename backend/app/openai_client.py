"""
OpenAI Client for Yuzu

Generates AI summaries of research papers at different detail levels.
Uses Google Gemini 2.0 Flash via OpenAI SDK for fast, cost-effective summarization.

Level 1: Uses abstract only (quick browsing)
Level 2 & 3: Uses full paper text from ArXiv HTML (deep analysis)
"""

from openai import OpenAI
from typing import Dict, Literal, Optional
import hashlib
from app.config import settings


class OpenAIClient:
    """Client for generating paper summaries using Google Gemini via OpenAI SDK"""
    
    def __init__(self):
        # Initialize OpenAI client with Google Gemini endpoint
        self.client = OpenAI(
            api_key=settings.google_api_key,
            base_url=settings.gemini_base_url
        )
        
        # Cache summaries by hash of abstract+level
        self.cache: Dict[str, str] = {}
        
        # Prompt templates for each level
        self.prompts = {
            1: self._get_level1_prompt,
            2: self._get_level2_prompt,
            3: self._get_level3_prompt,
        }
    
    def _get_cache_key(self, content: str, level: int, paper_id: Optional[str] = None) -> str:
        """Generate unique cache key from content and level"""
        # For levels 2 & 3, include paper_id in cache key since we use full text
        if paper_id and level in [2, 3]:
            cache_content = f"{paper_id}:{level}"
        else:
            cache_content = f"{content}:{level}"
        return hashlib.md5(cache_content.encode()).hexdigest()
    
    def _get_level1_prompt(self, abstract: str) -> str:
        """
        Level 1: Quick overview for browsing
        Target: Someone scrolling through papers quickly
        Tone: Conversational, accessible, engaging
        """
        return f"""You are helping researchers browse papers quickly on Yuzu, an app for discovering research.

Summarize this abstract in 3-4 SHORT sentences using simple, friendly language.

Focus on:
- What problem does this research tackle?
- What's their approach or solution?
- Why should someone care about this?

Make it conversational and easy to understand, like explaining to a smart friend over coffee.
Avoid jargon unless necessary. Be enthusiastic about interesting findings!

Abstract:
{abstract}

Your summary:"""

    def _get_level2_prompt(self, full_text: str) -> str:
        """
        Level 2: Key contributions and methodology from full paper
        Target: Someone interested in the approach
        Tone: Technical but clear, structured
        """
        return f"""You are analyzing a full research paper for someone who wants to understand the technical approach.

Extract and summarize the KEY CONTRIBUTIONS and METHODOLOGY in 4-6 concise bullet points.

Cover:
- Novel contributions or innovations
- Technical approach or methods used  
- Key insights or techniques introduced
- How the method works (high-level architecture)

Be specific but concise. Use technical terms where appropriate.
Format as markdown bullet points.

Full Paper Text:
{full_text}

Key points:"""

    def _get_level3_prompt(self, full_text: str) -> str:
        """
        Level 3: Comprehensive analysis from full paper
        Target: Someone doing deep research
        Tone: Detailed, academic, specific
        """
        return f"""You are providing a comprehensive analysis of a full research paper for deep review.

Provide a thorough summary covering:

**Main Findings** (3-4 sentences)
- Specific results from experiments and evaluation
- Include all quantitative metrics, performance numbers, and comparisons
- Highlight key experimental outcomes

**Technical Details** (2-3 sentences)
- Important implementation details
- Dataset information and experimental setup
- Notable design choices

**Implications & Impact** (2-3 sentences)  
- Broader impact or significance
- How this advances the field
- Practical applications

**Limitations & Future Work** (1-2 sentences)
- Limitations mentioned in the paper
- Future research directions suggested

Be very specific about numbers, percentages, performance metrics, and comparisons with baselines.

Full Paper Text:
{full_text}

Summary:"""

    async def generate_summary(
        self, 
        abstract: str, 
        level: Literal[1, 2, 3],
        paper_id: Optional[str] = None
    ) -> str:
        """
        Generate AI summary for a paper at specified detail level
        
        Args:
            abstract: Paper abstract text
            level: Detail level (1=abstract only, 2=full text methods, 3=full text comprehensive)
            paper_id: ArXiv paper ID (required for levels 2 & 3 to fetch full text)
        
        Returns:
            Generated summary string
            
        Raises:
            ValueError: If level is not 1, 2, or 3, or if paper_id missing for levels 2/3
            Exception: If Gemini API call fails or full text unavailable
        """
        # Validate level
        if level not in [1, 2, 3]:
            raise ValueError(f"Invalid level: {level}. Must be 1, 2, or 3")
        
        # For levels 2 & 3, we need paper_id to fetch full text
        if level in [2, 3] and not paper_id:
            raise ValueError(f"paper_id is required for level {level} summaries (full text analysis)")
        
        # Check cache
        cache_key = self._get_cache_key(abstract, level, paper_id)
        if cache_key in self.cache:
            print(f"Cache hit for summary level {level}")
            return self.cache[cache_key]
        
        # For levels 2 & 3, fetch full text
        content_to_summarize = abstract
        if level in [2, 3]:
            # Import here to avoid circular dependency
            from app.arxiv_client import arxiv_client
            
            print(f"Fetching full text for paper {paper_id}...")
            full_text = await arxiv_client.get_full_text(paper_id)
            
            if not full_text:
                # Fallback to abstract if full text unavailable
                print(f"Warning: Full text not available for {paper_id}, using abstract as fallback")
                content_to_summarize = abstract
            else:
                content_to_summarize = full_text
        
        # Get appropriate prompt template
        prompt_fn = self.prompts[level]
        prompt = prompt_fn(content_to_summarize)
        
        try:
            print(f"Generating level {level} summary...")
            
            # Call Gemini API via OpenAI SDK
            response = self.client.chat.completions.create(
                model="gemini-2.0-flash-exp",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at summarizing academic papers in an engaging, accessible way while maintaining accuracy."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=300,  # Limit output length
                temperature=0.7,  # Slight creativity
            )
            
            # Extract summary from response
            summary = response.choices[0].message.content
            if not summary:
                raise Exception("Gemini returned empty response")
            
            summary = summary.strip()
            
            # Cache the result
            self.cache[cache_key] = summary
            
            print(f"Successfully generated level {level} summary ({len(summary)} chars)")
            
            return summary
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            raise Exception(f"Failed to generate summary: {str(e)}")
    
    async def generate_all_levels(self, abstract: str, paper_id: Optional[str] = None) -> Dict[int, str]:
        """
        Generate summaries for all 3 levels at once
        Useful for pre-caching
        
        Args:
            abstract: Paper abstract
            paper_id: ArXiv paper ID (needed for levels 2 & 3)
        
        Returns:
            Dictionary with keys 1, 2, 3 mapping to summaries
        """
        summaries = {}
        for level in [1, 2, 3]:
            try:
                summaries[level] = await self.generate_summary(abstract, level, paper_id)
            except Exception as e:
                print(f"Failed to generate level {level}: {e}")
                summaries[level] = f"Summary unavailable for level {level}"
        
        return summaries


# Create singleton instance
openai_client = OpenAIClient()
