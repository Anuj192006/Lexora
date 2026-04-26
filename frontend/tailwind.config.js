/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0a0e27',
        'brand-darker': '#050814',
        'brand-purple': '#7c3aed',
        'brand-indigo': '#6366f1',
        'brand-cyan': '#06b6d4',
        'brand-lavender': '#c7d2fe',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
      },
      backdropBlur: {
        'glass': 'blur(4px)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
