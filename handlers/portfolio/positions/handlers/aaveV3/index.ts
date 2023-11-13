import { RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import { getAaveV3ReserveConfigurationData, getAaveV3ReserveData } from 'blockchain/aave-v3'
import { NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import { getPositionsAutomations } from 'handlers/portfolio/positions/helpers'
import type { DpmList } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import { getAutomationData } from 'handlers/portfolio/positions/helpers/getAutomationData'
import type { HistoryResponse } from 'handlers/portfolio/positions/helpers/getHistoryData'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import { getTokenName } from 'handlers/portfolio/positions/helpers/getTokenName'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import {
  formatAmount,
  formatAsShorthandNumbers,
  formatCryptoBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

type GetPositionHandlerType = (
  dpm: DpmList[number],
  tickers: Tickers,
  allPositionsHistory: HistoryResponse,
  allPositionsAutomation: AutomationResponse,
) => Promise<PortfolioPosition>

const commonDataMapper = (dpm: DpmList[number], automations?: AutomationResponse[number]) => ({
  positionId: Number(dpm.vaultId),
  type: dpm.positionType,
  network: networksById[dpm.networkId].name,
  protocol: LendingProtocol.AaveV3,
  primaryToken: getTokenName(dpm.networkId, dpm.collateralToken),
  secondaryToken: getTokenName(dpm.networkId, dpm.debtToken),
  url: `/${networksById[dpm.networkId].name.toLowerCase()}/aave/v3/${dpm.vaultId}`,
  automations: {
    ...(dpm.positionType !== OmniProductType.Earn &&
      automations && {
        autoBuy: { enabled: false },
        autoSell: { enabled: false },
        stopLoss: { enabled: false },
        takeProfit: { enabled: false },
        ...getPositionsAutomations({
          networkId: NetworkIds.MAINNET,
          triggers: [automations.triggers],
        }),
      }),
  },
})

const getAaveBorrowPosition: GetPositionHandlerType = async (
  dpm,
  tickers,
  _history,
  allPositionsAutomations,
) => {
  const positionAutomations = allPositionsAutomations.filter(
    (position) => position.triggers.owner.toLowerCase() === dpm.user.toLowerCase(),
  )[0]
  const commonData = commonDataMapper(dpm, positionAutomations)
  const primaryTokenPrice = getTokenPrice(commonData.primaryToken, tickers)
  const secondaryTokenPrice = getTokenPrice(commonData.secondaryToken, tickers)
  const [primaryTokenReserveData, secondaryTokenReserveData, onChainPositionData] =
    await Promise.all([
      getAaveV3ReserveData({
        networkId: dpm.networkId,
        token: commonData.primaryToken,
      }),
      getAaveV3ReserveData({
        networkId: dpm.networkId,
        token: commonData.secondaryToken,
      }),
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

const getAaveMultiplyPosition: GetPositionHandlerType = async (
  dpm,
  tickers,
  allPositionsHistory,
  allPositionsAutomations,
) => {
  const positionAutomations = allPositionsAutomations.filter(
    (position) => position.triggers.owner.toLowerCase() === dpm.user.toLowerCase(),
  )[0]
  const commonData = commonDataMapper(dpm, positionAutomations)
  const primaryTokenPrice = getTokenPrice(commonData.primaryToken, tickers)
  const secondaryTokenPrice = getTokenPrice(commonData.secondaryToken, tickers)
  const [
    primaryTokenReserveConfiguration,
    primaryTokenReserveData,
    secondaryTokenReserveData,
    onChainPositionData,
  ] = await Promise.all([
    getAaveV3ReserveConfigurationData({
      networkId: dpm.networkId,
      token: commonData.primaryToken,
    }),
    getAaveV3ReserveData({
      networkId: dpm.networkId,
      token: commonData.primaryToken,
    }),
    getAaveV3ReserveData({
      networkId: dpm.networkId,
      token: commonData.secondaryToken,
    }),
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

const getAaveEarnPosition: GetPositionHandlerType = async (dpm, tickers, allPositionsHistory) => {
  const commonData = commonDataMapper(dpm)
  const primaryTokenPrice = getTokenPrice(commonData.primaryToken, tickers)
  const secondaryTokenPrice = getTokenPrice(commonData.secondaryToken, tickers)
  const [primaryTokenReserveData, secondaryTokenReserveData, onChainPositionData] =
    await Promise.all([
      getAaveV3ReserveData({
        networkId: dpm.networkId,
        token: commonData.primaryToken,
      }),
      getAaveV3ReserveData({
        networkId: dpm.networkId,
        token: commonData.secondaryToken,
      }),
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
    automations: {}, // TODO add automations
  }
}

export const aaveV3PositionsHandler: PortfolioPositionsHandler = async ({
  address,
  dpmList,
  tickers,
}) => {
  const aaveV3DpmList = dpmList.filter(({ protocol }) => protocol === 'AAVE_V3')
  const uniqueDpmNetworks = Array.from(new Set(aaveV3DpmList.map(({ networkId }) => networkId)))
  const [allPositionsHistory, allPositionsAutomations] = await Promise.all([
    Promise.all(
      uniqueDpmNetworks.map((networkId) =>
        getHistoryData({
          network: networkId,
          addresses: aaveV3DpmList
            .filter(({ networkId: dpmNetworkId }) => dpmNetworkId === networkId)
            .map(({ id }) => id),
        }),
      ),
    ).then((data) => data.flat()),
    getAutomationData({
      addresses: aaveV3DpmList
        .filter(({ networkId }) => networkId === NetworkIds.MAINNET)
        .map(({ id }) => id),
      network: NetworkIds.MAINNET,
    }),
  ])

  const positions = await Promise.all(
    aaveV3DpmList.map(async (dpm) => {
      switch (dpm.positionType.toLowerCase()) {
        case OmniProductType.Multiply:
          return getAaveMultiplyPosition(dpm, tickers, allPositionsHistory, allPositionsAutomations)
        case OmniProductType.Borrow:
          return getAaveBorrowPosition(dpm, tickers, allPositionsHistory, allPositionsAutomations)
        case OmniProductType.Earn:
          return getAaveEarnPosition(dpm, tickers, allPositionsHistory, allPositionsAutomations)
        default:
          throw new Error(`Unsupported position type ${dpm.positionType}`)
      }
    }),
  )

  return {
    positions,
    address,
    dpmList,
  }
}
