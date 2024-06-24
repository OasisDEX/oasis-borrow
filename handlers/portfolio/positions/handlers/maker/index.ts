import { decodeTriggerDataAsJson } from '@oasisdex/automation'
import { RiskRatio } from '@oasisdex/dma-library'
import { getChainInfoByChainId } from '@summer_fi/summerfi-sdk-common'
import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { amountFromRay } from 'blockchain/utils'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { OmniProductType } from 'features/omni-kit/types'
import { getMakerPoolId } from 'features/refinance/helpers/getMakerPoolId'
import { getMakerPositionId } from 'features/refinance/helpers/getMakerPositionId'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import {
  getMakerPositionDetails,
  getMakerPositionInfo,
} from 'handlers/portfolio/positions/handlers/maker/helpers'
import { mapMakerRaysMultipliers } from 'handlers/portfolio/positions/handlers/maker/helpers/mapMakerRaysMultipliers'
import { getPositionsAutomations } from 'handlers/portfolio/positions/helpers'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import { getPositionPortfolioRaysWithBoosts } from 'handlers/portfolio/positions/helpers/getPositionPortfolioRaysWithBoosts'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { getPointsPerYear } from 'helpers/rays'
import { one, zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

const notSupportedIlks = ['CRVV1ETHSTETH-A']

export const makerPositionsHandler: PortfolioPositionsHandler = async ({
  apiVaults,
  address,
  prices,
  positionsCount,
  raysUserMultipliers,
}) => {
  const subgraphPositions = (await loadSubgraph({
    subgraph: 'Discover',
    method: 'getMakerDiscoverPositions',
    networkId: NetworkIds.MAINNET,
    params: {
      walletAddress: address,
    },
  })) as SubgraphsResponses['Discover']['getMakerDiscoverPositions']

  if (positionsCount || !apiVaults) {
    return {
      positions: subgraphPositions.response.cdps.map(({ cdp }) => ({ positionId: cdp })),
    }
  }

  const positions = await Promise.all(
    subgraphPositions.response.cdps
      // Filter out ilks that are no longer supported (i.e insti vaults)
      .filter((item) => !notSupportedIlks.includes(item.ilk.ilk))
      .map(
        async ({
          cdp,
          collateral,
          cumulativeDepositUSD,
          cumulativeFeesUSD,
          cumulativeWithdrawnUSD,
          ilk,
          normalizedDebt,
          openedAt,
          triggers,
          type: initialType,
          creator,
        }): Promise<PortfolioPosition> => {
          const { collateralPrice, daiPrice, debt, primaryToken, secondaryToken, type, url } =
            await getMakerPositionInfo({
              apiVaults,
              cdp,
              ilk,
              normalizedDebt,
              prices,
              type: initialType,
            })
          const netValue = new BigNumber(collateral)
            .times(collateralPrice)
            .minus(debt.times(daiPrice))

          const minCollRatio = amountFromRay(new BigNumber(ilk.liquidationRatio))

          const liquidationPrice = collateralPriceAtRatio({
            collateral: new BigNumber(collateral),
            colRatio: minCollRatio,
            vaultDebt: new BigNumber(debt),
          }).toString()

          const riskRatio = new RiskRatio(
            Number(collateral) > 0
              ? new BigNumber(debt)
                  .times(daiPrice)
                  .div(new BigNumber(collateral).times(collateralPrice))
              : zero,
            RiskRatio.TYPE.LTV,
          )

          const borrowRate = new BigNumber(ilk.stabilityFee).minus(one)
          const maxRiskRatio = new RiskRatio(one.div(minCollRatio), RiskRatio.TYPE.LTV)
          const chainFamily = getChainInfoByChainId(NetworkIds.MAINNET)
          if (!chainFamily) {
            throw new Error(`ChainId ${NetworkIds.MAINNET} is not supported`)
          }

          const collateralToken = mapTokenToSdkToken(chainFamily.chainInfo, primaryToken)
          const debtToken = mapTokenToSdkToken(chainFamily.chainInfo, secondaryToken)
          const poolId = getMakerPoolId(chainFamily.chainInfo, ilk.ilk, collateralToken, debtToken)
          const positionId = getMakerPositionId(cdp)

          const rawRaysPerYear = getPointsPerYear(netValue.toNumber())

          const positionRaysMultipliersData = mapMakerRaysMultipliers({
            multipliers: raysUserMultipliers,
            dsProxy: creator,
            ilkId: ilk.id,
          })

          const raysPerYear = getPositionPortfolioRaysWithBoosts({
            rawRaysPerYear,
            positionRaysMultipliersData,
          })

          return {
            availableToMigrate: false,
            availableToRefinance: true,
            automations: {
              ...(type !== OmniProductType.Earn && {
                autoBuy: { enabled: false },
                autoSell: { enabled: false },
                stopLoss: { enabled: false },
                takeProfit: { enabled: false },
                ...getPositionsAutomations({
                  triggers: triggers.map((trigger) => ({
                    ...trigger,
                    ...decodeTriggerDataAsJson(
                      trigger.commandAddress,
                      NetworkIds.MAINNET,
                      trigger.triggerData,
                    ),
                  })) as unknown as AutomationResponse[number]['triggers'][],
                }),
              }),
            },
            details: getMakerPositionDetails({
              collateral,
              collateralPrice,
              cumulativeDepositUSD,
              cumulativeFeesUSD,
              cumulativeWithdrawnUSD,
              daiPrice,
              debt,
              liquidationPrice,
              netValue,
              primaryToken,
              type,
              borrowRate,
              riskRatio,
              maxRiskRatio,
            }),
            rawPositionDetails: {
              collateralAmount: collateral,
              debtAmount: debt.toString(),
              collateralPrice: collateralPrice.toString(),
              debtPrice: daiPrice.toString(),
              ethPrice: prices['ETH'].toString(),
              liquidationPrice,
              ltv: riskRatio.loanToValue.toString(),
              maxLtv: maxRiskRatio.loanToValue.toString(),
              borrowRate: borrowRate.toString(),
              poolId,
              positionId,
              pairId: 1,
              dpmAddress: undefined,
              ownerAddress: undefined,
            },
            ...(type === OmniProductType.Earn && { lendingType: 'passive' }),
            network: NetworkNames.ethereumMainnet,
            netValue: netValue.toNumber(),
            openDate: Number(openedAt),
            positionId: Number(cdp),
            primaryToken,
            protocol: LendingProtocol.Maker,
            secondaryToken,
            type,
            url,
            raysPerYear,
          }
        },
      ),
  )

  return {
    address,
    positions,
  }
}
