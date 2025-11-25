import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PatientProfile from "./pages/PatientProfile";

function App() {
    return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PatientProfile />} />
          </Routes>
        </BrowserRouter>
      );
}

export default App
