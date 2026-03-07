import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { PenTool, FileText, Palette, LogIn, LogOut, User } from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'notes',
    label: 'Notes',
    icon: FileText,
    path: '/',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm Session',
    icon: Palette,
    path: '/brainstorm',
  },
  {
    id: 'join',
    label: 'Join Session',
    icon: LogIn,
    path: '/join',
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const signOutRedirect = async () => {
    // 1. Clear local OIDC tokens from sessionStorage/localStorage
    await auth.removeUser();
    // 2. Clear Cognito server-side session and redirect back unauthenticated
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-gray-200 flex flex-col z-40 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Skimble</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                ${active
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200/60 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${active ? 'text-purple-600' : 'text-gray-400'}`}
              />
              <span className="truncate">{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {auth.user?.profile.email}
            </p>
            <p className="text-xs text-gray-400">Signed in</p>
          </div>
        </div>
        <button
          onClick={signOutRedirect}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
