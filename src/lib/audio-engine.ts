export class AudioEngine {
    private audioContext: AudioContext | null = null;
    private micStream: MediaStream | null = null;
    private systemStream: MediaStream | null = null;
    private mixedStream: MediaStreamAudioDestinationNode | null = null;

    constructor() {
        this.audioContext = new AudioContext();
    }

    async getMicStream(): Promise<MediaStream> {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

        return this.mixedStream.stream;
    }

    stop() {
        this.micStream?.getTracks().forEach(t => t.stop());
        this.systemStream?.getTracks().forEach(t => t.stop());
        this.audioContext?.close();
        this.audioContext = null;
    }
}
