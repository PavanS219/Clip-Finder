import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface VideoUploadProps {
  isYouTube?: boolean
  onSuccess: (videoId: string, fileName: string) => void
  onBack: () => void
}

export default function VideoUpload({ isYouTube = false, onSuccess, onBack }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [uploadedBytes, setUploadedBytes] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [rateLimit, setRateLimit] = useState<{ remaining: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadStartTime = useRef<number>(0)

  // Load rate limit on mount
  useEffect(() => {
    loadRateLimit()
  }, [])

  const loadRateLimit = async () => {
    try {
      const response = await axios.get(`${API_URL}/rate-limit-status`)
      setRateLimit(response.data)
    } catch (err) {
      console.error('Failed to load rate limit:', err)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 500MB.')
      return
    }

    // Check file type
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
      setError('Invalid file type. Please upload a video file.')
      return
    }

    setError('')
    setSelectedFile(file)
    
    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    // Check rate limit
    if (rateLimit && rateLimit.remaining <= 0) {
      setError('Daily upload limit reached. Please try again tomorrow.')
      return
    }

    setError('')
    setUploading(true)
    setUploadProgress(0)
    uploadStartTime.current = Date.now()

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(percentCompleted)
          setUploadedBytes(progressEvent.loaded)
          setTotalBytes(progressEvent.total || 0)

          // Calculate upload speed
          const elapsedSeconds = (Date.now() - uploadStartTime.current) / 1000
          if (elapsedSeconds > 0) {
            const bytesPerSecond = progressEvent.loaded / elapsedSeconds
            setUploadSpeed(bytesPerSecond)
          }
        },
      })

      // Update rate limit
      await loadRateLimit()
      
      onSuccess(response.data.video_id, selectedFile.name)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Upload failed. Please try again.'
      setError(errorMsg)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleYouTubeUpload = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    // Check rate limit
    if (rateLimit && rateLimit.remaining <= 0) {
      setError('Daily upload limit reached. Please try again tomorrow.')
      return
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
    if (!youtubeRegex.test(youtubeUrl)) {
      setError('Please enter a valid YouTube URL')
      return
    }

    setError('')
    setUploading(true)

    try {
      const response = await axios.post(`${API_URL}/upload-url`, null, {
        params: { url: youtubeUrl }
      })

      // Update rate limit
      await loadRateLimit()

      onSuccess(response.data.video_id, 'YouTube Video')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'YouTube download failed. Please check the URL.'
      setError(errorMsg)
      setUploading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s'
  }

  const calculateETA = () => {
    if (uploadSpeed === 0 || totalBytes === 0) return 'Calculating...'
    const remainingBytes = totalBytes - uploadedBytes
    const etaSeconds = remainingBytes / uploadSpeed
    if (etaSeconds < 60) return `${Math.round(etaSeconds)}s`
    return `${Math.round(etaSeconds / 60)}m ${Math.round(etaSeconds % 60)}s`
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
            {isYouTube ? '🎥 YouTube Video' : '📤 Upload Video'}
          </h2>
          {rateLimit && (
            <p className="text-sm text-purple-300">
              {rateLimit.remaining} of {rateLimit.total} uploads remaining today
            </p>
          )}
        </div>
        <button
          onClick={onBack}
          className="text-purple-300 hover:text-white transition-all duration-200 text-sm md:text-base flex items-center gap-2 hover:gap-3"
        >
          <span>←</span> Back
        </button>
      </div>

      {isYouTube ? (
        <div className="space-y-4">
          <div>
            <label className="block text-purple-200 text-sm mb-2 font-medium">
              YouTube Video URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base transition-all"
              disabled={uploading}
            />
          </div>
          <button
            onClick={handleYouTubeUpload}
            disabled={uploading || !youtubeUrl.trim() || (rateLimit?.remaining === 0)}
            className="w-full px-6 py-3 md:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {uploading ? '⏳ Processing...' : rateLimit?.remaining === 0 ? '🚫 Limit Reached' : '📥 Process YouTube Video'}
          </button>
          <p className="text-xs md:text-sm text-slate-400 text-center">
            Processing may take 2-5 minutes depending on video length
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-purple-400 bg-purple-500/20 scale-[1.02] shadow-lg shadow-purple-500/20'
                  : 'border-slate-600 hover:border-purple-500 hover:bg-slate-700/30'
              }`}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/avi,video/mov,video/mkv,video/webm"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <div className="text-6xl md:text-7xl mb-4 animate-bounce">
                {dragActive ? '📂' : '🎬'}
              </div>
              <p className="text-white text-base md:text-lg mb-2 font-semibold">
                {dragActive ? 'Drop your video here' : 'Drag & drop video or click to browse'}
              </p>
              <p className="text-slate-400 text-xs md:text-sm">
                Supported: MP4, AVI, MOV, MKV, WEBM • Max 500MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-black rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-96 object-contain"
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null)
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  disabled={uploading}
                  className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                  ✕
                </button>
              </div>

              {/* File Info */}
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm md:text-base">
                      {selectedFile?.name}
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">
                      Size: {selectedFile ? formatBytes(selectedFile.size) : ''}
                    </p>
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleFileUpload}
                disabled={uploading || !selectedFile || (rateLimit?.remaining === 0)}
                className="w-full px-6 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {uploading ? '⏳ Uploading...' : rateLimit?.remaining === 0 ? '🚫 Limit Reached' : '🚀 Upload & Process Video'}
              </button>
            </div>
          )}

          {uploading && uploadProgress > 0 && (
            <div className="space-y-3 bg-slate-700/30 rounded-xl p-4 border border-slate-600">
              <div className="flex justify-between text-sm text-slate-300">
                <span className="font-medium">Uploading...</span>
                <span className="font-bold text-white">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-300 bg-[length:200%_100%] animate-gradient relative"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}</span>
                <span>{formatSpeed(uploadSpeed)}</span>
                <span>ETA: {calculateETA()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl backdrop-blur-sm">
          <p className="text-red-200 text-sm md:text-base flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-blue-200 text-xs md:text-sm">
          💡 <span className="font-semibold">Tip:</span> Upload videos with clear speech for best search results. Processing typically takes 1-3 minutes.
        </p>
      </div>
    </div>
  )
}
