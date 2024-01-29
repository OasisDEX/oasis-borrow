import { getOnChainPosition } from 'actions/aave-like'
import { getAaveV2ReserveData } from 'blockchain/aave'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import dayjs from 'dayjs'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { GraphQLClient } from 'graphql-request'
import { notAvailable } from 'handlers/portfolio/constants'
import { commonDataMapper } from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { isZeroAddress } from 'helpers/isZeroAddress'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveStEthYield } from 'lendingProtocols/aave-v2/calculations/stEthYield'
import { DsProxyRegistry__factory } from 'types/ethers-contracts'
const DsProxyFactory = DsProxyRegistry__factory

export const getAaveV2DsProxyPosition: PortfolioPositionsHandler = async ({ address, prices }) => {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const contracts = getNetworkContracts(NetworkIds.MAINNET)

  const DsProxyContract = DsProxyFactory.connect(contracts.dsProxyRegistry.address, rpcProvider)

  const dsProxyAddress = await DsProxyContract.proxies(address)
  if (!dsProxyAddress || isZeroAddress(dsProxyAddress)) {
    return {
      positions: [],
    }
  }
  const allPositionsHistory = await getHistoryData({
    network: NetworkIds.MAINNET,
    addresses: [dsProxyAddress],
  })
  const positionHistory = allPositionsHistory.filter(
    (position) => position.id.toLowerCase() === dsProxyAddress.toLowerCase(),
  )[0]

  const stEthPosition = await getOnChainPosition({
    networkId: NetworkIds.MAINNET,
    proxyAddress: dsProxyAddress,
    protocol: LendingProtocol.AaveV2,
    debtToken: 'ETH',
    collateralToken: 'STETH',
  })
  if (!positionHistory || !stEthPosition) {
    console.warn(
      `summer/portfolio: No AAVE v2 position history or no stEth position for ${address}, proxy:${dsProxyAddress}}`,
    )
    return {
      positions: [],
    }
  }
  if (stEthPosition.collateral.amount.gt(zero)) {
    const { commonData, primaryTokenPrice, secondaryTokenPrice } = commonDataMapper({
      dpm: {
        collateralToken: contracts.tokens.STETH.address,
        debtToken: contracts.tokens.ETH.address,
        id: dsProxyAddress,
        networkId: NetworkIds.MAINNET,
        protocol: 'AAVE', // this means Aave V2
        positionType: OmniProductType.Earn,
        user: address,
        vaultId: address,
        createEvents: [
          {
            collateralToken: contracts.tokens.STETH.address,
            debtToken: contracts.tokens.ETH.address,
            positionType: OmniProductType.Earn,
            protocol: 'AAVE',
          },
        ],
      },
      positionIdAsString: true,
      prices,
    })
    const [primaryTokenReserveData, secondaryTokenReserveData, yields] = await Promise.all([
      getAaveV2ReserveData({ token: commonData.primaryToken }),
      getAaveV2ReserveData({ token: commonData.secondaryToken }),
      getAaveStEthYield(new GraphQLClient(contracts.cacheApi), dayjs(), stEthPosition.riskRatio, [
        '7Days',
      ]),
    ])
    const calculations = calculateViewValuesForPosition(
      stEthPosition,
      primaryTokenPrice,
      secondaryTokenPrice,
      primaryTokenReserveData.liquidityRate,
      secondaryTokenReserveData.variableBorrowRate,
    )
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
    })
    return {
      positions: [
        {
          ...commonData,
          lendingType: stEthPosition.debt.amount.gt(zero) ? 'loop' : 'passive',
          details: [
            {
              type: 'netValue',
              value: formatUsdValue(netValuePnlModalData.netValue.inUsd),
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
              value: yields.annualisedYield7days
                ? formatDecimalAsPercent(yields.annualisedYield7days.div(100))
                : notAvailable,
            },
            {
              type: 'ltv',
              value: formatDecimalAsPercent(stEthPosition.riskRatio.loanToValue),
              subvalue: `Max ${formatDecimalAsPercent(stEthPosition.category.maxLoanToValue)}`,
            },
          ],
          netValue: calculations.netValue.toNumber(),
        },
      ],
    }
  }
  return {
    positions: [],
  }
}
