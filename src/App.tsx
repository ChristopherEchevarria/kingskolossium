/***
Path:/kingskolossium/src/App.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description:
***/

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArenaPage } from './features/arena';
import { SiteHeader } from './features/header/SiteHeader';

export default function App() {
  return (
    <BrowserRouter>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<ArenaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

