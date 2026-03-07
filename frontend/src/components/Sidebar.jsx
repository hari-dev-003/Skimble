import { Link, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { 
  Home as HomeIcon, 
  Layout, 
  Settings, 
  LogOut, 
  PenTool,
  ChevronLeft,
  ChevronRight,
  Users,
  Grid,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const { pathname } = useLocation();
  const auth = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: Grid, label: 'Workspace', path: '/' },
    { icon: Layout, label: 'Brainstorm', path: '/brainstorm' },
    { icon: Users, label: 'Join Session', path: '/join' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => pathname === path;

  const userProfile = auth.user?.profile;
  const userDisplayName = userProfile?.name || userProfile?.given_name || userProfile?.preferred_username || userProfile?.['cognito:username'] || userProfile?.nickname || userProfile?.email || 'User';
  const userInitial = (userDisplayName === 'User' ? userProfile?.email?.[0] : userDisplayName?.[0]) || 'U';

  const handleLogout = async () => {
    // Clear local OIDC state
    auth.removeUser();
    
    // AWS Cognito requires a manual redirect to their logout endpoint
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const domain = import.meta.env.VITE_COGNITO_DOMAIN;
    
    // Construct the Cognito logout URL
    const cognitoLogoutUrl = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    
    // Redirect to Cognito
    window.location.href = cognitoLogoutUrl;
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="p-6 mb-4 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <PenTool className="text-[#0f172a] w-6 h-6" strokeWidth={2.5} />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-black text-xl text-white tracking-tighter uppercase"
            >
              Skimble
            </motion.span>
          )}
        </div>
        
        {isMobileOpen && (
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              isActive(item.path)
                ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20'
                : 'hover:bg-white/5 hover:text-white text-slate-400'
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-white'}`} />
            {(!isCollapsed || isMobileOpen) && <span className="truncate text-sm tracking-tight font-bold">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="px-4 mb-4 mt-auto border-t border-white/5 pt-6">
        <div className={`flex items-center gap-3 px-2 py-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-cyan-400 font-black text-sm uppercase">
              {userInitial}
            </span>
          </div>
          
          {(!isCollapsed || isMobileOpen) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-xs font-black text-white truncate leading-tight uppercase tracking-tight">
                {userDisplayName}
              </span>
              <span className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                {userProfile?.email}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-8 space-y-2">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              isActive(item.path)
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'hover:bg-white/5 hover:text-white text-slate-400'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-white" />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all group font-bold tracking-tight text-sm"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-white/5 flex items-center px-6 z-50 justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="text-cyan-500 w-6 h-6" />
          <span className="text-white font-black uppercase tracking-tighter">Skimble</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-[#0f172a] z-[70] flex flex-col border-r border-white/10 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '80px' : '260px' }}
        className="hidden lg:flex h-screen bg-[#0f172a] text-slate-400 flex flex-col relative z-40 shadow-2xl transition-all duration-300 ease-in-out border-r border-white/5 shrink-0"
      >
        {sidebarContent}
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1e293b] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-xl"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
