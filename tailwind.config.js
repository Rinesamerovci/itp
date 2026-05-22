/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1B3A6B",
          gold: "#F5A800",
          teal: "#0F6E56",
          page: "#F3F4F6",
          card: "#FFFFFF",
          border: "#E5E7EB",
          primary: "#111827",
          secondary: "#6B7280",
          success: "#3B6D11",
          amber: "#BA7517",
          red: "#E24B4A",
          mint: "#DDF2EB",
          sand: "#F6F1E8",
          sky: "#DDECF7",
        },
      },
      boxShadow: {
        soft: "0 10px 25px -18px rgba(27, 58, 107, 0.45)",
        "ek-card": "0 1px 4px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(27,58,107,0.08), transparent 38%), radial-gradient(circle at bottom right, rgba(15,110,86,0.1), transparent 34%)",
      },
    },
  },
  plugins: [],
};
