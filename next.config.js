const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  options: {
    providerImportSource: '@mdx-js/react',
  },
})
const TerserPlugin = require('terser-webpack-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { i18n } = require('./next-i18next.config')
const { withSentryConfig } = require('@sentry/nextjs')
const { publicRuntimeConfig } = require('./runtime.config.js')
const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'
const basePath = ''

/**
 * @type {import('next').NextConfig}
 */
const baseConfig = {
  basePath,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // We do ythis for now to allow for staging deployments during the
    // active development phase and are planning to remove this later
    // !! WARN !!
    ignoreBuildErrors: isProduction,
  },
  productionBrowserSourceMaps: true,
  pageExtensions: ['mdx', 'tsx'],
  publicRuntimeConfig: publicRuntimeConfig,
  webpack: function (config, { isServer }) {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
        },
      },
    })

    config.optimization = {
      minimize: config.mode !== 'development',
      minimizer: [
        new TerserPlugin({
          // TODO: Figure out how to disable mangling partially without breaking the aplication.
          // To test if your changes break the app or no - go to /owner/<address> page for an account that has some vaults and see if they are displayed.
          terserOptions: {
            mangle: false,
          },
        }),
      ],
      splitChunks:
        !isServer && config.mode !== 'development'
          ? {
              chunks: 'all',
              minChunks: 2,
              cacheGroups: {
                vendors: {
                  test: /[\\/]node_modules[\\/]/,
                  name: 'vendors-chunk',
                },
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

    if (!isProduction) {
      config.watch = true
      // Don't ignore all node modules.
      // config.watchOptions.ignored = config.watchOptions.ignored.filter(
      //   (ignore) => !ignore.toString().includes('node_modules'),
      // )
      // Ignore all node modules except those here.
      config.watchOptions = {
        ignored: ['node_modules/**'],
      }
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
    if (config.mode === 'development') {
      const { I18NextHMRPlugin } = require('i18next-hmr/plugin')
      config.plugins.push(
        new I18NextHMRPlugin({
          localesDir: path.resolve('./public/locales'),
        }),
      )
    }

    return config
  },
  i18n,
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
          { key: 'Access-Control-Allow-Origin', value: 'https://app.safe.global' },
        ],
      },
    ]
  },
  transpilePackages: ['@lifi/widget', '@lifi/wallet-management'],
}

module.exports = withSentryConfig(withBundleAnalyzer(withMDX(baseConfig)), {
  org: 'oazo-apps',
  project: 'oazo-apps',
  url: 'https://sentry.io/',
})


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "oazo-apps",
    project: "oazo-apps",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
