export class AudioEngine {
    private audioContext: AudioContext | null = null;
    private micStream: MediaStream | null = null;
    private systemStream: MediaStream | null = null;
    private mixedStream: MediaStreamAudioDestinationNode | null = null;

    private processor: ScriptProcessorNode | null = null;
    private onAudioData: ((data: Int16Array) => void) | null = null;

    constructor(onAudioData?: (data: Int16Array) => void) {
        this.audioContext = new AudioContext();
        this.onAudioData = onAudioData || null;
    }

    async getMicStream(deviceId?: string): Promise<MediaStream> {
        const constraints: MediaStreamConstraints = {
            audio: deviceId ? { deviceId: { exact: deviceId } } : true
        };
        this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
        return this.micStream;
    }

    async getSystemStream(sourceId: string): Promise<MediaStream> {
        try {
            this.systemStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sourceId,
                    },
                } as unknown as MediaTrackConstraints,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sourceId,
                    },
                } as unknown as MediaTrackConstraints,
            });
            return this.systemStream;
        } catch (e) {
            console.error('Error getting system stream:', e);
            throw e;
        }
    }

    async startMixing(micStream: MediaStream, systemStream: MediaStream): Promise<MediaStream> {
        if (!this.audioContext) this.audioContext = new AudioContext();
        if (this.audioContext.state === 'suspended') await this.audioContext.resume();

        const micSource = this.audioContext.createMediaStreamSource(micStream);
        const systemSource = this.audioContext.createMediaStreamSource(systemStream);
        this.mixedStream = this.audioContext.createMediaStreamDestination();

        micSource.connect(this.mixedStream);
        systemSource.connect(this.mixedStream);

        // Create processor to extract raw audio data
        this.processor = this.audioContext.createScriptProcessor(4096, 2, 2);
        this.processor.onaudioprocess = (e) => {
            if (!this.onAudioData) return;
            const inputBuffer = e.inputBuffer;
            const left = inputBuffer.getChannelData(0);
            const right = inputBuffer.getChannelData(1);

            // Interleave channels and convert to Int16
            const interleaved = new Int16Array(left.length * 2);
            for (let i = 0; i < left.length; i++) {
                interleaved[i * 2] = Math.max(-1, Math.min(1, left[i])) * 0x7FFF;
                interleaved[i * 2 + 1] = Math.max(-1, Math.min(1, right[i])) * 0x7FFF;
            }
            this.onAudioData(interleaved);
        };

        // Connect mixed output to processor, and processor to destination (to keep it alive)
        const mixedSource = this.audioContext.createMediaStreamSource(this.mixedStream.stream);
        mixedSource.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        return this.mixedStream.stream;
    }

    stop() {
        this.micStream?.getTracks().forEach(t => t.stop());
        this.systemStream?.getTracks().forEach(t => t.stop());
        this.processor?.disconnect();
        this.processor = null;
        this.audioContext?.close();
        this.audioContext = null;
    }
}
