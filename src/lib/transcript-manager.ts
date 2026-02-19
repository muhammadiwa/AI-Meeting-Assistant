import { TranscriptionResult } from './deepgram-service'

export interface TranscriptSegment {
    id: string
    speaker: number
    text: string
    start: number
    end: number
    isFinal: boolean
    confidence: number
}

export class TranscriptManager {
    private segments: TranscriptSegment[] = []
    private interimSegment: TranscriptSegment | null = null

    addResult(result: TranscriptionResult) {
        if (result.isFinal) {
            // If we have an interim segment, remove it as it's now finalized or replaced
            this.interimSegment = null

            // Check if we can merge with the previous segment (same speaker, close time proximity)
            const lastSegment = this.segments[this.segments.length - 1]

            if (lastSegment &&
                lastSegment.speaker === result.speaker &&
                result.start - lastSegment.end < 2.0) { // 2 seconds threshold

                lastSegment.text += ' ' + result.transcript
                lastSegment.end = result.end
                lastSegment.confidence = (lastSegment.confidence + result.confidence) / 2
            } else {
                // New segment
                this.segments.push({
                    id: crypto.randomUUID(),
                    speaker: result.speaker || 0,
                    text: result.transcript,
                    start: result.start,
                    end: result.end,
                    isFinal: true,
                    confidence: result.confidence
                })
            }
        } else {
            // Update interim segment
            this.interimSegment = {
                id: 'interim',
                speaker: result.speaker || 0,
                text: result.transcript,
                start: result.start,
                end: result.end,
                isFinal: false,
                confidence: result.confidence
            }
        }
    }

    getSegments(): TranscriptSegment[] {
        if (this.interimSegment) {
            return [...this.segments, this.interimSegment]
        }
        return this.segments
    }

    getFullTranscript(): string {
        return this.getSegments()
            .map(s => `[Speaker ${s.speaker}]: ${s.text}`)
            .join('\n')
    }

    getContextWindow(windowSizeSeconds: number = 60): string {
        const now = this.interimSegment ? this.interimSegment.end : (this.segments[this.segments.length - 1]?.end || 0)
        const startTime = Math.max(0, now - windowSizeSeconds)

        return this.getSegments()
            .filter(s => s.end >= startTime)
            .map(s => `[${new Date(s.start * 1000).toISOString().substr(14, 5)}] Speaker ${s.speaker}: ${s.text}`)
            .join('\n')
    }

    clear() {
        this.segments = []
        this.interimSegment = null
    }
}
