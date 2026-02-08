import { useState } from 'react'
import VideoUpload from '../components/VideoUpload'
import ProcessingStatus from '../components/ProcessingStatus'
import VideoSearch from '../components/VideoSearch'

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'youtube' | 'processing' | 'search'>('home')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleUploadSuccess = (id: string, name: string) => {
    setVideoId(id)
    setFileName(name)
    setCurrentView('processing')
  }

  const handleProcessingComplete = () => {
    setCurrentView('search')
  }

  const handleBackHome = () => {
    setCurrentView('home')
    setVideoId(null)
    setFileName('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="text-center py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          🎬 Clip Finder
        </h1>
        <p className="text-lg md:text-xl text-purple-200 mb-2">
          AI-powered video search and clip extraction
        </p>
        <p className="text-sm md:text-base text-purple-300">
          Free tool • 100% open-source • Semantic search
        </p>
      </header>

      {/* Main Content - FULLY CENTERED */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-4xl">
          {currentView === 'home' && (
            <div className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">
                Get Started
              </h2>
              <p className="text-purple-100 mb-6 text-sm md:text-base">
                Upload a video or paste a YouTube URL to begin searching for specific moments using natural language.
              </p>
              
              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-start gap-3 text-purple-100">
                  <span className="text-xl md:text-2xl">🔍</span>
                  <div>
                    <p className="font-medium text-white text-sm md:text-base">Semantic Search</p>
                    <p className="text-xs md:text-sm text-purple-200">Natural language queries</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-purple-100">
                  <span className="text-xl md:text-2xl">⏱️</span>
                  <div>
                    <p className="font-medium text-white text-sm md:text-base">Jump to Moments</p>
                    <p className="text-xs md:text-sm text-purple-200">Instant timestamp navigation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-purple-100">
                  <span className="text-xl md:text-2xl">✂️</span>
                  <div>
                    <p className="font-medium text-white text-sm md:text-base">Extract Clips</p>
                    <p className="text-xs md:text-sm text-purple-200">Download 30-second clips</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-purple-100">
                  <span className="text-xl md:text-2xl">📚</span>
                  <div>
                    <p className="font-medium text-white text-sm md:text-base">History & Bookmarks</p>
                    <p className="text-xs md:text-sm text-purple-200">Save your searches</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                  onClick={() => setCurrentView('upload')}
                  className="flex-1 px-6 py-3 md:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm md:text-base shadow-lg hover:shadow-xl"
                >
                  📤 Upload Video
                </button>
                <button 
                  onClick={() => setCurrentView('youtube')}
                  className="flex-1 px-6 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm md:text-base shadow-lg hover:shadow-xl"
                >
                  📺 Use YouTube URL
                </button>
              </div>

              {/* Info */}
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/20">
                <p className="text-xs md:text-sm text-purple-200 text-center">
                  <span className="font-medium text-white">Open Source Stack:</span> Whisper • OpenCLIP (ViT-B-32) • Sentence-Transformers • FFmpeg • yt-dlp
                </p>
              </div>
            </div>
          )}

          {currentView === 'upload' && (
            <VideoUpload 
              onSuccess={handleUploadSuccess}
              onBack={handleBackHome}
            />
          )}

          {currentView === 'youtube' && (
            <VideoUpload 
              isYouTube={true}
              onSuccess={handleUploadSuccess}
              onBack={handleBackHome}
            />
          )}

          {currentView === 'processing' && videoId && (
            <ProcessingStatus 
              videoId={videoId}
              fileName={fileName}
              onComplete={handleProcessingComplete}
            />
          )}

          {currentView === 'search' && videoId && (
            <VideoSearch 
              videoId={videoId}
              onBack={handleBackHome}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-purple-200 text-xs md:text-sm">
        <p>Made with ❤️ using 100% open-source tools</p>
      </footer>
    </div>
  )
}