import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export interface TranscriptionResult {
    transcript: string
    isFinal: boolean
    speaker?: number
    confidence: number
    start: number
    end: number
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export class DeepgramService {
    private client: ReturnType<typeof createClient>
    private connection: LiveClient | null = null
    private keepAliveInterval: NodeJS.Timeout | null = null
    private onStatusChange: ((status: ConnectionStatus) => void) | null = null

    constructor(apiKey: string, onStatusChange?: (status: ConnectionStatus) => void) {
        this.client = createClient(apiKey)
        this.onStatusChange = onStatusChange || null
    }

    async connect(onResult: (result: TranscriptionResult) => void) {
        this.notifyStatus('connecting')

        this.connection = this.client.listen.live({
            model: 'nova-2',
            smart_format: true,
            diarize: true,
            punctuate: true,
            interim_results: true,
            encoding: 'linear16',
            sample_rate: 48000,
            channels: 2, // Stereo mix
        })

        this.connection.on(LiveTranscriptionEvents.Open, () => {
            console.log('Deepgram connection opened')
            this.notifyStatus('connected')
            this.startKeepAlive()
        })

        this.connection.on(LiveTranscriptionEvents.Close, () => {
            console.log('Deepgram connection closed')
            this.notifyStatus('disconnected')
            this.stopKeepAlive()
        })

        this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
            const alternatives = data.channel.alternatives[0]
            if (alternatives && alternatives.transcript) {
                onResult({
                    transcript: alternatives.transcript,
                    isFinal: data.is_final,
                    speaker: alternatives.words?.[0]?.speaker,
                    confidence: alternatives.confidence,
                    start: data.start,
                    end: data.start + data.duration,
                })
            }
        })

        this.connection.on(LiveTranscriptionEvents.Error, (err) => {
            console.error('Deepgram error:', err)
            this.notifyStatus('error')
        })
    }

    sendAudio(buffer: Int16Array) {
        // WebSocket.OPEN === 1
        if (this.connection && this.connection.getReadyState() === 1) {
            this.connection.send(buffer.buffer)
        }
    }

    disconnect() {
        this.stopKeepAlive()
        if (this.connection) {
            this.connection.requestClose()
            this.connection = null
        }
        this.notifyStatus('disconnected')
    }

    private startKeepAlive() {
        this.stopKeepAlive()
        this.keepAliveInterval = setInterval(() => {
            // WebSocket.OPEN === 1
            if (this.connection && this.connection.getReadyState() === 1) {
                this.connection.keepAlive()
            }
        }, 10000)
    }

    private stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval)
            this.keepAliveInterval = null
        }
    }

    private notifyStatus(status: ConnectionStatus) {
        if (this.onStatusChange) {
            this.onStatusChange(status)
        }
    }
}
