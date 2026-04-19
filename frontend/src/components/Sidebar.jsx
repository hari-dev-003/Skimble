import { Link, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import {
  Layout,
  Settings,
  LogOut,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Users,
  Grid,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { pathname } = useLocation();
  const auth = useAuth();
  const { isDark, toggle } = useTheme();
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: Grid,   label: 'Workspace',    path: '/' },
    { icon: Layout, label: 'Brainstorm',   path: '/brainstorm' },
    { icon: Users,  label: 'Join Session', path: '/join' },
  ];

  const isActive = (path) => pathname === path;

  const userProfile     = auth.user?.profile;
  const userDisplayName = userProfile?.name || userProfile?.given_name
    || userProfile?.preferred_username || userProfile?.['cognito:username']
    || userProfile?.nickname || userProfile?.email || 'User';
  const userInitial = (userDisplayName === 'User' ? userProfile?.email?.[0] : userDisplayName?.[0]) || 'U';

  const handleLogout = async () => {
    auth.removeUser();
    const clientId  = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const domain    = import.meta.env.VITE_COGNITO_DOMAIN;
    window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 overflow-hidden">
        <div className="w-10 h-10 bg-sk-accent/10 border border-sk-accent/20 rounded-xl flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all">
          <PenTool className="text-sk-accent w-5 h-5" strokeWidth={2.5} />
        </div>
        {(!isCollapsed || isMobileOpen) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-extrabold text-base tracking-tight text-sk-1"
          >
            Skimble
          </motion.span>
        )}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto lg:hidden text-sk-3 hover:text-sk-1 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar mt-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${isActive(item.path)
                ? 'bg-sk-accent/12 text-sk-accent'
                : 'text-sk-3 hover:bg-sk-raised hover:text-sk-1'
              }`}
          >
            {isActive(item.path) && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-sk-accent"
                style={{ boxShadow: '0 0 8px #06B6D4' }}
              />
            )}
            <item.icon className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-3 mt-auto pt-4 border-t border-sk-subtle">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sk-raised overflow-hidden ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-sk-accent/12 border border-sk-accent/25 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold uppercase text-sk-accent">{userInitial}</span>
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sk-1 truncate leading-tight">{userDisplayName}</span>
              <span className="text-xs text-sk-3 truncate mt-0.5">{userProfile?.email}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-3 pb-6 mt-2 space-y-0.5">
        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sk-2 hover:bg-sk-raised hover:text-sk-1 text-sm font-medium ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          </motion.div>
          {(!isCollapsed || isMobileOpen) && (
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        <Link
          to="/settings"
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
            ${isActive('/settings')
              ? 'bg-sk-accent/12 text-sk-accent'
              : 'text-sk-3 hover:bg-sk-raised hover:text-sk-1'
            }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span className="text-sm font-medium">Settings</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sk-3 hover:bg-sk-danger/8 hover:text-sk-danger text-sm font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sk-surface border-b border-sk-subtle flex items-center px-5 z-50 justify-between">
        <div className="flex items-center gap-3">
          <PenTool className="text-sk-accent w-5 h-5" />
          <span className="text-sk-1 font-extrabold text-base tracking-tight">Skimble</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 text-sk-2 hover:text-sk-1 bg-sk-raised rounded-lg transition-colors"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-sk-2 hover:text-sk-1 bg-sk-raised rounded-lg transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] backdrop-blur-sm"
              style={{ background: 'var(--sk-backdrop)' }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-sk-surface z-[70] flex flex-col border-r border-sk-subtle shadow-lg"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '64px' : '240px' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex h-screen bg-sk-surface flex-col relative z-40 shrink-0 border-r border-sk-subtle"
      >
        {sidebarContent}

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-2.5 top-20 w-5 h-5 bg-sk-raised border border-sk-strong rounded-full flex items-center justify-center text-sk-3 hover:text-sk-1 hover:border-sk-accent/30 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
