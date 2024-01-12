import { RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import { getAaveV2ReserveConfigurationData, getAaveV2ReserveData } from 'blockchain/aave'
import { NetworkIds } from 'blockchain/networks'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import { commonDataMapper } from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import type { GetAaveLikePositionHandlerType } from 'handlers/portfolio/positions/handlers/aave-like/types'
import { getAaveV2DsProxyPosition } from 'handlers/portfolio/positions/handlers/aave-v2/ds-proxy-position'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
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
  const tokensLabel = `${commonData.primaryToken}/${commonData.secondaryToken}`
  const netValuePnlModalData = getOmniNetValuePnlData({
    cumulatives: {
      ...positionHistory,
      cumulativeWithdrawUSD: positionHistory.cumulativeWithdraw,
      cumulativeFeesUSD: positionHistory.cumulativeFees,
      cumulativeDepositUSD: positionHistory.cumulativeDeposit,
      cumulativeFeesInCollateralToken: positionHistory.cumulativeFeesInQuoteToken,
    },
    productType: OmniProductType.Multiply,
    collateralTokenPrice: primaryTokenPrice,
    debtTokenPrice: secondaryTokenPrice,
    netValueInCollateralToken: calculations.netValueInCollateralToken,
    netValueInDebtToken: calculations.netValueInDebtToken,
    collateralToken: commonData.primaryToken,
    debtToken: commonData.secondaryToken,
  })
  return {
    ...commonData,
    details: [
      {
        type: 'netValue',
        value: `${formatCryptoBalance(netValuePnlModalData.netValue.inToken)} ${
          netValuePnlModalData.netValue.netValueToken
        }`,
        subvalue: formatUsdValue(netValuePnlModalData.netValue.inUsd),
      },
      {
        type: 'pnl',
        value: netValuePnlModalData.pnl?.percentage
          ? formatDecimalAsPercent(netValuePnlModalData.pnl?.percentage, { precision: 2 })
          : notAvailable,
        accent: netValuePnlModalData.pnl?.percentage
          ? netValuePnlModalData.pnl?.percentage.gte(zero)
            ? 'positive'
            : 'negative'
          : undefined,
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
  const [allPositionsHistory] = await Promise.all([
    getHistoryData({
      network: NetworkIds.MAINNET,
      addresses: aaveV2DpmList.map(({ id }) => id),
    }),
  ])
  const [dsProxyPositions] = await Promise.all([
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
