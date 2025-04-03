import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Cars from './pages/Cars'
import SplashScreen from './components/ui/SplashScreen'
import Bookings from './pages/Bookings'
import { NotificationProvider, Notification } from './context/NotificationContext'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/" />
  }
  return children
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <SplashScreen />
        <Notification />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          
          {/* Protected Dashboard Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cars" element={<Cars />} />
            <Route path="bookings" element={<Bookings />} />
            {/* Add other dashboard routes here */}
          </Route>
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
