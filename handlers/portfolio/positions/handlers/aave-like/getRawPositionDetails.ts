import { RiskRatio } from '@oasisdex/dma-library'
import { getChainInfoByChainId } from '@summer_fi/summerfi-sdk-common'
import BigNumber from 'bignumber.js'
import { NetworkIds, type NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import { getAaveLikePoolId, getAaveLikePositionId } from 'features/refinance/helpers'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { zero } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'

export function getRawPositionDetails(
  dpm: DpmSubgraphData,
  calculations: {
    collateral: BigNumber
    debt: BigNumber
    buyingPower: BigNumber
    netValue: BigNumber
    netValueInCollateralToken: BigNumber
    netValueInDebtToken: BigNumber
    totalExposure: BigNumber
    netBorrowCostPercentage: BigNumber
    collateralLiquidityRate: BigNumber
    debtVariableBorrowRate: BigNumber
  },
  liquidationPrice: string,
  primaryTokenPrice: BigNumber,
  secondaryTokenPrice: BigNumber,
  onChainPositionData: any,
  commonData: {
    positionId: string | number
    type: OmniProductType
    network: NetworkNames
    protocol: LendingProtocol
    primaryToken: string
    secondaryToken: string
    url: string
    automations: {
      autoBuy?: { enabled: boolean; price?: number | undefined } | undefined
      autoSell?: { enabled: boolean; price?: number | undefined } | undefined
      stopLoss?: { enabled: boolean; price?: number | undefined } | undefined
      takeProfit?: { enabled: boolean; price?: number | undefined } | undefined
    }
    availableToRefinance: boolean
  },
  lendingProtocol: LendingProtocol,
  prices: TokensPricesList,
) {
  const chainFamily = getChainInfoByChainId(dpm.networkId)
  if (!chainFamily) {
    throw new Error(`ChainId ${NetworkIds.MAINNET} is not supported`)
  }
  const collateral = calculations.collateral
  const debt = calculations.debt
  const collateralPrice = primaryTokenPrice.toString()
  const debtPrice = secondaryTokenPrice.toString()

  const riskRatio = new RiskRatio(
    Number(collateral) > 0
      ? new BigNumber(debt).times(debtPrice).div(new BigNumber(collateral).times(collateralPrice))
      : zero,
    RiskRatio.TYPE.LTV,
  )

  const borrowRate = calculations.debtVariableBorrowRate
  const maxRiskRatio = new RiskRatio(
    onChainPositionData.category.maxLoanToValue,
    RiskRatio.TYPE.LTV,
  )

  const collateralToken = mapTokenToSdkToken(chainFamily.chainInfo, commonData.primaryToken)
  const debtToken = mapTokenToSdkToken(chainFamily.chainInfo, commonData.secondaryToken)
  const emodeType = getEmode(collateralToken, debtToken, lendingProtocol)

  const poolId = getAaveLikePoolId(
    lendingProtocol,
    chainFamily.chainInfo,
    collateralToken,
    debtToken,
    emodeType,
  )
  const positionId = getAaveLikePositionId(lendingProtocol, dpm.vaultId)

  const rawPositionDetails: PortfolioPosition['rawPositionDetails'] = {
    collateralAmount: collateral.toString(),
    debtAmount: debt.toString(),
    collateralPrice,
    debtPrice,
    ethPrice: prices['ETH'].toString(),
    liquidationPrice: liquidationPrice,
    ltv: riskRatio.loanToValue.toString(),
    maxLtv: maxRiskRatio.loanToValue.toString(),
    borrowRate: borrowRate.toString(),
    positionId,
    poolId,
    pairId: 1, // TODO: investigate what used for,
    dpmAddress: dpm.id,
    ownerAddress: dpm.user,
  }
  return rawPositionDetails
}
