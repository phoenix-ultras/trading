import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialState = {
  email: '',
  password: ''
};

function LoginPage() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || '';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from || '/', { replace: true });
    } catch (submitError) {
      setError(submitError.data?.message || 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg text-light-text flex items-center justify-center px-4">
      <form className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-full max-w-md" onSubmit={handleSubmit}>
        <div className="text-center mb-8">
          <span className="text-neon-green text-sm font-semibold">Prediction trading terminal</span>
          <h1 className="text-3xl font-bold text-white mt-2">Log In</h1>
          <p className="text-gray-400 mt-2">
            Reconnect to your neon desk, live markets, and trading wallet.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 outline-none transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 outline-none transition-all"
              placeholder="Enter your password"
              required
              minLength={8}
            />
          </div>
        </div>

        {successMessage ? <div className="bg-green-900/50 text-green-400 p-3 rounded-lg mt-4">{successMessage}</div> : null}
        {error ? <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mt-4">{error}</div> : null}

        <button 
          className="w-full bg-neon-green hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition-all duration-300 mt-6 shadow-lg hover:shadow-neon-green/50"
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Connecting...' : 'Enter terminal'}
        </button>

        <p className="text-center text-gray-400 mt-6">
          No account yet? <Link to="/signup" className="text-neon-green hover:text-green-400 transition-colors">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
