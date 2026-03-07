import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { Palette, Plus, Users, Clock, Trash2, AlertCircle } from 'lucide-react';
import { useSession } from '../context/SessionContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BrainstormPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { activeSession, joinSession, leaveSession, restoring } = useSession();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);

  const handleCreateSession = async () => {
    setCreating(true);
    setError(null);
    try {
      const token = auth.user?.access_token;
      const res = await axios.post(
        `${BACKEND_URL}/api/sessions`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sessionData = res.data;
      joinSession(sessionData, true);
      navigate(`/whiteboard/${sessionData.code}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (!window.confirm('End this brainstorm session? All collaborators will be disconnected.')) return;
    setEnding(true);
    try {
      const token = auth.user?.access_token;
      await axios.delete(`${BACKEND_URL}/api/sessions/${activeSession.code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      leaveSession();
    } catch {
      leaveSession();
    } finally {
      setEnding(false);
    }
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return '';
    const date = new Date(expiresAt * 1000);
    return date.toLocaleString();
  };

  if (restoring) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brainstorm Session</h1>
          <p className="text-gray-500 text-sm">Create a collaborative whiteboard for your team</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {activeSession ? (
        /* Active session card */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Active Session</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-mono font-bold tracking-widest">{activeSession.code}</span>
            </div>
            <p className="text-white/70 text-sm mt-1">Share this code with collaborators</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Collaborative whiteboard</span>
              </div>
              {activeSession.expiresAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Expires {formatExpiry(activeSession.expiresAt)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate(`/whiteboard/${activeSession.code}`)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all duration-200"
              >
                Open Whiteboard
              </button>
              {activeSession.isHost && (
                <button
                  onClick={handleEndSession}
                  disabled={ending}
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-all duration-200 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {ending ? 'Ending…' : 'End'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Create new session */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-purple-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Start a New Session</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Create a whiteboard session and share the 6-character code with your team to collaborate in real time.
            </p>
            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Session
                </>
              )}
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🎨', title: 'Rich Canvas', desc: 'Shapes, text, freehand drawing with full styling' },
              { icon: '⚡', title: 'Real-Time', desc: 'See collaborator changes and cursors instantly' },
              { icon: '🔗', title: 'Easy Share', desc: '6-char code — no sign-up needed for guests' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainstormPage;
