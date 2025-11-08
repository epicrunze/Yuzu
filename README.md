# 🍋 Yuzu - Fresh Research Discovery

Squeeze knowledge from every paper. Discover academic research through an intuitive swipe interface with AI-powered summaries.

## Features

- 🔍 **Smart Search**: Find papers from ArXiv by keyword
- ✨ **AI Summaries**: Three levels of depth powered by Gemini
- 💾 **Easy Export**: One-click BibTeX export for citations
- 🎉 **Delightful UX**: Confetti animations and toast notifications
- ⌨️ **Keyboard Controls**: Fast navigation with arrow keys
- 📱 **Mobile Friendly**: Touch gestures on mobile devices
- 🎨 **Beautiful Design**: Warm citrus-inspired interface

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google API key (for Gemini AI)

### Development

```bash
# Clone repository
git clone https://github.com/yourusername/yuzu.git
cd yuzu

# Add your Google API key
echo "GOOGLE_API_KEY=your-key-here" > .env

# Start services
docker-compose up --build

# Visit http://localhost:3000
```

### Production Deployment

```bash
# Set your Google API key
export GOOGLE_API_KEY=your-key-here

# Build and deploy production images
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python 3.11
- **APIs**: ArXiv, Google Gemini (via OpenAI API)
- **Deployment**: Docker, Docker Compose

## Usage

### Search Papers

1. Enter a research topic on the landing page
2. Wait for Yuzu to fetch relevant papers from ArXiv

### Navigate Papers

- **← Left Arrow** or **Swipe Left**: Pass on current paper
- **→ Right Arrow** or **Swipe Right**: See more details / Next paper
- **Space Bar**: Superlike and save paper to favorites

### Detail Levels

Papers have three AI-generated summary levels:

1. **Level 1**: Quick overview (one paragraph)
2. **Level 2**: Detailed summary (multiple sections)
3. **Level 3**: Comprehensive analysis (full breakdown)

Press → or swipe right to dive deeper into each level.

### Save & Export

- Press **Space** to superlike papers
- View saved papers in the sidebar
- Click **Download BibTeX** to export citations

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Pass on current paper |
| `→` | See more details / Next paper |
| `Space` | Superlike and save paper |

## Mobile Support

On touch devices:

- **Swipe Left**: Pass paper
- **Swipe Right**: More details
- **Tap Star Button**: Save paper

## Project Structure

```
yuzu/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── arxiv_client.py  # ArXiv API client
│   │   └── openai_client.py # Gemini integration
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main app
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── PaperCard.tsx    # Paper display
│   │   ├── SwipeInterface.tsx # Swipe logic
│   │   ├── Toast.tsx        # Notifications
│   │   └── ...
│   ├── lib/
│   │   ├── confetti.ts      # Celebration animations
│   │   ├── api.ts           # Backend API client
│   │   └── types.ts         # TypeScript types
│   ├── Dockerfile
│   └── Dockerfile.prod      # Production build
├── docker-compose.yml       # Development setup
└── docker-compose.prod.yml  # Production setup
```

## Environment Variables

### Backend

- `GOOGLE_API_KEY`: Your Google API key for Gemini
- `ENVIRONMENT`: Set to `production` for production builds

### Frontend

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: https://api-yuzu.epicrunze.com)

## Development

### Running Locally

```bash
# Backend (requires Python 3.11+)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8282

# Frontend (requires Node.js 18+)
cd frontend
npm install
npm run dev
```

### Installing Dependencies

The frontend requires additional packages. Run:

```bash
cd frontend
npm install
```

This will install:
- `canvas-confetti` - Celebration animations
- `react-swipeable` - Mobile touch gestures

## License

MIT

## Acknowledgments

Built with 🍋 for Duke AI Hackathon

- ArXiv for open research access
- Google Gemini for AI summaries
- Next.js and React communities

---

**Made with 🍋 by Yuzu Team**
