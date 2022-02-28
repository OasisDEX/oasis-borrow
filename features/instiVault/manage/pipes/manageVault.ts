import { BigNumber } from 'bignumber.js'
import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'

type InstiVaultViewState = {
  originationFee: BigNumber
  originationFeeUSD: BigNumber
  activeCollRatio: BigNumber
  activeCollRatioPriceUSD: BigNumber
  debtCeiling: BigNumber
  termEnd: Date
  fixedFee: BigNumber
  nextFixedFee: BigNumber
}

export type ManageInstiVaultState = ManageVaultState & InstiVaultViewState
