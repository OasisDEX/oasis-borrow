const sitemap = require('nextjs-sitemap-generator')

try {
  sitemap({
    baseUrl: 'https://oasis.app',
    pagesDirectory: `.next/server/pages`,
    targetDirectory: 'public/',
    ignoredPaths: [
      '/api',
      '404',
      '/[address]',
      '/terms',
      '/privacy',
      '/save',
      '/errors',
      '/earn/open/aave-steth',
    ],
    // other apps routes from Oasis Suite
    extraPaths: ['/blog'],
    nextConfigPath: `${__dirname}/next.config.js`,
    ignoreIndexFiles: true,
  })

  console.info(`✅ sitemap.xml generated!`)
} catch (err) {
  console.error('Something went wrong while generating sitemap')
}
