// frontend/src/components/common/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-600">
              ReWear
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/items" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">
              Browse Items
            </Link>
            {/* Ab ye sabko dikhenge, login check hata diya */}
            <Link to="/add-item" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">
              List Item
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/wishlist" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">
              Wishlist
            </Link>
            <Link to="/swaps" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">
              My Swaps
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 text-gray-700 hover:text-green-600 focus:outline-none">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium hidden md:block">{user.name}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Sign In</Link>
                <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;