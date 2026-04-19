import { Link, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { PenTool, Bell, HelpCircle, Share2, Download, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { pathname } = useLocation();
  const auth = useAuth();
  const { isDark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  const tabs = [
    { label: 'Dashboard', path: '/' },
    { label: 'Templates', path: '/templates' },
    { label: 'Team', path: '/team' },
  ];

  const userProfile = auth.user?.profile;
  const userEmail = userProfile?.email || '';
  const userDisplayName =
    userProfile?.name || userProfile?.given_name ||
    userProfile?.preferred_username || userEmail || 'User';
  const userInitial = (
    userDisplayName === 'User' ? userEmail?.[0] : userDisplayName?.[0] || 'U'
  ).toUpperCase();

  const handleLogout = () => {
    auth.removeUser();
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const domain = import.meta.env.VITE_COGNITO_DOMAIN;
    window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const isActive = (path) => {
    if (path === '/') return pathname === '/' || pathname === '/favorites';
    return pathname.startsWith(path);
  };

  useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-sk-surface border-b border-sk-subtle flex items-center px-4 sm:px-6 z-50 relative shrink-0">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mr-6 shrink-0 group">
        <div className="w-8 h-8 bg-sk-accent rounded-lg flex items-center justify-center shadow-sm group-hover:bg-sk-accent-hi transition-colors">
          <PenTool size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-sk-1 text-base tracking-tight">Skimble</span>
      </Link>

      {/* Nav Tabs — Desktop */}
      <nav className="hidden sm:flex items-center gap-0.5 flex-1">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive(tab.path)
                ? 'text-sk-accent'
                : 'text-sk-2 hover:text-sk-1 hover:bg-sk-raised'
            }`}
          >
            {tab.label}
            {isActive(tab.path) && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-sk-accent rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      <div className="flex-1 sm:hidden" />

      {/* Right Actions — Desktop */}
      <div className="hidden sm:flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="p-2 text-sk-3 hover:text-sk-1 rounded-lg hover:bg-sk-raised transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="p-2 text-sk-3 hover:text-sk-1 rounded-lg hover:bg-sk-raised transition-colors">
          <Bell size={17} />
        </button>
        <button className="p-2 text-sk-3 hover:text-sk-1 rounded-lg hover:bg-sk-raised transition-colors">
          <HelpCircle size={17} />
        </button>
        <div className="w-px h-5 bg-sk-subtle mx-1" />
        <button className="px-3 py-1.5 text-sm font-medium text-sk-2 border border-sk-subtle rounded-lg hover:bg-sk-raised transition-colors flex items-center gap-1.5">
          <Download size={13} />
          Export
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-white bg-sk-accent rounded-lg hover:bg-sk-accent-hi transition-colors flex items-center gap-1.5 shadow-sm">
          <Share2 size={13} />
          Share
        </button>

        {/* Avatar + dropdown */}
        <div ref={avatarRef} className="relative ml-1">
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="w-8 h-8 rounded-full bg-sk-accent/10 border border-sk-accent/25 flex items-center justify-center text-sk-accent text-sm font-semibold hover:bg-sk-accent/20 transition-colors"
            title={userEmail}
          >
            {userInitial}
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-sk-surface border border-sk-subtle rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-2 border-b border-sk-subtle mb-1">
                <p className="text-xs font-semibold text-sk-1 truncate">{userDisplayName}</p>
                <p className="text-xs text-sk-3 truncate">{userEmail}</p>
              </div>
              <button
                onClick={toggle}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-sk-2 hover:bg-sk-raised hover:text-sk-1 transition-colors"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <Link
                to="/settings"
                onClick={() => setAvatarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-sk-2 hover:bg-sk-raised hover:text-sk-1 transition-colors"
              >
                Settings
              </Link>
              <div className="border-t border-sk-subtle mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-sk-danger hover:bg-sk-danger/5 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="sm:hidden p-2 text-sk-3 hover:text-sk-1 rounded-lg"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="sm:hidden absolute top-14 left-0 right-0 bg-sk-surface border-b border-sk-subtle shadow-lg z-50 px-4 py-3 space-y-1">
          {tabs.map(tab => (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive(tab.path)
                  ? 'bg-sk-accent/10 text-sk-accent'
                  : 'text-sk-2 hover:bg-sk-raised hover:text-sk-1'
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-sk-subtle flex gap-2">
            <Link
              to="/join"
              onClick={() => setMobileOpen(false)}
              className="flex-1 px-3 py-2 text-sm font-medium text-center border border-sk-subtle rounded-lg text-sk-2 hover:bg-sk-raised"
            >
              Join Session
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 px-3 py-2 text-sm font-medium text-center text-sk-danger border border-sk-danger/20 rounded-lg hover:bg-sk-danger/5"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
