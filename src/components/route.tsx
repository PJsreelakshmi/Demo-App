import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../App.css';
import MenuBar from './Menu_bar';
import ProfilePage from './Profile';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <MenuBar onMenuToggle={() => setIsMenuOpen((prev) => !prev)} />
        <div className="container mx-auto px-4 py-8">
          {!isMenuOpen && (
            <Routes>
              {/* Dashboard Route */}
              <Route
                path="/"
                element={
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-600 mb-3">Dashboard</h1>
                    <p className="text-gray-600">
                      Welcome to your developer profile dashboard. Click on your profile icon in the top menu to view and edit your profile.
                    </p>
                  </div>
                }
              />
              {/* Profile Page Route */}
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;

