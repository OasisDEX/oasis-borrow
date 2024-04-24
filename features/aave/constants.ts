import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { LendingProtocol } from 'lendingProtocols'

export const aaveLikeEmodeRiskRatio = new RiskRatio(new BigNumber(9.99), RiskRatio.TYPE.MULITPLE)

export const aaveLikeProtocols = [
  LendingProtocol.AaveV2,
  LendingProtocol.AaveV3,
  LendingProtocol.SparkV3,
]

/**
 * Denomination for price values
 * 10 ** 8
 */
export const lambdaPriceDenomination = 10 ** 8
/**
 * Denomination for percentage values
 * 10 ** 2
 */
export const lambdaPercentageDenomination = 10 ** 2
