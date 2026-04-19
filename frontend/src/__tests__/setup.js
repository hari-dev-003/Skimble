import '@testing-library/jest-dom';
import { vi } from 'vitest';

// matchMedia stub (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// IntersectionObserver stub
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ResizeObserver stub
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// URL object stubs for CSV export
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Clipboard API stub
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
});

// Suppress framer-motion layout animation warnings in jsdom
vi.mock('framer-motion', () => {
  const actual = {};
  const passthrough = (tag) => {
    const C = ({ children, ...rest }) => {
      const { initial, animate, exit, transition, layout, layoutId, whileHover, whileTap, variants, ...htmlProps } = rest;
      const Tag = tag;
      return <Tag {...htmlProps}>{children}</Tag>;
    };
    C.displayName = `motion.${tag}`;
    return C;
  };
  return {
    motion: new Proxy(actual, {
      get: (_, tag) => passthrough(tag),
    }),
    AnimatePresence: ({ children }) => children,
    LayoutGroup: ({ children }) => children,
  };
});
