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
  const auth = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (auth.isAuthenticated) navigate('/');
    else auth.signinRedirect();
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Dynamic Background Grid & Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
            <PenTool className="w-6 h-6 text-[#020617]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-500">
            Skimble
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={handleStart}
            className="text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-cyan-400 after:transition-all hover:after:w-full"
          >
            Sign In
          </button>
          <button 
            onClick={handleStart}
            className="shimmer-btn px-6 py-2.5 bg-white text-slate-900 text-sm font-black rounded-xl hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-28"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
          >
            <Sparkles size={14} className="animate-spin-slow" /> New: Professional Whiteboards
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-[0.9]"
          >
            Capture ideas at the <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent italic">
              Speed of Thought.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
          >
            The premium productivity engine where structured notes meet freeform brainstorming. Fully collaborative and blazingly fast.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <button 
              onClick={handleStart}
              className="shimmer-btn group relative inline-flex items-center gap-4 px-12 py-6 bg-cyan-600 text-white text-lg font-black rounded-[2rem] hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-600/30 hover:-translate-y-1 active:translate-y-0"
            >
              Initialize Workspace
              <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
          </motion.div>
        </motion.div>

        {/* Bento Grid Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[260px]"
        >
          {/* Dashboard Preview */}
          <div className="md:col-span-2 row-span-2 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[3rem] p-10 overflow-hidden relative group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">Workspace Intelligence</h3>
              <p className="text-slate-400 text-base max-w-sm font-medium leading-relaxed">Organize your thoughts with our organic masonry layout and precision filtering system.</p>
            </div>
            
            {/* Visual Mockup of Cards */}
            <div className="absolute top-40 left-10 right-[-100px] bottom-[-100px] grid grid-cols-2 gap-6 opacity-40 group-hover:opacity-80 transition-opacity duration-700">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-700">
                  <div className="w-16 h-2 bg-cyan-500/40 rounded-full mb-6" />
                  <div className="w-full h-2 bg-slate-700 rounded-full mb-3" />
                  <div className="w-2/3 h-2 bg-slate-700 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration Preview */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
            <div className="relative z-10">
              <Users className="text-white mb-6" size={40} strokeWidth={2.5} />
              <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">Live Sync</h3>
              <p className="text-cyan-100 text-sm font-medium leading-relaxed">See collaborative name-tags and cursors in real-time as you build together.</p>
            </div>
            <MousePointer2 className="absolute bottom-[-20px] right-[-20px] text-white/20 w-48 h-48 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Whiteboard Preview */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
            <div className="relative z-10">
              <Layout className="text-cyan-400 mb-6" size={40} />
              <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">Creative Studio</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">An infinite digital canvas for your team's boldest and most complex brainstorming sessions.</p>
            </div>
            {/* Toolbar representation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2/3  h-4 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 flex items-center justify-around px-6">
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
              <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
            </div>
          </div>

          {/* Feature Strip */}
          <div className="md:col-span-3 h-28 bg-slate-900/20 backdrop-blur-sm border border-white/5 rounded-[2rem] flex items-center justify-around px-10">
            <div className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group">
              <Zap className="text-yellow-400 group-hover:scale-110 transition-transform" size={24} />
              <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white">Instant Sync</span>
            </div>
            <div className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group">
              <Layers className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
              <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white">Advanced Flow</span>
            </div>
            <div className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group">
              <Search className="text-cyan-500 group-hover:scale-110 transition-transform" size={24} />
              <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white">Global Search</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 border-t border-white/5 py-16 px-8 bg-[#010413]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <PenTool size={20} className="text-cyan-500" />
            <span className="text-base font-black uppercase tracking-tighter text-white">Skimble</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Security</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
          </div>
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
            © 2026 Cloud Computing Skimble
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default Landing;
