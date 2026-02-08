# 🚀 Quick Start Guide

Get Clip Finder running in 5 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.8+)
python3 --version

# Check Node.js version (need 18+)
node --version

# Check FFmpeg
ffmpeg -version
```

## Setup

### 1. Backend (Terminal 1)

```bash
cd backend

# Install Python packages
pip install -r requirements.txt

# Install yt-dlp for YouTube support
pip install yt-dlp

# Set your OpenRouter API key
export OPENROUTER_API_KEY="your-openrouter-api-key"

# Start backend server
python main.py
```

✅ Backend running at http://localhost:8000

### 2. Frontend (Terminal 2)

```bash
cd frontend

# Install packages
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

✅ Frontend running at http://localhost:3000

## First Test

1. Open http://localhost:3000
2. Upload a short video (or use a YouTube URL)
3. Wait for processing (1-3 minutes)
4. Search for content using natural language
5. Click results to jump to timestamps
6. Extract and download clips!

## Get OpenRouter API Key

1. Go to https://openrouter.ai/
2. Sign up for free account
3. Navigate to API Keys
4. Create new key
5. Copy and use in backend setup

## Common Issues

**FFmpeg not found:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows - download from https://ffmpeg.org/download.html
```

**Port already in use:**
```bash
# Backend
lsof -i :8000  # Find process
kill -9 <PID>  # Kill it

# Frontend
lsof -i :3000
kill -9 <PID>
```

**Module not found errors:**
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
rm -rf node_modules package-lock.json
npm install
```

## Using Docker (Alternative)

Easiest way to run everything:

```bash
# Create .env file
echo "OPENROUTER_API_KEY=your-key" > .env

# Start everything
docker-compose up

# Access at http://localhost:3000
```

## File Structure You Should See

```
clip-finder/
├── backend/
│   ├── main.py              ← FastAPI backend
│   ├── requirements.txt     ← Python packages
│   └── README.md
├── frontend/
│   ├── pages/              ← Next.js pages
│   ├── components/         ← React components
│   ├── package.json        ← Node packages
│   └── README.md
├── README.md               ← Main docs
├── DEPLOYMENT.md           ← Deploy guide
└── docker-compose.yml      ← Docker setup
```

## Next Steps

- Read full README.md for detailed docs
- Check DEPLOYMENT.md for production setup
- Customize the UI in frontend/styles/globals.css
- Add features to backend/main.py

## Need Help?

- Check backend logs: Terminal 1
- Check frontend logs: Terminal 2  
- API docs: http://localhost:8000/docs
- Issues: Open GitHub issue

---

Happy video searching! 🎬🔍
