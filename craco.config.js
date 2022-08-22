const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = {
	style: {
		postcss: {
			plugins: [tailwindcss, autoprefixer],
		},
	},
};
