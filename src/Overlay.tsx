import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAudio } from '@/hooks/use-audio'
import { useIntelligence } from '@/hooks/use-intelligence'
import { TranscriptView } from '@/components/TranscriptView'
import { ControlBar } from '@/components/ControlBar'
import { SettingsModal } from '@/components/SettingsModal'
import { db } from '@/lib/db-client'

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

  // Load sources on mount
  useEffect(() => {
    loadSources()
  }, [])

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

  const loadSources = async () => {
    const s = await getDesktopSources()
    setSources(s)
    if (s.length > 0 && !selectedSourceId) {
      setSelectedSourceId(s[0].id)
    }
  }

  const handleStart = async () => {
    if (!selectedSourceId) {
      // Refresh sources if none selected (might handle permission prompt flow here)
      await loadSources()
      if (sources.length > 0) setSelectedSourceId(sources[0].id)
      else return
    }
    // ensure we have a valid source ID before starting
    const idToUse = selectedSourceId || (sources.length > 0 ? sources[0].id : '')
    if (idToUse) {
      await startRecording(idToUse)
    }
  }

  const handleStop = async () => {
    stopRecording()
    setIsProcessing(true)

    // Generate Summary
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

    // Save to DB
    const id = await db.saveMeeting({
      title: `Meeting ${new Date().toLocaleString()}`,
      date: new Date().toISOString(),
      duration: transcript.length > 0 ? (transcript[transcript.length - 1].end - transcript[0].start) : 0,
      transcript: transcript,
      summary: summary
    }) as string

    setIsProcessing(false)

    // Switch to Dashboard
    await window.ipcRenderer.invoke('set-window-mode', 'dashboard')
    navigate(`/dashboard/meetings/${id}`)
  }

  const switchToDashboard = async () => {
    await window.ipcRenderer.invoke('set-window-mode', 'dashboard')
    navigate('/dashboard')
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent p-4 font-sans text-foreground">
      <Card className="flex h-full flex-col gap-4 border-none bg-background/30 shadow-2xl backdrop-blur-xl">
        {/* Drag Handle */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div className="h-6 w-full cursor-move rounded-t-lg bg-white/10" style={{ WebkitAppRegion: 'drag' } as any} />

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden p-4 pt-0 pb-0 relative">
          {isProcessing ? (
            <div className="flex h-full items-center justify-center text-white">
              <p>Generating Summary...</p>
            </div>
          ) : (
            !isQuietMode && <TranscriptView transcript={transcript} />
          )}
        </div>

        {/* Intelligence Overlay (Insights) */}
        {insight && (
          <div className="mx-4 rounded-md border bg-blue-500/10 p-3 text-xs backdrop-blur-md">
            <h4 className="font-bold text-blue-500 mb-1">Insights</h4>
            <p>{insight}</p>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 pt-0 relative">
          <ControlBar
            isRecording={isRecording}
            connectionState={connectionState}
            onStartRecording={handleStart}
            onStopRecording={handleStop}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/50 hover:text-white"
              onClick={() => setIsQuietMode(!isQuietMode)}
              title="Toggle Quiet Mode"
            >
              {isQuietMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/50 hover:text-white"
              onClick={switchToDashboard}
              title="Open Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>


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
