import { RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import { getAaveV2ReserveConfigurationData, getAaveV2ReserveData } from 'blockchain/aave'
import { NetworkIds } from 'blockchain/networks'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { notAvailable } from 'handlers/portfolio/constants'
import { commonDataMapper } from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import type { GetAaveLikePositionHandlerType } from 'handlers/portfolio/positions/handlers/aave-like/types'
import { getAaveV2DsProxyPosition } from 'handlers/portfolio/positions/handlers/aave-v2/ds-proxy-position'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

const getAaveV2MultiplyPosition: GetAaveLikePositionHandlerType = async (
  dpm,
  prices,
  allPositionsHistory,
) => {
  const { commonData, primaryTokenPrice, secondaryTokenPrice } = commonDataMapper({ dpm, prices })
  const [
    primaryTokenReserveConfiguration,
    primaryTokenReserveData,
    secondaryTokenReserveData,
    onChainPositionData,
  ] = await Promise.all([
    getAaveV2ReserveConfigurationData({ token: commonData.primaryToken }),
    getAaveV2ReserveData({ token: commonData.primaryToken }),
    getAaveV2ReserveData({ token: commonData.secondaryToken }),
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
      .minus(positionHistory.cumulativeDeposit)
      .plus(positionHistory.cumulativeWithdraw)
      .div(positionHistory.cumulativeDeposit)

  const tokensLabel = `${commonData.primaryToken}/${commonData.secondaryToken}`
  return {
    ...commonData,
    details: [
      {
        type: 'netValue',
        value: `$${formatCryptoBalance(calculations.netValue)}`,
      },
      {
        type: 'pnl',
        value: pnlValue ? formatDecimalAsPercent(pnlValue, { precision: 2 }) : notAvailable,
        accent: pnlValue ? (pnlValue.gte(zero) ? 'positive' : 'negative') : undefined,
      },
      {
        type: 'liquidationPrice',
        value: `${formatCryptoBalance(calculations.liquidationPriceInDebt)} ${tokensLabel}`,
        subvalue: `Now ${formatCryptoBalance(
          primaryTokenPrice.div(secondaryTokenPrice),
        )} ${tokensLabel}`,
      },
      {
        type: 'ltv',
        value: formatDecimalAsPercent(onChainPositionData.riskRatio.loanToValue),
        subvalue: `Max ${formatDecimalAsPercent(onChainPositionData.category.maxLoanToValue)}`,
      },
      {
        type: 'multiple',
        value: `${onChainPositionData.riskRatio.multiple.toFormat(2, BigNumber.ROUND_DOWN)}x`,
        subvalue: `Max ${maxMultiple.toFormat(2, BigNumber.ROUND_DOWN)}x`,
      },
    ],
    netValue: calculations.netValue.toNumber(),
  }
}

export const aaveV2PositionHandler: PortfolioPositionsHandler = async ({
  address,
  prices,
  dpmList,
  positionsCount,
  ...rest
}) => {
  const aaveV2DpmList = dpmList.filter(({ protocol }) => ['AAVE'].includes(protocol))
  if (positionsCount) {
    const dsProxyPosition = await getAaveV2DsProxyPosition({ address, prices, dpmList, ...rest })
    return {
      positions: [
        ...aaveV2DpmList.map(({ vaultId }) => ({ positionId: vaultId })),
        ...dsProxyPosition.positions.map(({ positionId }) => ({ positionId: positionId })),
      ],
    }
  }
  const [allPositionsHistory, dsProxyPositions] = await Promise.all([
    getHistoryData({
      network: NetworkIds.MAINNET,
      addresses: aaveV2DpmList.map(({ id }) => id),
    }),
    getAaveV2DsProxyPosition({ address, prices, dpmList, ...rest }),
  ])
  const positions = await Promise.all(
    aaveV2DpmList.map(async (dpm) =>
      getAaveV2MultiplyPosition(dpm, prices, allPositionsHistory, []),
    ),
  )
  return {
    positions: [...dsProxyPositions.positions, ...positions],
  }
}
