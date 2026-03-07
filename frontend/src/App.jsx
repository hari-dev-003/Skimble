import { Routes, Route } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { SessionProvider } from './context/SessionContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import BrainstormPage from './pages/BrainstormPage';
import JoinPage from './pages/JoinPage';
import Whiteboard from './pages/Whiteboard';
import Landing from './pages/Landing';

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative bg-[#f8fafc] mt-16 lg:mt-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/brainstorm" element={<BrainstormPage />} />
          <Route path="/favorites" element={<Home initialFilter="favorites" />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/whiteboard/:sessionCode" element={<Whiteboard />} />
          <Route path="/settings" element={<div className="p-10 text-slate-400">Settings coming soon...</div>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-indigo-300 rounded-full animate-spin-slow" />
          </div>
          <p className="text-slate-500 font-medium tracking-wide animate-pulse">Initializing Skimble...</p>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Auth error: {auth.error.message}</p>
          <button
            onClick={() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.reload();
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Landing />;
  }

  return (
    <SessionProvider>
      <AppLayout />
    </SessionProvider>
  );
}

export default App;
