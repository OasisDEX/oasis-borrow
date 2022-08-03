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
  isAllowanceNeeded: boolean
}

export function getOpenAaveParameters(
  amount: BigNumber,
  multiply: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  token: string = 'ETH',
): Promise<OpenPositionResult> {
  throw new Error('Not implemented')
}
