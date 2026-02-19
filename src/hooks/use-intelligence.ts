import { useState, useRef, useCallback } from 'react'
import { OpenAIService } from '@/lib/openai-service'
import { db } from '@/lib/db-client'

export function useIntelligence() {
    const [insight, setInsight] = useState('')
    const [suggestedAnswer, setSuggestedAnswer] = useState('')
    const [translation, setTranslation] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const openai = useRef<OpenAIService | null>(null)

    const initService = async () => {
        if (!openai.current) {
            const settings = await db.getSettings()
            if (settings.openaiKey) {
                openai.current = new OpenAIService(settings.openaiKey)
            }
        }
        return openai.current
    }

    const generateInsight = useCallback(async (context: string) => {
        setIsGenerating(true)
        setInsight('')
        try {
            const service = await initService()
            if (service) {
                await service.generateInsight(context, (chunk) => {
                    setInsight(prev => prev + chunk)
                })
            }
        } catch (e) {
            console.error('Failed to generate insight:', e)
        } finally {
            setIsGenerating(false)
        }
    }, [])

    const generateAnswer = useCallback(async (context: string) => {
        setIsGenerating(true)
        setSuggestedAnswer('')
        try {
            const service = await initService()
            if (service) {
                await service.generateAnswer(context, (chunk) => {
                    setSuggestedAnswer(prev => prev + chunk)
                })
            }
        } catch (e) {
            console.error('Failed to generate answer:', e)
        } finally {
            setIsGenerating(false)
        }
    }, [])

    const translate = useCallback(async (text: string, targetLang: string) => {
        setIsGenerating(true)
        setTranslation('')
        try {
            const service = await initService()
            if (service) {
                await service.translate(text, targetLang, (chunk) => {
                    setTranslation(prev => prev + chunk)
                })
            }
        } catch (e) {
            console.error('Failed to translate:', e)
        } finally {
            setIsGenerating(false)
        }
    }, [])

    const generateSummary = useCallback(async (fullTranscript: string, onChunk: (chunk: string) => void) => {
        setIsGenerating(true)
        try {
            const service = await initService()
            if (service) {
                await service.generateSummary(fullTranscript, onChunk)
            }
        } catch (e) {
            console.error('Failed to generate summary:', e)
        } finally {
            setIsGenerating(false)
        }
    }, [])

    return {
        insight,
        suggestedAnswer,
        translation,
        isGenerating,
        generateInsight,
        generateAnswer,
        translate,
        generateSummary
    }
}
