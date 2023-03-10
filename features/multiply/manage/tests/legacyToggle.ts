import {
  ManageMultiplyVaultEditingStage,
  ManageMultiplyVaultState,
} from '../pipes/manageMultiplyVault'

/*
  The toggle function in multiply vaults used to
  toggle between adjustPosition and otherActions stages.

  Now with the third tab (borrow), you need to explicitly
  tell which stage to jump to.

  This function mimics the previous behaviour in order
  to maintain the logic of the tests in this folder.

  TODO: We need to change the "toggle" name, because
  that's not what it's doing anymore.
*/
export function legacyToggle(state: ManageMultiplyVaultState) {
  const stages: ManageMultiplyVaultEditingStage[] = ['adjustPosition', 'otherActions']
  const targetStage = stages.find((stage) => stage !== state.stage)
  state.toggle!(targetStage!)
}
