import { EarnStrategies } from '@prisma/client'
import { networksByName } from 'blockchain/networks'
import type { DepositTokensConfig } from 'features/aave/strategies/deposit-tokens-config-list'
import type {
  ProductHubItemWithoutAddress,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers/get-token-group'
import type { LendingProtocol } from 'lendingProtocols'

export function parseLendingProducts(
  tokensConfig: DepositTokensConfig[],
  networkName: ProductHubSupportedNetworks,
  lendingeProtocol: LendingProtocol,
) {
  return tokensConfig
    .filter(
      (config) =>
        config.protocol === lendingeProtocol && config.networkId === networksByName[networkName].id,
    )
    .flatMap((config) =>
      config.list.map((token): ProductHubItemWithoutAddress => {
        return {
          product: [ProductHubProductType.Earn],
          primaryToken: token.toUpperCase(),
          primaryTokenGroup: getTokenGroup(token.toUpperCase()),
          secondaryToken: token.toUpperCase(),
          secondaryTokenGroup: getTokenGroup(token.toUpperCase()),
          depositToken: token.toUpperCase(),
          label: `${token.toUpperCase()}`,
          network: networkName,
          protocol: lendingeProtocol,
          earnStrategyDescription: `Lending ${token}`,
          earnStrategy: EarnStrategies.lending,
          managementType: 'passive',
        }
      }),
    )
}
