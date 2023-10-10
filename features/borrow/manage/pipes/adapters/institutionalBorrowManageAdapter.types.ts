import type BigNumber from 'bignumber.js'
import type { InstiVault } from 'blockchain/instiVault.types'
import type { GenericManageBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'

export type ManageInstiVaultState = GenericManageBorrowVaultState<InstiVault> & {
  transactionFeeETH?: BigNumber
  originationFeeUSD?: BigNumber
  vaultWillBeTakenUnderMinActiveColRatio?: boolean
  vaultIsCurrentlyUnderMinActiveColRatio?: boolean
  vaultWillRemainUnderMinActiveColRatio?: boolean
  afterActiveCollRatioPriceUSD?: BigNumber
}
export type RiskArgs = {
  inputAmountsEmpty: boolean
  afterCollateralizationRatioAtNextPrice: BigNumber
  afterCollateralizationRatio: BigNumber
  vault: {
    collateralizationRatioAtNextPrice: BigNumber
    collateralizationRatio: BigNumber
  }
}
