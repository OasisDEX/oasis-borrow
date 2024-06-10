import { RiskRatio, views } from '@oasisdex/dma-library'
import type { Vault } from '@prisma/client'
import { getChainInfoByChainId } from '@summer_fi/summerfi-sdk-common'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { getMorphoCumulatives } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { settings as morphoSettings } from 'features/omni-kit/protocols/morpho-blue/settings'
import { type OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { getMorphoPositionId } from 'features/refinance/helpers'
import { getMorphoPoolId } from 'features/refinance/helpers/getMorphoPoolId'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { emptyAutomations } from 'handlers/portfolio/constants'
import {
  getMorphoPositionDetails,
  getMorphoPositionInfo,
} from 'handlers/portfolio/positions/handlers/morpho-blue/helpers'
import {
  getPositionsAutomations,
  type TokensPricesList,
} from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import { getAutomationData } from 'handlers/portfolio/positions/helpers/getAutomationData'
import type {
  PortfolioPosition,
  PortfolioPositionsCountReply,
  PortfolioPositionsHandler,
  PortfolioPositionsReply,
} from 'handlers/portfolio/types'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

interface GetMorphoPositionsParams {
  apiVaults?: Vault[]
  dpmList: DpmSubgraphData[]
  prices: TokensPricesList
  networkId: OmniSupportedNetworkIds
  protocolRaw: string
  positionsCount?: boolean
}

async function getMorphoPositions({
  apiVaults,
  dpmList,
  networkId,
  positionsCount,
  prices,
  protocolRaw,
}: GetMorphoPositionsParams): Promise<PortfolioPositionsReply | PortfolioPositionsCountReply> {
  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph({
    subgraph: 'Morpho',
    method: 'getMorphoDpmPositions',
    networkId,
    params: {
      dpmProxyAddress,
    },
  })) as SubgraphsResponses['Morpho']['getMorphoDpmPositions']
  const positionsArray = subgraphPositions.response.accounts.flatMap(
    ({ address: proxyAddress, borrowPositions, vaultId: positionId }) =>
      borrowPositions.map((position) => ({
        ...position,
        proxyAddress,
        positionId,
      })),
  )

  const [morphoPositionsAutomations] = await Promise.all([
    getAutomationData({
      addresses: positionsArray.map(({ proxyAddress }) => proxyAddress),
      network: NetworkIds.MAINNET,
    }),
  ])

  if (positionsCount || !apiVaults) {
    return {
      positions: positionsArray.map(({ positionId }) => ({ positionId })),
    }
  } else {
    const positions = await Promise.all(
      positionsArray.map(
        async ({ market, positionId, proxyAddress }): Promise<PortfolioPosition> => {
          const {
            collateralToken,
            id: marketId,
            latestInterestRates: [{ rate }],
            liquidationRatio,
            debtToken,
          } = market

          const {
            collateralPrice,
            networkName,
            pairId,
            primaryToken,
            quotePrice,
            secondaryToken,
            type,
            url,
          } = await getMorphoPositionInfo({
            apiVaults,
            dpmList,
            market,
            networkId,
            positionId,
            prices,
            proxyAddress,
            protocolRaw,
          })

          const position = await views.morpho.getPosition(
            {
              collateralPrecision: Number(collateralToken.decimals),
              collateralPriceUSD: collateralPrice,
              marketId,
              proxyAddress: proxyAddress,
              quotePrecision: Number(debtToken.decimals),
              quotePriceUSD: quotePrice,
            },
            {
              getCumulatives: getMorphoCumulatives(networkId),
              morphoAddress: getNetworkContracts(networkId).morphoBlue.address,
              provider: getRpcProvider(networkId),
            },
          )
          const automations = getPositionsAutomations({
            triggers:
              morphoPositionsAutomations
                .map((automation) => automation.triggers)
                .filter(
                  ({ decodedAndMappedData, account }) =>
                    decodedAndMappedData.poolId === marketId && account === proxyAddress,
                ) ?? [],
            defaultList: emptyAutomations,
          })

          const liquidationPrice = position.liquidationPrice.toString()

          const rawPositionDetails = getRawPositionDetails(
            networkId,
            positionId,
            marketId,
            pairId,
            position.collateralAmount,
            position.debtAmount,
            liquidationPrice.toString(),
            collateralPrice,
            quotePrice,
            position.maxRiskRatio,
            rate,
            prices,
          )

          return {
            availableToMigrate: false,
            availableToRefinance: true,
            rawPositionDetails,
            automations,
            details: getMorphoPositionDetails({
              liquidationRatio: new BigNumber(liquidationRatio).shiftedBy(NEGATIVE_WAD_PRECISION),
              position,
              primaryToken,
              rate: new BigNumber(rate),
              secondaryToken,
              type,
            }),
            network: networkName,
            netValue: position.netValue.toNumber(),
            pairId,
            positionId: Number(positionId),
            primaryToken,
            protocol: LendingProtocol.MorphoBlue,
            secondaryToken,
            type,
            url,
          }
        },
      ),
    )

    return { positions }
  }
}

export const morphoPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  apiVaults,
  dpmList,
  prices,
  positionsCount,
}) => {
  return Promise.all([
    getMorphoPositions({
      apiVaults,
      dpmList,
      networkId: NetworkIds.MAINNET,
      prices,
      positionsCount,
      protocolRaw: morphoSettings.rawName[NetworkIds.MAINNET] as string,
    }),
  ]).then((responses) => {
    return {
      address,
      positions: responses.flatMap(({ positions }) => positions),
    }
  })
}

function getRawPositionDetails(
  networkId: number,
  vaultId: string,
  marketId: string,
  pairId: number,
  collateralAmount: BigNumber,
  debtAmount: BigNumber,
  liquidationPrice: string,
  primaryTokenPrice: BigNumber,
  secondaryTokenPrice: BigNumber,
  maxRiskRatio: RiskRatio,
  rate: string,
  prices: TokensPricesList,
) {
  const chainFamily = getChainInfoByChainId(networkId)
  if (!chainFamily) {
    throw new Error(`ChainId ${NetworkIds.MAINNET} is not supported`)
  }

  const collateralPrice = primaryTokenPrice.toString()
  const debtPrice = secondaryTokenPrice.toString()

  const riskRatio = new RiskRatio(
    Number(collateralAmount) > 0
      ? new BigNumber(debtAmount)
          .times(debtPrice)
          .div(new BigNumber(collateralAmount).times(collateralPrice))
      : zero,
    RiskRatio.TYPE.LTV,
  )

  const borrowRate = rate

  const poolId = getMorphoPoolId(chainFamily.chainInfo, marketId)
  const positionId = getMorphoPositionId(vaultId)

  const rawPositionDetails: PortfolioPosition['rawPositionDetails'] = {
    collateralAmount: collateralAmount.toString(),
    debtAmount: debtAmount.toString(),
    collateralPrice,
    debtPrice,
    ethPrice: prices['ETH'].toString(),
    liquidationPrice: liquidationPrice,
    ltv: riskRatio.loanToValue.toString(),
    maxLtv: maxRiskRatio.loanToValue.toString(),
    borrowRate: borrowRate.toString(),
    positionId,
    poolId,
    pairId,
  }
  return rawPositionDetails
}
