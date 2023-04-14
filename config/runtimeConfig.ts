import getConfig from 'next/config'

export const infuraProjectId =
  process.env.INFURA_PROJECT_ID || getConfig()?.publicRuntimeConfig?.infuraProjectId || ''
export const etherscanAPIKey =
  process.env.ETHERSCAN_API_KEY || getConfig()?.publicRuntimeConfig?.etherscan || ''
export const mainnetCacheUrl =
  process.env.MAINNET_CACHE_URL ||
  getConfig()?.publicRuntimeConfig?.mainnetCacheURL ||
  'https://oazo-bcache.new.oasis.app/api/v1'
