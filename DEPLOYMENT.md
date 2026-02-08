# Deployment Guide

This guide covers multiple deployment options for the Clip Finder application.

## Option 1: Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- OpenRouter API key

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd clip-finder
```

2. Create environment file:
```bash
echo "OPENROUTER_API_KEY=your-key-here" > .env
```

3. Build and run:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Stopping the application
```bash
docker-compose down
```

### Updating
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Option 2: Manual Deployment

### Backend Deployment

#### Railway.app

1. Create new project on Railway
2. Connect GitHub repository
3. Set environment variables:
   - `OPENROUTER_API_KEY`
4. Add start command:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Deploy

#### Render.com

1. Create new Web Service
2. Connect repository
3. Configure:
   - Build Command: `pip install -r requirements.txt && apt-get install -y ffmpeg`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `OPENROUTER_API_KEY`
5. Deploy

#### DigitalOcean App Platform

1. Create new App
2. Select repository
3. Configure build settings
4. Add environment variables
5. Deploy

### Frontend Deployment

#### Vercel (Recommended)

1. Import project from GitHub
2. Configure:
   - Framework: Next.js
   - Root Directory: `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
4. Deploy

#### Netlify

1. Connect repository
2. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

---

## Option 3: VPS Deployment (Ubuntu)

### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional but recommended)
- SSH access

### Backend Setup

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y python3-pip python3-venv ffmpeg nginx

# Install yt-dlp
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Clone repository
git clone <repository-url>
cd clip-finder/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set environment variable
echo "export OPENROUTER_API_KEY='your-key-here'" >> ~/.bashrc
source ~/.bashrc

# Run with systemd
sudo nano /etc/systemd/system/clipfinder-backend.service
```

Add this content:
```ini
[Unit]
Description=Clip Finder Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/clip-finder/backend
Environment="OPENROUTER_API_KEY=your-key-here"
ExecStart=/home/ubuntu/clip-finder/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable clipfinder-backend
sudo systemctl start clipfinder-backend
```

### Frontend Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Navigate to frontend
cd /home/ubuntu/clip-finder/frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://your-server-ip:8000" > .env.local

# Build
npm run build

# Run with PM2
sudo npm install -g pm2
pm2 start npm --name "clipfinder-frontend" -- start
pm2 save
pm2 startup
```

### Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/clipfinder
```

Add configuration:
```nginx
# Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 500M;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/clipfinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## Environment Variables Reference

### Backend
- `OPENROUTER_API_KEY` - Required for AI embeddings

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

---

## Monitoring

### Check Backend Status
```bash
# Docker
docker-compose logs backend

# Systemd
sudo systemctl status clipfinder-backend
journalctl -u clipfinder-backend -f

# PM2 (if used)
pm2 logs clipfinder-backend
```

### Check Frontend Status
```bash
# Docker
docker-compose logs frontend

# PM2
pm2 logs clipfinder-frontend
```

---

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
```

**FFmpeg not found:**
```bash
sudo apt-get install -y ffmpeg
which ffmpeg
```

**Whisper installation fails:**
```bash
pip install --upgrade pip setuptools wheel
pip install openai-whisper
```

### Frontend Issues

**Build fails:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**API connection errors:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS settings in backend

---

## Performance Optimization

### Backend
- Use Gunicorn with multiple workers:
  ```bash
  gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
  ```
- Add Redis for caching
- Use CDN for video delivery

### Frontend
- Enable Next.js image optimization
- Use CDN for static assets
- Enable gzip compression in Nginx

---

## Security Hardening

1. **Firewall:**
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

2. **Rate Limiting (Nginx):**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /upload {
    limit_req zone=api_limit burst=5;
}
```

3. **SSL/TLS:**
- Use strong ciphers
- Enable HSTS
- Use TLS 1.2+

4. **Environment Variables:**
- Never commit `.env` files
- Use secrets management in production

---

## Backup Strategy

### Database/Cache
```bash
# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz cache/

# Restore
tar -xzf backup-20240101.tar.gz
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * tar -czf /backups/cache-$(date +\%Y\%m\%d).tar.gz /home/ubuntu/clip-finder/backend/cache/
```

---

## Scaling Considerations

- Use load balancer for multiple backend instances
- Implement job queue (Celery + Redis) for video processing
- Use object storage (S3, DigitalOcean Spaces) for videos
- Add database for persistent storage
- Implement caching layer (Redis/Memcached)

---

For additional help, refer to the main README.md or open an issue on GitHub.
