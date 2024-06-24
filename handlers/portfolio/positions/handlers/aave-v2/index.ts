import { isCorrelatedPosition, RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import { getAaveV2ReserveConfigurationData, getAaveV2ReserveData } from 'blockchain/aave'
import { getNetworkById, NetworkIds } from 'blockchain/networks'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers'
import { mapAaveLikeRaysMultipliers } from 'features/omni-kit/protocols/aave-like/helpers/mapAaveLikeRaysMultipliers'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import {
  commonDataMapper,
  getFilteredAaveLikePortfolioPositionHistory,
} from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import type { GetAaveLikePositionHandlerType } from 'handlers/portfolio/positions/handlers/aave-like/types'
import { getAaveV2DsProxyPosition } from 'handlers/portfolio/positions/handlers/aave-v2/ds-proxy-position'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import { getPositionPortfolioRaysWithBoosts } from 'handlers/portfolio/positions/helpers/getPositionPortfolioRaysWithBoosts'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { getPointsPerYear } from 'helpers/rays'
import { zero } from 'helpers/zero'
import { isAaveLikeLendingProtocol } from 'lendingProtocols'

const getAaveV2MultiplyPosition: GetAaveLikePositionHandlerType = async ({
  dpm,
  prices,
  allPositionsHistory,
  raysUserMultipliers,
}) => {
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
  const protocol = commonData.protocol

  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const positionHistory = getFilteredAaveLikePortfolioPositionHistory({
    history: allPositionsHistory,
    protocol,
    proxy: dpm.id,
  })

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
    useDebtTokenAsPnL: isCorrelatedPosition(commonData.primaryToken, commonData.secondaryToken),
  })

  const rawRaysPerYear = getPointsPerYear(netValuePnlModalData.netValue.inUsd.toNumber())

  const networkName = getNetworkById(dpm.networkId).name

  const positionRaysMultipliersData = mapAaveLikeRaysMultipliers({
    multipliers: raysUserMultipliers,
    collateralTokenAddress: dpm.collateralToken,
    quoteTokenAddress: dpm.debtToken,
    dpmProxy: dpm.id,
    protocol: commonData.protocol,
    networkName,
  })

  const raysPerYear = getPositionPortfolioRaysWithBoosts({
    rawRaysPerYear,
    positionRaysMultipliersData,
  })

  return {
    ...commonData,
    raysPerYear,
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
  raysUserMultipliers,
  ...rest
}) => {
  const aaveV2DpmList = dpmList.filter(({ protocol }) => ['AAVE'].includes(protocol))
  if (positionsCount) {
    const dsProxyPosition = await getAaveV2DsProxyPosition({
      address,
      prices,
      dpmList,
      raysUserMultipliers,
      ...rest,
    })
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
    getAaveV2DsProxyPosition({ address, prices, dpmList, raysUserMultipliers, ...rest }),
  ])
  const positions = await Promise.all(
    aaveV2DpmList.map(async (dpm) =>
      getAaveV2MultiplyPosition({
        dpm,
        prices,
        allPositionsHistory,
        allPositionsAutomations: [], // not needed here
        allOraclePrices: [], // not needed here
        raysUserMultipliers,
      }),
    ),
  )
  return {
    positions: [...dsProxyPositions.positions, ...positions],
  }
}
