import BigNumber from 'bignumber.js'

export interface ActionCall {
  targetHash: string
  callData: string
}

export interface PositionInfo {
  flashloanAmount: BigNumber
  borrowedAmount: BigNumber
  fee: BigNumber
  depositedAmount: BigNumber
}

export interface OpenPositionResult {
  calls: ActionCall[]
  operationName: string
  positionInfo: PositionInfo
}

export function getOpenAaveParameters(amount: BigNumber, maxMultiply: number, token: string = 'ETH'): Promise<OpenPositionResult> {
  throw new Error('Not implemented')
}
