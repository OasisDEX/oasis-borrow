const TerserPlugin = require('terser-webpack-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { i18n } = require('./next-i18next.config')
const { publicRuntimeConfig } = require('./runtime.config.js')
const path = require('path')
const { withSentryConfig } = require('@sentry/nextjs')

const basePath = ''

/**
 * @type {import('next').NextConfig}
 */
const baseConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath,
  productionBrowserSourceMaps: true,
  pageExtensions: ['tsx', 'ts'],
  publicRuntimeConfig: publicRuntimeConfig,
  // sentry: {
  //   disableServerWebpackPlugin: true,
  //   disableClientWebpackPlugin: true,
  // },
  webpack: function (config, { isServer, dev }) {
    config.module.rules.push({
      test: /\.(svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
        },
      },
    })

    config.optimization = {
      minimize: !dev,
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.swcMinify,
          // TODO: Figure out how to disable mangling partially without breaking the aplication.
          // To test if your changes break the app or no - go to /owner/<address> page for an account that has some vaults and see if they are displayed.
          terserOptions: {
            mangle: false,
            compress: {
              dead_code: false,
            },
          },
        }),
      ],
      splitChunks:
        !isServer && !dev
          ? {
              chunks: 'all',
              cacheGroups: {
                ...config.optimization.splitChunks.cacheGroups,
              },
            }
          : {},
    }

    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
        },
      }
      config.plugins.push(new NodePolyfillPlugin())
    }

    const enableCircularDependencyPlugin = process.env.ENABLE_CIRCULAR_DEPENDENCY_PLUGIN === 'true'

    if (!isServer && enableCircularDependencyPlugin) {
      const CircularDependencyPlugin = require('circular-dependency-plugin')
      config.plugins.push(
        new CircularDependencyPlugin({
          exclude: /node_modules/,
          failOnError: false,
          allowAsyncCycles: false,
          cwd: process.cwd(),
        }),
      )
    }
    if (dev) {
      const { I18NextHMRPlugin } = require('i18next-hmr/webpack')
      config.plugins.push(
        new I18NextHMRPlugin({
          localesDir: path.resolve('./public/locales'),
        }),
      )
    }

    return config
  },
  i18n: Object.assign(i18n, {
    ...i18n,
    localeDetection: false, // set to false because of recent update https://github.com/vercel/next.js/issues/55648
  }),
  async redirects() {
    return [
      {
        source: '/multiply/aave/open/:strategy*',
        destination: '/multiply/aave/v2/open/:strategy*',
        permanent: true,
      },
      {
        source: '/earn/aave/open/:strategy*',
        destination: '/earn/aave/v2/open/:strategy*',
        permanent: true,
      },
      {
        source: '/aave/:vault(0x[a-fA-F0-9]{40}$)*',
        destination: '/aave/v2/:vault*',
        permanent: true,
      },
      {
        source: '/aave/:vault(\\d{1,})*',
        destination: '/aave/v2/:vault*',
        permanent: true,
      },
      {
        source: '/:type/aave/:version/open/:strategy*',
        destination: '/ethereum/aave/:version/:type/:strategy*',
        permanent: false,
      },
      {
        source: '/aave/:version/:vault*',
        destination: '/ethereum/aave/:version/:vault*',
        permanent: false,
      },
      {
        source: '/careers(.*)',
        destination: 'https://oasisapp.workable.com/',
        permanent: true,
      },
      {
        source: '/:vault(\\d+)',
        destination: '/ethereum/maker/:vault*',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubdomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'ALLOW' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
  transpilePackages: ['@lifi/widget', '@lifi/wallet-management', 'ramda'],
  experimental: {
    largePageDataBytes: 256 * 1024, // 256 KB. The default one is 128 KB, but we have a lot of that kind of errors, so we increase it.
  },
}

module.exports = withBundleAnalyzer(baseConfig)

if (process.env.SENTRY_AUTH_TOKEN !== undefined && process.env.SENTRY_AUTH_TOKEN !== '') {
  module.exports = withSentryConfig(
    module.exports,
    {
      org: 'oazo-apps',
      project: 'oazo-apps',
      url: 'https://sentry.io/',
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    },
  )
}
