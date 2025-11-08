from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from app.models import (
    SearchResponse, 
    SummarizeRequest, 
    SummarizeResponse,
    BatchSummarizeRequest,
    BatchSummarizeResponse
)
from app.arxiv_client import arxiv_client
from app.openai_client import openai_client

app = FastAPI(
    title="Yuzu API",
    description="Backend for Yuzu paper discovery app",
    version="1.0.0"
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yuzu.epicrunze.com",  # Production frontend
        "https://api-yuzu.epicrunze.com",  # Production API (for docs/testing)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Yuzu API 🍋"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "yuzu-api"}

@app.get("/api/search", response_model=SearchResponse)
async def search_papers(
    query: str = Query(
        ..., 
        description="Search query for papers",
        min_length=1,
        example="transformer neural networks"
    ),
    max_results: int = Query(
        20, 
        ge=1, 
        le=100, 
        description="Number of papers to return"
    ),
    sort_by: str = Query(
        "relevance",
        description="Sort order: relevance, submittedDate, or lastUpdatedDate",
        regex="^(relevance|submittedDate|lastUpdatedDate)$"
    )
):
    """
    Search ArXiv for academic papers
    
    Returns list of papers with metadata including:
    - Title, authors, abstract
    - PDF and ArXiv URLs
    - Publication date
    - Categories
    
    Results are cached to improve performance.
    Sort by submittedDate to get newest papers (better HTML availability).
    """
    try:
        # Call ArXiv client with sort parameter
        papers = arxiv_client.search(query, max_results, sort_by)
        
        return SearchResponse(
            papers=papers,
            query=query,
            count=len(papers)
        )
        
    except Exception as e:
        print(f"Search endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search papers: {str(e)}"
        )

@app.post("/api/summarize", response_model=SummarizeResponse)
async def summarize_paper(request: SummarizeRequest):
    """
    Generate AI summary of a paper
    
    Levels:
    - 1: Quick overview from abstract only (3-4 sentences, browsing mode)
    - 2: Technical analysis from full paper text (methods & contributions)
    - 3: Comprehensive analysis from full paper text (results, findings, implications)
    
    Note: Levels 2 and 3 require paper_id to fetch full text from ArXiv.
    Summaries are cached to improve performance and reduce costs.
    """
    try:
        # Debug logging
        print(f"📨 Summarize request received:")
        print(f"   Level: {request.level}")
        print(f"   Paper ID: {request.paper_id!r}")
        print(f"   Abstract length: {len(request.abstract) if request.abstract else 0} chars")
        # Validate abstract length
        if not request.abstract or len(request.abstract) < 50:
            raise HTTPException(
                status_code=400,
                detail="Abstract too short. Must be at least 50 characters."
            )
        
        if len(request.abstract) > 10000:
            raise HTTPException(
                status_code=400,
                detail="Abstract too long. Maximum 10,000 characters."
            )
        
        # Validate paper_id for levels 2 & 3
        if request.level in [2, 3] and not request.paper_id:
            raise HTTPException(
                status_code=400,
                detail=f"paper_id is required for level {request.level} summaries (full text analysis). Received: {request.paper_id!r}"
            )
        
        # Generate summary
        summary = await openai_client.generate_summary(
            request.abstract,
            request.level,
            request.paper_id
        )
        
        return SummarizeResponse(summary=summary)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Summarize endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )

@app.post("/api/summarize/batch", response_model=BatchSummarizeResponse)
async def batch_summarize(request: BatchSummarizeRequest):
    """
    Generate summaries for multiple papers at once
    
    Level 1: Uses abstract only
    Levels 2-3: Fetches and uses full paper text from ArXiv
    
    Useful for pre-loading summaries when displaying initial paper stack.
    Failed summaries will have error message as value.
    """
    if not request.papers:
        raise HTTPException(
            status_code=400,
            detail="No papers provided"
        )
    
    if len(request.papers) > 20:
        raise HTTPException(
            status_code=400,
            detail="Maximum 20 papers per batch request"
        )
    
    summaries = {}
    
    for paper in request.papers:
        try:
            summary = await openai_client.generate_summary(
                paper.abstract,
                request.level,
                paper.id  # Pass paper ID for full text fetching
            )
            summaries[paper.id] = summary
        except Exception as e:
            print(f"Failed to summarize paper {paper.id}: {e}")
            summaries[paper.id] = "Summary unavailable"
    
    return BatchSummarizeResponse(summaries=summaries)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

