/***
Path:/kingskolossium/src/features/auth/SignupPage.tsx
***/

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, fetchCurrentUser } from '../../api/auth';
import { useAuthStore } from './stores/authStore';
import type { BadgeStatus } from './stores/authStore';

interface Req { label: string; met: boolean; }

function usePasswordRequirements(password: string, confirm: string) {
  return useMemo((): Req[] => [
    { label: 'At least 8 characters',    met: password.length >= 8 },
    { label: 'At least 1 uppercase',     met: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase',     met: /[a-z]/.test(password) },
    { label: 'At least 1 number',        met: /[0-9]/.test(password) },
    { label: 'At least 1 special char',  met: /[^A-Za-z0-9]/.test(password) },
    { label: 'Passwords match',          met: password.length > 0 && password === confirm },
  ], [password, confirm]);
}

export function SignupPage() {
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();

  const [nickname, setNickname] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [touched,  setTouched]  = useState(false);

  const requirements = usePasswordRequirements(password, confirm);
  const allMet       = requirements.every(r => r.met);

  async function handleSubmit() {
    setTouched(true);
    setError('');
    if (!nickname.trim() || !email.trim()) { setError('All fields are required.'); return; }
    if (!allMet) { setError('Please meet all password requirements.'); return; }

    setLoading(true);
    try {
      const { access_token } = await registerUser({ nickname, email, password });
      localStorage.setItem('kk_token', access_token);
      const user = await fetchCurrentUser();
      setAuth({ ...user, badge_status: user.badge_status as BadgeStatus }, access_token);
      navigate('/');
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="auth-card liquid-glass-strong">

        <h2 className="text-2xl font-bold text-white font-mono text-center mb-6">
          Sign Up
        </h2>

        {error && (
          <p className="text-red-400 text-xs text-center mb-4 font-mono">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="auth-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setTouched(true); }}
            className="auth-input"
          />

          {/* Live requirements — only show once user starts typing */}
          {touched && (
            <ul className="flex flex-col gap-1 px-1">
              {requirements.map((r) => (
                <li
                  key={r.label}
                  className={`flex items-center gap-2 text-xs font-mono transition-colors duration-200
                    ${r.met ? 'text-green-400' : 'text-red-400'}`}
                >
                  <span className="text-[10px]">{r.met ? '✓' : '✗'}</span>
                  {r.label}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !allMet}
            className={`w-full py-3 rounded-lg font-mono font-bold text-sm text-white
                        transition-colors duration-200
                        ${allMet
                          ? 'bg-app-blue hover:bg-app-dark-blue cursor-pointer'
                          : 'bg-gray-500 cursor-not-allowed opacity-60'
                        }`}
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-white/60 text-xs mt-4 font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-app-blue hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  );
}

export default SignupPage;