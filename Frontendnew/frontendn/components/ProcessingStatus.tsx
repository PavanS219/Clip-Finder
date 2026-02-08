import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ProcessingStatusProps {
  videoId: string
  fileName: string
  onComplete: () => void
}

interface Status {
  status: string
  progress: number
  message: string
}

const processingSteps = [
  { name: 'Extracting audio', icon: '🎵', threshold: 0.2 },
  { name: 'Transcribing', icon: '📝', threshold: 0.4 },
  { name: 'Extracting frames', icon: '🎞️', threshold: 0.6 },
  { name: 'Creating embeddings', icon: '🧠', threshold: 0.8 },
  { name: 'Finalizing', icon: '✨', threshold: 1.0 },
]

export default function ProcessingStatus({ videoId, fileName, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<Status>({
    status: 'processing',
    progress: 0,
    message: 'Starting...'
  })
  const [elapsedTime, setElapsedTime] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Timer for elapsed time
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/status/${videoId}`)
        setStatus(response.data)
        setRetryCount(0) // Reset retry count on success

        if (response.data.status === 'completed') {
          setTimeout(() => {
            onComplete()
          }, 1500)
        } else if (response.data.status === 'error') {
          // Error handled by UI
        }
      } catch (err) {
        console.error('Status check failed:', err)
        setRetryCount(prev => prev + 1)
        
        // If too many failures, show error
        if (retryCount > 5) {
          setStatus({
            status: 'error',
            progress: 0,
            message: 'Connection lost. Please refresh the page.'
          })
        }
      }
    }

    // Check status every 2 seconds
    const interval = setInterval(checkStatus, 2000)
    checkStatus() // Initial check

    return () => clearInterval(interval)
  }, [videoId, onComplete, retryCount])

  const progressPercent = Math.round(status.progress * 100)
  const currentStep = processingSteps.findIndex(step => status.progress < step.threshold)
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">
        Processing Video
      </h2>

      <div className="space-y-6">
        {/* File info */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-purple-200 text-xs md:text-sm mb-1">File</p>
          <p className="text-white font-medium text-sm md:text-base truncate">{fileName}</p>
          <p className="text-purple-300 text-xs mt-1">Video ID: {videoId}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-purple-200">{status.message}</span>
            <span className="text-white font-medium">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 md:h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-full transition-all duration-500 ease-out bg-[length:200%_100%] animate-gradient"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-purple-300">
            <span>Elapsed: {formatTime(elapsedTime)}</span>
            <span>Est. 1-3 minutes</span>
          </div>
        </div>

        {/* Processing steps */}
        {status.status === 'processing' && (
          <div className="space-y-2">
            {processingSteps.map((step, index) => {
              const isActive = currentStep === index
              const isComplete = status.progress >= step.threshold
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : isComplete
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <span className="text-xl md:text-2xl">
                    {isComplete ? '✅' : isActive ? step.icon : '⏳'}
                  </span>
                  <span
                    className={`text-sm md:text-base ${
                      isActive
                        ? 'text-white font-medium'
                        : isComplete
                        ? 'text-green-200'
                        : 'text-purple-300'
                    }`}
                  >
                    {step.name}
                  </span>
                  {isActive && (
                    <span className="ml-auto">
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Error state */}
        {status.status === 'error' && (
          <div className="p-4 md:p-6 bg-red-500/20 border-2 border-red-500 rounded-lg">
            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-3">❌</div>
              <p className="text-red-200 font-medium mb-2 text-sm md:text-base">Processing Failed</p>
              <p className="text-red-300 text-xs md:text-sm">{status.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Success state */}
        {status.status === 'completed' && (
          <div className="text-center py-6">
            <div className="text-5xl md:text-6xl mb-4 animate-bounce">✅</div>
            <p className="text-white text-lg md:text-xl font-medium mb-2">Processing complete!</p>
            <p className="text-purple-200 text-sm md:text-base">Redirecting to search...</p>
          </div>
        )}

        {/* Info message */}
        {status.status === 'processing' && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-xs md:text-sm">
              💡 <span className="font-medium">What's happening:</span> We're extracting audio, transcribing speech using Whisper AI, and creating semantic embeddings for intelligent search. This enables you to search your video using natural language!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}