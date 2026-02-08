# Clip Finder API

An intelligent video search system that enables natural language search across video content using both text (speech) and visual (frame) analysis. Find any moment in your videos by describing what was said or what was shown on screen.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [How It Works](#how-it-works)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Core Capabilities
- **Text Search**: Search video transcripts using natural language queries
- **Visual Search**: Find frames by describing visual content
- **Hybrid Search**: Combine text and visual search for comprehensive results
- **Multi-format Support**: MP4, AVI, MOV, MKV, WebM
- **YouTube Integration**: Direct video processing from YouTube URLs
- **Clip Creation**: Extract and download specific video segments
- **Bookmark System**: Mark and annotate important timestamps
- **Search History**: Track all queries per video
- **Real-time Processing**: Live status updates during video processing

### Technical Features
- GPU acceleration with automatic CPU fallback
- Vector similarity search using LanceDB
- Frame-level visual analysis (1-second intervals)
- Word-level timestamp accuracy
- RESTful API with FastAPI
- CORS-enabled for web integration
- Rate limiting (50 uploads/day per IP)

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Application                       │
│                     (Web/Mobile/Desktop)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FastAPI Server                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                          │  │
│  │  /upload  /search  /create-clip  /bookmarks  /status     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Processing Pipeline                          │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   FFmpeg     │───▶│   Whisper    │───▶│  Sentence-   │      │
│  │   (Audio     │    │  (Speech-to- │    │ Transformers │      │
│  │  Extraction) │    │    Text)     │    │   (Text      │      │
│  └──────────────┘    └──────────────┘    │  Embeddings) │      │
│                                           └──────────────┘      │
│  ┌──────────────┐    ┌──────────────┐                          │
│  │   FFmpeg     │───▶│   OpenCLIP   │                          │
│  │   (Frame     │    │   (Visual    │                          │
│  │  Extraction) │    │  Embeddings) │                          │
│  └──────────────┘    └──────────────┘                          │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LanceDB Storage                           │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │  Text Embeddings     │    │  Visual Embeddings   │          │
│  │  Table               │    │  Table               │          │
│  │  (768-dim vectors)   │    │  (512-dim vectors)   │          │
│  └──────────────────────┘    └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Search & Retrieval                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Vector Similarity Search (Cosine)                 │  │
│  │  Query Embedding ──▶ ANN Search ──▶ Ranked Results      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Video Processing Layer
- **Input**: Video files (local upload or YouTube URL)
- **FFmpeg**: Handles audio extraction and frame extraction
- **Output**: WAV audio file + JPEG frames (1-second intervals)

#### 2. AI/ML Processing Layer
- **Whisper Model**: Converts audio to timestamped transcripts
- **Sentence-Transformers**: Generates 768-dim embeddings for text
- **OpenCLIP (ViT-B-32)**: Generates 512-dim embeddings for frames
- **Output**: Vector representations of content

#### 3. Storage Layer
- **LanceDB**: Vector database for efficient similarity search
- **File System**: Raw videos, frames, and metadata
- **In-Memory Cache**: Rate limiting, bookmarks, search history

#### 4. Search Engine
- **Text Search**: Semantic matching on transcript embeddings
- **Visual Search**: CLIP text-to-image matching on frame embeddings
- **Hybrid Search**: Weighted combination of both approaches

---

## Technology Stack

### Core Dependencies

| Component | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.8+ | Runtime environment |
| **FastAPI** | Latest | Web framework and REST API |
| **PyTorch** | 2.0+ | Deep learning backend |
| **OpenCLIP** | Latest | Vision-language model |
| **Whisper** | Latest | Speech recognition |
| **Sentence-Transformers** | Latest | Text embeddings |
| **LanceDB** | Latest | Vector database |
| **FFmpeg** | 4.0+ | Video/audio processing |
| **yt-dlp** | Latest | YouTube video download |

### Python Libraries
```
fastapi
uvicorn[standard]
python-multipart
torch
torchvision
open-clip-torch
openai-whisper
sentence-transformers
lancedb
numpy
pillow
aiohttp
pydantic
```

### System Tools
- **FFmpeg**: Audio/video manipulation
- **yt-dlp**: YouTube video downloading

---

## System Requirements

### Minimum Requirements
- **OS**: Linux, macOS, or Windows 10+
- **CPU**: 4+ cores (Intel i5 or AMD equivalent)
- **RAM**: 8GB
- **Storage**: 50GB free space
- **Python**: 3.8 or higher

### Recommended Requirements
- **OS**: Ubuntu 20.04+ / macOS 12+
- **CPU**: 8+ cores (Intel i7/i9 or AMD Ryzen 7/9)
- **RAM**: 16GB+
- **GPU**: NVIDIA GPU with 6GB+ VRAM (RTX 3060 or better)
- **Storage**: 100GB+ SSD
- **CUDA**: 11.8+ (for GPU acceleration)

### GPU Support
- **With GPU**: 10-30 seconds per minute of video
- **Without GPU**: 60-120 seconds per minute of video

---

## Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/clip-finder-api.git
cd clip-finder-api
```

### Step 2: Install System Dependencies

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install FFmpeg
sudo apt install ffmpeg -y

# Install Python 3.9+ (if not already installed)
sudo apt install python3.9 python3.9-pip python3.9-venv -y

# Install yt-dlp
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install ffmpeg python@3.9 yt-dlp
```

#### Windows
1. Install Python 3.9+ from [python.org](https://www.python.org/downloads/)
2. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
   - Extract and add to system PATH
3. Install yt-dlp:
   ```powershell
   pip install yt-dlp
   ```

### Step 3: Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### Step 4: Install Python Dependencies

#### For CPU-only Installation
```bash
pip install --upgrade pip
pip install fastapi uvicorn[standard] python-multipart
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install open-clip-torch openai-whisper sentence-transformers
pip install lancedb numpy pillow aiohttp pydantic
```

#### For GPU (CUDA) Installation
```bash
pip install --upgrade pip
pip install fastapi uvicorn[standard] python-multipart
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install open-clip-torch openai-whisper sentence-transformers
pip install lancedb numpy pillow aiohttp pydantic
```

### Step 5: Verify Installation
```bash
# Check FFmpeg
ffmpeg -version

# Check yt-dlp
yt-dlp --version

# Check Python dependencies
python -c "import torch; print(f'PyTorch: {torch.__version__}')"
python -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}')"
python -c "import whisper; print('Whisper: OK')"
python -c "import open_clip; print('OpenCLIP: OK')"
python -c "import lancedb; print('LanceDB: OK')"
```

### Step 6: Download AI Models (First Run)

Models will be downloaded automatically on first use:
- **Whisper**: ~460MB (small model)
- **OpenCLIP**: ~350MB (ViT-B-32 + LAION-2B weights)
- **Sentence-Transformers**: ~420MB (all-mpnet-base-v2)

Total: ~1.2GB initial download

---

## Configuration

### Directory Structure
```
clip-finder-api/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── uploads/               # Uploaded videos (auto-created)
├── clips/                 # Generated video clips (auto-created)
├── cache/                 # Processing metadata (auto-created)
├── lancedb_data/          # Vector database (auto-created)
└── venv/                  # Virtual environment
```

### Environment Variables (Optional)
```bash
# Set custom directories
export UPLOAD_DIR="/path/to/uploads"
export CLIPS_DIR="/path/to/clips"
export CACHE_DIR="/path/to/cache"
export LANCEDB_DIR="/path/to/lancedb"

# Set rate limits
export RATE_LIMIT=50  # uploads per day per IP

# Set file size limit (in bytes)
export MAX_FILE_SIZE=524288000  # 500MB
```

### Configuration in Code
Edit `main.py` to modify:
```python
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
RATE_LIMIT = 50  # requests per day per IP
```

---

## Usage

### Starting the Server

```bash
# Activate virtual environment
source venv/bin/activate

# Start server
python main.py

# Or use uvicorn directly
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Server will start at: `http://127.0.0.1:8000`

### Basic Workflow

#### 1. Upload a Video
```bash
curl -X POST "http://127.0.0.1:8000/upload" \
  -F "file=@/path/to/video.mp4"
```

Response:
```json
{
  "video_id": "abc123def456",
  "filename": "video.mp4",
  "message": "Upload successful. Processing started.",
  "remaining_uploads": 49
}
```

#### 2. Check Processing Status
```bash
curl "http://127.0.0.1:8000/status/abc123def456"
```

Response:
```json
{
  "status": "processing",
  "progress": 0.65,
  "message": "Encoding frames with OpenCLIP..."
}
```

#### 3. Search Video (Text)
```bash
curl -X POST "http://127.0.0.1:8000/search" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "abc123def456",
    "query": "machine learning optimization",
    "search_type": "text",
    "top_k": 10
  }'
```

#### 4. Search Video (Visual)
```bash
curl -X POST "http://127.0.0.1:8000/search" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "abc123def456",
    "query": "slide with bar chart",
    "search_type": "visual",
    "top_k": 10
  }'
```

#### 5. Create Clip
```bash
curl -X POST "http://127.0.0.1:8000/create-clip" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "abc123def456",
    "start_time": 120.5,
    "end_time": 145.0
  }'
```

---

## API Documentation

### Interactive Documentation
Once the server is running, visit:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### Core Endpoints

#### POST /upload
Upload a video file for processing.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (video file)

**Response:**
```json
{
  "video_id": "string",
  "filename": "string",
  "message": "string",
  "remaining_uploads": 49
}
```

#### POST /upload-url
Process a YouTube video by URL.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "video_id": "string",
  "url": "string",
  "message": "string",
  "remaining_uploads": 49
}
```

#### GET /status/{video_id}
Get processing status for a video.

**Response:**
```json
{
  "status": "processing|completed|error",
  "progress": 0.75,
  "message": "string"
}
```

#### POST /search
Search within a processed video.

**Request:**
```json
{
  "video_id": "string",
  "query": "string",
  "search_type": "text|visual|hybrid",
  "top_k": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "timestamp": 125.5,
      "text": "string",
      "score": 0.85,
      "search_type": "text|visual",
      "frame_url": "/frame/{video_id}/{frame_number}"
    }
  ],
  "total_matches": 25,
  "search_type": "text|visual|hybrid",
  "model": "OpenCLIP ViT-B-32 + LAION-2B"
}
```

#### GET /frame/{video_id}/{frame_number}
Retrieve a specific frame as JPEG image.

**Response:** Image/JPEG

#### POST /create-clip
Create a video clip from specified time range.

**Request:**
```json
{
  "video_id": "string",
  "start_time": 120.5,
  "end_time": 145.0
}
```

**Response:**
```json
{
  "clip_url": "/download-clip/{filename}",
  "filename": "string"
}
```

#### POST /bookmarks
Add a bookmark to a video.

**Request:**
```json
{
  "video_id": "string",
  "timestamp": 125.5,
  "note": "Important moment"
}
```

#### GET /bookmarks/{video_id}
Get all bookmarks for a video.

**Response:**
```json
{
  "video_id": "string",
  "bookmarks": [
    {
      "timestamp": 125.5,
      "note": "string",
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

#### GET /video-info/{video_id}
Get metadata about a processed video.

**Response:**
```json
{
  "video_id": "string",
  "duration": 600.5,
  "segments_count": 45,
  "frames_count": 600,
  "frame_interval": 1,
  "model": "OpenCLIP ViT-B-32 + LAION-2B",
  "has_text_search": true,
  "has_visual_search": true
}
```

#### DELETE /video/{video_id}
Delete a video and all associated data.

**Response:**
```json
{
  "message": "Video and all associated data deleted"
}
```

---

## How It Works

### Processing Pipeline

#### Phase 1: Video Upload
1. Client uploads video file or provides YouTube URL
2. Server validates file format and size
3. Unique video ID is generated
4. File is saved to uploads directory
5. Background processing task is initiated

#### Phase 2: Audio Processing
1. FFmpeg extracts audio track as WAV (16kHz, mono)
2. Whisper model transcribes audio with word-level timestamps
3. Segments are created with start/end times and text

#### Phase 3: Visual Processing
1. FFmpeg extracts frames at 1-second intervals
2. Each frame is saved as JPEG
3. OpenCLIP ViT-B-32 model encodes each frame into 512-dim vector
4. Batch processing for efficiency (32 frames at a time)

#### Phase 4: Embedding Generation
1. **Text embeddings**: Sentence-Transformers converts each transcript segment to 768-dim vector
2. **Visual embeddings**: Already generated in Phase 3
3. Both are normalized for cosine similarity

#### Phase 5: Storage
1. Text embeddings stored in LanceDB table `text_{video_id}`
2. Visual embeddings stored in LanceDB table `visual_{video_id}`
3. Metadata saved to JSON file in cache directory
4. Frame images kept in `uploads/{video_id}_frames/`

### Search Mechanism

#### Text Search
```
User Query
    ↓
Sentence-Transformer Encoding (768-dim)
    ↓
Cosine Similarity vs All Text Embeddings
    ↓
Keyword Match Bonus (if exact phrase found)
    ↓
Rank by Combined Score
    ↓
Return Top-K Results
```

#### Visual Search
```
User Query ("show me slides with charts")
    ↓
OpenCLIP Text Encoder (512-dim)
    ↓
Cosine Similarity vs All Frame Embeddings
    ↓
Pure Visual Matching (no text interference)
    ↓
Rank by Similarity Score
    ↓
Return Top-K Results with Frame URLs
```

#### Hybrid Search
```
Run Text Search (weight: 0.5)
    +
Run Visual Search (weight: 0.5)
    ↓
Combine and Deduplicate Results
    ↓
Rank by Combined Score
    ↓
Return Top-K Results
```

### Similarity Scoring

**Cosine Similarity Formula:**
```
similarity = (A · B) / (||A|| × ||B||)

where:
- A = query embedding
- B = stored embedding
- · = dot product
- || || = vector norm
```

**Score Range:** 0.0 to 1.0
- 0.9 - 1.0: Highly relevant
- 0.7 - 0.9: Very relevant
- 0.5 - 0.7: Moderately relevant
- 0.3 - 0.5: Somewhat relevant
- 0.0 - 0.3: Low relevance

---

## Performance Considerations

### Processing Speed

**GPU (RTX 3060):**
- Audio extraction: 5-10 seconds per minute of video
- Transcription: 10-20 seconds per minute of video
- Frame extraction: 5-10 seconds per minute of video
- Visual encoding: 15-30 seconds per minute of video
- Total: ~30-70 seconds per minute of video

**CPU Only:**
- Audio extraction: 10-20 seconds per minute of video
- Transcription: 60-120 seconds per minute of video
- Frame extraction: 10-20 seconds per minute of video
- Visual encoding: 120-240 seconds per minute of video
- Total: ~200-400 seconds per minute of video

### Search Speed

**Text Search:**
- Query encoding: 10-50ms
- Vector search (1000 segments): 50-200ms
- Total: 60-250ms

**Visual Search:**
- Query encoding: 20-100ms
- Vector search (600 frames/10min video): 100-500ms
- Total: 120-600ms

### Storage Requirements

**Per 10-minute video:**
- Original video: 50-200MB (depends on quality)
- Extracted frames (600 @ 1-second intervals): 50-100MB
- Text embeddings (768-dim × 50 segments): ~150KB
- Visual embeddings (512-dim × 600 frames): ~1.2MB
- Metadata: ~50KB
- Total: ~100-300MB per video

### Optimization Tips

1. **Use GPU**: 5-10x faster processing
2. **Batch Processing**: Process multiple videos in parallel
3. **Frame Interval**: Adjust from 1s to 2s for faster processing (trade-off: lower accuracy)
4. **Model Selection**: Use Whisper "tiny" or "base" for faster transcription
5. **Storage Cleanup**: Delete unused videos and frames regularly

---

## Troubleshooting

### Common Issues

#### 1. FFmpeg Not Found
```
Error: FFmpeg not installed or not in PATH
```

**Solution:**
- Install FFmpeg using system package manager
- Verify with: `ffmpeg -version`
- Ensure FFmpeg is in system PATH

#### 2. CUDA Out of Memory
```
RuntimeError: CUDA out of memory
```

**Solution:**
- Reduce batch size in `encode_multiple_images_batch()` (default: 32 → 16 or 8)
- Close other GPU-intensive applications
- Use CPU mode instead

#### 3. Model Download Failures
```
Error downloading model weights
```

**Solution:**
- Check internet connection
- Verify disk space (need ~2GB for all models)
- Manually download models:
  ```python
  import whisper
  whisper.load_model("small")
  
  from sentence_transformers import SentenceTransformer
  SentenceTransformer('all-mpnet-base-v2')
  
  import open_clip
  open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
  ```

#### 4. YouTube Download Fails
```
Error: YouTube download failed
```

**Solution:**
- Update yt-dlp: `pip install -U yt-dlp`
- Check if video is available and not region-blocked
- Verify internet connection

#### 5. Port Already in Use
```
Error: Address already in use
```

**Solution:**
- Change port in `main.py`:
  ```python
  uvicorn.run(app, host="127.0.0.1", port=8001)
  ```
- Or kill existing process:
  ```bash
  lsof -ti:8000 | xargs kill -9
  ```

#### 6. Permission Denied Errors
```
PermissionError: [Errno 13] Permission denied
```

**Solution:**
- Check directory permissions
- Run with appropriate user permissions
- Create directories manually:
  ```bash
  mkdir -p uploads clips cache lancedb_data
  chmod 755 uploads clips cache lancedb_data
  ```

### Debug Mode

Enable verbose logging:
```python
# Add to main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

Run with debug output:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --log-level debug
```

### Performance Profiling

Check processing bottlenecks:
```python
import time

start = time.time()
# ... your code ...
print(f"Operation took: {time.time() - start:.2f}s")
```

---

## API Rate Limits

- **Uploads**: 50 per day per IP address
- **Searches**: Unlimited
- **Clip Creation**: Unlimited
- **File Size**: 500MB maximum per upload

To check remaining uploads:
```bash
curl "http://127.0.0.1:8000/health"
```

---

## Security Considerations

### Current Implementation
- No authentication (suitable for local/development use)
- IP-based rate limiting
- File size validation
- File type validation

### Production Recommendations
1. Add authentication (JWT, OAuth2)
2. Implement user quotas and permissions
3. Add HTTPS/TLS encryption
4. Sanitize file uploads
5. Implement request validation
6. Add logging and monitoring
7. Use environment variables for secrets
8. Deploy behind reverse proxy (nginx, Caddy)

---

## Future Enhancements

### Planned Features
- Multi-language support (beyond English)
- Real-time video streaming support
- Advanced filters (date range, duration, quality)
- Batch video processing API
- Export search results to CSV/JSON
- Video thumbnail generation
- Audio-only search mode
- Custom model fine-tuning support

### Scalability Improvements
- Database migration to PostgreSQL + pgvector
- Redis caching layer
- Distributed task queue (Celery)
- Microservices architecture
- Container orchestration (Docker, Kubernetes)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Email: support@clipfinder.example.com
- Documentation: https://docs.clipfinder.example.com

---

## Acknowledgments

- **OpenAI Whisper**: Speech recognition
- **OpenCLIP**: Vision-language models
- **Sentence-Transformers**: Text embeddings
- **LanceDB**: Vector database
- **FFmpeg**: Multimedia processing
- **yt-dlp**: YouTube downloading

---

## Citation

If you use this project in research, please cite:

```bibtex
@software{clipfinder2024,
  title={Clip Finder: Intelligent Video Search System},
  author={Your Name},
  year={2024},
  url={https://github.com/yourusername/clip-finder-api}
}
```

---

**Version**: 6.0.0  
**Last Updated**: 2024  
**Maintained By**: Pavan
