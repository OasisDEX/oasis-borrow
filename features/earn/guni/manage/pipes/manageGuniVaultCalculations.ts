import BigNumber from 'bignumber.js'

import {
  calculateGrossEarnings,
  calculateNetEarnings,
  calculatePNL,
} from '../../../../../helpers/multiply/calculations'
import { zero } from '../../../../../helpers/zero'
import { GuniTxData, ManageEarnVaultState } from './manageGuniVault'

// this method extends / overwrites  applyManageVaultCalculations
export function applyGuniCalculations(state: ManageEarnVaultState & GuniTxData) {
  const {
    vault: { lockedCollateralUSD, debt },
    sharedAmount0,
    sharedAmount1,
    minToTokenAmount,
    vaultHistory,
  } = state

  const netValueUSD = lockedCollateralUSD.minus(debt)
  const currentPnL = calculatePNL(vaultHistory, netValueUSD)

  const grossEarnings = calculateGrossEarnings(vaultHistory, netValueUSD)
  const netEarnings = calculateNetEarnings(vaultHistory, netValueUSD)

  const netAPY = state.yields['0']?.value

  return {
    ...state,
    netValueUSD,
    collateralDeltaUSD: sharedAmount1,
    oazoFee: zero,
    loanFee: zero,
    fees: zero,
    currentPnL,
    earningsToDate: grossEarnings,
    earningsToDateAfterFees: netEarnings,
    // TODO: update when yield calcs finished
    netAPY: netAPY,
    afterCloseToDai:
      sharedAmount0 && minToTokenAmount ? sharedAmount0.plus(minToTokenAmount).minus(debt) : zero,
  }
}
