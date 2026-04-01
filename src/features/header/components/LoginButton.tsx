/***
Path:/kingskolossium/src/features/header/components/LoginButton.tsx
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: Conditional login/profile button — guest mode for now
***/

import { useNavigate } from 'react-router-dom';

interface LoginButtonProps {
  isLoggedIn: boolean;
  nickname?:  string;
}

export function LoginButton({ isLoggedIn, nickname }: LoginButtonProps) {
  const navigate = useNavigate();

  if (isLoggedIn) {
    return (
      <button
        onClick={() => navigate('/profile')}
        className="btn btn-primary text-xs px-3 py-1 rounded-full"
      >
        {nickname ?? 'Profile'}
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/login')}
      className="btn btn-primary text-xs px-1 py-1 rounded-full"
    >
      Login
    </button>
  );
}

export default LoginButton;