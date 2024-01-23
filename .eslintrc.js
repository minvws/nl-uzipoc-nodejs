module.exports = {
  extends: [
    "eslint:recommended"
  ],
  env: {
    "es6": true,
    "node": true
  },
  ignorePatterns: ['.eslintrc.js', 'package.json', 'node_modules'],
  "parserOptions": {
    ecmaVersion: "latest",
  },
  rules: {
    "quotes": ["warn", "double"],
    "semi": ["warn", "always"],
    "indent": ["warn", 4]
  },
  root: true,
};
