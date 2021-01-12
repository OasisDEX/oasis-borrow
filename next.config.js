const withSass = require('@zeit/next-sass')
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
})
const withPWA = require('next-pwa')

module.exports = withPWA(
  withMDX(
    withSass({
      cssModules: true,
      pageExtensions: ['mdx', 'tsx'],
      publicRuntimeConfig: {
        // Will be available on both server and client
        buildHash: require('child_process').execSync('git rev-parse HEAD').toString().trim(),
        buildDate: Date.now(),
        apiHost: process.env.API_HOST,
        wyreApiHost: process.env.SENDWYRE_API_HOST,
        testMoonPayHost: process.env.TEST_MOON_PAY_HOST,
        prodMoonPayHost: process.env.PROD_MOON_PAY_HOST,
        testMoonPayKey: process.env.TEST_MOON_PAY_KEY,
        testMoonPaySecretKey: process.env.TEST_MOON_PAY_SECRET_KEY,
        prodMoonPayKey: process.env.PROD_MOON_PAY_KEY,
        prodMoonPaySecretKey: process.env.PROD_MOON_PAY_SECRET_KEY,
        moonpayApiHost: process.env.MOONPAY_API_HOST,
        latamexEnabled: process.env.LATAMEX_ENABLED === '1',
        latamexApiHost: process.env.LATAMEX_API_HOST,
        compoundApiHost: process.env.COMPOUND_API_HOST,
        graphApiHost: process.env.GRAPH_API_HOST,
      },
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

        if (!isServer) {
          config.node = {
            fs: 'empty',
          }
        }

        if (!process.env.NODE_ENV === 'production') {
          config.watch = true
          // Don't ignore all node modules.
          config.watchOptions.ignored = config.watchOptions.ignored.filter(
            (ignore) => !ignore.toString().includes('node_modules'),
          )
          // Ignore all node modules except those here.
          config.watchOptions.ignored = [
            ...config.watchOptions.ignored,
            /node_modules([\\]+|\/)+(?!@oasisdex)/,
            /\@oasisdex([\\]+|\/)node_modules/,
          ]
        }

        return config
      },
      pwa: {
        disable: process.env.NODE_ENV !== 'production',
        register: process.env.NODE_ENV === 'production',
        dest: 'public',
      },
    }),
  ),
)
