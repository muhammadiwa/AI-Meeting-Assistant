import Store from 'electron-store'
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

interface MeetingMetadata {
    id: string
    title: string
    date: string
    duration: number
}

interface Settings {
    apiKey: string
    openaiKey: string
    audioDeviceId: string
}

const store = new Store<{
    settings: Settings
    meetings: MeetingMetadata[]
}>({
    defaults: {
        settings: { apiKey: '', openaiKey: '', audioDeviceId: 'default' },
        meetings: [],
    },
})

export class MeetingsStore {
    private transcriptDir: string

    constructor() {
        this.transcriptDir = path.join(app.getPath('userData'), 'transcripts')
        if (!fs.existsSync(this.transcriptDir)) {
            fs.mkdirSync(this.transcriptDir, { recursive: true })
        }
    }

    getSettings() {
        return store.get('settings')
    }

    setSettings(settings: Partial<Settings>) {
        store.set('settings', { ...this.getSettings(), ...settings })
    }

    getMeetings() {
        return store.get('meetings') || []
    }

    getMeeting(id: string) {
        const meta = this.getMeetings().find((m) => m.id === id)
        if (!meta) return null

        // Load transcript
        const transcriptPath = path.join(this.transcriptDir, `${id}.json`)
        let transcript = []
        if (fs.existsSync(transcriptPath)) {
            try {
                transcript = JSON.parse(fs.readFileSync(transcriptPath, 'utf-8'))
            } catch (e) {
                console.error('Failed to parse transcript', e)
            }
        }
        return { ...meta, transcript }
    }

    saveMeeting(meeting: Partial<MeetingMetadata> & { transcript?: unknown }) {
        const id = meeting.id || crypto.randomUUID()
        const meta: MeetingMetadata = {
            id,
            title: meeting.title || `Meeting ${new Date().toLocaleString()}`,
            date: meeting.date || new Date().toISOString(),
            duration: meeting.duration || 0,
        }

        // Update metadata list
        const meetings = this.getMeetings()
        const index = meetings.findIndex((m) => m.id === id)
        if (index >= 0) {
            meetings[index] = meta
        } else {
            meetings.unshift(meta)
        }
        store.set('meetings', meetings)

        // Save full transcript to file
        if (meeting.transcript) {
            const transcriptPath = path.join(this.transcriptDir, `${id}.json`)
            fs.writeFileSync(transcriptPath, JSON.stringify(meeting.transcript, null, 2))
        }

        return id
    }

    deleteMeeting(id: string) {
        const meetings = this.getMeetings().filter((m) => m.id !== id)
        store.set('meetings', meetings)

        const transcriptPath = path.join(this.transcriptDir, `${id}.json`)
        if (fs.existsSync(transcriptPath)) {
            fs.unlinkSync(transcriptPath)
        }
    }
}
