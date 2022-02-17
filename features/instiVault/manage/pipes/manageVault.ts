import { BigNumber } from "bignumber.js"
import { ManageVaultState } from "features/borrow/manage/pipes/manageVault"

type InstiVault = {
  originationFee: BigNumber,
  activeCollRatio: BigNumber,
  activeCollRatioPriceUSD: BigNumber,
  debtCeiling: BigNumber,
  termEnd: Date,
  fixedFee: BigNumber,
  nextFixedFee: BigNumber
}

export type ManageInstiVaultState = ManageVaultState & InstiVault