/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // <--- Perhatikan tanda petik dan nama baru ini
    autoprefixer: {},
  },
};

export default config;
