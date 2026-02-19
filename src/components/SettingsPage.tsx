import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { db } from "@/lib/db-client"

export function SettingsPage() {
    const [apiKey, setApiKey] = useState('')
    const [openaiKey, setOpenaiKey] = useState('')
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const settings = await db.getSettings()
        setApiKey(settings.apiKey || '')
        setOpenaiKey(settings.openaiKey || '')
    }

    const saveSettings = async () => {
        await db.setSettings({ apiKey, openaiKey })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your API keys and application preferences.</p>
            </div>
            <Separator />
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>Enter your API keys for Deepgram and OpenAI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="deepgram-key">Deepgram API Key</Label>
                            <Input
                                id="deepgram-key"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter Deepgram API Key"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="openai-key">OpenAI API Key</Label>
                            <Input
                                id="openai-key"
                                type="password"
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                placeholder="Enter OpenAI API Key"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={saveSettings}>
                            {saved ? "Saved!" : "Save Changes"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
