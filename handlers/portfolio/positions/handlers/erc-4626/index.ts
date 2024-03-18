import { views } from '@oasisdex/dma-library'
import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getRpcProvider, NetworkIds, networksById } from 'blockchain/networks'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
import {
  getErc4626Apy,
  getErc4626ApyParameters,
  getErc4626PositionParameters,
} from 'features/omni-kit/protocols/erc-4626/helpers'
import { erc4626Vaults } from 'features/omni-kit/protocols/erc-4626/settings'
import type { Erc4626Config } from 'features/omni-kit/protocols/erc-4626/types'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import { OmniProductType, type OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { type TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type {
  PortfolioPosition,
  PortfolioPositionsCountReply,
  PortfolioPositionsHandler,
  PortfolioPositionsReply,
} from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'

interface GetErc4626PositionsParams {
  apiVaults?: Vault[]
  dpmList: DpmSubgraphData[]
  networkId: OmniSupportedNetworkIds
  positionsCount?: boolean
  prices: TokensPricesList
}

async function getErc4626Positions({
  apiVaults,
  dpmList,
  networkId,
  positionsCount,
  prices,
}: GetErc4626PositionsParams): Promise<PortfolioPositionsReply | PortfolioPositionsCountReply> {
  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph('Erc4626', 'getErc4626DpmPositions', networkId, {
    dpmProxyAddress,
  })) as SubgraphsResponses['Erc4626']['getErc4626DpmPositions']
  const positionsArray = subgraphPositions.response.positions.flatMap(({ account, vault }) => ({
    ...account,
    ...vault,
  }))

  if (positionsCount || !apiVaults) {
    return {
      positions: positionsArray.map(({ vaultId }) => ({ positionId: vaultId })),
    }
  } else {
    const positions = await Promise.all(
      positionsArray.map(
        async ({ address, asset, id, user, vaultId }): Promise<PortfolioPosition> => {
          const vault = erc4626Vaults.find(
            ({ address: _address }) => _address.toLowerCase() === id.toLowerCase(),
          ) as Erc4626Config

          const networkName = networksById[networkId].name
          const quotePrice = new BigNumber(prices[asset.symbol.toUpperCase()])
          const quoteToken = asset.symbol.toUpperCase()

          const position = await views.common.getErc4626Position(
            {
              proxyAddress: address,
              quotePrice: new BigNumber(prices[quoteToken]),
              user: user.id,
              vaultAddress: id,
              underlyingAsset: {
                address: asset.address,
                precision: Number(asset.decimals),
                symbol: asset.symbol,
              },
            },
            {
              provider: getRpcProvider(networkId),
              getVaultApyParameters: getErc4626ApyParameters({ prices }),
              getLazyVaultSubgraphResponse: getErc4626PositionParameters(networkId),
            },
          )

          const netValue = position.netValue.times(quotePrice)

          return {
            assetLabel: vault.name,
            availableToMigrate: false,
            automations: {},
            details: [
              {
                type: 'netValue',
                value: formatUsdValue(netValue),
              },
              {
                type: 'earnings',
                value: `${formatCryptoBalance(
                  new BigNumber(position.totalEarnings.withoutFees),
                )} ${quoteToken}`,
              },
              {
                type: 'apy',
                value: formatDecimalAsPercent(
                  getErc4626Apy({
                    rewardsApy: position.apyFromRewards.per365d,
                    vaultApy: position.apy.per365d,
                  }),
                ),
              },
              {
                type: '90dApy',
                value: formatDecimalAsPercent(
                  getErc4626Apy({
                    rewardsApy: position.apyFromRewards.per90d,
                    vaultApy: position.apy.per90d,
                  }),
                ),
              },
            ],
            network: networkName,
            netValue: netValue.toNumber(),
            positionId: Number(vaultId),
            primaryToken: quoteToken,
            protocol: vault.protocol,
            secondaryToken: quoteToken,
            type: OmniProductType.Earn,
            url: getOmniPositionUrl({
              collateralToken: quoteToken,
              label: vault.name,
              networkName,
              productType: OmniProductType.Earn,
              protocol: vault.protocol,
              pseudoProtocol: Erc4626PseudoProtocol,
              quoteToken: quoteToken,
            }),
          }
        },
      ),
    )

    return { positions }
  }
}

export const erc4626PositionsHandler: PortfolioPositionsHandler = async ({
  address,
  apiVaults,
  dpmList,
  prices,
  positionsCount,
}) => {
  return Promise.all([
    getErc4626Positions({
      apiVaults,
      dpmList,
      networkId: NetworkIds.MAINNET,
      prices,
      positionsCount,
    }),
  ]).then((responses) => {
    return {
      address,
      positions: responses.flatMap(({ positions }) => positions),
    }
  })
}
