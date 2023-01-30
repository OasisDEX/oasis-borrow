import { BigNumber } from 'bignumber.js'

import { AaveV2ProtocolDataProvider } from '../../../types/web3-v1-contracts/aave-v2-protocol-data-provider'
import { amountFromWei } from '../../utils'
import { CallDef } from '../callsHelpers'

export interface AaveV2UserReserveDataParameters {
  token: string
  address: string
}

export interface AaveV2ReserveDataParameters {
  token: AaveV2UserReserveDataParameters['token']
}

export interface AaveV2UserReserveData {
  currentATokenBalance: BigNumber
  currentStableDebt: BigNumber
  currentVariableDebt: BigNumber
  principalStableDebt: BigNumber
  scaledVariableDebt: BigNumber
  stableBorrowRate: BigNumber
  liquidityRate: BigNumber
  usageAsCollateralEnabled: boolean
}

export type AaveV2ReserveDataReply = {
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

export const getAaveV2UserReserveData: CallDef<
  AaveV2UserReserveDataParameters,
  AaveV2UserReserveData
> = {
  call: (args, { contract, aaveV2ProtocolDataProvider }) => {
    return contract<AaveV2ProtocolDataProvider>(aaveV2ProtocolDataProvider).methods
      .getUserReserveData
  },
  prepareArgs: ({ token, address }, context) => {
    return [context.tokens[token].address, address]
  },
  postprocess: (result, args) => {
    return {
      currentATokenBalance: amountFromWei(
        new BigNumber(result.currentATokenBalance.toString()),
        args.token,
      ),
      currentStableDebt: amountFromWei(
        new BigNumber(result.currentStableDebt.toString()),
        args.token,
      ),
      currentVariableDebt: amountFromWei(
        new BigNumber(result.currentVariableDebt.toString()),
        args.token,
      ),
      principalStableDebt: amountFromWei(
        new BigNumber(result.principalStableDebt.toString()),
        args.token,
      ),
      scaledVariableDebt: amountFromWei(
        new BigNumber(result.scaledVariableDebt.toString()),
        args.token,
      ),
      stableBorrowRate: new BigNumber(result.stableBorrowRate.toString()),
      liquidityRate: new BigNumber(result.liquidityRate.toString()),
      usageAsCollateralEnabled: result.usageAsCollateralEnabled,
    }
  },
}

export const getAaveV2ReserveData: CallDef<AaveV2ReserveDataParameters, AaveV2ReserveDataReply> = {
  call: (_, { contract, aaveV2ProtocolDataProvider }) =>
    contract<AaveV2ProtocolDataProvider>(aaveV2ProtocolDataProvider).methods.getReserveData,
  prepareArgs: ({ token }, context) => [context.tokens[token].address],
}

export type AaveV2ReserveConfigurationData = {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
  // .... could add more things here.  see https://etherscan.io/address/0x057835ad21a177dbdd3090bb1cae03eacf78fc6d#readContract
}

export const getAaveV2ReserveConfigurationData: CallDef<
  { token: string },
  AaveV2ReserveConfigurationData
> = {
  call: (args, { contract, aaveV2ProtocolDataProvider }) => {
    return contract<AaveV2ProtocolDataProvider>(aaveV2ProtocolDataProvider).methods
      .getReserveConfigurationData
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return {
      ltv: new BigNumber(result.ltv).div(10000), // 6900 -> 0.69
      liquidationThreshold: new BigNumber(result.liquidationThreshold).div(10000), // 8100 -> 0.81
      liquidationBonus: new BigNumber(result.liquidationBonus).minus(10000).div(10000), // 10750 -> 750 -> -> 0.075
    }
  },
}
