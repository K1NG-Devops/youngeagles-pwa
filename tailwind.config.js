/** @type {import('tailwindcss').Config} */
const defaultConfig = require("shadcn/ui/tailwind.config")

module.exports = {
  ...defaultConfig,
  content: [
    ...defaultConfig.content,
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{js,ts,jsx,tsx}", // Include public directory if you have components there
      "*.{js,ts,jsx,tsx,mdx}"
],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      fontSize: {
        "mobile-xs": "0.625rem" /* 10px */,
        "mobile-sm": "0.75rem" /* 12px */,
        "mobile-base": "0.875rem" /* 14px */,
        "mobile-lg": "1rem" /* 16px */,
        "mobile-xl": "1.125rem" /* 18px */,
        "mobile-2xl": "1.25rem" /* 20px */,
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}
