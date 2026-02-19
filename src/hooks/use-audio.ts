import { useState, useRef, useEffect } from 'react'
import { AudioEngine } from '@/lib/audio-engine'

export function useAudio() {
    const [isRecording, setIsRecording] = useState(false)
    const engine = useRef<AudioEngine | null>(null)

    useEffect(() => {
        engine.current = new AudioEngine()
        return () => {
            engine.current?.stop()
        }
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
            const micStream = await engine.current.getMicStream()
            const systemStream = await engine.current.getSystemStream(sourceId)
            const mixedStream = await engine.current.startMixing(micStream, systemStream)
            setIsRecording(true)
            return mixedStream
        } catch (e) {
            console.error('Failed to start recording:', e)
            setIsRecording(false)
            throw e
        }
    }

    const stopRecording = () => {
        if (engine.current) {
            engine.current.stop()
            setIsRecording(false)
        }
    }

    return { isRecording, startRecording, stopRecording, getDesktopSources }
}
