import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, History, Settings, MonitorPlay } from 'lucide-react'

export function Sidebar() {
    const location = useLocation()

    const items = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: History, label: 'Meetings', href: '/meetings' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ]

    const switchToOverlay = async () => {
        await window.ipcRenderer.invoke('set-window-mode', 'overlay')
        // We might need to ensure navigation happens if we use hash router or similar
    }

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card p-4">
            <div className="mb-8 flex items-center gap-2 px-2">
                <div className="h-6 w-6 rounded-full bg-primary" />
                <span className="text-lg font-bold">AI Assistant</span>
            </div>

            <div className="flex-1 space-y-1">
                {items.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link key={item.href} to={item.href}>
                            <Button
                                variant={location.pathname === item.href ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    )
                })}
            </div>

            <div className="mt-auto">
                <Link to="/overlay">
                    <Button
                        variant="default"
                        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all hover:scale-105"
                        onClick={switchToOverlay}
                    >
                        <MonitorPlay className="h-4 w-4" />
                        Start Meeting
                    </Button>
                </Link>
            </div>
        </div>
    )
}
