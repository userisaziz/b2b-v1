/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        'primary-light': '#334155',
        accent: '#3b82f6',
        'accent-hover': '#2563eb',
        background: '#f8fafc',
        surface: '#ffffff',
        'text-main': '#0f172a',
        'text-muted': '#64748b',
        border: '#e2e8f0',
      },
    },
  },
  plugins: [],
}