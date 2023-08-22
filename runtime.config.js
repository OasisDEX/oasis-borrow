const publicRuntimeConfig = {
  // Will be available on both server and client
  buildHash: process.env.COMMIT_SHA,
  buildDate: Date.now(),
  apiHost: process.env.API_HOST,
  notificationsHost: process.env.NOTIFICATIONS_HOST,
  notificationsHostGoerli: process.env.NOTIFICATIONS_HOST_GOERLI,
  basePath: process.env.APP_FULL_DOMAIN,
  mixpanelEnv: process.env.MIXPANEL_ENV,
  mixpanelAPIKey: process.env.MIXPANEL_KEY,
  adRollAdvId: process.env.ADROLL_ADV_ID,
  adRollPixId: process.env.ADROLL_PIX_ID,
  useTermsOfService: process.env.USE_TERMS_OF_SERVICE === '1',
  useTrmApi: process.env.USE_TRM_API === '1',
  showBuildInfo: process.env.SHOW_BUILD_INFO === '1',
  infuraProjectId: process.env.INFURA_PROJECT_ID,
  etherscanAPIKey: process.env.ETHERSCAN_API_KEY,
  sentryRelease: process.env.SENTRY_RELEASE,
  exchangeAddress:
    process.env.USE_DUMMY === '1' ? process.env.DUMMY_EXCHANGE : process.env.EXCHANGE,
  multiplyProxyActions: process.env.MULTIPLY_PROXY_ACTIONS,
  mainnetCacheURL: process.env.MAINNET_CACHE_URL,
  discoverProxyUrl: process.env.DISCOVER_PROXY_URL,
  ajnaSubgraphUrl: process.env.AJNA_SUBGRAPH_URL,
  ajnaSubgraphUrlGoerli: process.env.AJNA_SUBGRAPH_URL_GOERLI,
  rebrandingUrl: process.env.REBRANDING_POST_URL,
  referralSubgraphUrl: process.env.REFERRAL_SUBGRAPH_URL,
}

module.exports = {
  publicRuntimeConfig: publicRuntimeConfig,
}
