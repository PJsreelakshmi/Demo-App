import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuBar from "./components/Menu_bar";
import ProfilePage from "./components/Profile";
import Calendar from "./components/Calendar";
import { Event } from "./types";

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(2025, 3, 10, 14, 0),
      color: "blue",
      duration: 60,
    },
    {
      id: "2",
      title: "Fun Meeting",
      date: new Date(2025, 3, 10, 17, 0),
      color: "green",
      duration: 60,
    },
    {
      id: "3",
      title: "Easter",
      date: new Date(2025, 3, 20),
      color: "red",
      isHoliday: true,
    },
  ]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <MenuBar onMenuToggle={() => setIsMenuOpen((prev) => !prev)} />
        <div className="container mx-auto px-4 py-8">
          {!isMenuOpen && (
            <Routes>
              {/* Show Calendar on the Home Route */}
              <Route path="/" element={<Calendar events={events} />} />
              {/* Profile Page Route */}
              <Route path="/profile" element={<ProfilePage />} />
              {/* Calendar Page Route (optional, same as home) */}
              <Route path="/calendar" element={<Calendar events={events} />} />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
