import { useState, useRef, useEffect, useCallback } from 'react'
import { AudioEngine } from '@/lib/audio-engine'
import { DeepgramService, ConnectionStatus } from '@/lib/deepgram-service'
import { TranscriptManager, TranscriptSegment } from '@/lib/transcript-manager'
import { db } from '@/lib/db-client'

export function useAudio() {
    const [isRecording, setIsRecording] = useState(false)
    const [connectionState, setConnectionState] = useState<ConnectionStatus>('disconnected')
    const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
    const engine = useRef<AudioEngine | null>(null)
    const deepgram = useRef<DeepgramService | null>(null)
    const transcriptManager = useRef<TranscriptManager>(new TranscriptManager())

    useEffect(() => {
        // Initialize audio engine with callback to send data to Deepgram
        engine.current = new AudioEngine((data) => {
            if (deepgram.current) {
                deepgram.current.sendAudio(data)
            }
        })

        return () => {
            engine.current?.stop()
            deepgram.current?.disconnect()
        }
    }, [])

    const updateTranscriptState = useCallback(() => {
        setTranscript([...transcriptManager.current.getSegments()])
    }, [])

    const getDesktopSources = async () => {
        try {
            return await window.ipcRenderer.invoke('get-sources')
        } catch (e) {
            console.error('Failed to get sources:', e)
            return []
        }
    }

    const startRecording = async (sourceId: string) => {
        if (!engine.current) return

        try {
            // Get API Key from settings
            const settings = await db.getSettings()
            if (!settings.apiKey) {
                throw new Error('Deepgram API Key not found in settings')
            }

            // Initialize Deepgram
            deepgram.current = new DeepgramService(settings.apiKey, (status) => {
                setConnectionState(status)
            })

            await deepgram.current.connect((result) => {
                transcriptManager.current.addResult(result)
                updateTranscriptState()
            })

            // Start Audio
            const micStream = await engine.current.getMicStream()
            const systemStream = await engine.current.getSystemStream(sourceId)
            const mixedStream = await engine.current.startMixing(micStream, systemStream)

            setIsRecording(true)
            return mixedStream
        } catch (e) {
            console.error('Failed to start recording:', e)
            setIsRecording(false)
            deepgram.current?.disconnect()
            throw e
        }
    }

    const stopRecording = () => {
        if (engine.current) {
            engine.current.stop()
            deepgram.current?.disconnect()
            setIsRecording(false)
        }
    }

    const clearTranscript = () => {
        transcriptManager.current.clear()
        setTranscript([])
    }

    return {
        isRecording,
        connectionState,
        transcript,
        startRecording,
        stopRecording,
        getDesktopSources,
        clearTranscript
    }
}
