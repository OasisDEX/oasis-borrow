import BigNumber from 'bignumber.js'

import { AaveV3Pool } from '../../../types/web3-v1-contracts/aave-v3-pool'
import { amountFromWei } from '../../utils'
import { CallDef } from '../callsHelpers'

export interface AaveV3UserAccountData {
  totalCollateralBase: BigNumber
  totalDebtBase: BigNumber
  availableBorrowsBase: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

export interface AaveV3UserAccountDataParameters {
  address: string
}

export type AaveV3UserConfigurationsParameters = {
  address: string
}
export type AaveV3ConfigurationData = string[]

export const getAaveV3UserAccountData: CallDef<
  AaveV3UserAccountDataParameters,
  AaveV3UserAccountData
> = {
  call: (args, { contract, aaveV3Pool }) => {
    return contract<AaveV3Pool>(aaveV3Pool).methods.getUserAccountData
  },
  prepareArgs: ({ address }) => {
    return [address]
  },
  postprocess: (result) => {
    return {
      totalCollateralBase: amountFromWei(
        new BigNumber(result.totalCollateralBase.toString()),
        'ETH',
      ),
      totalDebtBase: amountFromWei(new BigNumber(result.totalDebtBase.toString()), 'ETH'),
      availableBorrowsBase: amountFromWei(
        new BigNumber(result.availableBorrowsBase.toString()),
        'ETH',
      ),
      currentLiquidationThreshold: new BigNumber(result.currentLiquidationThreshold.toString()),
      ltv: new BigNumber(result.ltv.toString()),
      healthFactor: new BigNumber(result.healthFactor.toString()),
    }
  },
}

export const getAaveV3UserConfiguration: CallDef<
  AaveV3UserConfigurationsParameters,
  AaveV3ConfigurationData
> = {
  call: (args, { contract, aaveV3Pool }) => {
    return contract<AaveV3Pool>(aaveV3Pool).methods.getUserConfiguration
  },
  prepareArgs: ({ address }) => {
    return [address]
  },
}

export const getAaveV3ReservesList: CallDef<void, AaveV3ConfigurationData> = {
  call: (args, { contract, aaveV3Pool }) => {
    return contract<AaveV3Pool>(aaveV3Pool).methods.getReservesList
  },
  prepareArgs: () => {
    return []
  },
}
