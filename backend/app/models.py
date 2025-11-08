from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class Paper(BaseModel):
    """Academic paper from ArXiv"""
    id: str = Field(..., description="ArXiv paper ID")
    title: str
    authors: List[str]
    abstract: str
    published: str
    pdf_url: str
    arxiv_url: str
    categories: List[str]

class PaperSummary(BaseModel):
    """AI-generated summaries at different detail levels"""
    level1: Optional[str] = None  # Quick overview
    level2: Optional[str] = None  # Methods and contributions
    level3: Optional[str] = None  # Results and conclusions

class SummarizeRequest(BaseModel):
    """Request to generate paper summary"""
    abstract: str
    level: int = Field(..., ge=1, le=3, description="Detail level (1-3)")
    paper_id: Optional[str] = Field(None, description="ArXiv paper ID (required for levels 2-3)")

class SummarizeResponse(BaseModel):
    """Summary response"""
    summary: str

class BatchSummarizeRequest(BaseModel):
    """Request to summarize multiple papers at once"""
    papers: List[Paper]
    level: int = Field(1, ge=1, le=3, description="Detail level (1-3)")

class BatchSummarizeResponse(BaseModel):
    """Response with summaries keyed by paper ID"""
    summaries: Dict[str, str]

class SearchResponse(BaseModel):
    """Response from paper search"""
    papers: List[Paper]
    query: str
    count: int

class BibtexGenerateRequest(BaseModel):
    """Request to generate BibTeX for a single paper"""
    id: str
    title: str
    authors: List[str]
    abstract: str
    published: str
    pdf_url: str
    arxiv_url: str
    categories: List[str]

class BibtexGenerateResponse(BaseModel):
    """BibTeX citation for a single paper"""
    bibtex: str

class BibtexExportRequest(BaseModel):
    """Request to export multiple papers as BibTeX file"""
    papers: List[Paper] = Field(..., description="List of papers to export")

class ChatMessage(BaseModel):
    """A single chat message"""
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[float] = Field(None, description="Unix timestamp")

class ChatRequest(BaseModel):
    """Request to chat about a paper"""
    message: str = Field(..., description="User's question or message")
    paper_id: str = Field(..., description="ArXiv paper ID")
    paper_title: str = Field(..., description="Paper title")
    paper_abstract: str = Field(..., description="Paper abstract")
    paper_authors: List[str] = Field(..., description="Paper authors")
    paper_published: str = Field(..., description="Publication date")
    conversation_history: List[ChatMessage] = Field(default_factory=list, description="Previous messages in conversation")
    include_full_text: bool = Field(True, description="Whether to include full paper text in context")

class ChatResponse(BaseModel):
    """Response from chat endpoint"""
    message: str = Field(..., description="Assistant's response")

