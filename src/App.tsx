import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Overlay from './Overlay'
import { DashboardLayout } from '@/components/DashboardLayout'
import { MeetingHistory } from '@/components/MeetingHistory'
import { MeetingDetail } from '@/components/MeetingDetail'
import { SettingsPage } from '@/components/SettingsPage'
import { Analytics } from '@/components/Analytics'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/overlay" element={<Overlay />} />
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Analytics />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="meetings" element={<MeetingHistory />} />
                    <Route path="meetings/:id" element={<MeetingDetail />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
