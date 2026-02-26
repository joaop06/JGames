import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { RealtimeProvider } from './context/RealtimeContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Games from './pages/Games'
import TicTacToeLobby from './pages/TicTacToeLobby'
import TicTacToeMatch from './pages/TicTacToeMatch'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}>Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <RealtimeProvider>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="friends" element={<Navigate to="/profile" replace />} />
        <Route path="games" element={<Games />} />
        <Route path="games/tic-tac-toe" element={<TicTacToeLobby />} />
        <Route path="games/tic-tac-toe/match/:matchId" element={<TicTacToeMatch />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </RealtimeProvider>
  )
}
