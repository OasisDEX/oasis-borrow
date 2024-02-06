import { captureException } from '@sentry/nextjs'
import { ensureIsSupportedAaveV3NetworkId, getAaveV3OracleAssetPrice } from 'blockchain/aave-v3'
import type { NetworkIds } from 'blockchain/networks'
import { ensureIsSupportedSparkV3NetworkId, getSparkV3OracleAssetPrice } from 'blockchain/spark-v3'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import { LendingProtocol } from 'lendingProtocols'

import { eth2weth } from '@oasisdex/utils/lib/src/utils'

export const getOraclePriceData = ({
  tokens,
  protocol,
  network,
}: {
  tokens: string[]
  protocol: LendingProtocol.AaveV3 | LendingProtocol.SparkV3
  network: NetworkIds
}) => {
  try {
    if (!tokens) {
      return []
    }
    if (protocol === LendingProtocol.AaveV3) {
      ensureIsSupportedAaveV3NetworkId(network)
      return tokens.map(async (tokenAddress) => {
        const tokenSymbol = eth2weth(getTokenSymbolBasedOnAddress(network, tokenAddress))
        return await getAaveV3OracleAssetPrice({ token: tokenSymbol, networkId: network }).then(
          (price) => ({
            protocol,
            price,
            tokenSymbol,
            tokenAddress,
          }),
        )
      })
    }
    if (protocol === LendingProtocol.SparkV3) {
      ensureIsSupportedSparkV3NetworkId(network)
      return tokens.map(async (tokenAddress) => {
        const tokenSymbol = eth2weth(getTokenSymbolBasedOnAddress(network, tokenAddress))
        return await getSparkV3OracleAssetPrice({ token: tokenSymbol, networkId: network }).then(
          (price) => ({
            protocol,
            price,
            tokenSymbol,
            tokenAddress,
          }),
        )
      })
    }
    return []
  } catch (error) {
    captureException({
      region: 'getOraclePriceData',
      tokens,
      protocol,
      network,
      error,
    })
    return []
  }
}
