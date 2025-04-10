import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Menu as MenuIcon, User, Home, Book, LogOut, ArrowLeft, Calendar } from 'lucide-react';

interface MenuBarProps {
  onMenuToggle: (isOpen: boolean) => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onMenuToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    onMenuToggle(newMenuState);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    onMenuToggle(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Back Button - Only on Profile Page */}
          {location.pathname === "/profile" && (
            <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-blue-600">
              <ArrowLeft size={24} />
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">DevProfile</span>
          </div>

          {/* Right Section: Menu, Profile */}
          <div className="flex items-center space-x-4">
            {/* Menu Icon */}
            <button onClick={toggleMenu} className="text-gray-700 hover:text-blue-600">
              <MenuIcon size={24} />
            </button>

            {/* Profile Icon */}
            <button onClick={toggleProfileMenu} className="relative text-gray-700 hover:text-blue-600">
              <User size={24} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-4 mt-2 w-48 bg-white shadow-lg rounded-lg p-2">
                <p className="px-4 py-2 text-gray-700">John Doe</p>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => alert('Logged out')}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white shadow-lg rounded-b-lg">
          <div className="px-4 py-2">
            <Link to="/" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              <Home size={18} className="mr-2 inline" /> Dashboard
            </Link>
            <a href="#" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              <Book size={18} className="mr-2 inline" /> Academics
            </a>
            <Link to="/profile" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              <User size={18} className="mr-2 inline" /> Profile
            </Link>
            <Link to="/calendar" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              <Calendar size={18} className="mr-2 inline" /> Calendar
            </Link>
            <a href="#" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              <Settings size={18} className="mr-2 inline" /> Settings
            </a>
            <a href="#" onClick={closeMenu} className="block py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              <LogOut size={18} className="mr-2 inline" /> Sign Out
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
