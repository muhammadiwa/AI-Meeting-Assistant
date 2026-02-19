import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { db } from '@/lib/db-client'

interface Meeting {
    id: string
    title: string
    date: string
    duration: number
}

export function MeetingHistory() {
    const navigate = useNavigate()
    const [meetings, setMeetings] = useState<Meeting[]>([])

    useEffect(() => {
        loadMeetings()
    }, [])

    const loadMeetings = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await db.getMeetings() as any[]
        setMeetings(data)
    }

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Meeting History</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                    <div key={meeting.id} onClick={() => navigate(`/meetings/${meeting.id}`)} className="cursor-pointer transition-all hover:scale-[1.02]">
                        <Card>
                            <CardHeader>
                                <CardTitle>{meeting.title}</CardTitle>
                                <CardDescription>{new Date(meeting.date).toLocaleString()}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Duration: {Math.round(meeting.duration / 60)} mins</p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    )
}
