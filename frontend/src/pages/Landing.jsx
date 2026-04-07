import { useNavigate } from 'react-router-dom';
import {
  PenTool,
  Sparkles,
  Zap,
  Users,
  Layout,
  ArrowRight,
  MousePointer2,
  Layers,
  Search
} from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { motion } from 'framer-motion';

const Landing = () => {
  const auth     = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (auth.isAuthenticated) navigate('/');
    else auth.signinRedirect();
  };

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden:  { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-sk-base text-sk-2 selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Noise Texture — subtle in dark, hidden in light */}
      <div
        className="fixed inset-0 z-50 pointer-events-none opacity-0 dark:opacity-[0.025] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Background glows & grid */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:opacity-20" />
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-400/8 dark:bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[40%] h-[40%] bg-blue-500/6 dark:bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 bg-cyan-500/12 border border-cyan-500/25 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <PenTool className="w-4 h-4 text-cyan-500" strokeWidth={2.5} />
          </div>
          <span className="text-base font-black tracking-tighter uppercase text-sk-1 group-hover:text-sk-accent transition-colors duration-300">
            Skimble
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleStart}
            className="text-sm font-medium text-sk-3 hover:text-sk-accent transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleStart}
            className="shimmer-btn px-5 py-2 bg-sk-accent text-sk-base text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors active:scale-[0.97]"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-24"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 text-[11px] font-semibold uppercase tracking-widest mb-8"
          >
            <Sparkles size={12} className="animate-spin-slow" /> Professional Whiteboards
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-black text-sk-1 tracking-tighter mb-8 leading-[0.92]"
          >
            Capture ideas at the <br />
            <span className="bg-gradient-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent italic">
              Speed of Thought.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-sk-2 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            The productivity engine where structured notes meet freeform brainstorming. Fully collaborative and blazingly fast.
          </motion.p>

          <motion.div variants={itemVariants}>
            <button
              onClick={handleStart}
              className="shimmer-btn group inline-flex items-center gap-3 px-10 py-4 bg-sk-accent text-sk-base text-base font-bold rounded-xl hover:bg-sk-accent-hi transition-colors active:scale-[0.97]"
              style={{ boxShadow: '0 8px 32px rgba(6,182,212,0.30)' }}
            >
              Get Started
              <ArrowRight className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} size={18} />
            </button>
          </motion.div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]"
        >
          {/* Workspace preview — spans 2 cols, 2 rows */}
          <div className="md:col-span-2 row-span-2 bg-sk-surface border border-sk-subtle rounded-2xl p-8 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-sk-1 mb-2 tracking-tight">Workspace Intelligence</h3>
              <p className="text-sk-2 text-sm max-w-sm leading-relaxed">Organize your thoughts with our masonry layout and precision filtering system.</p>
            </div>
            <div className="absolute top-36 left-8 right-[-80px] bottom-[-80px] grid grid-cols-2 gap-4 opacity-40 group-hover:opacity-70 transition-opacity duration-500">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-sk-raised border border-sk-subtle rounded-xl p-6 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-1.5 bg-cyan-500/40 rounded-full mb-4" />
                  <div className="w-full h-1.5 bg-sk-strong rounded-full mb-2" />
                  <div className="w-2/3 h-1.5 bg-sk-strong rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Live sync — gradient card, looks great in both modes */}
          <div className="bg-gradient-to-br from-cyan-600 to-sky-700 rounded-2xl p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <Users className="text-white mb-5" size={30} strokeWidth={2} />
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Live Sync</h3>
              <p className="text-cyan-100 text-sm leading-relaxed">See collaborative cursors in real-time as your team builds together.</p>
            </div>
            <MousePointer2 className="absolute bottom-[-14px] right-[-14px] text-white/15 w-32 h-32 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-500" />
          </div>

          {/* Creative studio */}
          <div className="bg-sk-surface border border-sk-subtle rounded-2xl p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <Layout className="text-sk-accent mb-5" size={30} />
              <h3 className="text-xl font-bold text-sk-1 mb-2 tracking-tight">Creative Studio</h3>
              <p className="text-sk-2 text-sm leading-relaxed">An infinite canvas for your team's boldest brainstorming sessions.</p>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-3 bg-sk-raised rounded-full border border-sk-subtle flex items-center justify-around px-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 6px #22d3ee' }} />
              <div className="w-2 h-2 bg-sk-strong rounded-full" />
              <div className="w-2 h-2 bg-sk-strong rounded-full" />
            </div>
          </div>

          {/* Feature strip */}
          <div className="md:col-span-3 h-24 bg-sk-raised border border-sk-subtle rounded-2xl flex items-center justify-around px-8">
            {[
              { icon: <Zap className="text-yellow-500 dark:text-yellow-400" size={18} />,  label: 'Instant Sync' },
              { icon: <Layers className="text-blue-500 dark:text-blue-400" size={18} />,   label: 'Advanced Flow' },
              { icon: <Search className="text-sk-accent" size={18} />,                      label: 'Global Search' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sk-2 hover:text-sk-1 transition-colors duration-200 cursor-default group">
                <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sk-subtle py-12 px-8 bg-sk-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <PenTool size={15} className="text-sk-accent" />
            <span className="text-sm font-black uppercase tracking-tighter text-sk-1">Skimble</span>
          </div>
          <div className="flex gap-8 text-[11px] font-medium text-sk-3 uppercase tracking-widest">
            <a href="#" className="hover:text-sk-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-sk-accent transition-colors">Security</a>
            <a href="#" className="hover:text-sk-accent transition-colors">Twitter</a>
          </div>
          <div className="text-[11px] font-medium text-sk-3 uppercase tracking-widest">© 2026 Skimble</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
