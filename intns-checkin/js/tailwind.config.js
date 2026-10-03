// Обща Tailwind тема за цялото приложение (зарежда се след CDN скрипта).
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        gold: { 200: '#efe2c0', 300: '#e3cd95', 400: '#d4b46e', 500: '#c19a4f', 600: '#9c7a3a' },
      },
      letterSpacing: { label: '0.18em' },
    },
  },
};
