import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./modern-styles.css";
import HomePage from "./Components/HomePage";
import GeneratorPage from "./Components/GeneratorPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generator" element={<GeneratorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
