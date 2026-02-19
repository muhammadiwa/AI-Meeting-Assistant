import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TranscriptSegment } from '@/lib/transcript-manager'

interface TranscriptViewProps {
    transcript: TranscriptSegment[]
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
    const scrollEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [transcript])

    return (
        <ScrollArea className="h-full w-full rounded-md border bg-black/40 backdrop-blur-md p-4 shadow-inner">
            <div className="flex flex-col gap-3">
                {transcript.map((segment, index) => (
                    <div key={segment.id} className="flex flex-col gap-1">
                        {/* Only show speaker if it changed from previous segment */}
                        {(index === 0 || transcript[index - 1].speaker !== segment.speaker) && (
                            <span className="text-xs font-semibold text-muted-foreground">
                                {segment.speakerName || `Speaker ${segment.speaker}`}
                            </span>
                        )}
                        <p className={`text-sm leading-relaxed ${segment.isFinal ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                            {segment.text}
                        </p>
                    </div>
                ))}
                <div ref={scrollEndRef} />
            </div>
        </ScrollArea>
    )
}
