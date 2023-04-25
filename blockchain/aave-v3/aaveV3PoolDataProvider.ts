import { BigNumber } from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { amountFromRay, amountFromWei } from 'blockchain/utils'
import { AaveV3PoolDataProvider } from 'types/web3-v1-contracts'

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
  call: (args, { contract, chainId }) => {
    return contract<AaveV3PoolDataProvider>(getNetworkContracts(chainId).aaveV3PoolDataProvider)
      .methods.getUserReserveData
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

export const getAaveV3ReserveData: CallDef<AaveV3ReserveDataParameters, AaveV3ReserveDataReply> = {
  call: (_, { contract, chainId }) =>
    contract<AaveV3PoolDataProvider>(getNetworkContracts(chainId).aaveV3PoolDataProvider).methods
      .getReserveData,
  prepareArgs: ({ token }, { chainId }) => {
    return [getNetworkContracts(chainId).tokens[token].address]
  },
  postprocess: (result, { token }) => {
    return {
      availableLiquidity: new BigNumber(result.totalAToken.toString()).minus(
        new BigNumber(result.totalStableDebt.toString()).plus(
          new BigNumber(result.totalVariableDebt.toString()),
        ),
      ),
      unbacked: new BigNumber(result.unbacked.toString()),
      accruedToTreasuryScaled: new BigNumber(result.accruedToTreasuryScaled.toString()),

      totalAToken: amountFromWei(new BigNumber(result.totalAToken.toString()), token),
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
  call: (args, { contract, chainId }) => {
    return contract<AaveV3PoolDataProvider>(getNetworkContracts(chainId).aaveV3PoolDataProvider)
      .methods.getReserveConfigurationData
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

export const getAaveV3EModeCategoryForAsset: CallDef<{ token: string }, BigNumber> = {
  call: (args, { contract, chainId }) => {
    return contract<AaveV3PoolDataProvider>(getNetworkContracts(chainId).aaveV3PoolDataProvider)
      .methods.getReserveEModeCategory
  },
  prepareArgs: ({ token }, { chainId }) => {
    return [getNetworkContracts(chainId).tokens[token].address]
  },
  postprocess: (result) => {
    return new BigNumber(result)
  },
}
