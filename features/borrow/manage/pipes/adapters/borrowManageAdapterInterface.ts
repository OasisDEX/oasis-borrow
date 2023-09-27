import type { BigNumber } from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks.types'
import type { Context } from 'blockchain/network.types'
import type { Vault } from 'blockchain/vaults.types'
import type {
  ManageVaultChange,
  MutableManageVaultState,
} from 'features/borrow/manage/pipes/manageVault.types'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'

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
