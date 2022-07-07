const sitemap = require('nextjs-sitemap-generator')

try {
  sitemap({
    baseUrl: 'https://oasis.app',
    pagesDirectory: `.next/server/pages`,
    targetDirectory: 'public/',
    // TODO: remove '/earn' exclusion below when enabling EarnProduct feature
    ignoredPaths: ['/api', '404', '/[address]', '/terms', '/privacy', '/save', '/earn', '/errors'],
    // other apps routes from Oasis Suite
    extraPaths: ['/blog'],
    nextConfigPath: `${__dirname}/next.config.js`,
    ignoreIndexFiles: true,
  })

  console.info(`✅ sitemap.xml generated!`)
} catch (err) {
  console.error('Something went wrong while generating sitemap')
}
