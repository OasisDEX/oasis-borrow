import { RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import {
  commonDataMapper,
  filterAutomation,
  getReserveConfigurationDataCall,
  getReserveDataCall,
} from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import type { GetAaveLikePositionHandlerType } from 'handlers/portfolio/positions/handlers/aave-like/types'
import { getAutomationData } from 'handlers/portfolio/positions/helpers/getAutomationData'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import {
  formatAmount,
  formatAsShorthandNumbers,
  formatCryptoBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

const getAaveLikeBorrowPosition: GetAaveLikePositionHandlerType = async (
  dpm,
  prices,
  _history,
  allPositionsAutomations,
) => {
  const positionAutomations = allPositionsAutomations.find(filterAutomation(dpm))
  const commonData = commonDataMapper(dpm, positionAutomations)
  const primaryTokenPrice = prices[commonData.primaryToken]
  const secondaryTokenPrice = prices[commonData.secondaryToken]
  const [primaryTokenReserveData, secondaryTokenReserveData, onChainPositionData] =
    await Promise.all([
      getReserveDataCall(dpm, commonData.primaryToken),
      getReserveDataCall(dpm, commonData.secondaryToken),
      getOnChainPosition({
        networkId: dpm.networkId,
        collateralToken: commonData.primaryToken,
        debtToken: commonData.secondaryToken,
        protocol: commonData.protocol,
        proxyAddress: dpm.id.toLowerCase(),
      }),
    ])

  const calculations = calculateViewValuesForPosition(
    onChainPositionData,
    primaryTokenPrice,
    secondaryTokenPrice,
    primaryTokenReserveData.liquidityRate,
    secondaryTokenReserveData.variableBorrowRate,
  )
  return {
    ...commonData,
    details: [
      {
        type: 'collateralLocked',
        value: formatCryptoBalance(calculations.collateral),
      },
      {
        type: 'totalDebt',
        value: formatAsShorthandNumbers(calculations.debt, 2),
      },
      {
        type: 'liquidationPrice',
        value: `$${formatAmount(
          calculations.liquidationPriceInDebt.times(secondaryTokenPrice),
          commonData.secondaryToken,
        )}`,
        subvalue: `now: $${formatAmount(primaryTokenPrice, 'USD')}`,
      },
      {
        type: 'ltv',
        value: formatPercent(onChainPositionData.riskRatio.loanToValue.times(100), {
          precision: 2,
        }),
        subvalue: `max: ${formatPercent(onChainPositionData.category.maxLoanToValue.times(100), {
          precision: 2,
        })}`,
      },
      {
        type: 'borrowRate',
        value: formatPercent(secondaryTokenReserveData.variableBorrowRate.times(100), {
          precision: 2,
        }),
      },
    ],
    netValue: calculations.netValue.toNumber(),
  }
}

const getAaveLikeMultiplyPosition: GetAaveLikePositionHandlerType = async (
  dpm,
  prices,
  allPositionsHistory,
  allPositionsAutomations,
) => {
  const positionAutomations = allPositionsAutomations.find(filterAutomation(dpm))
  const commonData = commonDataMapper(dpm, positionAutomations)
  const primaryTokenPrice = prices[commonData.primaryToken]
  const secondaryTokenPrice = prices[commonData.secondaryToken]
  const [
    primaryTokenReserveConfiguration,
    primaryTokenReserveData,
    secondaryTokenReserveData,
    onChainPositionData,
  ] = await Promise.all([
    getReserveConfigurationDataCall(dpm, commonData.primaryToken),
    getReserveDataCall(dpm, commonData.primaryToken),
    getReserveDataCall(dpm, commonData.secondaryToken),
    getOnChainPosition({
      networkId: dpm.networkId,
      collateralToken: commonData.primaryToken,
      debtToken: commonData.secondaryToken,
      protocol: commonData.protocol,
      proxyAddress: dpm.id.toLowerCase(),
    }),
  ])

  const calculations = calculateViewValuesForPosition(
    onChainPositionData,
    primaryTokenPrice,
    secondaryTokenPrice,
    primaryTokenReserveData.liquidityRate,
    secondaryTokenReserveData.variableBorrowRate,
  )
  const { multiple: maxMultiple } = new RiskRatio(
    primaryTokenReserveConfiguration.ltv,
    RiskRatio.TYPE.LTV,
  )
  const positionHistory = allPositionsHistory.filter(
    (position) => position.id.toLowerCase() === dpm.id.toLowerCase(),
  )[0]
  const pnlValue =
    positionHistory?.cumulativeDeposit.gt(zero) &&
    calculations.netValue
      .minus(positionHistory.cumulativeDeposit.minus(positionHistory.cumulativeWithdraw))
      .div(positionHistory.cumulativeDeposit.minus(positionHistory.cumulativeWithdraw))
  return {
    ...commonData,
    details: [
      {
        type: 'netValue',
        value: `${formatAsShorthandNumbers(calculations.netValue, 2)}`,
      },
      {
        type: 'pnl',
        value: `${
          pnlValue
            ? formatPercent(pnlValue, {
                precision: 2,
                plus: true,
              })
            : notAvailable
        }`,
        accent: pnlValue ? (pnlValue.gte(zero) ? 'positive' : 'negative') : undefined,
      },
      {
        type: 'liquidationPrice',
        value: `$${formatAmount(
          calculations.liquidationPriceInDebt.times(secondaryTokenPrice),
          commonData.secondaryToken,
        )}`,
        subvalue: `now: $${formatAmount(primaryTokenPrice, 'USD')}`,
      },
      {
        type: 'ltv',
        value: formatPercent(onChainPositionData.riskRatio.loanToValue.times(100), {
          precision: 2,
        }),
        subvalue: `max: ${formatPercent(onChainPositionData.category.maxLoanToValue.times(100), {
          precision: 2,
        })}`,
      },
      {
        type: 'multiple',
        value: `${onChainPositionData.riskRatio.multiple.toFormat(2, BigNumber.ROUND_DOWN)}x`,
        subvalue: `max: ${maxMultiple.toFormat(2, BigNumber.ROUND_DOWN)}x`,
      },
    ],
    netValue: calculations.netValue.toNumber(),
  }
}

const getAaveLikeEarnPosition: GetAaveLikePositionHandlerType = async (
  dpm,
  prices,
  allPositionsHistory,
) => {
  const commonData = commonDataMapper(dpm)
  const primaryTokenPrice = prices[commonData.primaryToken]
  const secondaryTokenPrice = prices[commonData.secondaryToken]
  const [primaryTokenReserveData, secondaryTokenReserveData, onChainPositionData] =
    await Promise.all([
      getReserveDataCall(dpm, commonData.primaryToken),
      getReserveDataCall(dpm, commonData.secondaryToken),
      getOnChainPosition({
        networkId: dpm.networkId,
        collateralToken: commonData.primaryToken,
        debtToken: commonData.secondaryToken,
        protocol: commonData.protocol,
        proxyAddress: dpm.id.toLowerCase(),
      }),
    ])
  const positionHistory = allPositionsHistory.filter(
    (position) => position.id === dpm.id.toLowerCase(),
  )[0]
  const calculations = calculateViewValuesForPosition(
    onChainPositionData,
    primaryTokenPrice,
    secondaryTokenPrice,
    primaryTokenReserveData.liquidityRate,
    secondaryTokenReserveData.variableBorrowRate,
  )

  return {
    ...commonData,
    lendingType: onChainPositionData.debt.amount.gt(zero) ? 'loop' : 'passive',
    details: [
      {
        type: 'netValue',
        value: `${formatAsShorthandNumbers(calculations.netValue, 2)}`,
      },
      {
        type: 'earnings',
        value: `${
          positionHistory
            ? formatAsShorthandNumbers(
                calculations.netValue.minus(
                  positionHistory.cumulativeDeposit.minus(positionHistory.cumulativeWithdraw),
                ),
                2,
              )
            : notAvailable
        }`,
      },
      {
        type: 'apy',
        value: formatPercent(primaryTokenReserveData.liquidityRate.times(100), {
          precision: 2,
        }),
      },
      {
        type: 'ltv',
        value: formatPercent(onChainPositionData.riskRatio.loanToValue.times(100), {
          precision: 2,
        }),
        subvalue: `max: ${formatPercent(onChainPositionData.category.maxLoanToValue.times(100), {
          precision: 2,
        })}`,
      },
    ],
    netValue: calculations.netValue.toNumber(),
  }
}

export const aaveLikePositionsHandler: PortfolioPositionsHandler = async ({ dpmList, prices }) => {
  const aaveLikeDpmList = dpmList.filter(({ protocol }) => ['AAVE_V3', 'Spark'].includes(protocol))
  const uniqueDpmNetworks = Array.from(new Set(aaveLikeDpmList.map(({ networkId }) => networkId)))
  const [allPositionsHistory, allPositionsAutomations] = await Promise.all([
    Promise.all(
      uniqueDpmNetworks.map((networkId) =>
        getHistoryData({
          network: networkId,
          addresses: aaveLikeDpmList
            .filter(({ networkId: dpmNetworkId }) => dpmNetworkId === networkId)
            .map(({ id }) => id),
        }),
      ),
    ).then((data) => data.flat()),
    getAutomationData({
      addresses: aaveLikeDpmList
        .filter(({ networkId }) => networkId === NetworkIds.MAINNET)
        .map(({ id }) => id),
      network: NetworkIds.MAINNET,
    }),
  ])

  const positions = await Promise.all(
    aaveLikeDpmList.map(async (dpm) => {
      switch (dpm.positionType.toLowerCase()) {
        case OmniProductType.Multiply:
          return getAaveLikeMultiplyPosition(
            dpm,
            prices,
            allPositionsHistory,
            allPositionsAutomations,
          )
        case OmniProductType.Borrow:
          return getAaveLikeBorrowPosition(
            dpm,
            prices,
            allPositionsHistory,
            allPositionsAutomations,
          )
        case OmniProductType.Earn:
          return getAaveLikeEarnPosition(dpm, prices, allPositionsHistory, allPositionsAutomations)
        default:
          throw new Error(`Unsupported position type ${dpm.positionType}`)
      }
    }),
  )

  return {
    positions,
  }
}
