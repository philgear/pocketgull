/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            fontSize: {
                'xs': 'clamp(0.75rem, 0.71rem + 0.20vw, 0.875rem)',
                'sm': 'clamp(0.875rem, 0.84rem + 0.18vw, 1rem)',
                'base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
                'lg': 'clamp(1.125rem, 1.05rem + 0.38vw, 1.5rem)',
                'xl': 'clamp(1.25rem, 1.12rem + 0.65vw, 2rem)',
                'display': 'clamp(2rem, 1.50rem + 2.50vw, 4rem)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
