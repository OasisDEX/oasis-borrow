import { networksByName } from 'blockchain/config'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import getConfig from 'next/config'

function isLocalhost(url: string) {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

function isUsingHardhat(chainId: string) {
  return chainId === networksByName['hardhat'].id
}

export function skipCache(chainId: string) {
  // is NOT localHost & is using hardhat
  // server side will be unable to access hardhat node so we skip cache

  // feature flag for batch caching
  const batchCacheEnabledForEnv =
    process.env.INFURA_CACHE_ENABLED === 'true' ||
    getConfig()?.publicRuntimeConfig?.infuraCacheEnabled ||
    false

  const batchCacheEnabledForThisBrowser = useFeatureToggle('BatchCache')
  const batchCacheEnabled = batchCacheEnabledForEnv || batchCacheEnabledForThisBrowser

  return !batchCacheEnabled || (!isLocalhost(window.location.hostname) && isUsingHardhat(chainId))
}
