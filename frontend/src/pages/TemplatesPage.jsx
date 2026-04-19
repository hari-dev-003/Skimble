import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Users, Zap, Map, BarChart3, Layout, Grid3X3, GitBranch, Target, ArrowRight, Tag } from 'lucide-react';
import { TEMPLATE_ELEMENTS } from '../data/templateElements';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const TEMPLATES = [
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Plan your product quarters with milestones, features, and delivery targets.',
    category: 'Planning',
    icon: BarChart3,
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    accent: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400',
    shapes: [
      { w: '55%', h: '40%', top: '15%', left: '5%', op: 0.9 },
      { w: '30%', h: '35%', top: '15%', left: '65%', op: 0.7 },
      { w: '90%', h: '20%', top: '65%', left: '5%', op: 0.5 },
    ],
  },
  {
    id: 'sprint-board',
    name: 'Sprint Board',
    description: 'Kanban-style board to manage your sprint backlog, in-progress, and done.',
    category: 'Agile',
    icon: Grid3X3,
    color: 'from-violet-400 to-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    accent: 'text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-400',
    shapes: [
      { w: '28%', h: '70%', top: '10%', left: '3%', op: 0.9 },
      { w: '28%', h: '70%', top: '10%', left: '36%', op: 0.7 },
      { w: '28%', h: '70%', top: '10%', left: '69%', op: 0.5 },
    ],
  },
  {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'Radial brainstorm canvas to explore ideas from a central topic outward.',
    category: 'Brainstorm',
    icon: GitBranch,
    color: 'from-emerald-400 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    accent: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400',
    shapes: [
      { w: '20%', h: '20%', top: '40%', left: '40%', op: 1, round: true },
      { w: '15%', h: '15%', top: '10%', left: '10%', op: 0.7, round: true },
      { w: '15%', h: '15%', top: '10%', left: '75%', op: 0.7, round: true },
      { w: '15%', h: '15%', top: '70%', left: '10%', op: 0.7, round: true },
      { w: '15%', h: '15%', top: '70%', left: '75%', op: 0.7, round: true },
    ],
  },
  {
    id: 'user-journey',
    name: 'User Journey Map',
    description: 'Visualize your users\' experience across touchpoints and emotional stages.',
    category: 'UX Research',
    icon: Map,
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    accent: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400',
    shapes: [
      { w: '18%', h: '60%', top: '20%', left: '2%', op: 0.9 },
      { w: '18%', h: '60%', top: '20%', left: '22%', op: 0.75 },
      { w: '18%', h: '60%', top: '20%', left: '42%', op: 0.9 },
      { w: '18%', h: '60%', top: '20%', left: '62%', op: 0.75 },
      { w: '18%', h: '60%', top: '20%', left: '82%', op: 0.9 },
    ],
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    description: 'Structured board for What Went Well, Improvements, and Action Items.',
    category: 'Agile',
    icon: Target,
    color: 'from-rose-400 to-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    accent: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-400',
    shapes: [
      { w: '30%', h: '75%', top: '10%', left: '3%', op: 0.9 },
      { w: '30%', h: '75%', top: '10%', left: '36%', op: 0.8 },
      { w: '30%', h: '75%', top: '10%', left: '69%', op: 0.7 },
    ],
  },
  {
    id: 'wireframe',
    name: 'Wireframe Kit',
    description: 'Low-fidelity UI blocks for sketching screens and flows quickly.',
    category: 'Design',
    icon: Layout,
    color: 'from-cyan-400 to-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    accent: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/40 dark:text-cyan-400',
    shapes: [
      { w: '90%', h: '15%', top: '5%', left: '5%', op: 0.6 },
      { w: '42%', h: '55%', top: '27%', left: '5%', op: 0.8 },
      { w: '42%', h: '25%', top: '27%', left: '53%', op: 0.7 },
      { w: '42%', h: '25%', top: '57%', left: '53%', op: 0.5 },
    ],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm Canvas',
    description: 'Free-form canvas with sticky note clusters for open ideation sessions.',
    category: 'Brainstorm',
    icon: Sparkles,
    color: 'from-indigo-400 to-purple-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    accent: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400',
    shapes: [
      { w: '22%', h: '28%', top: '5%', left: '5%', op: 0.9 },
      { w: '22%', h: '28%', top: '5%', left: '32%', op: 0.7 },
      { w: '22%', h: '28%', top: '5%', left: '59%', op: 0.85 },
      { w: '22%', h: '28%', top: '40%', left: '5%', op: 0.6 },
      { w: '22%', h: '28%', top: '40%', left: '32%', op: 0.9 },
      { w: '22%', h: '28%', top: '40%', left: '59%', op: 0.7 },
    ],
  },
  {
    id: 'okr',
    name: 'OKR Planning',
    description: 'Align your team on Objectives and Key Results for the quarter.',
    category: 'Planning',
    icon: Zap,
    color: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    accent: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-400',
    shapes: [
      { w: '88%', h: '22%', top: '5%', left: '6%', op: 0.9 },
      { w: '88%', h: '22%', top: '33%', left: '6%', op: 0.75 },
      { w: '88%', h: '22%', top: '62%', left: '6%', op: 0.6 },
    ],
  },
];

const CATEGORIES = ['All', 'Planning', 'Agile', 'Brainstorm', 'UX Research', 'Design'];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { joinSession } = useSession();
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(null);

  const token = auth.user?.access_token;

  const handleUseTemplate = async (templateId) => {
    setLoading(templateId);
    try {
      const baseElements = TEMPLATE_ELEMENTS[templateId] || [];
      
      // Calculate bounding box of the template
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      baseElements.forEach(el => {
        const x = el.x || 0;
        const y = el.y || 0;
        const w = el.width || el.radiusX * 2 || (el.points ? Math.max(...el.points.filter((_, i) => i % 2 === 0)) : 0) || 0;
        const h = el.height || el.radiusY * 2 || (el.points ? Math.max(...el.points.filter((_, i) => i % 2 === 1)) : 0) || 0;
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });

      const templateWidth = maxX - minX;
      const templateHeight = maxY - minY;
      
      // Center relative to window (rough approximation of canvas center)
      const centerX = window.innerWidth / 2;
      const centerY = (window.innerHeight - 64) / 2; // Subtract header height approx

      const offsetX = centerX - (templateWidth / 2) - minX;
      const offsetY = centerY - (templateHeight / 2) - minY;

      const initialElements = baseElements.map(el => {
        const newEl = { ...el, id: crypto.randomUUID() };
        if (newEl.points) {
          newEl.points = newEl.points.map((p, i) => i % 2 === 0 ? p + offsetX : p + offsetY);
        } else {
          newEl.x += offsetX;
          newEl.y += offsetY;
        }
        return newEl;
      });

      const res = await axios.post(
        `${BACKEND_URL}/api/sessions`,
        { initialElements },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      joinSession(res.data, true);
      navigate(`/whiteboard/${res.data.code}`);
    } catch (error) {
      console.error('Failed to use template:', error);
      setLoading(null);
    }
  };

  const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="min-h-full p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sk-1 tracking-tight">Templates</h1>
        <p className="text-sm text-sk-2 mt-1">Jump-start your board with a proven structure.</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              filter === cat
                ? 'bg-sk-accent text-white border-sk-accent shadow-sm'
                : 'bg-sk-surface text-sk-2 border-sk-subtle hover:border-sk-accent/30 hover:text-sk-1'
            }`}
          >
            {cat !== 'All' && <Tag size={11} />}
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((t, idx) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-sk-surface border border-sk-subtle rounded-2xl overflow-hidden hover:border-sk-accent/30 hover:shadow-lg transition-all group flex flex-col"
            >
              {/* Preview */}
              <div className={`${t.bg} relative h-36 overflow-hidden`}>
                {t.shapes.map((s, i) => (
                  <div
                    key={i}
                    className={`absolute bg-gradient-to-br ${t.color} ${s.round ? 'rounded-full' : 'rounded-lg'}`}
                    style={{
                      width: s.w, height: s.h,
                      top: s.top, left: s.left,
                      opacity: s.op * 0.4,
                    }}
                  />
                ))}
                <div className={`absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-md`}>
                  <Icon size={17} className="text-white" />
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md w-fit mb-2 ${t.accent}`}>
                  {t.category}
                </span>
                <h3 className="text-sm font-bold text-sk-1 mb-1">{t.name}</h3>
                <p className="text-xs text-sk-2 leading-relaxed flex-1">{t.description}</p>

                <button
                  onClick={() => handleUseTemplate(t.id)}
                  disabled={loading === t.id}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-sk-accent text-white text-xs font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors disabled:opacity-60 group-hover:shadow-sm"
                >
                  {loading === t.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Use Template <ArrowRight size={13} /></>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 p-8 bg-sk-surface border border-sk-subtle rounded-2xl text-center">
        <div className="w-12 h-12 bg-sk-accent/10 border border-sk-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users size={22} className="text-sk-accent" />
        </div>
        <h3 className="text-base font-bold text-sk-1 mb-1">Start from scratch</h3>
        <p className="text-sm text-sk-2 mb-5 max-w-sm mx-auto">
          Prefer a blank canvas? Launch an empty board and build your own structure.
        </p>
        <button
          onClick={() => navigate('/brainstorm')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sk-accent text-white text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors shadow-sm"
        >
          <Sparkles size={14} /> New Blank Board
        </button>
      </div>
    </div>
  );
};

export default TemplatesPage;
