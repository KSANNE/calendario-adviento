import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const FRAMEWORKS = ['react', 'react-dom', 'react-dom/*'];

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['*.js', '*.ts', 'scripts/**/*.{mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['public/sw.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Algunos navegadores integrados bloquean estos diálogos y devuelven "no" sin enseñarlos.
      'no-restricted-globals': [
        'error',
        { name: 'confirm', message: 'Usa un diálogo de la app.' },
        { name: 'alert', message: 'Usa un mensaje de la app.' },
        { name: 'prompt', message: 'Usa un formulario de la app.' },
      ],
    },
  },
  {
    // El dominio no puede depender de capas externas ni de frameworks.
    files: ['src/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/application/**', '**/infrastructure/**', '**/presentation/**', '**/app/**'],
              message: 'El dominio no depende de otras capas.',
            },
            { group: FRAMEWORKS, message: 'El dominio no depende de frameworks.' },
          ],
        },
      ],
    },
  },
  {
    // La aplicación solo conoce el dominio.
    files: ['src/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**', '**/presentation/**', '**/app/**'],
              message: 'La aplicación no depende de infraestructura ni de presentación.',
            },
            { group: FRAMEWORKS, message: 'La aplicación no depende de frameworks.' },
          ],
        },
      ],
    },
  },
  {
    // La presentación habla con la aplicación a través del contenedor, nunca con el cifrado ni el almacenamiento.
    files: ['src/**/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/infrastructure/**'], message: 'La presentación no accede a la infraestructura.' },
          ],
        },
      ],
    },
  },
  {
    // Los tests montan las piezas reales, así que pueden importar de cualquier capa.
    files: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
