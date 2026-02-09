import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface VideoSearchProps {
  videoId: string
  onBack: () => void
}

interface SearchResult {
  timestamp: number
  text: string
  score: number
  end?: number
  frame_url?: string
  search_type?: string
}

interface Bookmark {
  timestamp: number
  note: string
  created_at: string
}

interface SearchHistoryItem {
  query: string
  timestamp: string
  results_count: number
}

interface ClipPreview {
  startTime: number
  endTime: number
  clipUrl: string
  filename: string
  show: boolean
}

export default function VideoSearch({ videoId, onBack }: VideoSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'bookmarks' | 'history'>('search')
  const [showBookmarkForm, setShowBookmarkForm] = useState<number | null>(null)
  const [bookmarkNote, setBookmarkNote] = useState('')
  const [clipPreview, setClipPreview] = useState<ClipPreview>({
    startTime: 0,
    endTime: 0,
    clipUrl: '',
    filename: '',
    show: false
  })
  const [creatingClip, setCreatingClip] = useState(false)
  
  // NEW: Search type state (default to visual for better UX)
  const [searchType, setSearchType] = useState<'text' | 'visual' | 'hybrid'>('visual')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)

  // Load bookmarks and history on mount
  useEffect(() => {
    loadBookmarks()
    loadSearchHistory()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play()
            } else {
              videoRef.current.pause()
            }
          }
          break
        case 'arrowleft':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
          }
          break
        case 'arrowright':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const loadBookmarks = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookmarks/${videoId}`)
      setBookmarks(response.data.bookmarks || [])
    } catch (err) {
      console.error('Failed to load bookmarks:', err)
    }
  }

  const loadSearchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/search-history/${videoId}`)
      setSearchHistory(response.data.history || [])
    } catch (err) {
      console.error('Failed to load search history:', err)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setError('')
    setSearching(true)

    try {
      // FIXED: Now includes search_type parameter
      const response = await axios.post(`${API_URL}/search`, {
        video_id: videoId,
        query: query,
        search_type: searchType, // 'text', 'visual', or 'hybrid'
        top_k: 10
      })

      setResults(response.data.results || [])
      setActiveTab('search')
      
      loadSearchHistory()
      
      if (response.data.results?.length === 0) {
        setError('No results found. Try a different search query.')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleJumpToTimestamp = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      videoRef.current.play()
      // Smooth scroll to video
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handlePreviewClip = async (timestamp: number, endTime?: number) => {
    const start = Math.max(0, timestamp - 5)
    const end = endTime ? Math.min(endTime + 5, timestamp + 30) : timestamp + 25

    setCreatingClip(true)
    
    try {
      const response = await axios.post(`${API_URL}/create-clip`, {
        video_id: videoId,
        start_time: start,
        end_time: end
      })

      const clipUrl = `${API_URL}${response.data.clip_url}`
      
      setClipPreview({
        startTime: start,
        endTime: end,
        clipUrl: clipUrl,
        filename: response.data.filename,
        show: true
      })
    } catch (err: any) {
      alert('Failed to create clip: ' + (err.response?.data?.detail || 'Unknown error'))
    } finally {
      setCreatingClip(false)
    }
  }

  const handleDownloadClip = () => {
    window.open(clipPreview.clipUrl, '_blank')
  }

  const closePreview = () => {
    setClipPreview({ ...clipPreview, show: false })
  }

  const handleAddBookmark = async (timestamp: number) => {
    try {
      await axios.post(`${API_URL}/bookmarks`, {
        video_id: videoId,
        timestamp,
        note: bookmarkNote
      })
      
      loadBookmarks()
      setShowBookmarkForm(null)
      setBookmarkNote('')
    } catch (err) {
      alert('Failed to add bookmark')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Video Player */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <video
          ref={videoRef}
          src={`${API_URL}/video/${videoId}`}
          controls
          className="w-full bg-black"
          style={{ maxHeight: '70vh' }}
        />
      </div>

      {/* Search Section with TYPE TOGGLE */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            🔍 Search Video
          </h2>
          <button
            onClick={onBack}
            className="text-purple-300 hover:text-white transition-all duration-200 text-sm md:text-base flex items-center gap-2 hover:gap-3"
          >
            <span>←</span> New Video
          </button>
        </div>

        {/* NEW: Search Type Toggle Buttons */}
        <div className="mb-4">
          <label className="block text-purple-200 text-sm mb-2 font-medium">
            Search Mode:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSearchType('visual')}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                searchType === 'visual'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white scale-105 shadow-lg shadow-pink-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">👁️</span>
                <span>Visual</span>
                <span className="text-xs opacity-75">(Images)</span>
              </div>
            </button>
            
            <button
              onClick={() => setSearchType('text')}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                searchType === 'text'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-105 shadow-lg shadow-blue-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">💬</span>
                <span>Text</span>
                <span className="text-xs opacity-75">(Speech)</span>
              </div>
            </button>
            
            <button
              onClick={() => setSearchType('hybrid')}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                searchType === 'hybrid'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white scale-105 shadow-lg shadow-purple-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">🔀</span>
                <span>Hybrid</span>
                <span className="text-xs opacity-75">(Both)</span>
              </div>
            </button>
          </div>
          
          {/* Helper text based on mode */}
          <div className="mt-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600">
            {searchType === 'visual' && (
              <p className="text-xs md:text-sm text-purple-200">
                <strong>👁️ Visual Search:</strong> Searches for images/scenes matching your description (e.g., "lady holding food", "person sitting", "red car")
              </p>
            )}
            {searchType === 'text' && (
              <p className="text-xs md:text-sm text-blue-200">
                <strong>💬 Text Search:</strong> Searches through the spoken words in the video (e.g., "when they talk about studying", "discussion about breakfast")
              </p>
            )}
            {searchType === 'hybrid' && (
              <p className="text-xs md:text-sm text-purple-200">
                <strong>🔀 Hybrid Search:</strong> Combines both visual and text search. Good for complex queries, but may return more results.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              searchType === 'visual' 
                ? 'Describe what you see (e.g., "lady holding food")' 
                : searchType === 'text'
                ? 'What was said? (e.g., "breakfast conversation")'
                : 'Search by image or speech...'
            }
            className="flex-1 px-4 py-3 md:py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base transition-all"
            disabled={searching}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all font-semibold text-sm md:text-base shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {searching ? '⏳' : '🔍'}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 md:p-4 bg-red-500/20 border-2 border-red-500 rounded-xl">
            <p className="text-red-200 text-sm md:text-base flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Clip Preview Modal */}
      {clipPreview.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-white">
                🎬 Clip Preview
              </h3>
              <button
                onClick={closePreview}
                className="text-slate-400 hover:text-white text-2xl md:text-3xl transition-colors"
              >
                ✕
              </button>
            </div>

            <video
              ref={previewVideoRef}
              src={clipPreview.clipUrl}
              controls
              autoPlay
              className="w-full rounded-xl bg-black mb-4 shadow-xl"
              style={{ maxHeight: '60vh' }}
            />

            <div className="bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-600">
              <p className="text-slate-300 text-sm mb-2">
                <strong className="text-white">Time Range:</strong> {formatTime(clipPreview.startTime)} - {formatTime(clipPreview.endTime)}
              </p>
              <p className="text-slate-300 text-sm">
                <strong className="text-white">Duration:</strong> {Math.round(clipPreview.endTime - clipPreview.startTime)}s
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadClip}
                className="flex-1 px-6 py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                📥 Download Clip
              </button>
              <button
                onClick={closePreview}
                className="px-6 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-semibold text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results / Bookmarks / History Tabs */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-4 py-3 text-sm md:text-base font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-slate-400 hover:bg-slate-700/30 hover:text-white'
            }`}
          >
            🔍 Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 px-4 py-3 text-sm md:text-base font-semibold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-slate-400 hover:bg-slate-700/30 hover:text-white'
            }`}
          >
            🔖 Bookmarks ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm md:text-base font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-slate-400 hover:bg-slate-700/30 hover:text-white'
            }`}
          >
            📜 History
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Search Results Tab */}
          {activeTab === 'search' && (
            <div className="space-y-3 md:space-y-4">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/30 rounded-xl p-3 md:p-4 hover:bg-slate-700/50 transition-all border border-slate-600 hover:border-purple-500/50"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <button
                            onClick={() => handleJumpToTimestamp(result.timestamp)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-full text-white text-xs md:text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                          >
                            ⏱️ {formatTime(result.timestamp)}
                          </button>
                          <span className="text-purple-300 text-xs md:text-sm font-medium">
                            Match: {Math.round(result.score * 100)}%
                          </span>
                          {/* NEW: Show search type badge */}
                          {result.search_type && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              result.search_type === 'visual' 
                                ? 'bg-pink-600/30 text-pink-200 border border-pink-500/50' 
                                : 'bg-blue-600/30 text-blue-200 border border-blue-500/50'
                            }`}>
                              {result.search_type === 'visual' ? '👁️ Visual' : '💬 Text'}
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm md:text-base leading-relaxed">{result.text}</p>
                      </div>
                      <div className="flex gap-2 md:flex-col md:gap-2">
                        <button
                          onClick={() => handlePreviewClip(result.timestamp, result.end)}
                          disabled={creatingClip}
                          className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg text-xs md:text-sm transition-all font-semibold whitespace-nowrap shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                        >
                          {creatingClip ? '⏳' : '🎬'} Preview
                        </button>
                        <button
                          onClick={() => setShowBookmarkForm(index)}
                          className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm transition-all font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
                        >
                          🔖 Save
                        </button>
                      </div>
                    </div>

                    {showBookmarkForm === index && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <input
                          type="text"
                          value={bookmarkNote}
                          onChange={(e) => setBookmarkNote(e.target.value)}
                          placeholder="Add note (optional)"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddBookmark(result.timestamp)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all"
                          >
                            Save Bookmark
                          </button>
                          <button
                            onClick={() => {
                              setShowBookmarkForm(null)
                              setBookmarkNote('')
                            }}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-semibold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-slate-400 text-sm md:text-base">
                    {searching ? 'Searching...' : 'No results yet. Try searching above!'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3 md:space-y-4">
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/30 rounded-xl p-3 md:p-4 hover:bg-slate-700/50 transition-all border border-slate-600"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <button
                          onClick={() => handleJumpToTimestamp(bookmark.timestamp)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-xs md:text-sm font-semibold mb-2 shadow-md hover:shadow-lg transition-all"
                        >
                          ⏱️ {formatTime(bookmark.timestamp)}
                        </button>
                        {bookmark.note && (
                          <p className="text-white text-sm md:text-base mt-2">{bookmark.note}</p>
                        )}
                        <p className="text-slate-400 text-xs mt-1">
                          {formatDateTime(bookmark.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePreviewClip(bookmark.timestamp)}
                        disabled={creatingClip}
                        className="px-3 md:px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg text-xs md:text-sm transition-all font-semibold shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                      >
                        {creatingClip ? '⏳' : '🎬'} Preview
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-slate-400 text-sm md:text-base">
                    No bookmarks yet. Save interesting moments while searching!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-2 md:space-y-3">
              {searchHistory.length > 0 ? (
                searchHistory.slice().reverse().map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/30 rounded-xl p-3 md:p-4 hover:bg-slate-700/50 transition-all cursor-pointer border border-slate-600 hover:border-purple-500/50"
                    onClick={() => {
                      setQuery(item.query)
                      setActiveTab('search')
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm md:text-base mb-1">{item.query}</p>
                        <p className="text-slate-400 text-xs">
                          {formatDateTime(item.timestamp)} • {item.results_count} results
                        </p>
                      </div>
                      <button className="text-purple-300 hover:text-white text-xs md:text-sm font-semibold">
                        Rerun →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📜</div>
                  <p className="text-slate-400 text-sm md:text-base">
                    Your search history will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-xl border border-blue-500/20">
        <h3 className="text-base md:text-lg font-bold text-white mb-3">
          💡 Pro Tips
        </h3>
        <ul className="space-y-2 text-blue-200 text-xs md:text-sm">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Visual search</strong> works best for describing scenes, objects, or people (e.g., "lady holding food", "two people talking")</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Text search</strong> is perfect for finding what was said (e.g., "breakfast conversation", "talk about studying")</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Hybrid mode</strong> combines both for comprehensive results, but may return more matches</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Click timestamps to jump instantly • Preview clips before downloading • Use keyboard: Space (play/pause), Arrows (skip)</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
