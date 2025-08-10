import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
			extend: {
				colors: {
...
				keyframes: {
					'accordion-down': {
						from: { height: '0' },
						to: { height: 'var(--radix-accordion-content-height)' }
					},
					'accordion-up': {
						from: { height: 'var(--radix-accordion-content-height)' },
						to: { height: '0' }
					},
					'wellness-glow': {
						'0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
						'50%': { opacity: '0.8', transform: 'scale(1.05)' }
					},
					'float': {
						'0%, 100%': { transform: 'translateY(0px)' },
						'50%': { transform: 'translateY(-10px)' }
					},
					'fade-in': {
						'0%': { opacity: '0', transform: 'translateY(10px)' },
						'100%': { opacity: '1', transform: 'translateY(0)' }
					},
					'fade-out': {
						'0%': { opacity: '1', transform: 'translateY(0)' },
						'100%': { opacity: '0', transform: 'translateY(10px)' }
					},
					'scale-in': {
						'0%': { transform: 'scale(0.95)', opacity: '0' },
						'100%': { transform: 'scale(1)', opacity: '1' }
					},
					'scale-out': {
						from: { transform: 'scale(1)', opacity: '1' },
						to: { transform: 'scale(0.95)', opacity: '0' }
					},
					'slide-in-right': {
						'0%': { transform: 'translateX(100%)' },
						'100%': { transform: 'translateX(0)' }
					},
					'slide-out-right': {
						'0%': { transform: 'translateX(0)' },
						'100%': { transform: 'translateX(100%)' }
					}
				},
				animation: {
					'accordion-down': 'accordion-down 0.2s ease-out',
					'accordion-up': 'accordion-up 0.2s ease-out',
					'wellness-glow': 'wellness-glow 3s ease-in-out infinite',
					'float': 'float 6s ease-in-out infinite',
					'fade-in': 'fade-in 0.3s ease-out',
					'fade-out': 'fade-out 0.3s ease-out',
					'scale-in': 'scale-in 0.2s ease-out',
					'scale-out': 'scale-out 0.2s ease-out',
					'slide-in-right': 'slide-in-right 0.3s ease-out',
					'slide-out-right': 'slide-out-right 0.3s ease-out',
					'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
					'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
				},
				backgroundImage: {
					'gradient-wellness': 'linear-gradient(180deg, hsl(var(--wellness-secondary)) 0%, hsl(var(--soft-lavender)) 100%)',
					'gradient-primary': 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))',
					'gradient-calm': 'linear-gradient(135deg, hsl(var(--calm-blue)), hsl(var(--wellness-secondary)))',
					'gradient-hero': 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--calm-blue)) 50%, hsl(var(--warm-coral)) 100%)'
				},
			boxShadow: {
				'wellness': 'var(--shadow-wellness)',
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
