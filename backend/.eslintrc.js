/**
 * ESLint Configuration
 * 
 * Code linting rules for AgriMarket backend.
 */

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prettier/prettier': 'warn',
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
  },
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '*.js',
    '!.eslintrc.js',
    '!jest.config.js',
  ],
};
