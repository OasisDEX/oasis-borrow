import { calculatePNL } from '../../../../../helpers/multiply/calculations'
import { zero } from '../../../../../helpers/zero'
import { ManageMultiplyVaultState } from '../../../../multiply/manage/pipes/manageMultiplyVault'
import { GuniTxData } from './manageGuniVault'

// this method extends / overwrites  applyManageVaultCalculations
export function applyGuniCalculations(state: ManageMultiplyVaultState & GuniTxData) {
  const {
    vault: { lockedCollateralUSD, debt },
    sharedAmount0,
    sharedAmount1,
    minToTokenAmount,
    vaultHistory,
  } = state

  const netValueUSD = lockedCollateralUSD.minus(debt)
  const currentPnL = calculatePNL(vaultHistory, netValueUSD)

  return {
    ...state,
    netValueUSD,
    collateralDeltaUSD: sharedAmount1,
    oazoFee: zero,
    loanFee: zero,
    fees: zero,
    currentPnL,
    afterCloseToDai:
      sharedAmount0 && minToTokenAmount ? sharedAmount0.plus(minToTokenAmount).minus(debt) : zero,
  }
}
