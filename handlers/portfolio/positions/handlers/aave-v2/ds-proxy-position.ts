import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import { getAaveV2ReserveData } from 'blockchain/aave'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import {
  commonDataMapper,
  getFilteredAaveLikePortfolioPositionHistory,
} from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import { getHistoryData } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { isZeroAddress } from 'helpers/isZeroAddress'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
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

  const positionHistory = getFilteredAaveLikePortfolioPositionHistory({
    history: allPositionsHistory,
    protocol: LendingProtocol.AaveV2,
    proxy: dsProxyAddress,
  })

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

    const stethTokenAddress = contracts.tokens['STETH'].address
    const ethTokenAddress = contracts.tokens['WETH'].address

    const [primaryTokenReserveData, secondaryTokenReserveData, yields] = await Promise.all([
      getAaveV2ReserveData({ token: commonData.primaryToken }),
      getAaveV2ReserveData({ token: commonData.secondaryToken }),
      getYieldsRequest(
        {
          ltv: stEthPosition.riskRatio.loanToValue,
          protocol: LendingProtocol.AaveV2,
          networkId: NetworkIds.MAINNET,
          collateralTokenAddress: stethTokenAddress,
          quoteTokenAddress: ethTokenAddress,
        },
        process.env.FUNCTIONS_API_URL,
      ),
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
          url: `/${commonData.network.toLowerCase()}/old/aave/v2/${address}`,
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
              value: yields?.results?.apy7d
                ? formatDecimalAsPercent(new BigNumber(yields.results.apy7d).div(100))
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
