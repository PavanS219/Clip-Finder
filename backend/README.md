# Clip Finder Backend

FastAPI-based backend for video search and clip extraction.

## Prerequisites

- Python 3.8+
- FFmpeg installed
- yt-dlp installed (for YouTube support)

## Installation

1. Install system dependencies:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg

# Install yt-dlp
pip install yt-dlp
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Set your OpenRouter API key as an environment variable:
```bash
export OPENROUTER_API_KEY="your-api-key-here"
```

## Running the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Features

- Video upload (MP4, AVI, MOV, MKV)
- YouTube URL processing
- Speech-to-text transcription (Whisper)
- Semantic search using embeddings
- Clip extraction and download
- Rate limiting (5 requests/day per IP)

## Directory Structure

- `uploads/` - Uploaded videos and frames
- `clips/` - Generated video clips
- `cache/` - Processing status and metadata
