import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db-client"

interface SettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sources: Electron.DesktopCapturerSource[]
    selectedSourceId: string
    onSourceChange: (id: string) => void
}

export function SettingsModal({
    open,
    onOpenChange,
    sources,
    selectedSourceId,
    onSourceChange
}: SettingsModalProps) {
    const [apiKey, setApiKey] = useState('')
    const [openaiKey, setOpenaiKey] = useState('')
    const [micDeviceId, setMicDeviceId] = useState('')
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await db.getSettings()
            setApiKey(settings.apiKey || '')
            setOpenaiKey(settings.openaiKey || '')
            setMicDeviceId(settings.micDeviceId || '')
        }

        const loadDevices = async () => {
            try {
                const send = await navigator.mediaDevices.enumerateDevices()
                setAudioDevices(send.filter(d => d.kind === 'audioinput'))
            } catch (e) {
                console.error("Failed to load audio devices", e)
            }
        }

        if (open) {
            loadSettings()
            loadDevices()
        }
    }, [open])

    const saveSettings = async () => {
        await db.setSettings({ apiKey, openaiKey, micDeviceId })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>System Audio (Screen/Window)</Label>
                        <Select value={selectedSourceId} onValueChange={onSourceChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select screen to record" />
                            </SelectTrigger>
                            <SelectContent>
                                {sources.map((source) => (
                                    <SelectItem key={source.id} value={source.id}>
                                        {source.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Microphone</Label>
                        <Select value={micDeviceId} onValueChange={setMicDeviceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select microphone" />
                            </SelectTrigger>
                            <SelectContent>
                                {audioDevices.map((device) => (
                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="grid gap-2">
                        <Label htmlFor="deepgram-key">Deepgram API Key</Label>
                        <Input
                            id="deepgram-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter Deepgram API Key"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="openai-key">OpenAI API Key</Label>
                        <Input
                            id="openai-key"
                            type="password"
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                            placeholder="Enter OpenAI API Key"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={saveSettings}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
