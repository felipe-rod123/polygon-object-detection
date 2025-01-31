/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['media', 'class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			inter: [
  				'Inter',
  				'sans-serif'
  			],
  			sans: [
  				'Inter',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			main: {
  				'50': '#f3f2ff',
  				'100': '#e8e8ff',
  				'200': '#d4d4ff',
  				'300': '#b4b2ff',
  				'400': '#8e86ff',
  				'500': '#6955fd',
  				'600': '#5632f5',
  				'700': '#532ee3',
  				'800': '#3b1abd',
  				'900': '#33189a',
  				'950': '#1c0c69'
  			},
  			secondary: {
  				'50': '#eff8ff',
  				'100': '#def0ff',
  				'200': '#b6e2ff',
  				'300': '#75cdff',
  				'400': '#2cb4ff',
  				'500': '#009dfc',
  				'600': '#007ad4',
  				'700': '#0061ab',
  				'800': '#00528d',
  				'900': '#064574',
  				'950': '#042b4d'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		}
  	}
  },
};
