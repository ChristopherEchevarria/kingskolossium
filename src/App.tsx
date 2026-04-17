/***
Path:/kingskolossium/src/App.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description:
***/

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArenaPage }             from './features/arena';
import { SignupPage, LoginPage } from './features/auth';
import { SiteHeader }            from './features/header/SiteHeader';
import { useAuthStore }          from './features/auth/stores/authStore';
import type { BadgeStatus } from './features/auth/stores/authStore';
import { fetchCurrentUser }      from './api/auth';



export default function App() {
  const { user, token, setAuth, logout } = useAuthStore();

  // On mount: if a token exists in localStorage, rehydrate the user
  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser()
        .then((u) => setAuth({ ...u, badge_status: u.badge_status as BadgeStatus }, token))
        .catch(() => logout());
    }
  }, [token, user, setAuth, logout]);

  return (
    <BrowserRouter>
      <SiteHeader />
      <Routes>
        <Route path="/"       element={<ArenaPage />}  />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login"  element={<LoginPage />}  />
      </Routes>
    </BrowserRouter>
  );
}