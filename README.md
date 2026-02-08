# Clip Finder - Video Search Platform

A free online tool for searching within videos using natural language. Upload videos or provide YouTube URLs, then search for specific moments using semantic search powered by AI.

![Clip Finder](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Features

- **Video Upload** - Support for MP4, AVI, MOV, MKV (up to 500MB)
- **YouTube Integration** - Process videos directly from YouTube URLs
- **Semantic Search** - Find moments using natural language queries
- **Speech-to-Text** - Automatic transcription using OpenAI Whisper
- **AI Embeddings** - Powered by OpenRouter for accurate search
- **Clip Extraction** - Download 30-second clips from any timestamp
- **Real-time Processing** - Live progress updates during video analysis
- **Rate Limiting** - 5 free videos per day per IP
- **Mobile Responsive** - Works seamlessly on all devices

## 🏗️ Architecture

### Backend (FastAPI)
- Video processing and storage
- Audio extraction with FFmpeg
- Speech transcription (Whisper)
- Semantic embeddings (OpenRouter)
- Clip generation and download

### Frontend (Next.js)
- Modern React UI with TypeScript
- Real-time status updates
- Drag-and-drop upload
- Video player with timestamp navigation
- Responsive design with custom animations

## 📋 Prerequisites

### System Requirements
- Python 3.8+
- Node.js 18+
- FFmpeg
- yt-dlp (for YouTube support)

### API Keys
- OpenRouter API key (for embeddings)

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y ffmpeg
pip install yt-dlp

# Install Python dependencies
pip install -r requirements.txt

# Set API key
export OPENROUTER_API_KEY="your-api-key-here"

# Run server
python main.py
```

Backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
clip-finder/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── uploads/             # Video storage
│   ├── clips/               # Generated clips
│   └── cache/               # Processing metadata
├── frontend/
│   ├── pages/               # Next.js pages
│   ├── components/          # React components
│   ├── styles/              # CSS styles
│   ├── utils/               # API utilities
│   └── package.json         # Node dependencies
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```bash
OPENROUTER_API_KEY=your-key-here  # Required for embeddings
```

### Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend URL
```

## 📊 API Endpoints

### Upload Video
```
POST /upload
Content-Type: multipart/form-data
Body: file (video file)
```

### Upload YouTube URL
```
POST /upload-url?url={youtube_url}
```

### Get Processing Status
```
GET /status/{video_id}
```

### Search Video
```
POST /search
Body: {
  "video_id": "string",
  "query": "string"
}
```

### Create Clip
```
POST /create-clip
Body: {
  "video_id": "string",
  "start_time": float,
  "end_time": float
}
```

### Download Clip
```
GET /download-clip/{filename}
```

## 🎨 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Whisper** - OpenAI's speech recognition
- **FFmpeg** - Video/audio processing
- **OpenRouter** - AI embeddings API
- **yt-dlp** - YouTube video download

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Custom Fonts** - Instrument Serif + DM Sans

## 🔒 Security Features

- Rate limiting (5 requests/day per IP)
- File type validation
- File size limits (500MB max)
- CORS protection
- Input sanitization

## 🚢 Deployment

### Backend Deployment (Railway/Render/DigitalOcean)

1. Set environment variables:
   - `OPENROUTER_API_KEY`
   
2. Install system dependencies:
   ```bash
   apt-get install -y ffmpeg
   pip install yt-dlp
   ```

3. Deploy using:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Frontend Deployment (Vercel/Netlify)

1. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

2. Build command:
   ```bash
   npm run build
   ```

3. Deploy the `.next` folder

## 🐛 Troubleshooting

### FFmpeg not found
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Whisper installation issues
```bash
pip install --upgrade pip
pip install openai-whisper
```

### CORS errors
- Ensure backend CORS settings allow your frontend domain
- Check `NEXT_PUBLIC_API_URL` is correctly set

### Rate limit exceeded
- Wait 24 hours for reset
- Deploy your own instance for unlimited usage

## 📈 Performance

- **Processing Time**: 1-3 minutes for typical videos
- **Search Speed**: < 1 second for semantic search
- **Clip Generation**: < 5 seconds for 30s clips
- **Concurrent Users**: Scales with infrastructure

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- OpenAI Whisper for speech recognition
- OpenRouter for AI embeddings
- FFmpeg for video processing
- The open-source community

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review API documentation at `/docs` endpoint

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Batch video processing
- [ ] Advanced clip editing
- [ ] Video summarization
- [ ] Custom model training
- [ ] User accounts and history
- [ ] Cloud storage integration

---

Built with ❤️ using open-source technologies
