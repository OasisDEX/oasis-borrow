const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  core: {
    builder: 'webpack5',
  },
  typescript: { reactDocgen: false },
  stories: [
    '../theme/*.stories.tsx',
    // '../features/**/*.stories.tsx',
    '../features/borrow/manage/stories/ManageVaultErrors.stories.tsx',
    '../components/**/*.stories.tsx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-postcss',
    'storybook-addon-next-router',
    'storybook-i18next',
  ],
  babel: async (options) => ({
    ...options,
    // any extra options you want to set
    presets: ['next/babel'],
    plugins: [
      '@babel/proposal-class-properties',
      ['@babel/plugin-proposal-private-methods', { loose: false }],
    ],
  }),
  webpackFinal: async (config) => {
    const nextConfig = require('../next.config.js')
    config.resolve.modules = [path.resolve(__dirname, '..'), 'node_modules']

    return {
      ...nextConfig.webpack,
      ...config,
      resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
        },
        plugins: [
          new TsconfigPathsPlugin(),
          // Work around for Buffer is undefined:
          // https://github.com/webpack/changelog-v5/issues/10
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
          }),
        ],
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          fs: false,
          domain: require.resolve('domain-browser'),
          os: require.resolve('os-browserify/browser'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          path: require.resolve('path-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer'),
        },
      },
    }
  },
}
