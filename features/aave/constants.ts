import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { LendingProtocol } from 'lendingProtocols'

export const wstethRiskRatio = new RiskRatio(new BigNumber(9.99), RiskRatio.TYPE.MULITPLE)

export const aaveLikeProtocols = [
  LendingProtocol.AaveV2,
  LendingProtocol.AaveV3,
  LendingProtocol.SparkV3,
]

export const trailingStopLossDenomination = 10 ** 8
