/***
Path:/kingskolossium/src/App.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description:
***/

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArenaPage } from './features/arena';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArenaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

