import { BigNumber } from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { amountFromWei } from 'blockchain/utils'
import { AaveV3PoolDataProvider } from 'types/web3-v1-contracts/aave-v3-pool-data-provider'

export interface AaveV3UserReserveDataParameters {
  token: string
  address: string
}

export interface AaveV3ReserveDataParameters {
  token: AaveV3UserReserveDataParameters['token']
}

export interface AaveV3UserReserveData {
  currentATokenBalance: BigNumber
  currentStableDebt: BigNumber
  currentVariableDebt: BigNumber
  principalStableDebt: BigNumber
  scaledVariableDebt: BigNumber
  stableBorrowRate: BigNumber
  liquidityRate: BigNumber
  usageAsCollateralEnabled: boolean
}

export type AaveV3ReserveDataReply = {
  availableLiquidity: BigNumber
  unbacked: BigNumber
  accruedToTreasuryScaled: BigNumber
  totalAToken: BigNumber
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

export const getAaveV3UserReserveData: CallDef<
  AaveV3UserReserveDataParameters,
  AaveV3UserReserveData
> = {
  call: (args, { contract, aaveV3PoolDataProvider }) => {
    return contract<AaveV3PoolDataProvider>(aaveV3PoolDataProvider).methods.getUserReserveData
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

export const getAaveV3ReserveData: CallDef<AaveV3ReserveDataParameters, AaveV3ReserveDataReply> = {
  call: (_, { contract, aaveV3PoolDataProvider }) =>
    contract<AaveV3PoolDataProvider>(aaveV3PoolDataProvider).methods.getReserveData,
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return {
      availableLiquidity: new BigNumber(result.totalAToken.toString()).minus(
        new BigNumber(result.totalStableDebt.toString()).plus(
          new BigNumber(result.totalVariableDebt.toString()),
        ),
      ),
      unbacked: new BigNumber(result.unbacked.toString()),
      accruedToTreasuryScaled: new BigNumber(result.accruedToTreasuryScaled.toString()),
      totalAToken: new BigNumber(result.totalAToken.toString()),
      totalStableDebt: new BigNumber(result.totalStableDebt.toString()),
      totalVariableDebt: new BigNumber(result.totalVariableDebt.toString()),
      liquidityRate: new BigNumber(result.liquidityRate.toString()),
      variableBorrowRate: new BigNumber(result.variableBorrowRate.toString()),
      stableBorrowRate: new BigNumber(result.stableBorrowRate.toString()),
      averageStableBorrowRate: new BigNumber(result.averageStableBorrowRate.toString()),
      liquidityIndex: new BigNumber(result.liquidityIndex.toString()),
      variableBorrowIndex: new BigNumber(result.variableBorrowIndex.toString()),
      lastUpdateTimestamp: new BigNumber(result.lastUpdateTimestamp.toString()),
    }
  },
}

export type AaveV3ReserveConfigurationData = {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
  // .... could add more things here.  see https://etherscan.io/address/0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3#readContract
}

export const getAaveV3ReserveConfigurationData: CallDef<
  { token: string },
  AaveV3ReserveConfigurationData
> = {
  call: (args, { contract, aaveV3PoolDataProvider }) => {
    return contract<AaveV3PoolDataProvider>(aaveV3PoolDataProvider).methods
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

export const getAaveV3EModeCategoryForAsset: CallDef<{ token: string }, BigNumber> = {
  call: (args, { contract, aaveV3PoolDataProvider }) => {
    return contract<AaveV3PoolDataProvider>(aaveV3PoolDataProvider).methods.getReserveEModeCategory
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return new BigNumber(result)
  },
}
