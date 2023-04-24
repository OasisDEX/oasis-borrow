import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { amountFromWei } from 'blockchain/utils'
import { AaveV2LendingPool } from 'types/web3-v1-contracts'

export interface AaveV2UserAccountData {
  totalCollateralETH: BigNumber
  totalDebtETH: BigNumber
  availableBorrowsETH: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

export interface AaveV2UserAccountDataParameters {
  address: string
}

export type AaveV2UserConfigurationsParameters = {
  address: string
}
export type AaveV2ConfigurationData = string[]

export const getAaveV2UserAccountData: CallDef<
  AaveV2UserAccountDataParameters,
  AaveV2UserAccountData
> = {
  call: (args, { contract, chainId }) => {
    return contract<AaveV2LendingPool>(getNetworkContracts(chainId).aaveV2LendingPool).methods
      .getUserAccountData
  },
  prepareArgs: ({ address }) => {
    return [address]
  },
  postprocess: (result) => {
    return {
      totalCollateralETH: amountFromWei(new BigNumber(result.totalCollateralETH.toString()), 'ETH'),
      totalDebtETH: amountFromWei(new BigNumber(result.totalDebtETH.toString()), 'ETH'),
      availableBorrowsETH: amountFromWei(
        new BigNumber(result.availableBorrowsETH.toString()),
        'ETH',
      ),
      currentLiquidationThreshold: new BigNumber(result.currentLiquidationThreshold.toString()),
      ltv: new BigNumber(result.ltv.toString()),
      healthFactor: new BigNumber(result.healthFactor.toString()),
    }
  },
}

export const getAaveV2UserConfiguration: CallDef<
  AaveV2UserConfigurationsParameters,
  AaveV2ConfigurationData
> = {
  call: (args, { contract, chainId }) => {
    return contract<AaveV2LendingPool>(getNetworkContracts(chainId).aaveV2LendingPool).methods
      .getUserConfiguration
  },
  prepareArgs: ({ address }) => {
    return [address]
  },
}

export const getAaveV2ReservesList: CallDef<void, AaveV2ConfigurationData> = {
  call: (args, { contract, chainId }) => {
    return contract<AaveV2LendingPool>(getNetworkContracts(chainId).aaveV2LendingPool).methods
      .getReservesList
  },
  prepareArgs: () => {
    return []
  },
}
