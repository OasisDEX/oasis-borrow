import BigNumber from 'bignumber.js'

import { AaveLendingPool } from '../../../types/web3-v1-contracts/aave-lending-pool'
import { amountFromWei } from '../../utils'
import { CallDef } from '../callsHelpers'

export interface AaveUserAccountData {
  totalCollateralETH: BigNumber
  totalDebtETH: BigNumber
  availableBorrowsETH: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

export interface AaveUserAccountDataParameters {
  proxyAddress: string
}

export const getAaveUserAccountData: CallDef<AaveUserAccountDataParameters, AaveUserAccountData> = {
  call: (args, { contract, aaveLendingPool }) => {
    return contract<AaveLendingPool>(aaveLendingPool).methods.getUserAccountData
  },
  prepareArgs: ({ proxyAddress }) => {
    return [proxyAddress]
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
