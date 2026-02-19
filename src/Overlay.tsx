import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudio } from '@/hooks/use-audio'
import { useIntelligence } from '@/hooks/use-intelligence'
import { TranscriptView } from '@/components/TranscriptView'
import { ControlBar } from '@/components/ControlBar'
import { SettingsModal } from '@/components/SettingsModal'
import { db } from '@/lib/db-client'
import { cn } from '@/lib/utils'

function Overlay() {
  const navigate = useNavigate()
  const {
    isRecording,
    connectionState,
    transcript,
    startRecording,
    stopRecording,
    getDesktopSources
  } = useAudio()

  const {
    insight,
    generateInsight,
    generateSummary
  } = useIntelligence()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [sources, setSources] = useState<Electron.DesktopCapturerSource[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string>('')
  const [isQuietMode, setIsQuietMode] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const loadSources = useCallback(async () => {
    const s = await getDesktopSources()
    setSources(s)
    if (s.length > 0 && !selectedSourceId) {
      setSelectedSourceId(s[0].id)
    }
  }, [getDesktopSources, selectedSourceId])

  // Load sources on mount
  useEffect(() => {
    loadSources()
  }, [loadSources])

  // Analyze context periodically (every 30s) if recording
  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => {
      const context = transcript.map(s => `[${s.speakerName || s.speaker}]: ${s.text}`).join('\n')
      if (context.length > 100) {
        generateInsight(context.slice(-2000)) // Last 2000 chars
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [isRecording, transcript, generateInsight])

  const handleStart = async () => {
    if (!selectedSourceId) {
      await loadSources()
      // ... (rest of logic)
    }
    const idToUse = selectedSourceId || (sources.length > 0 ? sources[0].id : '')
    if (idToUse) {
      await startRecording(idToUse)
    }
  }

  const handleStop = async () => {
    stopRecording()
    setIsProcessing(true)

    const fullText = transcript.map(s => `[${s.speakerName || s.speaker}]: ${s.text}`).join('\n')
    let summary = ''
    if (fullText.trim().length > 50) {
      await new Promise<void>((resolve) => {
        generateSummary(fullText, (chunk) => {
          summary += chunk
        }).then(resolve).catch(e => {
          console.error("Summary generation failed", e)
          resolve()
        })
      })
    }

    const id = await db.saveMeeting({
      title: `Meeting ${new Date().toLocaleString()}`,
      date: new Date().toISOString(),
      duration: transcript.length > 0 ? (transcript[transcript.length - 1].end - transcript[0].start) : 0,
      transcript: transcript,
      summary: summary
    }) as string

    setIsProcessing(false)
    await window.ipcRenderer.invoke('set-window-mode', 'dashboard')
    navigate(`/meetings/${id}`)
  }

  const switchToDashboard = async () => {
    await window.ipcRenderer.invoke('set-window-mode', 'dashboard')
    navigate('/')
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent font-sans text-foreground flex flex-col">
      {/* Main Glass Container */}
      <div
        className={cn(
          "flex h-full flex-col border border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-in-out",
          isQuietMode ? "opacity-30 hover:opacity-100" : "opacity-100"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header / Drag Handle */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div className="flex h-10 w-full cursor-move items-center justify-between border-b border-white/5 bg-white/5 px-4" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs font-medium text-white/70">
              {isRecording ? 'Recording Live' : 'Ready'}
            </span>
          </div>

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <div className="flex items-center gap-1 no-drag" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-white"
              onClick={() => setIsQuietMode(!isQuietMode)}
              title={isQuietMode ? "Show Transcript" : "Quiet Mode"}
            >
              {isQuietMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-white"
              onClick={switchToDashboard}
              title="Return to Dashboard"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {isProcessing ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white animate-in fade-in duration-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-white/80">Generating Summary...</p>
            </div>
          ) : (
            <div className={cn(
              "h-full w-full transition-opacity duration-300",
              isQuietMode && !isHovered ? "opacity-0" : "opacity-100"
            )}>
              <TranscriptView transcript={transcript} />
            </div>
          )}

          {/* Insights Overlay */}
          {insight && !isQuietMode && (
            <div className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-3 shadow-lg backdrop-blur-md">
                <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">AI Insight</h4>
                <p className="text-xs text-white/90 leading-relaxed">{insight}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className={cn(
          "border-t border-white/5 bg-white/5 p-4 transition-all duration-300",
          isQuietMode && !isHovered ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}>
          <ControlBar
            isRecording={isRecording}
            connectionState={connectionState}
            onStartRecording={handleStart}
            onStopRecording={handleStop}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      </div>

      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        sources={sources}
        selectedSourceId={selectedSourceId}
        onSourceChange={setSelectedSourceId}
      />
    </div>
  )
}

export default Overlay
