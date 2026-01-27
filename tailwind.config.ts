import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      colors: {
        navy: {
          DEFAULT: "var(--navy)",
          light: "var(--navy-light)",
          dark: "var(--navy-dark)",
        },
        blue: "var(--blue)",
        cyan: {
          DEFAULT: "var(--cyan)",
          dark: "var(--cyan-dark)",
        },
        teal: "var(--teal)",
        grey: "var(--grey)",
      },
      backgroundColor: {
        cream: "var(--bg-cream)",
        light: "var(--bg-light)",
      },
      textColor: {
        dark: "var(--text-dark)",
        body: "var(--text-body)",
        muted: "var(--text-muted)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
    },
  },
  plugins: [],
};
export default config;
