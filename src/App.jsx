import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Teachers from './pages/Teachers.jsx'
import Classes from './pages/Classes.jsx'
import Allocations from './pages/Allocations.jsx'
import LiveMonitoring from './pages/LiveMonitoring.jsx'
import FinishedList from './pages/FinishedList.jsx'
import MonitoringDetail from './pages/MonitoringDetail.jsx'
import Indicators from './pages/Indicators.jsx'

function ProtectedRoute({ children }) {
  const { auth } = useAuth()
  return auth ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/monitoramento" replace />} />
          <Route path="monitoramento" element={<LiveMonitoring />} />
          <Route path="monitoramentos" element={<FinishedList />} />
          <Route path="monitoramentos/:id" element={<MonitoringDetail />} />
          <Route path="indicadores" element={<Indicators />} />
          <Route path="professores" element={<Teachers />} />
          <Route path="turmas" element={<Classes />} />
          <Route path="lotacao" element={<Allocations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
