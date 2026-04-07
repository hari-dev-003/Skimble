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
    <div className="flex h-screen overflow-hidden bg-sk-base flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative bg-sk-base mt-14 lg:mt-0">
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/brainstorm"          element={<BrainstormPage />} />
          <Route path="/favorites"           element={<Home initialFilter="favorites" />} />
          <Route path="/join"                element={<JoinPage />} />
          <Route path="/whiteboard/:sessionCode" element={<Whiteboard />} />
          <Route path="/settings"            element={<div className="p-10 text-sk-3 text-sm">Settings coming soon…</div>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sk-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-sk-accent/20 border-t-sk-accent rounded-full animate-spin" />
          <p className="text-sk-3 text-sm font-medium tracking-wide animate-pulse">Initializing Skimble…</p>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-sk-base">
        <div className="text-center">
          <p className="text-sk-danger mb-4 text-sm">Auth error: {auth.error.message}</p>
          <button
            onClick={() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.reload();
            }}
            className="px-4 py-2 bg-sk-accent text-sk-base rounded-xl text-sm font-semibold hover:bg-sk-accent-hi transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) return <Landing />;

  return (
    <SessionProvider>
      <AppLayout />
    </SessionProvider>
  );
}

export default App;
