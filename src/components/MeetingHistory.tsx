import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { db } from '@/lib/db-client'

interface Meeting {
    id: string
    title: string
    date: string
    duration: number
}

export function MeetingHistory() {
    const [meetings, setMeetings] = useState<Meeting[]>([])

    useEffect(() => {
        loadMeetings()
    }, [])

    const loadMeetings = async () => {
        const data = await db.getMeetings()
        setMeetings(data)
    }

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Meeting History</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                    <Card key={meeting.id}>
                        <CardHeader>
                            <CardTitle>{meeting.title}</CardTitle>
                            <CardDescription>{new Date(meeting.date).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Duration: {Math.round(meeting.duration / 60)} mins</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
