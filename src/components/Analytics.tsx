import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { db } from '@/lib/db-client'

export function Analytics() {
    const [stats, setStats] = useState({ totalMeetings: 0, totalDuration: 0 })

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meetings = await db.getMeetings() as any[]
        const totalDuration = meetings.reduce((acc, m) => acc + (m.duration || 0), 0)
        setStats({
            totalMeetings: meetings.length,
            totalDuration: Math.round(totalDuration / 60) // in minutes
        })
    }

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMeetings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Duration (mins)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDuration}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No historical data available for visualization yet.</p>
                </CardContent>
            </Card>
        </div>
    )
}
