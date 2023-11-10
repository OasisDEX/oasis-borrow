import { RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import {
  getAaveV3ReserveConfigurationData,
  getAaveV3ReserveData,
  getAaveV3UserReserveData,
} from 'blockchain/aave-v3'
import { networksById } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { calculateViewValuesForPosition } from 'features/aave/services'
import type { DpmList } from 'handlers/portfolio/positions/handlers/dpm'
import { getTokenName } from 'handlers/portfolio/positions/helpers/getTokenName'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

type GetPositionHandlerType = (dpm: DpmList[number], tickers: Tickers) => Promise<PortfolioPosition>

const commonDataMapper = (dpm: DpmList[number]) => ({
  positionId: Number(dpm.vaultId),
  type: dpm.positionType,
  network: networksById[dpm.networkId].name,
  protocol: LendingProtocol.AaveV3,
  primaryToken: getTokenName(dpm.networkId, dpm.collateralToken),
  secondaryToken: getTokenName(dpm.networkId, dpm.debtToken),
})

const getAaveBorrowPosition: GetPositionHandlerType = async (dpm) => {
  const commonData = commonDataMapper(dpm)
  const userReserveData = await getAaveV3UserReserveData({
    networkId: dpm.networkId,
    token: commonData.primaryToken,
    address: dpm.user.toLowerCase(),
  })
  return {
    ...commonDataMapper(dpm),
    details: [
      {
        type: 'collateralLocked',
        value: userReserveData.currentATokenBalance.toString(),
      },
      {
        type: 'totalDebt',
        value: userReserveData.currentStableDebt.toString(),
      },
      {
        type: 'liquidationPrice',
        value: '27',
      },
      {
        type: 'ltv',
        value: userReserveData.liquidityRate.toString(),
      },
      {
        type: 'borrowRate',
        value: userReserveData.stableBorrowRate.toString(),
      },
    ],
    automations: {},
    netValue: 22,
  }
}

const getAaveMultiplyPosition: GetPositionHandlerType = async (dpm, tickers) => {
  const commonData = commonDataMapper(dpm)
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
  return {
    ...commonData,
    details: [
      {
        type: 'netValue',
        value: `$${formatAmount(calculations.netValue, 'USD')}`,
      },
      {
        type: 'pnl',
        value: '23',
        accent: 'positive',
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
    automations: {},
    netValue: calculations.netValue.toNumber(),
  }
}
const getAaveEarnPosition: GetPositionHandlerType = async (dpm) => {
  return {
    ...commonDataMapper(dpm),
    details: [
      {
        type: 'netValue',
        value: '22',
      },
      {
        type: 'earnings',
        value: '23',
      },
      {
        type: 'apy',
        value: '27',
      },
    ],
    automations: {},
    netValue: 22,
  }
}

export const aaveV3PositionsHandler: PortfolioPositionsHandler = async ({
  address,
  dpmList,
  tickers,
}) => {
  const aaveV3DpmList = dpmList.filter(({ protocol }) => protocol === 'AAVE_V3')
  const positionsCallList = await Promise.all(
    aaveV3DpmList.map(async (dpm) => {
      switch (dpm.positionType) {
        case 'Multiply':
          return await getAaveMultiplyPosition(dpm, tickers)
        case 'Borrow':
          return await getAaveBorrowPosition(dpm, tickers)
        case 'Earn':
          return await getAaveEarnPosition(dpm, tickers)
        default:
          throw new Error(`Unsupported position type ${dpm.positionType}`)
      }
    }),
  )

  return {
    positions: positionsCallList,
    address,
    dpmList,
  }
}
