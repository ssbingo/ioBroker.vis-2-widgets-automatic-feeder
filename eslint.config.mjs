import config from '@iobroker/eslint-config';

// The widgets are linted by their own config in src-widgets-ts/. This root config
// exists so tooling (and the repository checker) find an ESLint flat config here.
export default [
    ...config,
    {
        ignores: [
            '.github/',
            'admin/',
            'widgets/',
            'node_modules/',
            'src-widgets-js/',
            'src-widgets-jsvite/',
            'src-widgets-ts/',
            'test/',
            'tasks.js',
        ],
    },
];
