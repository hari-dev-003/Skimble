import { useNavigate } from 'react-router-dom';
import {
  PenTool,
  Sparkles,
  Zap,
  Users,
  Layout,
  ArrowRight,
  MousePointer2,
} from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const auth     = useAuth();
  const navigate = useNavigate();

  // ── Refs for GSAP targets ───────────────────────────────────────────────
  const rootRef      = useRef(null);
  const navRef       = useRef(null);
  const orb1Ref      = useRef(null);
  const orb2Ref      = useRef(null);
  const badgeRef     = useRef(null);
  const h1Ref        = useRef(null);
  const underlineRef = useRef(null);
  const paraRef      = useRef(null);
  const ctaRef       = useRef(null);
  const featuresRef  = useRef(null);
  const previewRef   = useRef(null);
  const cursorRef    = useRef(null);
  const brandsRef    = useRef(null);
  const footerRef    = useRef(null);

  const handleStart = () => {
    if (auth.isAuthenticated) navigate('/');
    else auth.signinRedirect();
  };

  useEffect(() => {
    // Feature card hover — outside gsap.context so we can remove listeners in cleanup
    const cards = featuresRef.current?.querySelectorAll('.feature-card') || [];
    const onEnter = (e) => gsap.to(e.currentTarget, { y: -10, duration: 0.3, ease: 'power2.out' });
    const onLeave = (e) => gsap.to(e.currentTarget, { y: 0,  duration: 0.3, ease: 'power2.out' });
    cards.forEach(card => {
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
    });

    const ctx = gsap.context(() => {

      // ── Nav entrance ──────────────────────────────────────────────────────
      gsap.from(navRef.current, {
        y: -60, opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });

      // ── Hero stagger (mirrors original containerVariants / itemVariants) ─
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current,  { y: 30, opacity: 0, duration: 0.5 }, 0.1)
        .from(h1Ref.current,     { y: 30, opacity: 0, duration: 0.5 }, 0.2)
        .from(paraRef.current,   { y: 30, opacity: 0, duration: 0.5 }, 0.3)
        .from(ctaRef.current,    { y: 30, opacity: 0, duration: 0.5 }, 0.4);

      // ── SVG underline draw-on (mirrors pathLength 0→1 at delay:1) ───────
      if (underlineRef.current) {
        const path = underlineRef.current;
        const len  = path.getTotalLength?.() || 300;
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1,
          delay: 1,
          ease: 'power2.out',
        });
      }

      // ── Background orb parallax (mirrors style={{ y: y1 }} scrub) ───────
      gsap.to(orb1Ref.current, {
        y: -200,
        scrollTrigger: { scrub: 1.5, start: 'top top', end: 'bottom top' },
      });
      gsap.to(orb2Ref.current, {
        y: -500,
        rotate: 45,
        scrollTrigger: { scrub: 2, start: 'top top', end: 'bottom top' },
      });

      // ── Feature cards whileInView (opacity 0→1, y 20→0) ─────────────────
      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
          opacity: 0, y: 20,
          stagger: 0.1,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // ── Preview section (opacity 0, scale 0.95 → 1) ───────────────────
      if (previewRef.current) {
        gsap.from(previewRef.current, {
          opacity: 0, scale: 0.95,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: previewRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // ── Floating cursor (mirrors animate x:[0,100,50] y:[0,50,20]) ───────
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          keyframes: [
            { x: 100, y: 50,  duration: 2, ease: 'sine.inOut' },
            { x: 50,  y: 20,  duration: 2, ease: 'sine.inOut' },
            { x: 0,   y: 0,   duration: 2, ease: 'sine.inOut' },
          ],
          repeat: -1,
        });
      }

      // ── Brand logos (mirrors whileInView stagger) ─────────────────────
      if (brandsRef.current) {
        gsap.from(brandsRef.current.querySelectorAll('.brand-item'), {
          opacity: 0, y: 10,
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: brandsRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // ── Footer scroll reveal ──────────────────────────────────────────────
      if (footerRef.current) {
        gsap.from(footerRef.current.querySelectorAll(':scope > div > div'), {
          opacity: 0, y: 24,
          stagger: 0.1,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        });
      }

    }, rootRef);

    return () => {
      ctx.revert();
      cards.forEach(card => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-sk-base text-sk-1 selection:bg-sk-accent/30 overflow-x-hidden relative"
    >
      {/* ── Dynamic Background Elements ─────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          ref={orb1Ref}
          className="absolute top-[10%] left-[5%] w-64 h-64 bg-sk-accent/5 rounded-3xl blur-3xl"
        />
        <div
          ref={orb2Ref}
          className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-sk-accent/5 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--sk-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--sk-subtle)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav ref={navRef} className="relative z-50 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-sk-accent/10 border border-sk-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <PenTool className="w-5 h-5 text-sk-accent" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-sk-1 group-hover:text-sk-accent transition-colors duration-300">
            Skimble
          </span>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={handleStart}
            className="text-sm font-semibold text-sk-2 hover:text-sk-accent transition-colors"
          >
            Log In
          </button>
          <button
            onClick={handleStart}
            className="shimmer-btn px-6 py-2.5 bg-sk-accent text-white text-sm font-bold shadow-lg shadow-sk-accent/20 hover:shadow-sk-accent/40 transition-all active:scale-[0.97]"
          >
            Join the Workspace
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32">
        <div className="text-center mb-32">

          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sk-accent/10 border border-sk-accent/20 text-sk-accent text-[12px] font-bold uppercase tracking-wider mb-10"
          >
            <Sparkles size={14} className="animate-pulse" /> Reimagining Productivity
          </div>

          {/* Headline */}
          <h1
            ref={h1Ref}
            className="text-7xl md:text-8xl font-extrabold text-sk-1 tracking-tight mb-10 leading-[0.95]"
          >
            Where ideas find <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-sk-accent to-indigo-400 bg-clip-text text-transparent">
                their space.
              </span>
              {/* SVG underline — GSAP draws strokeDashoffset on mount */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-sk-accent/30"
                viewBox="0 0 300 12"
                fill="none"
                aria-hidden
              >
                <path
                  ref={underlineRef}
                  d="M4 8C50 2 150 2 296 8"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={paraRef}
            className="text-xl text-sk-2 max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
          >
            A premium, high-productivity workspace where structured notes meet limitless brainstorming.
            Designed for deep work and seamless collaboration.
          </p>

          {/* CTA Row */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={handleStart}
              className="shimmer-btn group inline-flex items-center gap-3 px-12 py-5 bg-sk-accent text-white text-lg font-bold shadow-2xl shadow-sk-accent/30 hover:shadow-sk-accent/50 transition-all active:scale-[0.95]"
            >
              Start Creating
              <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} size={20} />
            </button>
            <div className="flex -space-x-3 overflow-hidden p-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="flex h-10 w-10 rounded-full ring-4 ring-sk-base bg-sk-raised items-center justify-center border border-sk-subtle overflow-hidden shrink-0"
                >
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                </div>
              ))}
              <div className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-sk-base bg-sk-accent text-white text-[10px] font-bold">
                +2k
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature Grid ──────────────────────────────────────────────── */}
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: <Layout className="text-sk-accent" size={32} />,
              title: 'Digital Zen Workspace',
              desc: 'A clutter-free environment designed to help you focus on what matters most — your ideas.',
            },
            {
              icon: <Users className="text-sk-accent" size={32} />,
              title: 'Real-time Collaboration',
              desc: 'Work together in perfect harmony with instant sync and live collaborative cursors.',
            },
            {
              icon: <Zap className="text-sk-accent" size={32} />,
              title: 'Infinite Creativity',
              desc: 'From structured notes to messy brainstorms, our infinite canvas adapts to your flow.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="feature-card sk-card bg-sk-surface p-10 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                {feature.icon}
              </div>
              <div className="relative z-10">
                <div className="mb-6 p-3 w-fit bg-sk-accent/10 rounded-2xl group-hover:bg-sk-accent group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-sk-1 mb-4">{feature.title}</h3>
                <p className="text-sk-2 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Interactive Preview Section ────────────────────────────────── */}
        <div
          ref={previewRef}
          className="relative bg-sk-surface border border-sk-subtle rounded-[32px] p-4 md:p-8 shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sk-accent/5 to-transparent pointer-events-none" />

          {/* Browser chrome */}
          <div className="flex items-center gap-4 mb-8 px-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
              <div className="w-3 h-3 rounded-full bg-green-400/50" />
            </div>
            <div className="h-8 flex-1 bg-sk-raised rounded-lg border border-sk-subtle flex items-center px-4">
              <div className="w-1/2 h-2 bg-sk-subtle rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 min-h-[400px]">
            {/* Sidebar mock */}
            <div className="col-span-3 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-sk-raised rounded-xl border border-sk-subtle" />
              ))}
            </div>

            {/* Content mock */}
            <div className="col-span-9 bg-sk-base rounded-2xl border border-sk-subtle p-8 relative">
              <div className="space-y-6">
                <div className="w-3/4 h-8 bg-sk-strong/20 rounded-lg animate-pulse" />
                <div className="w-full h-4 bg-sk-strong/10 rounded-full" />
                <div className="w-5/6 h-4 bg-sk-strong/10 rounded-full" />
                <div className="w-2/3 h-4 bg-sk-strong/10 rounded-full" />
              </div>

              {/* Floating Cursor — GSAP animates this */}
              <div
                ref={cursorRef}
                className="absolute top-1/2 left-1/4 flex items-center gap-2"
                style={{ willChange: 'transform' }}
              >
                <MousePointer2 className="text-sk-accent fill-sk-accent" size={20} />
                <span className="bg-sk-accent text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                  Sarah is typing...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Social Proof / Trusted By ──────────────────────────────────── */}
        <div className="mt-32 text-center">
          <p className="text-sk-3 text-xs font-bold uppercase tracking-[0.3em] mb-12">
            Trusted by builders at
          </p>
          <div
            ref={brandsRef}
            className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40"
          >
            {['Meta', 'Linear', 'Vercel', 'Stripe', 'Airbnb'].map(brand => (
              <span
                key={brand}
                className="brand-item text-2xl font-black text-sk-1 hover:text-sk-accent hover:opacity-100 transition-all cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer ref={footerRef} className="relative z-10 border-t border-sk-subtle py-20 px-8 bg-sk-surface/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <PenTool size={20} className="text-sk-accent" />
              <span className="text-xl font-extrabold tracking-tight text-sk-1">Skimble</span>
            </div>
            <p className="text-sk-2 max-w-sm mb-8 font-medium leading-relaxed">
              The next generation workspace for teams who value clarity, focus, and speed.
            </p>
          </div>
          <div>
            <h4 className="text-sk-1 font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm font-semibold text-sk-2">
              <li className="hover:text-sk-accent transition-colors cursor-pointer">Changelog</li>
              <li className="hover:text-sk-accent transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-sk-accent transition-colors cursor-pointer">Templates</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sk-1 font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-semibold text-sk-2">
              <li className="hover:text-sk-accent transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-sk-accent transition-colors cursor-pointer">Twitter / X</li>
              <li className="hover:text-sk-accent transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-sk-subtle flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[11px] font-bold text-sk-3 uppercase tracking-widest">
            © 2026 Skimble Inc. All rights reserved.
          </div>
          <div className="flex gap-8 text-[11px] font-bold text-sk-3 uppercase tracking-widest">
            <a href="#" className="hover:text-sk-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-sk-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
