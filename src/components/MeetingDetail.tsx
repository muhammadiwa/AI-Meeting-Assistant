import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db-client'
// We can reuse TranscriptView if we adapt the types, or create a simple list
// TranscriptView expects TranscriptSegment[] which has 'isFinal' etc.
// The stored transcript might be different?
// store.ts saves 'transcript' as unknown. 
// In TranscriptManager, getSegments() returns TranscriptSegment[].
// We should assume it saves that array.

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

    if (!meeting) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/meetings')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Meetings
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>{meeting.title}</CardTitle>
                    <CardDescription>{new Date(meeting.date).toLocaleString()} • {Math.round(meeting.duration / 60)} mins</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <h3 className="font-semibold">Transcript</h3>
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
