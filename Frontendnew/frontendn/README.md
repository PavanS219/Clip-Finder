# Clip Finder Frontend

Modern Next.js frontend for video search and clip extraction.

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend/README.md)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your backend URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Features

- **Drag & Drop Upload** - Easy video file uploads
- **YouTube Support** - Process videos from YouTube URLs
- **Real-time Progress** - Live processing status updates
- **Semantic Search** - Natural language video search
- **Timestamp Navigation** - Jump to relevant moments instantly
- **Clip Extraction** - Download 30-second clips
- **Responsive Design** - Works on desktop and mobile
- **Modern UI** - Custom design with animations

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Fonts**: Instrument Serif + DM Sans
- **API Client**: Axios
- **Animations**: CSS animations + transitions

## Project Structure

```
frontend/
├── pages/
│   ├── index.tsx          # Main page
│   ├── _app.tsx           # App wrapper
│   └── _document.tsx      # HTML document
├── components/
│   ├── VideoUpload.tsx    # Upload interface
│   ├── ProcessingStatus.tsx  # Progress tracker
│   └── VideoSearch.tsx    # Search & player
├── styles/
│   └── globals.css        # Global styles
├── utils/
│   └── api.ts             # API utilities
└── package.json
```

## Customization

### Color Scheme
Edit CSS variables in `styles/globals.css`:
- `--color-primary`: Main accent color
- `--color-secondary`: Secondary accent
- `--color-accent`: Highlight color

### Typography
Update font imports in `styles/globals.css` and Tailwind config.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Other Platforms
Build the production bundle and deploy the `.next` folder along with:
- `package.json`
- `next.config.js`
- `public/` directory

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
