import type BigNumber from 'bignumber.js'

export interface AaveStopLossDataInput {
  collateralToken: string
  debtToken: string
  positionRatio: BigNumber
  liquidationPrice: BigNumber
  debt: BigNumber
  lockedCollateral: BigNumber
  proxyAddress?: string
  liquidationPenalty: BigNumber
  liquidationRatio: BigNumber
  debtTokenAddress: string
  collateralTokenAddress: string
  stopLossLevel: BigNumber
  collateralActive: boolean
}
