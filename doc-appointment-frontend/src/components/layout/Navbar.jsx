import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Calendar,
  FileText,
  LogIn,
  UserPlus,
  Stethoscope,
  Heart,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'হোম', path: '/', icon: Home, roles: ['guest', 'patient', 'user', 'doctor', 'admin'] },
    { name: 'ডাক্তার', path: '/doctors', icon: Stethoscope, roles: ['guest', 'patient', 'user', 'doctor', 'admin'] },
    { name: 'অ্যাপয়েন্টমেন্ট', path: '/appointments', icon: Calendar, roles: ['patient', 'user', 'doctor', 'admin'] },
    { name: 'প্রেসক্রিপশন', path: '/prescriptions', icon: FileText, roles: ['doctor', 'admin'] },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(user.role));

  const isActive = (path) =>
    location.pathname === path
      ? 'text-slate-900 bg-white shadow-sm'
      : 'text-slate-600 hover:text-slate-900 hover:bg-white/90';

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-100/80 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-3xl bg-linear-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
              <Heart className="h-6 w-6 text-white animate-pulse" />
              <Stethoscope className="absolute h-4 w-4 text-slate-200" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                ডক্টর অ্যাপ
              </h1>
              <p className="text-xs text-slate-500">আপনার স্বাস্থ্য সাথী</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3 bg-slate-100/80 px-3 py-2 rounded-full shadow-inner ring-1 ring-slate-200">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition duration-300 ${isActive(link.path)}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 md:gap-4 relative">
            <div className="hidden md:flex items-center gap-3">
              {user.isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-300 hover:bg-indigo-700"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm text-slate-600">Logged in as</p>
                        <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                        <p className="text-xs text-slate-500 capitalize">Role: {user.role}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition duration-300"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-300 hover:bg-slate-800"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>লগইন</span>
                  </Link>                  
                </>
              )}
            </div>

            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition duration-300 hover:border-slate-400 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden animate-slideIn rounded-3xl bg-white/95 p-4 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
            <div className="space-y-2">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-300 ${isActive(link.path)}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="grid gap-3 pt-2">
                {user.isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">Logged in as</p>
                      <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                      <p className="text-xs text-slate-500 capitalize">Role: {user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>লগআউট</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-slate-800 flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>লগইন</span>
                    </Link>
                    <Link
                      to="/login"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition duration-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>রেজিস্টার</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
