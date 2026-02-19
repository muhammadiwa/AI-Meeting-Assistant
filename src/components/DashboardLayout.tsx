import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
    return (
        <div className="flex h-screen w-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    )
}
