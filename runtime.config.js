const publicRuntimeConfig = {
  // Will be available on both server and client
  buildHash: process.env.COMMIT_SHA,
  buildDate: Date.now(),
  notificationsHost: process.env.NOTIFICATIONS_HOST,
  notificationsHostGoerli: process.env.NOTIFICATIONS_HOST_GOERLI,
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
  ajnaSubgraphV2Url: process.env.AJNA_SUBGRAPH_V2_URL,
  ajnaSubgraphV2UrlGoerli: process.env.AJNA_SUBGRAPH_V2_URL_GOERLI,
  aaveSubgraphUrl: process.env.AAVE_SUBGRAPH_URL,
  aaveSubgraphUrlOptimism: process.env.AAVE_OPTIMISM_SUBGRAPH_URL,
  referralSubgraphUrl: process.env.REFERRAL_SUBGRAPH_URL,
  configUrl: process.env.CONFIG_URL,
  rpcGatewayUrl: process.env.RPC_GATEWAY,
  grooveWidgetId: process.env.GROOVE_WIDGET_ID || `27241a63-86b5-47e2-a167-2e2a3e2a621e`,
  getTriggersUrl: process.env.GET_TRIGGERS_URL,
  setupTriggerUrl: process.env.SETUP_TRIGGER_URL,
}

module.exports = {
  publicRuntimeConfig: publicRuntimeConfig,
}
