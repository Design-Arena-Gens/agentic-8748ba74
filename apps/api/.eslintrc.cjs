require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module'
  },
  env: {
    es2021: true,
    node: true
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.ts']
      }
    }
  },
  rules: {
    'import/order': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }
    ],
    'import/no-named-as-default': 'off',
    'import/namespace': 'off'
  }
};
