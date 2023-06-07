import colors from 'tailwindcss/colors'
import forms from '@tailwindcss/forms'
import elevation from 'tw-elevation'
import typography from '@tailwindcss/typography'
import aspectRatio from	'@tailwindcss/aspect-ratio'

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			...colors,
			primary: colors.orange,
			indigo: colors.orange,
		},
		extend: {},
	},
	plugins: [
		forms,
		elevation,
		typography,
		aspectRatio,
	],
}

