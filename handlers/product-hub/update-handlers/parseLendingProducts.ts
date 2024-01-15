import { EarnStrategies } from '@prisma/client'
import { networksByName } from 'blockchain/networks'
import type { DepositTokensConfig } from 'features/aave/strategies/deposit-tokens-list'
import type {
  ProductHubItemWithoutAddress,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers/get-token-group'
import type { LendingProtocol } from 'lendingProtocols'

export function parseLendingProducts(
  tokensList: DepositTokensConfig[],
  networkName: ProductHubSupportedNetworks,
  lendingeProtocol: LendingProtocol,
) {
  return tokensList
    .filter(
      (tokenList) =>
        tokenList.protocol === lendingeProtocol &&
        tokenList.networkId === networksByName[networkName].id,
    )
    .flatMap((tokenList) =>
      tokenList.list.map((token): ProductHubItemWithoutAddress => {
        return {
          product: [ProductHubProductType.Earn],
          primaryToken: token.toUpperCase(),
          primaryTokenGroup: getTokenGroup(token.toUpperCase()),
          secondaryToken: token.toUpperCase(),
          secondaryTokenGroup: getTokenGroup(token.toUpperCase()),
          label: `${token.toUpperCase()}`,
          network: networkName,
          protocol: lendingeProtocol,
          earnStrategyDescription: `Lending ${token}`,
          earnStrategy: EarnStrategies.other,
          managementType: 'passive',
        }
      }),
    )
}
