import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">ProjectTracker</Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
            </Link>
            <Link
              to="/projects"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname.startsWith('/projects') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderKanban className="h-4 w-4 mr-1" /> Projects
            </Link>
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
              <span className="text-sm text-gray-600">{user.name}</span>
              <button onClick={logout} className="text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
