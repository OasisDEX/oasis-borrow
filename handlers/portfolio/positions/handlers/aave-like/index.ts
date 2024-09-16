import { isCorrelatedPosition, RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getNetworkById, NetworkIds } from 'blockchain/networks'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { getOmniNetValuePnlData, isShortPosition } from 'features/omni-kit/helpers'
import { mapAaveLikeRaysMultipliers } from 'features/omni-kit/protocols/aave-like/helpers/mapAaveLikeRaysMultipliers'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import {
  aaveLikeProtocolNames,
  commonDataMapper,
  filterAutomation,
  formatBigNumberDebugData,
  getFilteredAaveLikePortfolioPositionHistory,
  getReserveConfigurationDataCall,
  getReserveDataCall,
  uniqueTokensReducer,
} from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import type { GetAaveLikePositionHandlerType } from 'handlers/portfolio/positions/handlers/aave-like/types'
import { getAutomationData } from 'handlers/portfolio/positions/helpers/getAutomationData'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import { getOraclePriceData } from 'handlers/portfolio/positions/helpers/getOraclePriceData'
import { getPositionPortfolioRaysWithBoosts } from 'handlers/portfolio/positions/helpers/getPositionPortfolioRaysWithBoosts'
import type { PortfolioPositionsHandler, PositionDetail } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import type { GetYieldsResponse } from 'helpers/lambda/yields'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { getPointsPerYear } from 'helpers/rays'
import { zero } from 'helpers/zero'
import { isAaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { getRawPositionDetails } from './getRawPositionDetails'
import { mapDpmProtocolNameToUIName } from './mapDpmProtocolNameToUIName'

const getAaveLikeBorrowPosition: GetAaveLikePositionHandlerType = async ({
  dpm,
  prices,
  allPositionsAutomations,
  allOraclePrices,
  apiVaults,
  debug,
  raysUserMultipliers,
}) => {
  const positionAutomations = allPositionsAutomations
    .filter(filterAutomation(dpm))
    .map((automation) => automation.triggers)
  const { commonData, primaryTokenPrice, secondaryTokenPrice, ...commonRest } = commonDataMapper({
    automations: positionAutomations,
    dpm,
    prices,
    apiVaults,
    allOraclePrices,
    debug,
  })
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

  const isShort = isShortPosition({ collateralToken: commonData.primaryToken })
  const tokensLabel = isShort
    ? `${commonData.secondaryToken}/${commonData.primaryToken}`
    : `${commonData.primaryToken}/${commonData.secondaryToken}`

  const liquidationPrice = isShort
    ? calculations.liquidationPriceInCollateral
    : calculations.liquidationPriceInDebt

  const rawPositionDetails = getRawPositionDetails(
    dpm,
    calculations,
    liquidationPrice.toString(),
    primaryTokenPrice,
    secondaryTokenPrice,
    onChainPositionData,
    commonData,
    commonData.protocol,
    prices,
  )

  const rawRaysPerYear = getPointsPerYear(calculations.netValue.toNumber())

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
    rawPositionDetails,
    details: [
      {
        type: 'collateralLocked',
        value: `${formatCryptoBalance(calculations.collateral)} ${commonData.primaryToken}`,
      },
      {
        type: 'totalDebt',
        value: `${formatCryptoBalance(calculations.debt)} ${commonData.secondaryToken}`,
      },
      {
        type: 'liquidationPrice',
        value: `${formatCryptoBalance(liquidationPrice)} ${tokensLabel}`,
        subvalue: `Now ${formatCryptoBalance(
          isShort
            ? secondaryTokenPrice.div(primaryTokenPrice)
            : primaryTokenPrice.div(secondaryTokenPrice),
        )} ${tokensLabel}`,
      },
      {
        type: 'ltv',
        value: formatDecimalAsPercent(onChainPositionData.riskRatio.loanToValue),
        subvalue: `Max ${formatDecimalAsPercent(onChainPositionData.category.maxLoanToValue)}`,
      },
      {
        type: 'borrowRate',
        value: formatDecimalAsPercent(calculations.netBorrowCostPercentage),
      },
    ],
    netValue: calculations.netValue.toNumber(),
    debuggingData: debug
      ? { ...formatBigNumberDebugData({ ...commonRest, positionAutomations, dpm }) }
      : undefined,
    raysPerYear: {
      value: raysPerYear,
    },
  }
}

const getAaveLikeMultiplyPosition: GetAaveLikePositionHandlerType = async ({
  dpm,
  prices,
  allPositionsHistory,
  allPositionsAutomations,
  allOraclePrices,
  apiVaults,
  debug,
  raysUserMultipliers,
}) => {
  const positionAutomations = allPositionsAutomations
    .filter(filterAutomation(dpm))
    .map((automation) => automation.triggers)
  const { commonData, primaryTokenPrice, secondaryTokenPrice, ...commonRest } = commonDataMapper({
    automations: positionAutomations,
    dpm,
    prices,
    apiVaults,
    allOraclePrices,
    debug,
  })

  const lendingProtocol = commonData.protocol

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
      protocol: lendingProtocol,
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

  if (!isAaveLikeLendingProtocol(lendingProtocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const positionHistory = getFilteredAaveLikePortfolioPositionHistory({
    history: allPositionsHistory,
    protocol: lendingProtocol,
    proxy: dpm.id,
  })
  const isShort = isShortPosition({ collateralToken: commonData.primaryToken })
  const tokensLabel = isShort
    ? `${commonData.secondaryToken}/${commonData.primaryToken}`
    : `${commonData.primaryToken}/${commonData.secondaryToken}`

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

  const liquidationPrice = isShort
    ? calculations.liquidationPriceInCollateral
    : calculations.liquidationPriceInDebt

  const rawPositionDetails = getRawPositionDetails(
    dpm,
    calculations,
    liquidationPrice.toString(),
    primaryTokenPrice,
    secondaryTokenPrice,
    onChainPositionData,
    commonData,
    lendingProtocol,
    prices,
  )

  const rawRaysPerYear = getPointsPerYear(calculations.netValue.toNumber())

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
    rawPositionDetails,
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
        value: `${formatCryptoBalance(liquidationPrice)} ${tokensLabel}`,
        subvalue: `Now ${formatCryptoBalance(
          isShort
            ? secondaryTokenPrice.div(primaryTokenPrice)
            : primaryTokenPrice.div(secondaryTokenPrice),
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
    debuggingData: debug
      ? { ...formatBigNumberDebugData({ ...commonRest, positionAutomations, dpm }) }
      : undefined,
    raysPerYear: {
      value: raysPerYear,
    },
  }
}

const getAaveLikeEarnPosition: GetAaveLikePositionHandlerType = async ({
  dpm,
  prices,
  allPositionsHistory,
  allOraclePrices,
  debug,
  raysUserMultipliers,
}) => {
  const { commonData, primaryTokenPrice, secondaryTokenPrice, ...commonRest } = commonDataMapper({
    dpm,
    prices,
    allOraclePrices,
    debug,
  })
  const [onChainPositionData, primaryTokenReserveData, secondaryTokenReserveData] =
    await Promise.all([
      getOnChainPosition({
        networkId: dpm.networkId,
        collateralToken: commonData.primaryToken,
        debtToken: commonData.secondaryToken,
        protocol: commonData.protocol,
        proxyAddress: dpm.id.toLowerCase(),
      }),
      getReserveDataCall(dpm, commonData.primaryToken),
      getReserveDataCall(dpm, commonData.secondaryToken),
    ])
  const calculations = calculateViewValuesForPosition(
    onChainPositionData,
    primaryTokenPrice,
    secondaryTokenPrice,
    primaryTokenReserveData.liquidityRate,
    secondaryTokenReserveData.variableBorrowRate,
  )

  const protocol = commonData.protocol

  const isWstethEthEarn =
    commonData.primaryToken === 'WSTETH' && commonData.secondaryToken === 'ETH'
  let wstEthYield: GetYieldsResponse | null = null

  if (isWstethEthEarn) {
    const contracts = getNetworkContracts(NetworkIds.MAINNET)
    const wstethTokenAddress = contracts.tokens['WSTETH'].address
    const ethTokenAddress = contracts.tokens['WETH'].address
    wstEthYield = await getYieldsRequest(
      {
        ltv: onChainPositionData.riskRatio.loanToValue,
        protocol,
        networkId: NetworkIds.MAINNET,
        collateralTokenAddress: wstethTokenAddress,
        quoteTokenAddress: ethTokenAddress,
      },
      process.env.FUNCTIONS_API_URL,
    )
  }

  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const positionHistory = getFilteredAaveLikePortfolioPositionHistory({
    history: allPositionsHistory,
    protocol,
    proxy: dpm.id,
  })

  const netValuePnlModalData = getOmniNetValuePnlData({
    cumulatives: {
      ...positionHistory,
      cumulativeWithdrawUSD: positionHistory.cumulativeWithdraw,
      cumulativeFeesUSD: positionHistory.cumulativeFees,
      cumulativeDepositUSD: positionHistory.cumulativeDeposit,
      cumulativeFeesInCollateralToken: positionHistory.cumulativeFeesInQuoteToken,
    },
    productType: OmniProductType.Earn,
    collateralTokenPrice: primaryTokenPrice,
    debtTokenPrice: secondaryTokenPrice,
    netValueInCollateralToken: calculations.netValueInCollateralToken,
    netValueInDebtToken: calculations.netValueInDebtToken,
    collateralToken: commonData.primaryToken,
    debtToken: commonData.secondaryToken,
    useDebtTokenAsPnL: isCorrelatedPosition(commonData.primaryToken, commonData.secondaryToken),
  })

  const rawRaysPerYear = getPointsPerYear(calculations.netValue.toNumber())

  const networkName = getNetworkById(dpm.networkId).name

  const positionRaysMultipliersData = mapAaveLikeRaysMultipliers({
    multipliers: raysUserMultipliers,
    collateralTokenAddress: dpm.collateralToken,
    quoteTokenAddress: dpm.debtToken,
    dpmProxy: dpm.id,
    protocol,
    networkName,
  })

  const raysPerYear = getPositionPortfolioRaysWithBoosts({
    rawRaysPerYear,
    positionRaysMultipliersData,
  })

  return {
    ...commonData,
    lendingType: onChainPositionData.debt.amount.gt(zero) ? 'loop' : 'passive',
    details: [
      {
        type: 'netValue',
        value: `${formatCryptoBalance(netValuePnlModalData.netValue.inToken)} ${
          netValuePnlModalData.netValue.netValueToken
        }`,
        subvalue: formatUsdValue(netValuePnlModalData.netValue.inUsd),
      },
      {
        type: 'earnings',
        value: `${
          netValuePnlModalData.pnl
            ? `${formatCryptoBalance(netValuePnlModalData.pnl?.inToken)} ${
                netValuePnlModalData.pnl.pnlToken
              }`
            : notAvailable
        }`,
      },
      {
        type: 'apy',
        value: wstEthYield?.results?.apy7d
          ? formatDecimalAsPercent(new BigNumber(wstEthYield.results.apy7d).div(100))
          : notAvailable,
      },
      {
        type: 'ltv',
        value: formatDecimalAsPercent(onChainPositionData.riskRatio.loanToValue),
        subvalue: `Max ${formatDecimalAsPercent(onChainPositionData.category.maxLoanToValue)}`,
      },
    ].filter(Boolean) as PositionDetail[],
    netValue: netValuePnlModalData.netValue.inToken.toNumber(),
    debuggingData: debug ? { ...formatBigNumberDebugData(commonRest) } : undefined,
    raysPerYear: {
      value: raysPerYear,
    },
  }
}

export const aaveLikePositionsHandler: PortfolioPositionsHandler = async ({
  dpmList,
  prices,
  apiVaults,
  positionsCount,
  debug,
  raysUserMultipliers,
}) => {
  const aaveLikeDpmList = dpmList
    .map(mapDpmProtocolNameToUIName)
    .filter(({ protocol }) =>
      [aaveLikeProtocolNames.aavev3, aaveLikeProtocolNames.sparkv3].includes(protocol),
    )
  if (positionsCount) {
    return {
      positions: aaveLikeDpmList.map(({ vaultId }) => ({ positionId: vaultId })),
    }
  }
  const aaveUniqueTokens = aaveLikeDpmList
    .filter(({ protocol }) => protocol === aaveLikeProtocolNames.aavev3)
    .reduce(uniqueTokensReducer, {} as Record<NetworkIds, string[]>)
  const sparkUniqueTokens = aaveLikeDpmList
    .filter(({ protocol }) => protocol === aaveLikeProtocolNames.sparkv3)
    .reduce(uniqueTokensReducer, {} as Record<NetworkIds, string[]>)
  const uniqueDpmNetworks = Array.from(new Set(aaveLikeDpmList.map(({ networkId }) => networkId)))
  const [allPositionsHistory, allPositionsAutomations, allOraclePrices] = await Promise.all([
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
    Promise.all(
      uniqueDpmNetworks.map((dpmsNetworkId) =>
        getAutomationData({
          addresses: aaveLikeDpmList
            .filter(({ networkId }) => networkId === dpmsNetworkId)
            .map(({ id }) => id),
          network: dpmsNetworkId,
        }),
      ),
    ).then((data) => data.flat()),
    Promise.all([
      ...uniqueDpmNetworks
        .map((networkId) =>
          getOraclePriceData({
            network: networkId,
            tokens: aaveUniqueTokens[networkId],
            protocol: LendingProtocol.AaveV3,
          }),
        )
        .flat(),
      ...uniqueDpmNetworks
        .map((networkId) =>
          getOraclePriceData({
            network: networkId,
            tokens: sparkUniqueTokens[networkId],
            protocol: LendingProtocol.SparkV3,
          }),
        )
        .flat(),
    ]).then((data) => data.flat()),
  ])

  const positions = await Promise.all(
    aaveLikeDpmList.map(async (dpm) => {
      const payload = {
        dpm,
        prices,
        allPositionsHistory,
        allPositionsAutomations,
        allOraclePrices,
        apiVaults,
        debug,
        raysUserMultipliers,
      }
      switch (dpm.positionType.toLowerCase()) {
        case OmniProductType.Multiply:
          return getAaveLikeMultiplyPosition(payload)
        case OmniProductType.Borrow:
          return getAaveLikeBorrowPosition(payload)
        case OmniProductType.Earn:
          return getAaveLikeEarnPosition(payload)
        default:
          throw new Error(`Unsupported position type ${dpm.positionType}`)
      }
    }),
  )

  return {
    positions,
  }
}
