const path = require('path')

module.exports = {
  "stories": [
    "../theme/*.stories.tsx",
    "../features/**/*.stories.tsx",
    "../components/**/*.stories.tsx",
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  // typescript: {
  //   reactDocgen: 'react-docgen-typescript',
  //   reactDocgenTypescriptOptions: {
  //     shouldExtractLiteralValuesFromEnum: true,
  //     shouldExtractValuesFromUnion: true,
  //     propFilter: (prop) =>
  //     prop.parent ? !/node_modules/.test(prop.parent.fileName) : true
  //   }
  // },
  webpackFinal: async (config, { configType }) => {
    config.resolve.modules = [path.resolve(__dirname, '..'), "node_modules"]
    config.node = {
      fs: 'empty',
    }
    return config
  },
}
