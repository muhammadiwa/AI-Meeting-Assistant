import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, History, Settings, MonitorPlay } from 'lucide-react'

export function Sidebar() {
    const location = useLocation()

    const items = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: History, label: 'Meetings', href: '/dashboard/meetings' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
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
                <Link to="/">
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={switchToOverlay}
                    >
                        <MonitorPlay className="h-4 w-4" />
                        Overlay Mode
                    </Button>
                </Link>
            </div>
        </div>
    )
}
