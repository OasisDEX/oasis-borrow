import { WalletManagementState } from 'features/web3OnBoard/wallet-state/wallet-management-state'

export function ensureCorrectState<TType extends WalletManagementState['status']>(
  state: WalletManagementState,
  status: TType,
): asserts state is Extract<WalletManagementState, { status: TType }> {
  if (state.status !== status) {
    throw new Error(`Invalid state: expected "${status}", got "${state.status}"`)
  }
}
