import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Search, 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X,
  Target,
  BarChart3
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        isActive(to)
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-vibrant'
          : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:text-primary-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-orange-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">FitTracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <NavLink to="/dashboard" icon={BarChart3}>
                  Dashboard
                </NavLink>
                <NavLink to="/food-search" icon={Search}>
                  Food Search
                </NavLink>
                <NavLink to="/diary" icon={BookOpen}>
                  Diary
                </NavLink>
                <NavLink to="/profile" icon={User}>
                  Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" icon={Home}>
                  Home
                </NavLink>
                <Link
                  to="/login"
                  className="btn-outline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <NavLink to="/dashboard" icon={BarChart3} onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/food-search" icon={Search} onClick={() => setIsMobileMenuOpen(false)}>
                    Food Search
                  </NavLink>
                  <NavLink to="/diary" icon={BookOpen} onClick={() => setIsMobileMenuOpen(false)}>
                    Diary
                  </NavLink>
                  <NavLink to="/profile" icon={User} onClick={() => setIsMobileMenuOpen(false)}>
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/" icon={Home} onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </NavLink>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-outline text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;