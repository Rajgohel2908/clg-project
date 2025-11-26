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
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              ReWear
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/items" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">
              Browse Items
            </Link>
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

          {/* User Profile & Dropdown */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)} 
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full p-1"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-medium text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">{user.name}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 transform transition-all duration-200 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {/* Admin Dashboard - Only if Admin */}
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}

                      {/* Profile */}
                      <Link 
                        to="/profile" 
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Profile
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      {/* Logout */}
                      <button 
                        onClick={handleLogout} 
                        className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">Sign In</Link>
                <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow-sm transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;