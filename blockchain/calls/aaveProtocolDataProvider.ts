import { BigNumber } from 'bignumber.js'

import { AaveProtocolDataProvider } from '../../types/web3-v1-contracts/aave-protocol-data-provider'
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

export type AaveReserveConfigurationData = {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  // .... could add more things here.  see https://etherscan.io/address/0x057835ad21a177dbdd3090bb1cae03eacf78fc6d#readContract
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

export const getAaveReserveConfigurationData: CallDef<
  { token: string },
  AaveReserveConfigurationData
> = {
  call: (args, { contract, aaveProtocolDataProvider }) => {
    return contract<AaveProtocolDataProvider>(aaveProtocolDataProvider).methods
      .getReserveConfigurationData
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return {
      ltv: new BigNumber(result.ltv).div(10000), // 6900 -> 0.69
      liquidationThreshold: new BigNumber(result.liquidationThreshold).div(10000), // 8100 -> 0.81
    }
  },
}
