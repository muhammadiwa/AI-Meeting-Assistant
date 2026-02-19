import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Overlay from './Overlay'
import { DashboardLayout } from '@/components/DashboardLayout'
import { MeetingHistory } from '@/components/MeetingHistory'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Overlay />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<MeetingHistory />} />
                    <Route path="meetings" element={<MeetingHistory />} />
                    <Route path="settings" element={<div>Settings Placeholder</div>} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
