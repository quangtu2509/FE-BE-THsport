/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Quét tất cả các tệp React
  ],
  theme: {
    extend: {
      // Định nghĩa các màu tùy chỉnh từ file style.css
      colors: {
        primary: "#e50914",
        "dark-color": "#141414",
        "light-gray": "#f4f4f4",
        "logo-yellow": "#e6d431",
      },
      // Chúng ta giữ lại container mặc định của Tailwind,
      // nhưng bạn có thể tùy chỉnh nó ở đây nếu muốn
      container: {
        center: true,
        padding: "1rem",
        screens: {
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [],
};
