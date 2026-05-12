import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Users, Calendar, FileText, 
  LogIn, UserPlus, Stethoscope, Heart 
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'হোম', path: '/', icon: Home },
    { name: 'ডাক্তার', path: '/doctors', icon: Stethoscope },
    { name: 'অ্যাপয়েন্টমেন্ট', path: '/appointments', icon: Calendar },
    { name: 'প্রেসক্রিপশন', path: '/prescriptions', icon: FileText },
  ];

  const isActive = (path) => {
    return location.pathname === path 
      ? 'text-blue-600 bg-blue-50 rounded-lg font-bold' 
      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Heart className="h-10 w-10 text-red-500 animate-pulse" />
                <Stethoscope className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
                  ডক্টর অ্যাপ
                </h1>
                <p className="text-xs text-gray-500 -mt-1">আপনার স্বাস্থ্য সাথী</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 transform hover:scale-105 ${isActive(link.path)}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
              <LogIn className="h-4 w-4" />
              <span>লগইন</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 font-medium">
              <UserPlus className="h-4 w-4" />
              <span>রেজিস্টার</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none transition-colors duration-300"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 transition-all duration-300 ${isActive(link.path)}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
              <div className="flex space-x-3 pt-4 px-4">
                <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium">
                  লগইন
                </button>
                <button className="flex-1 py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-medium">
                  রেজিস্টার
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;