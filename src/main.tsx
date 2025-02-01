import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import Draw from './pages/draw';
import Home from './pages/home';

const root = document.getElementById('root') as HTMLElement;

/* StrictMode is used in debuging, to add more infos to React (all hooks perform one extra time, to check cleanup)
 */

ReactDOM.createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="draw" element={<Draw />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
