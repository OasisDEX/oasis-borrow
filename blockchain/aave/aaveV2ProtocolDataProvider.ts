import { BigNumber } from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { amountFromRay, amountFromWei } from 'blockchain/utils'
import { AaveV2ProtocolDataProvider } from 'types/web3-v1-contracts'

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
  availableLiquidity: BigNumber
  totalStableDebt: BigNumber
  totalVariableDebt: BigNumber
  liquidityRate: BigNumber
  variableBorrowRate: BigNumber
  stableBorrowRate: BigNumber
  averageStableBorrowRate: BigNumber
  liquidityIndex: BigNumber
  variableBorrowIndex: BigNumber
  lastUpdateTimestamp: BigNumber
}

export const getAaveV2UserReserveData: CallDef<
  AaveV2UserReserveDataParameters,
  AaveV2UserReserveData
> = {
  call: (args, { contract, chainId }) => {
    return contract<AaveV2ProtocolDataProvider>(
      getNetworkContracts(chainId).aaveV2ProtocolDataProvider,
    ).methods.getUserReserveData
  },
  prepareArgs: ({ token, address }, { chainId }) => {
    return [getNetworkContracts(chainId).tokens[token].address, address]
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
  call: (_, { contract, chainId }) =>
    contract<AaveV2ProtocolDataProvider>(getNetworkContracts(chainId).aaveV2ProtocolDataProvider)
      .methods.getReserveData,
  prepareArgs: ({ token }, { chainId }) => [getNetworkContracts(chainId).tokens[token].address],
  postprocess: (result, { token }) => {
    return {
      availableLiquidity: amountFromWei(new BigNumber(result.availableLiquidity), token),
      totalStableDebt: amountFromWei(new BigNumber(result.totalStableDebt.toString()), token),
      totalVariableDebt: amountFromWei(new BigNumber(result.totalVariableDebt.toString()), token),
      liquidityRate: amountFromRay(new BigNumber(result.liquidityRate.toString())),
      variableBorrowRate: amountFromRay(new BigNumber(result.variableBorrowRate.toString())),
      stableBorrowRate: amountFromRay(new BigNumber(result.stableBorrowRate.toString())),
      averageStableBorrowRate: amountFromRay(
        new BigNumber(result.averageStableBorrowRate.toString()),
      ),
      liquidityIndex: new BigNumber(result.liquidityIndex.toString()),
      variableBorrowIndex: new BigNumber(result.variableBorrowIndex.toString()),
      lastUpdateTimestamp: new BigNumber(result.lastUpdateTimestamp.toString()),
    }
  },
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
  call: (args, { contract, chainId }) => {
    return contract<AaveV2ProtocolDataProvider>(
      getNetworkContracts(chainId).aaveV2ProtocolDataProvider,
    ).methods.getReserveConfigurationData
  },
  prepareArgs: ({ token }, { chainId }) => {
    return [getNetworkContracts(chainId).tokens[token].address]
  },
  postprocess: (result) => {
    return {
      ltv: new BigNumber(result.ltv).div(10000), // 6900 -> 0.69
      liquidationThreshold: new BigNumber(result.liquidationThreshold).div(10000), // 8100 -> 0.81
      liquidationBonus: new BigNumber(result.liquidationBonus).minus(10000).div(10000), // 10750 -> 750 -> -> 0.075
    }
  },
}
