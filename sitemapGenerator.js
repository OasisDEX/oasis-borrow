const sitemap = require('nextjs-sitemap-generator')

try {
  void sitemap({
    baseUrl: 'https://summer.fi',
    pagesDirectory: `.next/server/pages`,
    targetDirectory: 'public/',
    ignoredPaths: ['/api', '/not-found', '/[address]', '/terms', '/privacy', '/aave/[address]'],
    // other apps routes from Summer.fi Suite
    extraPaths: ['/blog'],
    nextConfigPath: `${__dirname}/next.config.js`,
    ignoreIndexFiles: true,
  })

  console.info(`✅ sitemap.xml generated!`)
} catch (err) {
  console.error('Something went wrong while generating sitemap')
}
