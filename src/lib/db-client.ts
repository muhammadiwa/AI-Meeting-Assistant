export const db = {
    getMeetings: async () => window.ipcRenderer.invoke('get-meetings'),
    getMeeting: async (id: string) => window.ipcRenderer.invoke('get-meeting', id),
    saveMeeting: async (data: unknown) => window.ipcRenderer.invoke('save-meeting', data),
    deleteMeeting: async (id: string) => window.ipcRenderer.invoke('delete-meeting', id),
    getSettings: async () => window.ipcRenderer.invoke('get-settings'),
    setSettings: async (data: unknown) => window.ipcRenderer.invoke('set-settings', data),
}
