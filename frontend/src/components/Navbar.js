import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import { FaBars, FaTimes, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const NAV_LINKS = {
  guest: [
    { to: '/', label: 'nav.home' },
    { to: '/about', label: 'nav.about' },
    { to: '/services', label: 'nav.services' },
    { to: '/dental-health', label: 'nav.dentalHealth' },
    { to: '/patient-resources', label: 'nav.resources' },
    { to: '/contact', label: 'nav.contact' },
    { to: '/login', label: 'nav.login' },
    { to: '/register', label: 'nav.register' },
  ],
  patient: [
    { to: '/', label: 'nav.home' },
    { to: '/about', label: 'nav.about' },
    { to: '/services', label: 'nav.services' },
    { to: '/dental-health', label: 'nav.dentalHealth' },
    { to: '/patient-resources', label: 'nav.resources' },
    { to: '/contact', label: 'nav.contact' },
    { to: '/my-appointments', label: 'nav.myAppointments' },
    { to: '/profile', label: 'nav.profile' },
  ],
  staff: [
    { to: '/', label: 'nav.home' },
    { to: '/about', label: 'nav.about' },
    { to: '/services', label: 'nav.services' },
    { to: '/dental-health', label: 'nav.dentalHealth' },
    { to: '/patient-resources', label: 'nav.resources' },
    { to: '/contact', label: 'nav.contact' },
    { to: '/staff/dashboard', label: 'nav.staffDashboard' },
    { to: '/my-appointments', label: 'nav.myAppointments' },
    { to: '/profile', label: 'nav.profile' },
  ],
  admin: [
    { to: '/', label: 'nav.home' },
    { to: '/about', label: 'nav.about' },
    { to: '/services', label: 'nav.services' },
    { to: '/dental-health', label: 'nav.dentalHealth' },
    { to: '/patient-resources', label: 'nav.resources' },
    { to: '/contact', label: 'nav.contact' },
    { to: '/admin', label: 'nav.dashboard' },
    { to: '/admin/staff', label: 'nav.staff' },
    { to: '/admin/messages', label: 'nav.messages' },
    { to: '/my-appointments', label: 'nav.myAppointments' },
    { to: '/profile', label: 'nav.profile' },
  ],
};

function Navbar() {
  const { token, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  let role = 'guest';
  if (token && user) {
    role = user.role || 'patient';
  }
  let links = NAV_LINKS[role] || NAV_LINKS.guest;
  // Filter out admin links for non-admins
  if (!isAdmin) {
    links = links.filter(link => !link.to.startsWith('/admin'));
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-0 top-0 bg-blue-600 text-white px-4 py-2 z-50">
        {t('nav.skipToContent')}
      </a>
      <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 w-full z-40" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center w-full">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">Smile Bright</Link>
            {token && user && (
              <span className="text-gray-700 dark:text-gray-300 text-md">
                {t('nav.welcome')}{user.username ? `, ${user.username}` : user.email ? `, ${user.email}` : ''}!
              </span>
            )}
          </div>
          {/* Hamburger menu for mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="text-gray-700 dark:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          {/* Desktop menu */}
          <div className="flex items-center justify-end flex-1 hidden md:flex">
            <div className="flex space-x-6">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {t(link.label)}
                </Link>
              ))}
              {/* Book Appointment only for patients or not logged in */}
              {(!token || (user && user.role === 'patient')) && (
                <Link to="/booking" className="ml-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition">
                  {t('nav.bookAppointment')}
                </Link>
              )}
            </div>
            {/* User actions group */}
            <div className="flex items-center space-x-4 ml-8">
              {/* Language Switcher */}
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="Language selector"
                >
                  <FaGlobe className="text-gray-700 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {i18n.language === 'en' ? 'EN' : i18n.language === 'sv' ? 'SV' : i18n.language === 'es' ? 'ES' : i18n.language === 'sw' ? 'SW' : ''}
                  </span>
                </button>
                {profileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => { changeLanguage('en'); setProfileOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        English
                      </button>
                      <button
                        onClick={() => { changeLanguage('sv'); setProfileOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Svenska
                      </button>
                      <button
                        onClick={() => { changeLanguage('es'); setProfileOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Español
                      </button>
                      <button
                        onClick={() => { changeLanguage('sw'); setProfileOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Kiswahili
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Theme Toggle */}
              <ThemeToggle />
              {/* Notification Center for logged-in users */}
              {token && <NotificationCenter />}
              {/* Profile Dropdown for logged-in users */}
              {token && user && (
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center space-x-2 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={profileOpen}
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">
                      {user.username ? user.username[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : '?'}
                    </span>
                    <span className="hidden sm:inline text-gray-700 dark:text-gray-300">{user.username || user.email}</span>
                  </button>
                  {profileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {t('nav.profile')}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Mobile menu dropdown */}
          {menuOpen && (
            <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-lg z-50 flex flex-col items-start px-6 py-4 md:hidden">
              {links.map(link => (
                <Link key={link.to} to={link.to} className="block w-full py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => setMenuOpen(false)}>
                  {t(link.label)}
                </Link>
              ))}
              {(!token || (user && user.role === 'patient')) && (
                <Link to="/booking" className="block w-full mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition" onClick={() => setMenuOpen(false)}>
                  {t('nav.bookAppointment')}
                </Link>
              )}
              {/* Language Switcher for Mobile */}
              <div className="w-full mt-4 flex space-x-4">
                <button
                  onClick={() => { changeLanguage('en'); setMenuOpen(false); }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  English
                </button>
                <button
                  onClick={() => { changeLanguage('sv'); setMenuOpen(false); }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Svenska
                </button>
                <button
                  onClick={() => { changeLanguage('es'); setMenuOpen(false); }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Español
                </button>
                <button
                  onClick={() => { changeLanguage('sw'); setMenuOpen(false); }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Kiswahili
                </button>
              </div>
              {token && user && (
                <div className="w-full mt-2">
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center space-x-2 w-full focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={profileOpen}
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">
                      {user.username ? user.username[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : '?'}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{user.username || user.email}</span>
                  </button>
                  {profileOpen && (
                    <div className="mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setProfileOpen(false); setMenuOpen(false); }}>
                          {t('nav.profile')}
                        </Link>
                        <button
                          onClick={() => { handleLogout(); setProfileOpen(false); setMenuOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center mt-4 space-x-4">
                <ThemeToggle />
                {token && <NotificationCenter />}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar; 