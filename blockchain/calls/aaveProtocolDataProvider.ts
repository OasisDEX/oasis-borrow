import { AaveProtocolDataProvider } from 'types/web3-v1-contracts/aave-protocol-data-provider'

import { CallDef } from './callsHelpers'

export interface AaveUserReserveDataParameters {
  token: string
  proxyAddress: string
}
export interface AaveReserveDataParameters {
  token: AaveUserReserveDataParameters['token']
}

export interface AaveUserReserveData {
  currentATokenBalance: string
}

export type AaveReserveDataReply = {
  availableLiquidity: string
  totalStableDebt: string
  totalVariableDebt: string
  liquidityRate: string
  variableBorrowRate: string
  stableBorrowRate: string
  averageStableBorrowRate: string
  liquidityIndex: string
  variableBorrowIndex: string
  lastUpdateTimestamp: string
}

export const getAaveUserReserveData: CallDef<AaveUserReserveDataParameters, AaveUserReserveData> = {
  call: (args, { contract, aaveProtocolDataProvider }) => {
    return contract<AaveProtocolDataProvider>(aaveProtocolDataProvider).methods.getUserReserveData
  },
  prepareArgs: ({ token, proxyAddress }, context) => {
    return [context.tokens[token].address, proxyAddress]
  },
}

export const getAaveReserveData: CallDef<AaveReserveDataParameters, AaveReserveDataReply> = {
  call: (_, { contract, aaveProtocolDataProvider }) =>
    contract<AaveProtocolDataProvider>(aaveProtocolDataProvider).methods.getReserveData,
  prepareArgs: ({ token }, context) => [context.tokens[token].address],
}
