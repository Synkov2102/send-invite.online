/** @type {import("lint-staged").Configuration} */
const config = {
  "frontend/**/*.{js,jsx,mjs,ts,tsx}": "eslint --fix --config frontend/eslint.config.mjs --max-warnings=0",
  "backend/**/*.ts": "eslint --fix --config backend/eslint.config.mjs --max-warnings=0",
  "packages/shared/src/**/*.ts": "eslint --fix --config packages/shared/eslint.config.mjs --max-warnings=0",
  "*.{json,md,yml,yaml,css}": "prettier --write --ignore-unknown",
};

export default config;
