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

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await db.getSettings()
            setApiKey(settings.apiKey || '')
            setOpenaiKey(settings.openaiKey || '')
        }
        if (open) {
            loadSettings()
        }
    }, [open])

    const saveSettings = async () => {
        await db.setSettings({ apiKey, openaiKey })
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
                        <Label>Audio Source</Label>
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
