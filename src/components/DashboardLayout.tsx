import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Minimize, Maximize, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardLayout() {
    const minimize = () => window.ipcRenderer.send('window-minimize')
    const maximize = () => window.ipcRenderer.send('window-maximize')
    const close = () => window.ipcRenderer.send('window-close')

    return (
        <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden flex-col">
            {/* Custom Title Bar */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <div className="flex h-8 w-full items-center justify-between bg-muted/50 px-2" style={{ WebkitAppRegion: 'drag' } as any}>
                <div className="text-xs font-medium text-muted-foreground ml-2">AI Meeting Assistant</div>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <div className="flex items-center gap-1 no-drag" style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={minimize}>
                        <Minimize className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={maximize}>
                        <Maximize className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-500 hover:text-white" onClick={close}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
