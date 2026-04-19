// Canvas element presets for each template.
// IDs are placeholders — callers must replace with fresh crypto.randomUUID() values.

const T = 'template'; // creatorId sentinel

const base = (overrides) => ({
  stroke: 'transparent', strokeWidth: 0,
  opacity: 1, rotation: 0, scaleX: 1, scaleY: 1,
  creatorId: T,
  ...overrides,
});

const rect = (id, x, y, w, h, fill, stroke = 'transparent', sw = 0) =>
  base({ id, type: 'rect', x, y, width: w, height: h, fill, stroke, strokeWidth: sw });

const label = (id, x, y, text, fill = '#1A1A1A', fontSize = 14) =>
  base({ id, type: 'text', x, y, text, fill, fontSize, fontFamily: 'Aptos, sans-serif', strokeWidth: 0, stroke: 'transparent' });

const sticky = (id, x, y, text, fill = '#FEF08A', w = 220, h = 100) =>
  base({ id, type: 'sticky', x, y, width: w, height: h, fill, text, fontSize: 13 });

const arrow = (id, x1, y1, x2, y2, stroke = '#94A3B8', sw = 2) =>
  base({ id, type: 'arrow', x: 0, y: 0, points: [x1, y1, x2, y2], stroke, strokeWidth: sw, fill: stroke });

const line = (id, x1, y1, x2, y2, stroke = '#E2E8F0', sw = 1.5) =>
  base({ id, type: 'line', x: 0, y: 0, points: [x1, y1, x2, y2], stroke, strokeWidth: sw, fill: 'transparent' });

const circle = (id, x, y, rx, ry, fill, stroke = 'transparent', sw = 0) =>
  base({ id, type: 'circle', x, y, radiusX: rx, radiusY: ry, fill, stroke, strokeWidth: sw });

// ─── Sprint Board ───────────────────────────────────────────────────────────
const sprintBoard = [
  // column backgrounds
  rect('sb-bg1', 40, 50, 310, 560, '#F8FAFC', '#E2E8F0', 1.5),
  rect('sb-bg2', 390, 50, 310, 560, '#F0FDF4', '#BBF7D0', 1.5),
  rect('sb-bg3', 740, 50, 310, 560, '#EFF6FF', '#BFDBFE', 1.5),
  // column headers
  label('sb-h1', 56, 22, 'Backlog', '#64748B', 13),
  label('sb-h2', 406, 22, 'In Progress', '#059669', 13),
  label('sb-h3', 756, 22, 'Done ✓', '#2563EB', 13),
  // divider line under headers
  line('sb-l1', 40, 50, 350, 50, '#E2E8F0', 1),
  line('sb-l2', 390, 50, 700, 50, '#BBF7D0', 1),
  line('sb-l3', 740, 50, 1050, 50, '#BFDBFE', 1),
  // Backlog stickies
  sticky('sb-s1', 58, 68, 'User authentication flow', '#FEF9C3', 274, 100),
  sticky('sb-s2', 58, 186, 'Dashboard redesign', '#FEF9C3', 274, 100),
  sticky('sb-s3', 58, 304, 'API rate limiting', '#FEF9C3', 274, 100),
  sticky('sb-s4', 58, 422, 'Mobile responsive layout', '#FEF9C3', 274, 100),
  // In Progress stickies
  sticky('sb-s5', 408, 68, 'Login & signup pages', '#DCFCE7', 274, 100),
  sticky('sb-s6', 408, 186, 'DB schema setup', '#DCFCE7', 274, 100),
  // Done stickies
  sticky('sb-s7', 758, 68, 'Project scaffolding', '#DBEAFE', 274, 100),
  sticky('sb-s8', 758, 186, 'CI/CD pipeline setup', '#DBEAFE', 274, 100),
];

// ─── Retrospective ──────────────────────────────────────────────────────────
const retrospective = [
  label('rt-title', 340, 10, 'Sprint Retrospective', '#1A1A1A', 20),
  // columns
  rect('rt-bg1', 40, 55, 310, 580, '#F0FDF4', '#BBF7D0', 1.5),
  rect('rt-bg2', 390, 55, 310, 580, '#FFFBEB', '#FDE68A', 1.5),
  rect('rt-bg3', 740, 55, 310, 580, '#EFF6FF', '#BFDBFE', 1.5),
  // headers
  label('rt-h1', 56, 66, '✓  What Went Well', '#059669', 13),
  label('rt-h2', 406, 66, '▲  To Improve', '#D97706', 13),
  label('rt-h3', 756, 66, '→  Action Items', '#2563EB', 13),
  // What Went Well
  sticky('rt-s1', 58, 100, 'Great team collaboration this sprint', '#DCFCE7', 274, 95),
  sticky('rt-s2', 58, 213, 'Shipped all planned features on time', '#DCFCE7', 274, 95),
  sticky('rt-s3', 58, 326, 'Clear and focused stand-ups', '#DCFCE7', 274, 95),
  // To Improve
  sticky('rt-s4', 408, 100, 'Sprint planning needs more detail', '#FEF9C3', 274, 95),
  sticky('rt-s5', 408, 213, 'Better async communication needed', '#FEF9C3', 274, 95),
  sticky('rt-s6', 408, 326, 'Acceptance criteria were unclear', '#FEF9C3', 274, 95),
  // Action Items
  sticky('rt-s7', 758, 100, 'Schedule refinement sessions weekly', '#DBEAFE', 274, 95),
  sticky('rt-s8', 758, 213, 'Create a shared definition of done', '#DBEAFE', 274, 95),
];

// ─── Product Roadmap ────────────────────────────────────────────────────────
const productRoadmap = [
  label('pr-title', 330, 10, 'Product Roadmap 2024', '#1A1A1A', 20),
  // quarter header rects
  rect('pr-q1h', 150, 48, 230, 36, '#EFF6FF', '#BFDBFE', 1),
  rect('pr-q2h', 400, 48, 230, 36, '#F0FDF4', '#BBF7D0', 1),
  rect('pr-q3h', 650, 48, 230, 36, '#FFFBEB', '#FDE68A', 1),
  rect('pr-q4h', 900, 48, 230, 36, '#FFF1F2', '#FECDD3', 1),
  label('pr-q1', 243, 61, 'Q1', '#2563EB', 14),
  label('pr-q2', 493, 61, 'Q2', '#059669', 14),
  label('pr-q3', 743, 61, 'Q3', '#D97706', 14),
  label('pr-q4', 993, 61, 'Q4', '#E11D48', 14),
  // row labels
  label('pr-r1', 10, 112, 'Core', '#6B7280', 12),
  label('pr-r2', 10, 222, 'UX', '#6B7280', 12),
  label('pr-r3', 10, 332, 'Platform', '#6B7280', 12),
  label('pr-r4', 10, 442, 'Growth', '#6B7280', 12),
  // horizontal row dividers
  line('pr-d1', 150, 96, 1130, 96, '#E2E8F0', 1),
  line('pr-d2', 150, 196, 1130, 196, '#E2E8F0', 1),
  line('pr-d3', 150, 306, 1130, 306, '#E2E8F0', 1),
  line('pr-d4', 150, 416, 1130, 416, '#E2E8F0', 1),
  line('pr-d5', 150, 526, 1130, 526, '#E2E8F0', 1),
  // vertical quarter dividers
  line('pr-v1', 150, 48, 150, 530, '#E2E8F0', 1),
  line('pr-v2', 400, 48, 400, 530, '#E2E8F0', 1),
  line('pr-v3', 650, 48, 650, 530, '#E2E8F0', 1),
  line('pr-v4', 900, 48, 900, 530, '#E2E8F0', 1),
  line('pr-v5', 1130, 48, 1130, 530, '#E2E8F0', 1),
  // Core feature blocks (Q1-Q3)
  rect('pr-f1', 158, 104, 214, 84, '#BFDBFE', 'transparent', 0),
  label('pr-f1t', 165, 130, 'Auth & Onboarding', '#1E40AF', 12),
  rect('pr-f2', 658, 104, 214, 84, '#FDE68A', 'transparent', 0),
  label('pr-f2t', 665, 130, 'Performance Tuning', '#92400E', 12),
  // UX blocks
  rect('pr-f3', 408, 204, 214, 84, '#BBF7D0', 'transparent', 0),
  label('pr-f3t', 415, 230, 'Design System v2', '#065F46', 12),
  rect('pr-f4', 908, 204, 214, 84, '#FECDD3', 'transparent', 0),
  label('pr-f4t', 915, 230, 'Accessibility Audit', '#9F1239', 12),
  // Platform blocks
  rect('pr-f5', 158, 314, 464, 84, '#E0E7FF', 'transparent', 0),
  label('pr-f5t', 165, 340, 'Microservices Migration (Q1–Q2)', '#3730A3', 12),
  // Growth blocks
  rect('pr-f6', 658, 424, 214, 84, '#FDE68A', 'transparent', 0),
  label('pr-f6t', 665, 450, 'Analytics Dashboard', '#92400E', 12),
  rect('pr-f7', 908, 424, 214, 84, '#FECDD3', 'transparent', 0),
  label('pr-f7t', 915, 450, 'Referral Program', '#9F1239', 12),
];

// ─── Mind Map ───────────────────────────────────────────────────────────────
const mindMap = [
  label('mm-title', 420, 10, 'Mind Map', '#1A1A1A', 20),
  // center node
  circle('mm-center', 560, 360, 70, 50, '#2563EB'),
  label('mm-ct', 520, 348, 'Main Topic', '#FFFFFF', 13),
  // branch nodes (ellipses)
  circle('mm-n1', 200, 140, 70, 38, '#7C3AED'),
  circle('mm-n2', 560, 90, 70, 38, '#059669'),
  circle('mm-n3', 920, 140, 70, 38, '#D97706'),
  circle('mm-n4', 200, 580, 70, 38, '#E11D48'),
  circle('mm-n5', 560, 630, 70, 38, '#0891B2'),
  circle('mm-n6', 920, 580, 70, 38, '#65A30D'),
  // branch labels
  label('mm-l1', 148, 130, 'Research', '#FFFFFF', 12),
  label('mm-l2', 518, 80, 'Strategy', '#FFFFFF', 12),
  label('mm-l3', 876, 130, 'Design', '#FFFFFF', 12),
  label('mm-l4', 158, 570, 'Engineering', '#FFFFFF', 12),
  label('mm-l5', 526, 620, 'Marketing', '#FFFFFF', 12),
  label('mm-l6', 886, 570, 'Analytics', '#FFFFFF', 12),
  // connectors
  arrow('mm-a1', 490, 312, 270, 178, '#7C3AED', 2),
  arrow('mm-a2', 530, 310, 530, 128, '#059669', 2),
  arrow('mm-a3', 630, 312, 850, 178, '#D97706', 2),
  arrow('mm-a4', 490, 408, 270, 542, '#E11D48', 2),
  arrow('mm-a5', 530, 410, 530, 592, '#0891B2', 2),
  arrow('mm-a6', 630, 408, 850, 542, '#65A30D', 2),
  // sub-branch stickies
  sticky('mm-s1', 60, 200, 'User interviews', '#EDE9FE', 130, 70),
  sticky('mm-s2', 410, 18, 'OKR alignment', '#DCFCE7', 130, 70),
  sticky('mm-s3', 970, 200, 'Component library', '#FEF3C7', 130, 70),
];

// ─── User Journey Map ────────────────────────────────────────────────────────
const userJourney = [
  label('uj-title', 330, 8, 'User Journey Map', '#1A1A1A', 20),
  // stage header rects
  rect('uj-h1', 40, 45, 190, 40, '#EFF6FF', '#BFDBFE', 1),
  rect('uj-h2', 250, 45, 190, 40, '#F0FDF4', '#BBF7D0', 1),
  rect('uj-h3', 460, 45, 190, 40, '#FFFBEB', '#FDE68A', 1),
  rect('uj-h4', 670, 45, 190, 40, '#FFF1F2', '#FECDD3', 1),
  rect('uj-h5', 880, 45, 190, 40, '#F5F3FF', '#DDD6FE', 1),
  label('uj-s1', 104, 61, 'Awareness', '#2563EB', 12),
  label('uj-s2', 308, 61, 'Consideration', '#059669', 12),
  label('uj-s3', 524, 61, 'Decision', '#D97706', 12),
  label('uj-s4', 735, 61, 'Purchase', '#E11D48', 12),
  label('uj-s5', 942, 61, 'Retention', '#7C3AED', 12),
  // row label column
  rect('uj-rc1', -5, 95, 36, 80, '#F8FAFC', '#E2E8F0', 1),
  rect('uj-rc2', -5, 185, 36, 80, '#F8FAFC', '#E2E8F0', 1),
  rect('uj-rc3', -5, 275, 36, 80, '#F8FAFC', '#E2E8F0', 1),
  rect('uj-rc4', -5, 365, 36, 80, '#F8FAFC', '#E2E8F0', 1),
  label('uj-rl1', -2, 122, 'Actions', '#64748B', 10),
  label('uj-rl2', -2, 212, 'Thoughts', '#64748B', 10),
  label('uj-rl3', -2, 300, 'Emotions', '#64748B', 10),
  label('uj-rl4', -2, 388, 'Channels', '#64748B', 10),
  // grid dividers
  line('uj-v1', 40, 45, 40, 450, '#E2E8F0', 1),
  line('uj-v2', 250, 45, 250, 450, '#E2E8F0', 1),
  line('uj-v3', 460, 45, 460, 450, '#E2E8F0', 1),
  line('uj-v4', 670, 45, 670, 450, '#E2E8F0', 1),
  line('uj-v5', 880, 45, 880, 450, '#E2E8F0', 1),
  line('uj-v6', 1070, 45, 1070, 450, '#E2E8F0', 1),
  line('uj-h1l', 40, 95, 1070, 95, '#E2E8F0', 1),
  line('uj-h2l', 40, 185, 1070, 185, '#E2E8F0', 1),
  line('uj-h3l', 40, 275, 1070, 275, '#E2E8F0', 1),
  line('uj-h4l', 40, 365, 1070, 365, '#E2E8F0', 1),
  line('uj-h5l', 40, 450, 1070, 450, '#E2E8F0', 1),
  // Sample content stickies
  sticky('uj-c1', 48, 100, 'Sees social ad', '#DBEAFE', 174, 72),
  sticky('uj-c2', 258, 100, 'Reads blog post', '#DCFCE7', 174, 72),
  sticky('uj-c3', 468, 100, 'Views pricing page', '#FEF9C3', 174, 72),
  sticky('uj-c4', 678, 100, 'Adds to cart', '#FECDD3', 174, 72),
  sticky('uj-c5', 888, 100, 'Gets onboarding email', '#EDE9FE', 174, 72),
  sticky('uj-e1', 48, 285, '😐 Curious', '#DBEAFE', 174, 72),
  sticky('uj-e2', 258, 285, '🤔 Evaluating', '#DCFCE7', 174, 72),
  sticky('uj-e3', 468, 285, '😊 Interested', '#FEF9C3', 174, 72),
  sticky('uj-e4', 678, 285, '😄 Excited', '#FECDD3', 174, 72),
  sticky('uj-e5', 888, 285, '🌟 Delighted', '#EDE9FE', 174, 72),
];

// ─── Wireframe Kit ───────────────────────────────────────────────────────────
const wireframe = [
  label('wf-title', 320, 8, 'Wireframe Kit', '#1A1A1A', 20),
  // nav bar
  rect('wf-nav', 30, 40, 1000, 50, '#E2E8F0', '#CBD5E1', 1.5),
  label('wf-nav-logo', 50, 57, '■ Logo', '#94A3B8', 13),
  rect('wf-nav-b1', 750, 53, 70, 24, '#CBD5E1', 'transparent', 0),
  rect('wf-nav-b2', 834, 53, 70, 24, '#CBD5E1', 'transparent', 0),
  rect('wf-nav-b3', 918, 53, 92, 24, '#2563EB', 'transparent', 0),
  label('wf-nb1', 762, 60, 'Sign In', '#94A3B8', 11),
  label('wf-nb3', 930, 60, 'Get Started', '#FFFFFF', 11),
  // sidebar
  rect('wf-side', 30, 105, 200, 480, '#F8FAFC', '#E2E8F0', 1.5),
  label('wf-side-h', 50, 118, 'Navigation', '#64748B', 11),
  rect('wf-si1', 42, 140, 176, 30, '#2563EB', 'transparent', 0),
  rect('wf-si2', 42, 180, 176, 30, '#E2E8F0', 'transparent', 0),
  rect('wf-si3', 42, 220, 176, 30, '#E2E8F0', 'transparent', 0),
  rect('wf-si4', 42, 260, 176, 30, '#E2E8F0', 'transparent', 0),
  label('wf-si1l', 60, 150, '⊞  Dashboard', '#FFFFFF', 12),
  label('wf-si2l', 60, 190, '⊡  Analytics', '#94A3B8', 12),
  label('wf-si3l', 60, 230, '⊡  Settings', '#94A3B8', 12),
  label('wf-si4l', 60, 270, '⊡  Profile', '#94A3B8', 12),
  // main content
  rect('wf-main', 246, 105, 784, 480, '#FFFFFF', '#E2E8F0', 1.5),
  label('wf-main-h', 262, 120, 'Page Title', '#1A1A1A', 18),
  // stat cards
  rect('wf-c1', 262, 150, 178, 90, '#EFF6FF', '#BFDBFE', 1),
  rect('wf-c2', 452, 150, 178, 90, '#F0FDF4', '#BBF7D0', 1),
  rect('wf-c3', 642, 150, 178, 90, '#FFFBEB', '#FDE68A', 1),
  rect('wf-c4', 832, 150, 178, 90, '#FFF1F2', '#FECDD3', 1),
  label('wf-c1l', 272, 175, '1,284\nUsers', '#2563EB', 13),
  label('wf-c2l', 462, 175, '342\nOrders', '#059669', 13),
  label('wf-c3l', 652, 175, '$12.4k\nRevenue', '#D97706', 13),
  label('wf-c4l', 842, 175, '98%\nUptime', '#E11D48', 13),
  // content block
  rect('wf-table', 262, 255, 748, 300, '#F8FAFC', '#E2E8F0', 1),
  rect('wf-thr', 262, 255, 748, 32, '#E2E8F0', 'transparent', 0),
  label('wf-th', 272, 267, 'Name                  Status           Date               Actions', '#64748B', 11),
  rect('wf-tr1', 262, 290, 748, 32, '#FFFFFF', 'transparent', 0),
  rect('wf-tr2', 262, 326, 748, 32, '#F8FAFC', 'transparent', 0),
  rect('wf-tr3', 262, 362, 748, 32, '#FFFFFF', 'transparent', 0),
];

// ─── Brainstorm Canvas ───────────────────────────────────────────────────────
const brainstorm = [
  label('bs-title', 380, 10, 'Brainstorm Session', '#1A1A1A', 22),
  label('bs-sub', 300, 42, 'What problem are we solving? Add your ideas below.', '#64748B', 13),
  // central cluster
  sticky('bs-s1', 60, 90, '🎯 Problem\nWhat is the core issue?', '#FECDD3', 220, 140),
  sticky('bs-s2', 320, 90, '💡 Ideas\nCapture all possibilities', '#FEF9C3', 220, 140),
  sticky('bs-s3', 580, 90, '👥 Who\nWho is affected?', '#DCFCE7', 220, 140),
  sticky('bs-s4', 840, 90, '⚡ Why Now\nWhat makes this urgent?', '#DBEAFE', 220, 140),
  sticky('bs-s5', 60, 270, '✅ Solutions\nHow might we fix this?', '#EDE9FE', 220, 140),
  sticky('bs-s6', 320, 270, '📊 Success\nHow do we measure it?', '#FEF9C3', 220, 140),
  sticky('bs-s7', 580, 270, '🚧 Constraints\nWhat limits our options?', '#FECDD3', 220, 140),
  sticky('bs-s8', 840, 270, '🗓 Next Steps\nWhat do we do first?', '#DCFCE7', 220, 140),
  // freeform area hint
  rect('bs-area', 60, 440, 1000, 200, '#F8FAFC', '#E2E8F0', 1.5),
  label('bs-hint', 500, 528, 'Free-form drawing area', '#CBD5E1', 14),
];

// ─── OKR Planning ────────────────────────────────────────────────────────────
const okrPlanning = [
  label('okr-title', 360, 8, 'OKR Planning Board', '#1A1A1A', 22),
  label('okr-sub', 280, 40, 'Define your objectives and the key results that prove you got there.', '#64748B', 13),
  // Objective 1
  rect('okr-o1', 40, 70, 1060, 170, '#EFF6FF', '#BFDBFE', 1.5),
  rect('okr-o1-bar', 40, 70, 6, 170, '#2563EB', 'transparent', 0),
  label('okr-o1-l', 54, 78, 'OBJECTIVE 1', '#93C5FD', 10),
  label('okr-o1-t', 54, 95, 'Launch the new product to market and achieve initial user adoption', '#1E40AF', 15),
  sticky('okr-kr1', 54, 128, 'KR1: 1,000 signups in 30 days', '#DBEAFE', 310, 96),
  sticky('okr-kr2', 382, 128, 'KR2: NPS score ≥ 40', '#DBEAFE', 310, 96),
  sticky('okr-kr3', 710, 128, 'KR3: 30% week-2 retention', '#DBEAFE', 310, 96),
  // Objective 2
  rect('okr-o2', 40, 258, 1060, 170, '#F0FDF4', '#BBF7D0', 1.5),
  rect('okr-o2-bar', 40, 258, 6, 170, '#059669', 'transparent', 0),
  label('okr-o2-l', 54, 266, 'OBJECTIVE 2', '#6EE7B7', 10),
  label('okr-o2-t', 54, 283, 'Build a high-performance engineering culture', '#065F46', 15),
  sticky('okr-kr4', 54, 316, 'KR1: Deploy CI/CD for all services', '#DCFCE7', 310, 96),
  sticky('okr-kr5', 382, 316, 'KR2: 90%+ test coverage', '#DCFCE7', 310, 96),
  sticky('okr-kr6', 710, 316, 'KR3: Incident response < 1 hour', '#DCFCE7', 310, 96),
  // Objective 3
  rect('okr-o3', 40, 446, 1060, 170, '#FFFBEB', '#FDE68A', 1.5),
  rect('okr-o3-bar', 40, 446, 6, 170, '#D97706', 'transparent', 0),
  label('okr-o3-l', 54, 454, 'OBJECTIVE 3', '#FCD34D', 10),
  label('okr-o3-t', 54, 471, 'Grow revenue and expand into two new markets', '#92400E', 15),
  sticky('okr-kr7', 54, 504, 'KR1: $500k ARR by Q4', '#FEF9C3', 310, 96),
  sticky('okr-kr8', 382, 504, 'KR2: 2 enterprise contracts signed', '#FEF9C3', 310, 96),
  sticky('okr-kr9', 710, 504, 'KR3: Launch in EU & APAC', '#FEF9C3', 310, 96),
];

export const TEMPLATE_ELEMENTS = {
  'sprint-board': sprintBoard,
  'retrospective': retrospective,
  'product-roadmap': productRoadmap,
  'mind-map': mindMap,
  'user-journey': userJourney,
  'wireframe': wireframe,
  'brainstorm': brainstorm,
  'okr': okrPlanning,
};
