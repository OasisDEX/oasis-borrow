import { RiskRatio } from '@oasisdex/dma-library'
import {
  getChainInfoByChainId,
  type ILendingPoolId,
  type ILendingPositionId,
} from '@summer_fi/summerfi-sdk-common'
import BigNumber from 'bignumber.js'
import { getMorphoPositionId } from 'features/refinance/helpers'
import { getMorphoPoolId } from 'features/refinance/helpers/getMorphoPoolId'
import { type TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { zero } from 'helpers/zero'

export function getRawPositionDetails(
  networkId: number,
  vaultId: string,
  marketId: string,
  pairId: number,
  collateralAmount: BigNumber,
  debtAmount: BigNumber,
  liquidationPrice: string,
  primaryTokenPrice: BigNumber,
  secondaryTokenPrice: BigNumber,
  maxRiskRatio: RiskRatio,
  rate: string,
  prices: TokensPricesList,
  proxyAddress: string,
  ownerAddress: string,
) {
  const chainInfo = getChainInfoByChainId(networkId)
  if (!chainInfo) {
    throw new Error(`chainInfo with networkId ${networkId} is not supported`)
  }

  const collateralPrice = primaryTokenPrice.toString()
  const debtPrice = secondaryTokenPrice.toString()

  const riskRatio = new RiskRatio(
    Number(collateralAmount) > 0
      ? new BigNumber(debtAmount)
          .times(debtPrice)
          .div(new BigNumber(collateralAmount).times(collateralPrice))
      : zero,
    RiskRatio.TYPE.LTV,
  )

  const borrowRate = rate

  const poolId = getMorphoPoolId(chainInfo, marketId) as unknown as ILendingPoolId
  const positionId = getMorphoPositionId(vaultId) as unknown as ILendingPositionId

  const rawPositionDetails: PortfolioPosition['rawPositionDetails'] = {
    collateralAmount: collateralAmount.toString(),
    debtAmount: debtAmount.toString(),
    collateralPrice,
    debtPrice,
    ethPrice: prices['ETH'].toString(),
    liquidationPrice: liquidationPrice,
    ltv: riskRatio.loanToValue.toString(),
    maxLtv: maxRiskRatio.loanToValue.toString(),
    borrowRate: borrowRate.toString(),
    positionId,
    poolId,
    pairId,
    dpmAddress: proxyAddress,
    ownerAddress,
  }
  return rawPositionDetails
}
