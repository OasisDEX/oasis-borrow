import type { BigNumber } from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks'
import type { Context } from 'blockchain/network'
import type { Vault } from 'blockchain/vaults.types'
import type {
  ManageVaultChange,
  MutableManageVaultState,
} from 'features/borrow/manage/pipes/manageVault'
import type { BalanceInfo } from 'features/shared/balanceInfo'
import type { PriceInfo } from 'features/shared/priceInfo'

export type CreateInitialVaultStateArgs<V extends Vault> = {
  vault: V
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  account?: string
  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  context: Context
  initialTotalSteps: number
  change: (ch: ManageVaultChange) => void
  injectStateOverride: (stateToOverride: Partial<MutableManageVaultState>) => void
}

export interface BorrowManageAdapterInterface<V extends Vault, ViewState> {
  createInitialViewState(args: CreateInitialVaultStateArgs<V>): ViewState
  transformViewState(viewState: ViewState, change: ManageVaultChange): ViewState
  addTxnCost(viewState: ViewState): ViewState
  addErrorsAndWarnings(viewState: ViewState): ViewState
}
