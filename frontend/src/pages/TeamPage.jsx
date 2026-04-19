import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  Users, Crown, UserPlus, Copy, Check, Mail, Pencil,
  Shield, Eye, Trash2, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_CONFIG = {
  Owner: {
    label: 'Owner',
    icon: Crown,
    style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  Editor: {
    label: 'Editor',
    icon: Pencil,
    style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  Viewer: {
    label: 'Viewer',
    icon: Eye,
    style: 'bg-sk-raised text-sk-2 border-sk-subtle',
  },
};

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

const TeamPage = () => {
  const auth = useAuth();
  const userProfile = auth.user?.profile;
  const userEmail = userProfile?.email || '';
  const userDisplayName =
    userProfile?.name || userProfile?.given_name || userProfile?.preferred_username || userEmail || 'You';
  const userInitial = (userDisplayName[0] || 'U').toUpperCase();

  const [members, setMembers] = useState([
    { id: 'owner', name: userDisplayName, email: userEmail, role: 'Owner', initial: userInitial, color: 'bg-sk-accent', isYou: true },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteLink = `${window.location.origin}/join`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setInviteError('Please enter a valid email address.');
      return;
    }
    if (members.some(m => m.email === inviteEmail)) {
      setInviteError('This person is already on your team.');
      return;
    }
    setInviting(true);
    setInviteError('');
    setTimeout(() => {
      const name = inviteEmail.split('@')[0];
      const initial = name[0].toUpperCase();
      setMembers(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name,
          email: inviteEmail,
          role: inviteRole,
          initial,
          color: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
          isYou: false,
          pending: true,
        },
      ]);
      setInviteEmail('');
      setInviting(false);
      setInviteSent(true);
      setTimeout(() => setInviteSent(false), 3000);
    }, 800);
  };

  const handleRemove = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleChangeRole = (id, newRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sk-1 tracking-tight">Team</h1>
        <p className="text-sm text-sk-2 mt-1">Manage who has access to your workspace.</p>
      </div>

      {/* Invite Section */}
      <div className="bg-sk-surface border border-sk-subtle rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-sk-1 mb-4 flex items-center gap-2">
          <UserPlus size={15} className="text-sk-accent" />
          Invite Team Members
        </h2>

        {/* Invite Link */}
        <div className="flex items-center gap-2 p-3 bg-sk-raised border border-sk-subtle rounded-xl mb-5">
          <LinkIcon size={14} className="text-sk-3 shrink-0" />
          <span className="text-xs text-sk-3 flex-1 truncate font-mono">{inviteLink}</span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sk-surface border border-sk-subtle rounded-lg text-xs font-medium text-sk-2 hover:border-sk-accent/30 hover:text-sk-accent transition-colors shrink-0"
          >
            {linkCopied ? <><Check size={12} className="text-sk-success" /> Copied</> : <><Copy size={12} /> Copy link</>}
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sk-3" />
            <input
              type="email"
              value={inviteEmail}
              onChange={e => { setInviteEmail(e.target.value); setInviteError(''); }}
              placeholder="colleague@company.com"
              className="w-full pl-9 pr-4 py-2.5 bg-sk-input border border-sk-subtle rounded-xl text-sm text-sk-1 placeholder:text-sk-3 focus:border-sk-accent/40 outline-none transition-colors"
            />
          </div>
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
            className="px-3 py-2.5 bg-sk-input border border-sk-subtle rounded-xl text-sm text-sk-1 focus:border-sk-accent/40 outline-none cursor-pointer"
          >
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={inviting || !inviteEmail}
            className="px-4 py-2.5 bg-sk-accent text-white text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0"
          >
            {inviting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus size={14} />
            )}
            Invite
          </button>
        </form>

        {inviteError && (
          <p className="text-xs text-sk-danger mt-2">{inviteError}</p>
        )}

        <AnimatePresence>
          {inviteSent && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-sk-success mt-2 flex items-center gap-1.5"
            >
              <Check size={12} /> Invite sent successfully!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Members List */}
      <div className="bg-sk-surface border border-sk-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-sk-subtle flex items-center justify-between">
          <h2 className="text-sm font-bold text-sk-1 flex items-center gap-2">
            <Users size={15} className="text-sk-accent" />
            Members
            <span className="text-xs font-bold text-sk-3 bg-sk-raised px-2 py-0.5 rounded-full">{members.length}</span>
          </h2>
        </div>

        <div className="divide-y divide-sk-subtle">
          {members.map((member, idx) => {
            const roleConfig = ROLE_CONFIG[member.role];
            const RoleIcon = roleConfig.icon;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-3 px-5 py-4 hover:bg-sk-raised/50 transition-colors"
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full ${member.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {member.initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-sk-1 truncate">{member.name}</span>
                    {member.isYou && (
                      <span className="text-[10px] font-bold text-sk-accent bg-sk-accent/10 px-1.5 py-0.5 rounded">you</span>
                    )}
                    {member.pending && (
                      <span className="text-[10px] font-bold text-sk-warning bg-sk-warning/10 px-1.5 py-0.5 rounded">pending</span>
                    )}
                  </div>
                  <p className="text-xs text-sk-3 truncate">{member.email}</p>
                </div>

                {/* Role Badge / Selector */}
                {member.isYou ? (
                  <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border ${roleConfig.style}`}>
                    <RoleIcon size={11} /> {member.role}
                  </span>
                ) : (
                  <select
                    value={member.role}
                    onChange={e => handleChangeRole(member.id, e.target.value)}
                    className={`hidden sm:block text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer outline-none ${roleConfig.style}`}
                  >
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                )}

                {/* Remove */}
                {!member.isYou && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-1.5 text-sk-3 hover:text-sk-danger hover:bg-sk-danger/8 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Permissions Info */}
      <div className="mt-6 p-5 bg-sk-raised border border-sk-subtle rounded-2xl">
        <h3 className="text-xs font-bold text-sk-2 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield size={13} /> Role Permissions
        </h3>
        <div className="space-y-2 text-xs text-sk-2">
          <div className="flex items-start gap-2">
            <Crown size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <span><strong className="text-sk-1">Owner</strong> — Full access: create, edit, delete boards, manage team.</span>
          </div>
          <div className="flex items-start gap-2">
            <Pencil size={12} className="text-blue-500 mt-0.5 shrink-0" />
            <span><strong className="text-sk-1">Editor</strong> — Can draw and edit on boards. Cannot delete boards.</span>
          </div>
          <div className="flex items-start gap-2">
            <Eye size={12} className="text-sk-3 mt-0.5 shrink-0" />
            <span><strong className="text-sk-1">Viewer</strong> — Read-only access. Can observe live sessions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
