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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="flex-1 ml-[240px] min-h-screen overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/brainstorm" element={<BrainstormPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/whiteboard/:sessionCode" element={<Whiteboard />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading…</p>
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
