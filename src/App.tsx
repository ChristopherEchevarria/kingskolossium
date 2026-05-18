/***
Path:/kingskolossium/src/App.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Root app component — routing, auth rehydration, global providers.
***/

import { useEffect }                               from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ArenaPage }             from './features/arena';
import { SignupPage, LoginPage } from './features/auth';
import { SiteHeader }            from './features/header/SiteHeader';
import { useAuthStore }          from './features/auth/stores/authStore';
import type { BadgeStatus }      from './features/auth/stores/authStore';
import { fetchCurrentUser }      from './api/auth';
import { PopupProvider }         from './features/common/popups';
import { BuildSharePage }        from './features/build/BuildSharePage';

// ── RedirectHandler — inside BrowserRouter so useNavigate works ──────────────
function RedirectHandler() {
  const navigate = useNavigate();   // ← CORRECT: called inside a component body

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      window.history.replaceState({}, '', redirect);
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return null;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser()
        .then((u) => setAuth({ ...u, badge_status: u.badge_status as BadgeStatus }, token))
        .catch(() => logout());
    }
  }, [token, user, setAuth, logout]);

  return (
    <BrowserRouter>
      <RedirectHandler />        {/* must be INSIDE BrowserRouter */}
      <SiteHeader />
      <Routes>
        <Route path="/"                element={<ArenaPage />}     />
        <Route path="/signup"          element={<SignupPage />}    />
        <Route path="/login"           element={<LoginPage />}     />
        <Route path="/build/:build_id" element={<BuildSharePage />} />
      </Routes>
      <PopupProvider />
    </BrowserRouter>
  );
}