import React from 'react';
import Dashboard from './components/Dashboard.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;