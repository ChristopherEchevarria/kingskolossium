import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, fetchCurrentUser } from '../../api/auth';
import { useAuthStore } from './stores/authStore';

export function LoginPage() {
  const navigate  = useNavigate();
  const { setAuth } = useAuthStore();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Both fields are required.'); return;
    }
    setLoading(true);
    try {
      const { access_token } = await loginUser({ email, password });
      localStorage.setItem('kk_token', access_token);
      const user = await fetchCurrentUser();
      setAuth({ ...user, badge_status: user.badge_status as any }, access_token);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="auth-card liquid-glass-strong ">
        <h2 className="text-2xl font-bold text-white font-mono text-center mb-6">
          Login
        </h2>

        {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}

        <div className="flex flex-col gap-6">
          <input
            type="email" placeholder=" Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input rounded-lg"
          />
          <input
            type="password" placeholder=" Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input rounded-lg"
          />
          <button
            onClick={handleSubmit} disabled={loading}
            className="auth-btn rounded-lg"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </div>

        <p className="text-center text-white/60 text-xs mt-4 font-mono">
          Don't have an account?{' '}
          <Link to="/signup" className="text-app-blue hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;