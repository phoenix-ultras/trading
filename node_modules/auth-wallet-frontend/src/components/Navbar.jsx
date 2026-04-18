import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link className="flex items-center space-x-2" to="/">
            <span className="text-2xl font-bold text-neon-green">NPX</span>
            <div className="hidden sm:block">
              <div className="text-white font-semibold">Neon Prediction Exchange</div>
              <div className="text-sm text-gray-400">Realtime signal desk</div>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <NavLink to="/" end className="text-gray-300 hover:text-neon-green transition-colors">
              Dashboard
            </NavLink>
            <NavLink to="/markets" className="text-gray-300 hover:text-neon-green transition-colors">
              Markets
            </NavLink>
            <NavLink to="/leaderboard" className="text-gray-300 hover:text-neon-green transition-colors">
              Leaderboard
            </NavLink>
            <NavLink to="/profile" className="text-gray-300 hover:text-neon-green transition-colors">
              Profile
            </NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-white font-semibold text-sm">{user?.username || 'Trader'}</div>
                <div className="text-xs text-gray-400">Online terminal</div>
              </div>
            </div>
            <button 
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={logout} 
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
