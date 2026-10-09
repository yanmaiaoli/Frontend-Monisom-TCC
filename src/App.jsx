import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Teachers from './pages/Teachers.jsx'
import Classes from './pages/Classes.jsx'
import Allocations from './pages/Allocations.jsx'

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
          <Route index element={<Navigate to="/professores" replace />} />
          <Route path="professores" element={<Teachers />} />
          <Route path="turmas" element={<Classes />} />
          <Route path="lotacao" element={<Allocations />} />
          <Route path="lotacao" element={<div>Lotação (em breve)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
