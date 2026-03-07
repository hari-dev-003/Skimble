import { useState } from 'react';
import { Copy, Check, Users, Wifi, WifiOff, X, Crown, Trash2 } from 'lucide-react';

const PARTICIPANT_COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

const SessionHeader = ({ sessionCode, participants, connected, isHost, onLeave, onEndSession, currentUserId }) => {
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shadow-sm flex-shrink-0">
      {/* Session code */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Session</span>
        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5">
          <span className="font-mono font-bold text-purple-700 text-sm tracking-widest">
            {sessionCode}
          </span>
          <button
            onClick={handleCopy}
            className="text-purple-400 hover:text-purple-600 transition-colors ml-1"
            title="Copy session code"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        {isHost && (
          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
            <Crown className="w-3 h-3" /> Host
          </span>
        )}
      </div>

      <div className="h-5 w-px bg-gray-200" />

      {/* Participants */}
      <div className="relative">
        <button
          onClick={() => setShowParticipants(p => !p)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Users className="w-4 h-4" />
          <div className="flex -space-x-2">
            {participants.slice(0, 4).map((p, i) => (
              <div
                key={p.userId}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}
                title={p.name + (p.userId === currentUserId ? ' (You)' : '')}
              >
                {(p.name?.[0] || '?').toUpperCase()}
              </div>
            ))}
            {participants.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                +{participants.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">{participants.length} online</span>
        </button>

        {showParticipants && (
          <div className="absolute top-10 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 min-w-[200px] z-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Participants</p>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={p.userId} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}
                  >
                    {(p.name?.[0] || '?').toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 truncate max-w-[140px]">
                    {p.name} {p.userId === currentUserId && <span className="text-gray-400 text-xs">(You)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-1.5 ml-auto">
        {connected ? (
          <span className="flex items-center gap-1.5 text-xs text-green-600">
            <Wifi className="w-3.5 h-3.5" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-orange-500">
            <WifiOff className="w-3.5 h-3.5" />
            Reconnecting…
          </span>
        )}
      </div>

      {/* End Session (host only) */}
      {isHost && (
        <button
          onClick={onEndSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300 font-medium"
          title="End session for all participants"
        >
          <Trash2 className="w-3.5 h-3.5" />
          End Session
        </button>
      )}

      {/* Leave button */}
      <button
        onClick={onLeave}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
      >
        <X className="w-3.5 h-3.5" />
        Leave
      </button>
    </div>
  );
};

export default SessionHeader;
