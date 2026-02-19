import OpenAI from 'openai'

export class OpenAIService {
    private openai: OpenAI

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Valid for Electron renderer
        })
    }

    async generateInsight(context: string, onChunk: (chunk: string) => void) {
        const prompt = `
    Analyze the following meeting transcript context and extract key insights.
    Focus on:
    - Action Items
    - Key Decisions
    - Potential Risks
    
    Context:
    ${context}
    
    Provide a concise summary.
    `
        await this.streamCompletion(prompt, onChunk)
    }

    async generateAnswer(context: string, onChunk: (chunk: string) => void) {
        const prompt = `
    Based on the following meeting transcript, suggest a professional and relevant response for the user (me) to say next.
    Consider the tone and context.
    
    Context:
    ${context}
    
    Suggested Answer:
    `
        await this.streamCompletion(prompt, onChunk)
    }

    async translate(text: string, targetLang: string = 'English', onChunk: (chunk: string) => void) {
        const prompt = `
    Translate the following text to ${targetLang}.
    Maintain the original tone and meaning.
    
    Text:
    ${text}
    `
        await this.streamCompletion(prompt, onChunk)
    }

    private async streamCompletion(prompt: string, onChunk: (chunk: string) => void) {
        try {
            const stream = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                stream: true,
            })

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || ''
                if (content) {
                    onChunk(content)
                }
            }
        } catch (error) {
            console.error('OpenAI Stream Error:', error)
            throw error
        }
    }
}
