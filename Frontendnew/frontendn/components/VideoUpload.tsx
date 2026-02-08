import { useState, useRef } from 'react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setError('')
    setUploading(true)
    setUploadProgress(0)

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 500MB.')
      setUploading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

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
        },
      })

      onSuccess(response.data.video_id, file.name)
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

      onSuccess(response.data.video_id, 'YouTube Video')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'YouTube download failed. Please check the URL.'
      setError(errorMsg)
      setUploading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white">
          {isYouTube ? '📺 YouTube URL' : '📤 Upload Video'}
        </h2>
        <button
          onClick={onBack}
          className="text-purple-200 hover:text-white transition-colors text-sm md:text-base"
        >
          ← Back
        </button>
      </div>

      {isYouTube ? (
        <div className="space-y-4">
          <div>
            <label className="block text-purple-200 text-sm mb-2">
              Enter YouTube video URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
              disabled={uploading}
            />
          </div>
          <button
            onClick={handleYouTubeUpload}
            disabled={uploading || !youtubeUrl.trim()}
            className="w-full px-6 py-3 md:py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm md:text-base"
          >
            {uploading ? '⏳ Processing...' : '📥 Process YouTube Video'}
          </button>
          <p className="text-xs md:text-sm text-purple-200 text-center">
            This may take a few minutes depending on video length
          </p>
        </div>
      ) : (
        <div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-purple-400 bg-purple-500/20 scale-105'
                : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
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
            <div className="text-5xl md:text-6xl mb-4">
              {uploading ? '⏳' : '📹'}
            </div>
            <p className="text-white text-base md:text-lg mb-2 font-medium">
              {dragActive ? '📂 Drop video here' : uploading ? 'Uploading...' : 'Drag & drop video or click to browse'}
            </p>
            <p className="text-purple-200 text-xs md:text-sm">
              Supported: MP4, AVI, MOV, MKV, WEBM (Max 500MB)
            </p>
          </div>

          {uploading && uploadProgress > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-purple-200">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-200 text-sm md:text-base">❌ {error}</p>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-xs md:text-sm">
          💡 <span className="font-medium">Tip:</span> Upload videos with clear speech for best results. Processing takes 1-3 minutes depending on video length.
        </p>
      </div>
    </div>
  )
}