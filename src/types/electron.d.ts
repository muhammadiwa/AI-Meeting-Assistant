export interface IpcRenderer {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>
    send(channel: string, ...args: unknown[]): void
    on(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void
    off(channel: string, listener: (...args: unknown[]) => void): void
}

declare global {
    interface Window {
        ipcRenderer: IpcRenderer & {
            invoke(channel: 'set-window-mode', mode: 'overlay' | 'dashboard'): Promise<void>
        }
    }
}
