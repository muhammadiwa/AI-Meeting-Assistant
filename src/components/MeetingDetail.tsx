import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'
import { db } from '@/lib/db-client'

interface StoredSegment {
    id: string
    speaker: number
    speakerName?: string
    text: string
    start: number
    end: number
    isFinal: boolean
    confidence: number
}

interface MeetingDetail {
    id: string
    title: string
    date: string
    duration: number
    transcript: StoredSegment[]
    summary?: string
}

export function MeetingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [meeting, setMeeting] = useState<MeetingDetail | null>(null)

    useEffect(() => {
        if (id) loadMeeting(id)
    }, [id])

    const loadMeeting = async (meetingId: string) => {
        // cast to expected type
        const data = await db.getMeeting(meetingId) as MeetingDetail
        setMeeting(data)
    }

    const handleExport = () => {
        if (!meeting) return

        let content = `# ${meeting.title}\n`
        content += `Date: ${new Date(meeting.date).toLocaleString()}\n`
        content += `Duration: ${Math.round(meeting.duration / 60)} mins\n\n`

        if (meeting.summary) {
            content += `## Summary\n${meeting.summary}\n\n`
        }

        content += `## Transcript\n`
        content += meeting.transcript.map(s =>
            `**${s.speakerName || `Speaker ${s.speaker}`}** (${new Date(s.start * 1000).toISOString().substr(14, 5)}): ${s.text}`
        ).join('\n\n')

        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `meeting-${meeting.id}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    if (!meeting) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/meetings')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Meetings
                </Button>
                <Button variant="outline" onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export to Markdown
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{meeting.title}</CardTitle>
                    <CardDescription>{new Date(meeting.date).toLocaleString()} • {Math.round(meeting.duration / 60)} mins</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {meeting.summary && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Summary</h3>
                            <div className="rounded-md bg-muted p-4 whitespace-pre-wrap">
                                {meeting.summary}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Transcript</h3>
                        <div className="space-y-2">
                            {meeting.transcript && meeting.transcript.map((segment) => (
                                <div key={segment.id} className="flex gap-2">
                                    <div className="min-w-[80px] text-sm text-muted-foreground">
                                        {new Date(segment.start * 1000).toISOString().substr(14, 5)}
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-semibold mr-2">
                                            {segment.speakerName || `Speaker ${segment.speaker}`}:
                                        </span>
                                        <span>{segment.text}</span>
                                    </div>
                                </div>
                            ))}
                            {(!meeting.transcript || meeting.transcript.length === 0) && (
                                <p className="text-muted-foreground">No transcript available.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
