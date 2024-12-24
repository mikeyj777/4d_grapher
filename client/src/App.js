import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Plot4D from './components/Plot4D';
import './App.css';
import './styles/global.css';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Plot4D />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;