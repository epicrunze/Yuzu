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

