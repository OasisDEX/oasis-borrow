import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/networks'
import { erc4626Vaults } from 'features/omni-kit/protocols/erc-4626/settings'
import type { Erc4626Config } from 'features/omni-kit/protocols/erc-4626/types'
import { OmniProductType } from 'features/omni-kit/types'
import { type ProductHubSupportedNetworks } from 'features/productHub/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { zero } from 'helpers/zero'

export interface Erc4626InterestRatesResponse {
  vaults: {
    interestRates: {
      rate: string
    }[]
  }[]
}

async function getErc4626VaultData({
  address,
  name,
  networkId,
  protocol,
  rewards,
  strategy,
  token,
}: Erc4626Config): Promise<ProductHubHandlerResponseData> {
  try {
    const { response } = (await loadSubgraph({
      subgraph: 'Erc4626',
      method: 'getErc4626InterestRates',
      networkId,
      params: {
        vault: address,
      },
    })) as SubgraphsResponses['Erc4626']['getErc4626InterestRates']

    const vaults = response.vaults[0]

    const hasRewards = !!(rewards && rewards?.length)
    const tokenGroup = getTokenGroup(token.symbol)
    const weeklyNetApy = vaults
      ? vaults.interestRates
          .reduce<BigNumber>((total, { rate }) => total.plus(new BigNumber(rate)), zero)
          .div(vaults.interestRates.length)
          .toString()
      : undefined

    if (weeklyNetApy && new BigNumber(weeklyNetApy).eq(0)) {
      throw new Error('Should not process update with APY of zero')
    }

    return {
      table: [
        {
          label: name,
          network: networksById[networkId].name as ProductHubSupportedNetworks,
          primaryToken: token.symbol,
          ...(tokenGroup !== token.symbol && { primaryTokenGroup: tokenGroup }),
          product: [OmniProductType.Earn],
          protocol,
          secondaryToken: token.symbol,
          ...(tokenGroup !== token.symbol && { secondaryTokenGroup: tokenGroup }),
          depositToken: token.symbol,
          earnStrategy: EarnStrategies.erc_4626,
          earnStrategyDescription: strategy ?? name,
          managementType: 'passive',
          weeklyNetApy,
          primaryTokenAddress: token.address,
          secondaryTokenAddress: token.address,
          hasRewards,
          tooltips: {
            ...(hasRewards && {
              weeklyNetApy: {
                content: {
                  title: {
                    key: 'erc-4626.product-hub-tooltips.this-vault-is-earning-tokens',
                  },
                  description: rewards
                    .map(({ label, token: _token }) => label ?? _token)
                    .join(', '),
                },
                icon: 'sparks',
              },
            }),
          },
        },
      ],
      warnings: [],
    }
  } catch (e) {
    // @ts-ignore
    return { table: [], warnings: [e.toString()] }
  }
}

export default async function (): ProductHubHandlerResponse {
  return Promise.all(erc4626Vaults.map((vault) => getErc4626VaultData(vault))).then((responses) => {
    return responses.reduce<ProductHubHandlerResponseData>(
      (v, response) => {
        return {
          table: [...v.table, ...response.table],
          warnings: [...v.warnings, ...response.warnings],
        }
      },
      { table: [], warnings: [] },
    )
  })
}
