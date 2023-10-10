import { calculateTokenPrecisionByValue } from 'helpers/tokens'
import { zero } from 'helpers/zero'

import type { ManageMultiplyVaultChange } from './ManageMultiplyVaultChange.types'
import { manageMultiplyInputsDefaults } from './manageMultiplyVaultForm.constants'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'

export function applyManageVaultInput(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
) {
  if (change.kind === 'requiredCollRatio') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      requiredCollRatio: change.requiredCollRatio,
      depositAmount: state.depositAmount,
      depositAmountUSD: state.depositAmountUSD,
      withdrawAmount: state.withdrawAmount,
      withdrawAmountUSD: state.withdrawAmountUSD,
      depositDaiAmount: state.depositDaiAmount,
      generateAmount: state.generateAmount,
    }
  }

  if (change.kind === 'buyAmount' && !state.showSliderController && state.mainAction === 'buy') {
    const { buyAmount } = change
    const { priceInfo } = state
    const buyAmountUSD = buyAmount?.times(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      buyAmount,
      buyAmountUSD,
    }
  }

  if (change.kind === 'buyAmountUSD' && !state.showSliderController && state.mainAction === 'buy') {
    const { buyAmountUSD } = change
    const { priceInfo } = state
    const buyAmount = buyAmountUSD?.div(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      buyAmount,
      buyAmountUSD,
    }
  }

  if (change.kind === 'buyMax' && !state.showSliderController && state.mainAction === 'buy') {
    // const { priceInfo } = state
    // TODO use buying power here or debt ceiling

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      buyAmount: zero,
      buyAmountUSD: zero,
    }
  }

  if (change.kind === 'sellAmount' && !state.showSliderController && state.mainAction === 'sell') {
    const { sellAmount } = change
    const { priceInfo } = state
    const sellAmountUSD = sellAmount?.times(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      sellAmount,
      sellAmountUSD,
    }
  }

  if (
    change.kind === 'sellAmountUSD' &&
    !state.showSliderController &&
    state.mainAction === 'sell'
  ) {
    const { sellAmountUSD } = change
    const { priceInfo } = state
    const sellAmount = sellAmountUSD?.div(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      sellAmount,
      sellAmountUSD,
    }
  }

  if (change.kind === 'sellMax' && !state.showSliderController && state.mainAction === 'sell') {
    // const { sellAmountUSD } = change
    const {
      vault: { freeCollateral, freeCollateralUSD },
    } = state
    // const sellAmount = sellAmountUSD?.div(priceInfo.currentCollateralPrice)
    // TO DO: figure out what is the sell max amount

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      sellAmount: freeCollateral,
      sellAmountUSD: freeCollateralUSD,
    }
  }

  if (change.kind === 'depositAmount') {
    const {
      priceInfo: { currentCollateralPrice },
      vault: { token },
    } = state
    const currencyDigits = calculateTokenPrecisionByValue({
      token: token,
      usdPrice: currentCollateralPrice,
    })
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      generateAmount: state.vaultType === VaultType.Borrow ? state.generateAmount : undefined,
      depositAmount: change.depositAmount,
      depositAmountUSD: change.depositAmount?.times(currentCollateralPrice).dp(currencyDigits),
      showSliderController: false,
    }
  }

  if (change.kind === 'depositDaiAmount') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      depositDaiAmount: change.depositDaiAmount,
      showSliderController: true,
      requiredCollRatio:
        state.vault.debt.isZero() && change.depositDaiAmount?.gt(zero)
          ? state.ilkData.liquidationRatio
          : change.depositDaiAmount?.gt(zero)
          ? state.vault.collateralizationRatio
          : undefined,
    }
  }

  if (change.kind === 'depositAmountUSD') {
    const {
      priceInfo: { currentCollateralPrice },
    } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      generateAmount: state.vaultType === VaultType.Borrow ? state.generateAmount : undefined,
      depositAmountUSD: change.depositAmountUSD,
      depositAmount: change.depositAmountUSD?.div(currentCollateralPrice),
      showSliderController: false,
    }
  }

  if (change.kind === 'depositAmountMax') {
    const { maxDepositAmount, maxDepositAmountUSD } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      generateAmount: state.vaultType === VaultType.Borrow ? state.generateAmount : undefined,
      depositAmount: maxDepositAmount,
      depositAmountUSD: maxDepositAmountUSD,
      showSliderController: false,
    }
  }

  if (change.kind === 'depositDaiAmountMax') {
    const { maxDepositDaiAmount } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      depositDaiAmount: maxDepositDaiAmount,
      showSliderController: true,
      requiredCollRatio: state.ilkData.liquidationRatio,
    }
  }

  if (change.kind === 'paybackAmount') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      withdrawAmount: state.vaultType === VaultType.Borrow ? state.withdrawAmount : undefined,
      withdrawAmountUSD: state.vaultType === VaultType.Borrow ? state.withdrawAmount : undefined,
      paybackAmount: change.paybackAmount,
    }
  }

  if (change.kind === 'paybackAmountMax') {
    const { maxPaybackAmount } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      withdrawAmount: state.vaultType === VaultType.Borrow ? state.withdrawAmount : undefined,
      withdrawAmountUSD: state.vaultType === VaultType.Borrow ? state.withdrawAmount : undefined,
      paybackAmount: maxPaybackAmount,
    }
  }

  if (change.kind === 'withdrawAmount') {
    const { priceInfo } = state
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      withdrawAmount: change.withdrawAmount,
      withdrawAmountUSD: change.withdrawAmount?.times(priceInfo.currentCollateralPrice),
      paybackAmount: state.vaultType === VaultType.Borrow ? state.paybackAmount : undefined,
      showSliderController: false,
    }
  }

  if (change.kind === 'withdrawAmountUSD') {
    const { priceInfo } = state
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      withdrawAmountUSD: change.withdrawAmountUSD,
      withdrawAmount: change.withdrawAmountUSD?.div(priceInfo.currentCollateralPrice),
      paybackAmount: state.vaultType === VaultType.Borrow ? state.paybackAmount : undefined,
      showSliderController: false,
    }
  }

  if (change.kind === 'withdrawAmountMax') {
    const { maxWithdrawAmount, maxWithdrawAmountUSD } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      withdrawAmount: maxWithdrawAmount,
      withdrawAmountUSD: maxWithdrawAmountUSD,
      paybackAmount: state.vaultType === VaultType.Borrow ? state.paybackAmount : undefined,
      showSliderController: false,
    }
  }

  if (change.kind === 'generateAmount') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      generateAmount: change.generateAmount,
      showSliderController: false,
      depositAmount: state.vaultType === VaultType.Borrow ? state.depositAmount : undefined,
      depositAmountUSD: state.vaultType === VaultType.Borrow ? state.depositAmountUSD : undefined,
    }
  }

  if (change.kind === 'generateAmountMax') {
    const { maxGenerateAmount } = state
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      generateAmount: maxGenerateAmount,
      showSliderController: false,
      depositAmount: state.vaultType === VaultType.Borrow ? state.depositAmount : undefined,
      depositAmountUSD: state.vaultType === VaultType.Borrow ? state.depositAmountUSD : undefined,
    }
  }

  return state
}
