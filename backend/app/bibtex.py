"""
BibTeX generation utilities for Yuzu

Converts paper metadata into BibTeX citation format
"""

import re
from datetime import datetime
from typing import Dict, Any


def generate_citation_key(authors: list[str], title: str, year: str) -> str:
    """
    Generate BibTeX citation key in format: FirstAuthorLastName2024Title
    
    Example: Anderson2024AttentionIsAllYouNeed
    """
    # Get first author's last name
    if authors:
        first_author = authors[0].split()[-1]  # Get last word (last name)
        # Clean special characters
        first_author = re.sub(r'[^a-zA-Z]', '', first_author)
    else:
        first_author = "Unknown"
    
    # Get first 3 words of title
    title_words = re.sub(r'[^a-zA-Z0-9\s]', '', title).split()[:3]
    title_part = ''.join(word.capitalize() for word in title_words)
    
    return f"{first_author}{year}{title_part}"


def extract_arxiv_id(paper_id: str) -> str:
    """
    Extract clean ArXiv ID from various formats
    
    Examples:
    - "http://arxiv.org/abs/2301.12345v1" -> "2301.12345"
    - "2301.12345v1" -> "2301.12345"
    """
    # Remove URL prefix if present
    arxiv_id = paper_id.split('/')[-1]
    
    # Remove version suffix (v1, v2, etc.)
    arxiv_id = re.sub(r'v\d+$', '', arxiv_id)
    
    return arxiv_id


def paper_to_bibtex(paper: Dict[str, Any]) -> str:
    """
    Convert paper metadata to BibTeX format
    
    Args:
        paper: Dictionary with keys: id, title, authors, abstract, published, pdf_url, arxiv_url
    
    Returns:
        BibTeX formatted string
    """
    # Extract year from published date
    try:
        pub_date = datetime.fromisoformat(paper['published'].replace('Z', '+00:00'))
        year = pub_date.year
        month = pub_date.strftime('%B').lower()
    except:
        year = datetime.now().year
        month = ''
    
    # Generate citation key
    citation_key = generate_citation_key(
        paper['authors'],
        paper['title'],
        str(year)
    )
    
    # Extract ArXiv ID
    arxiv_id = extract_arxiv_id(paper['id'])
    
    # Format authors for BibTeX (Last, First and Last, First and ...)
    authors_formatted = ' and '.join(paper['authors'])
    
    # Escape special characters in title
    title = paper['title'].replace('{', '\\{').replace('}', '\\}')
    
    # Build BibTeX entry
    bibtex = f"""@article{{{citation_key},
  title = {{{title}}},
  author = {{{authors_formatted}}},
  year = {{{year}}},"""
    
    if month:
        bibtex += f"\n  month = {{{month}}},"
    
    bibtex += f"""
  journal = {{arXiv preprint arXiv:{arxiv_id}}},
  eprint = {{{arxiv_id}}},
  archivePrefix = {{arXiv}},
  primaryClass = {{cs.AI}},
  url = {{{paper['arxiv_url']}}},
  note = {{Available at: {paper['pdf_url']}}}
}}"""
    
    return bibtex


def papers_to_bibtex_file(papers: list[Dict[str, Any]]) -> str:
    """
    Convert multiple papers to a complete BibTeX file
    
    Args:
        papers: List of paper dictionaries
    
    Returns:
        Complete BibTeX file content
    """
    header = f"""% BibTeX export from Yuzu
% Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
% Total papers: {len(papers)}

"""
    
    entries = []
    for paper in papers:
        entry = paper_to_bibtex(paper)
        entries.append(entry)
    
    return header + '\n\n'.join(entries)
