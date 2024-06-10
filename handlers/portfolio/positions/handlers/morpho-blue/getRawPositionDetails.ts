import { RiskRatio } from '@oasisdex/dma-library'
import { getChainInfoByChainId } from '@summer_fi/summerfi-sdk-common'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
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
) {
  const chainFamily = getChainInfoByChainId(networkId)
  if (!chainFamily) {
    throw new Error(`ChainId ${NetworkIds.MAINNET} is not supported`)
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

  const poolId = getMorphoPoolId(chainFamily.chainInfo, marketId)
  const positionId = getMorphoPositionId(vaultId)

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
  }
  return rawPositionDetails
}
