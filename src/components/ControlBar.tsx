import { Button } from '@/components/ui/button'
import { Settings, Mic, Square, Loader2 } from 'lucide-react'
import { ConnectionStatus } from '@/lib/deepgram-service'

interface ControlBarProps {
    isRecording: boolean
    connectionState: ConnectionStatus
    onStartRecording: () => void
    onStopRecording: () => void
    onOpenSettings: () => void
}

export function ControlBar({
    isRecording,
    connectionState,
    onStartRecording,
    onStopRecording,
    onOpenSettings
}: ControlBarProps) {
    const isConnecting = connectionState === 'connecting'

    return (
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-background/80 p-2 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2">
                <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="icon"
                    onClick={isRecording ? onStopRecording : onStartRecording}
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isRecording ? (
                        <Square className="h-4 w-4 fill-current" />
                    ) : (
                        <Mic className="h-4 w-4" />
                    )}
                </Button>

                <div className="flex flex-col">
                    <span className="text-xs font-medium">
                        {isRecording ? 'Recording' : 'Ready'}
                    </span>
                    <span className={`text-[10px] ${connectionState === 'connected' ? 'text-green-500' :
                        connectionState === 'error' ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                        {connectionState}
                    </span>
                </div>
            </div>

            <Button variant="ghost" size="icon" onClick={onOpenSettings}>
                <Settings className="h-4 w-4" />
            </Button>
        </div>
    )
}
