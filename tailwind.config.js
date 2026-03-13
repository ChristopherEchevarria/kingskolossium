/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main theme colors
        'app-grey': '#B0B7BC',
        'app-blue': '#0076B6',
        'app-white': '#FFFFFF',
        // Extended palette
        'app-dark-blue': '#005a8c',
        'app-light-blue': '#e6f3fa',
        'app-dark-grey': '#8a9199',
        // Cell types for grid
        cell: {
          walkable: '#c4b998',      // Sandy/beige like the reference
          obstacle: '#8b7355',       // Darker brown for obstacles
          unavailable: '#2a2a2a',    // Dark for unavailable
          hole: '#1a1a1a',           // Black for holes
          elevated: '#d4c4a8',       // Lighter for elevated
          selected: '#0076B6',       // Blue highlight
          hover: '#e6f3fa',          // Light blue hover
        },
        // Element colors for resistances
        element: {
          earth: '#8B4513',
          fire: '#dc2626',
          water: '#0076B6',
          air: '#22d3ee',
          neutral: '#9ca3af',
        },
        // Status colors
        status: {
          online: '#22c55e',
          offline: '#ef4444',
          pending: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
