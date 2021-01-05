const path = require('path')

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [require.resolve('next/babel')],
    },
  })

  config.module.rules.push({
    test: /\.mdx?$/,
    use: ['babel-loader', '@mdx-js/loader'],
  })

  config.resolve.extensions.push('.ts', '.tsx', '.mdx')

  config.resolve.modules = [...(config.resolve.modules || []), path.resolve(__dirname, '../')]

  // required to bundle MDX
  config.node = {
    ...config.node,
    fs: 'empty',
  }
  return config
}
