import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/api/auth/staff/login', formData)
      localStorage.setItem('token', response.data.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-4">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex h-[600px]">
            {/* Left side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600/50 to-blue-800/50 backdrop-blur-sm p-12 flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">WeAreCars</h1>
                <p className="text-blue-100 text-lg">Your premium car rental solution</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-lg"></div>
                <img 
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80" 
                  alt="Luxury Car" 
                  className="w-full h-64 object-cover rounded-lg shadow-xl"
                />
              </div>
              <div className="text-blue-100">
                <p className="text-sm">Experience luxury on wheels</p>
                <p className="text-sm">Premium vehicles for every journey</p>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center bg-gradient-to-br from-blue-800 to-blue-900">
              <div className="lg:hidden mb-8 text-center">
                <h1 className="text-3xl font-bold text-white">WeAreCars</h1>
                <p className="text-blue-100 mt-2">Your premium car rental solution</p>
              </div>

              <div className="max-w-md mx-auto w-full">
                <h2 className="text-2xl font-bold text-white mb-8">Welcome back</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-blue-100">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-300"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-blue-100">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-300"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-white text-sm bg-indigo-900 p-4 rounded-lg text-center font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-blue-200">
                    Default credentials for testing:
                  </p>
                  <p className="text-sm text-blue-300 mt-1">
                    Username: sta001 | Password: givemethekeys123
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 