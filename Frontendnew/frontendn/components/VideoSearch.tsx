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
  const videoRef = useRef<HTMLVideoElement>(null)

  // Load bookmarks and history on mount
  useEffect(() => {
    loadBookmarks()
    loadSearchHistory()
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
      const response = await axios.post(`${API_URL}/search`, {
        video_id: videoId,
        query: query
      })

      setResults(response.data.results || [])
      setActiveTab('search')
      
      // Reload search history
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
    }
  }

  const handleCreateClip = async (timestamp: number, endTime?: number) => {
    const start = Math.max(0, timestamp - 5)
    const end = endTime ? Math.min(endTime + 5, timestamp + 30) : timestamp + 25

    try {
      const response = await axios.post(`${API_URL}/create-clip`, {
        video_id: videoId,
        start_time: start,
        end_time: end
      })

      const clipUrl = `${API_URL}${response.data.clip_url}`
      window.open(clipUrl, '_blank')
    } catch (err: any) {
      alert('Failed to create clip: ' + (err.response?.data?.detail || 'Unknown error'))
    }
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

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search Interface */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            🔍 Search Video
          </h2>
          <button
            onClick={onBack}
            className="text-purple-200 hover:text-white transition-colors text-sm md:text-base whitespace-nowrap"
          >
            ← New Video
          </button>
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., 'when they discuss AI' or 'funny moment'"
            className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm md:text-base whitespace-nowrap"
          >
            {searching ? '⏳ Searching...' : '🔍 Search'}
          </button>
        </div>

        {error && (
          <div className="p-3 md:p-4 bg-red-500/20 border border-red-500 rounded-lg mb-6">
            <p className="text-red-200 text-sm md:text-base">❌ {error}</p>
          </div>
        )}

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-4 md:mb-6">
          <video
            ref={videoRef}
            controls
            className="w-full"
            src={`${API_URL}/video/${videoId}`}
          >
            Your browser does not support video playback.
          </video>
        </div>

        {/* Example queries */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs md:text-sm text-purple-200">Try:</span>
          {['introduction', 'key points', 'conclusion', 'examples'].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-purple-200 rounded-full text-xs md:text-sm transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-4 py-3 text-sm md:text-base font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-purple-600 text-white'
                : 'text-purple-200 hover:bg-white/5'
            }`}
          >
            🔍 Results {results.length > 0 && `(${results.length})`}
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 px-4 py-3 text-sm md:text-base font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-purple-600 text-white'
                : 'text-purple-200 hover:bg-white/5'
            }`}
          >
            📚 Bookmarks {bookmarks.length > 0 && `(${bookmarks.length})`}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm md:text-base font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'text-purple-200 hover:bg-white/5'
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
                    className="bg-white/10 rounded-lg p-3 md:p-4 hover:bg-white/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <button
                            onClick={() => handleJumpToTimestamp(result.timestamp)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-full text-white text-xs md:text-sm font-medium transition-colors"
                          >
                            ⏱️ {formatTime(result.timestamp)}
                          </button>
                          <span className="text-purple-200 text-xs md:text-sm">
                            Match: {Math.round(result.score * 100)}%
                          </span>
                        </div>
                        <p className="text-white text-sm md:text-base leading-relaxed">{result.text}</p>
                      </div>
                      <div className="flex gap-2 md:flex-col md:gap-2">
                        <button
                          onClick={() => handleCreateClip(result.timestamp, result.end)}
                          className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap"
                        >
                          📥 Clip
                        </button>
                        <button
                          onClick={() => setShowBookmarkForm(index)}
                          className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap"
                        >
                          🔖 Save
                        </button>
                      </div>
                    </div>

                    {showBookmarkForm === index && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <input
                          type="text"
                          value={bookmarkNote}
                          onChange={(e) => setBookmarkNote(e.target.value)}
                          placeholder="Add note (optional)"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-purple-200 text-sm mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddBookmark(result.timestamp)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Save Bookmark
                          </button>
                          <button
                            onClick={() => {
                              setShowBookmarkForm(null)
                              setBookmarkNote('')
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-purple-200 text-sm md:text-base">
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
                    className="bg-white/10 rounded-lg p-3 md:p-4 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <button
                          onClick={() => handleJumpToTimestamp(bookmark.timestamp)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-xs md:text-sm font-medium mb-2"
                        >
                          ⏱️ {formatTime(bookmark.timestamp)}
                        </button>
                        {bookmark.note && (
                          <p className="text-white text-sm md:text-base mt-2">{bookmark.note}</p>
                        )}
                        <p className="text-purple-300 text-xs mt-1">
                          {formatDateTime(bookmark.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCreateClip(bookmark.timestamp)}
                        className="px-3 md:px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs md:text-sm transition-colors"
                      >
                        📥 Clip
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-purple-200 text-sm md:text-base">
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
                    className="bg-white/10 rounded-lg p-3 md:p-4 hover:bg-white/20 transition-colors cursor-pointer"
                    onClick={() => {
                      setQuery(item.query)
                      setActiveTab('search')
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm md:text-base mb-1">{item.query}</p>
                        <p className="text-purple-300 text-xs">
                          {formatDateTime(item.timestamp)} • {item.results_count} results
                        </p>
                      </div>
                      <button className="text-purple-200 hover:text-white text-xs md:text-sm">
                        Rerun →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-purple-200 text-sm md:text-base">
                    Your search history will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3">
          💡 How to use
        </h3>
        <ul className="space-y-2 text-purple-200 text-xs md:text-sm">
          <li className="flex gap-2">
            <span>•</span>
            <span>Use natural language to search (e.g., "when they laugh" or "technical explanation")</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Click timestamps to jump to that moment in the video</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Download 30-second clips of relevant moments</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Save bookmarks for quick access to important parts</span>
          </li>
        </ul>
      </div>
    </div>
  )
}