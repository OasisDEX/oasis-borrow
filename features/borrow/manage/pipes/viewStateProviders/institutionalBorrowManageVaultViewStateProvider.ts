import BigNumber from 'bignumber.js'
import { InstiVault } from 'blockchain/instiVault'

import { ManageInstiVaultState, ManageStandardBorrowVaultState } from '../manageVault'
import {
  BorrowManageVaultViewStateProviderInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageVaultViewStateProviderInterface'
import { StandardBorrowManageVaultViewStateProvider } from './standardBorrowManageVaultViewStateProvider'

export const InstitutionalBorrowManageVaultViewStateProvider: BorrowManageVaultViewStateProviderInterface<
  InstiVault,
  ManageInstiVaultState
> = {
  addTxnCost(viewState: ManageInstiVaultState): ManageInstiVaultState {
    // for origination fee, assume if generate amount not set we are generating 0 DAI
    const generateAmount = viewState.generateAmount || new BigNumber(0)

    const originationFeeUSD = generateAmount.times(
      viewState.vault.originationFeePercent.dividedBy(100),
    )

    const transactionFeeUsd = originationFeeUSD?.plus(viewState.gasEstimationUsd!)

    const transactionFeeETH = transactionFeeUsd?.div(viewState.priceInfo.currentEthPrice!)

    return {
      ...viewState,
      originationFeeUSD,
      transactionFeeETH,
    }
  },
  createInitialVaultState(args: CreateInitialVaultStateArgs<InstiVault>): ManageInstiVaultState {
    const mananageStandardVaultViewState: ManageStandardBorrowVaultState = {
      ...StandardBorrowManageVaultViewStateProvider.createInitialVaultState(args),
      vault: args.vault,
    }
    return {
      ...mananageStandardVaultViewState,
      vault: args.vault,
      originationFeeUSD: undefined,
    }
  },
}
