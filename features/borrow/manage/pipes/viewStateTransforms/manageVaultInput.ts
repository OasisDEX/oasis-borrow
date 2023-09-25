import type {
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from 'features/borrow/manage/pipes/manageVault.types'
import { calculateTokenPrecisionByValue } from 'helpers/tokens'
import { zero } from 'helpers/zero'

import {
  depositAndGenerateDefaults,
  paybackAndWithdrawDefaults,
} from './manageVaultInput.constants'

export function applyManageVaultInput<VaultState extends ManageStandardBorrowVaultState>(
  change: ManageVaultChange,
  state: VaultState,
): VaultState {
  const {
    stage,
    priceInfo,
    generateAmount,
    showDepositAndGenerateOption,
    maxDepositAmount,
    maxDepositAmountUSD,
    maxGenerateAmount,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    maxPaybackAmount,
    mainAction,
  } = state

  const canDeposit =
    mainAction === 'depositGenerate' &&
    ((stage === 'daiEditing' && generateAmount && showDepositAndGenerateOption) ||
      stage === 'collateralEditing')

  if (change.kind === 'deposit' && canDeposit) {
    const { depositAmount } = change
    const depositAmountUSD = depositAmount && priceInfo.currentCollateralPrice.times(depositAmount)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      ...(!depositAmount &&
        stage === 'collateralEditing' && {
          showDepositAndGenerateOption: false,
          generateAmount: undefined,
        }),
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === 'depositUSD' && canDeposit) {
    const { depositAmountUSD } = change
    const { priceInfo, vault } = state
    const currentCollateralPrice = priceInfo.currentCollateralPrice
    const currencyDigits = calculateTokenPrecisionByValue({
      token: vault.token,
      usdPrice: currentCollateralPrice,
    })
    const depositAmount =
      depositAmountUSD && depositAmountUSD.div(priceInfo.currentCollateralPrice).dp(currencyDigits)

    return {
      ...state,
      depositAmount,
      depositAmountUSD,
      ...(!depositAmountUSD &&
        stage === 'collateralEditing' && {
          showDepositAndGenerateOption: false,
          generateAmount: undefined,
        }),
      ...paybackAndWithdrawDefaults,
    }
  }

  if (change.kind === 'depositMax' && canDeposit) {
    return {
      ...state,
      depositAmount: maxDepositAmount,
      depositAmountUSD: maxDepositAmountUSD,
      ...paybackAndWithdrawDefaults,
    }
  }

  const canGenerate =
    mainAction === 'depositGenerate' &&
    ((stage === 'collateralEditing' && state.depositAmount && state.showDepositAndGenerateOption) ||
      stage === 'daiEditing')

  if (change.kind === 'generate' && canGenerate) {
    const { generateAmount } = change
    const thing = {
      ...state,
      generateAmount,
      ...(!generateAmount &&
        stage === 'daiEditing' && {
          showDepositAndGenerateOption: false,
          depositAmount: undefined,
          depositAmountUSD: undefined,
        }),
      ...paybackAndWithdrawDefaults,
    }
    return thing
  }

  if (change.kind === 'generateMax' && canGenerate) {
    return {
      ...state,
      generateAmount: maxGenerateAmount,
      ...paybackAndWithdrawDefaults,
    }
  }

  const canWithdraw =
    mainAction === 'withdrawPayback' &&
    ((stage === 'daiEditing' && state.paybackAmount && state.showPaybackAndWithdrawOption) ||
      stage === 'collateralEditing')

  if (change.kind === 'withdraw' && canWithdraw) {
    const { withdrawAmount } = change
    const withdrawAmountUSD =
      withdrawAmount && priceInfo.currentCollateralPrice.times(withdrawAmount)

    return {
      ...state,
      withdrawAmount,
      withdrawAmountUSD,
      ...(!withdrawAmount &&
        stage === 'collateralEditing' && {
          showPaybackAndWithdrawOption: false,
          paybackAmount: undefined,
        }),
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === 'withdrawUSD' && canWithdraw) {
    const { withdrawAmountUSD } = change
    const withdrawAmount =
      withdrawAmountUSD && withdrawAmountUSD.gt(zero)
        ? withdrawAmountUSD.div(priceInfo.currentCollateralPrice)
        : undefined

    return {
      ...state,
      withdrawAmount,
      withdrawAmountUSD,
      ...(!withdrawAmountUSD &&
        stage === 'collateralEditing' && {
          showPaybackAndWithdrawOption: false,
          paybackAmount: undefined,
        }),
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === 'withdrawMax' && canWithdraw) {
    return {
      ...state,
      withdrawAmount: maxWithdrawAmount,
      withdrawAmountUSD: maxWithdrawAmountUSD,
      ...depositAndGenerateDefaults,
    }
  }

  const canPayback =
    mainAction === 'withdrawPayback' &&
    ((stage === 'collateralEditing' &&
      state.withdrawAmount &&
      state.showPaybackAndWithdrawOption) ||
      stage === 'daiEditing')

  if (change.kind === 'payback' && canPayback) {
    const { paybackAmount } = change
    return {
      ...state,
      paybackAmount,
      ...(!paybackAmount &&
        stage === 'daiEditing' && {
          showPaybackAndWithdrawOption: false,
          withdrawAmount: undefined,
          withdrawAmountUSD: undefined,
        }),
      ...depositAndGenerateDefaults,
    }
  }

  if (change.kind === 'paybackMax' && canPayback) {
    return {
      ...state,
      paybackAmount: maxPaybackAmount,
      ...depositAndGenerateDefaults,
    }
  }

  return state
}
