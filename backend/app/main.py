from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.models import SearchResponse
from app.arxiv_client import arxiv_client

app = FastAPI(
    title="Yuzu API",
    description="Backend for Yuzu paper discovery app",
    version="1.0.0"
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local frontend
        "http://frontend:3000",   # Docker frontend
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
    """
    try:
        # Call ArXiv client
        papers = arxiv_client.search(query, max_results)
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

