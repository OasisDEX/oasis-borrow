import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { ManageMultiplyVaultChange, ManageMultiplyVaultState } from './manageMultiplyVault'
import { manageMultiplyInputsDefaults } from './manageMultiplyVaultForm'

interface DepositAmountChange {
  kind: 'depositAmount'
  depositAmount?: BigNumber
}

interface DepositAmountUSDChange {
  kind: 'depositAmountUSD'
  depositAmountUSD?: BigNumber
}

interface DepositAmountMaxChange {
  kind: 'depositAmountMax'
}

interface paybackAmountChange {
  kind: 'paybackAmount'
  paybackAmount?: BigNumber
}

interface PaybackAmountMaxChange {
  kind: 'paybackAmountMax'
}

interface WithdrawAmountChange {
  kind: 'withdrawAmount'
  withdrawAmount?: BigNumber
}

interface WithdrawAmountUSDChange {
  kind: 'withdrawAmountUSD'
  withdrawAmountUSD?: BigNumber
}

interface WithdrawAmountMaxChange {
  kind: 'withdrawAmountMax'
}

interface GenerateAmountChange {
  kind: 'generateAmount'
  generateAmount?: BigNumber
}

interface GenerateAmountMaxChange {
  kind: 'generateAmountMax'
}

interface RequiredCollRatioChange {
  kind: 'requiredCollRatio'
  requiredCollRatio?: BigNumber
}
interface BuyChange {
  kind: 'buyAmount'
  buyAmount?: BigNumber
}

interface BuyUSDChange {
  kind: 'buyAmountUSD'
  buyAmountUSD?: BigNumber
}

interface BuyMaxChange {
  kind: 'buyMax'
}

interface SellChange {
  kind: 'sellAmount'
  sellAmount?: BigNumber
}

interface SellUSDChange {
  kind: 'sellAmountUSD'
  sellAmountUSD?: BigNumber
}
interface SellMaxChange {
  kind: 'sellMax'
}

export type ManageVaultInputChange =
  | DepositAmountChange
  | DepositAmountUSDChange
  | DepositAmountMaxChange
  | paybackAmountChange
  | PaybackAmountMaxChange
  | WithdrawAmountChange
  | WithdrawAmountUSDChange
  | WithdrawAmountMaxChange
  | GenerateAmountChange
  | GenerateAmountMaxChange
  | BuyChange
  | BuyUSDChange
  | BuyMaxChange
  | SellChange
  | SellUSDChange
  | SellMaxChange
  | RequiredCollRatioChange

// export const paybackAndWithdrawDefaults: Partial<ManageMultiplyVaultState> = {
//   withdrawAmount: undefined,
//   withdrawAmountUSD: undefined,
//   paybackAmount: undefined,
// }

export function applyManageVaultInput(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
) {
  // const canDeposit =
  //   (state.stage === 'daiEditing' && state.generateAmount && state.showDepositAndGenerateOption) ||
  //   state.stage === 'collateralEditing'

  // if (change.kind === 'deposit' && canDeposit) {
  //   const { depositAmount } = change
  //   const { stage, priceInfo } = state
  //   const depositAmountUSD = depositAmount && priceInfo.currentCollateralPrice.times(depositAmount)

  //   return {
  //     ...state,
  //     depositAmount,
  //     depositAmountUSD,
  //     ...(!depositAmount &&
  //       stage === 'collateralEditing' && {
  //         showDepositAndGenerateOption: false,
  //         generateAmount: undefined,
  //       }),
  //     ...paybackAndWithdrawDefaults,
  //   }
  // }

  // if (change.kind === 'depositUSD' && canDeposit) {
  //   const { depositAmountUSD } = change
  //   const { stage, priceInfo } = state
  //   const depositAmount = depositAmountUSD && depositAmountUSD.div(priceInfo.currentCollateralPrice)

  //   return {
  //     ...state,
  //     depositAmount,
  //     depositAmountUSD,
  //     ...(!depositAmountUSD &&
  //       stage === 'collateralEditing' && {
  //         showDepositAndGenerateOption: false,
  //         generateAmount: undefined,
  //       }),
  //     ...paybackAndWithdrawDefaults,
  //   }
  // }

  // if (change.kind === 'depositMax' && canDeposit) {
  //   const { maxDepositAmount, maxDepositAmountUSD } = state

  //   return {
  //     ...state,
  //     depositAmount: maxDepositAmount,
  //     depositAmountUSD: maxDepositAmountUSD,
  //     ...paybackAndWithdrawDefaults,
  //   }
  // }

  // const canGenerate =
  //   (state.stage === 'collateralEditing' &&
  //     state.depositAmount &&
  //     state.showDepositAndGenerateOption) ||
  //   state.stage === 'daiEditing'

  // if (change.kind === 'generate' && canGenerate) {
  //   const { generateAmount } = change
  //   const { stage } = state
  //   return {
  //     ...state,
  //     generateAmount,
  //     ...(!generateAmount &&
  //       stage === 'daiEditing' && {
  //         showDepositAndGenerateOption: false,
  //         depositAmount: undefined,
  //         depositAmountUSD: undefined,
  //       }),
  //     ...paybackAndWithdrawDefaults,
  //   }
  // }

  // if (change.kind === 'generateMax' && canGenerate) {
  //   const { maxGenerateAmount } = state

  //   return {
  //     ...state,
  //     generateAmount: maxGenerateAmount,
  //     ...paybackAndWithdrawDefaults,
  //   }
  // }

  // const canWithdraw =
  //   (state.stage === 'daiEditing' && state.paybackAmount && state.showPaybackAndWithdrawOption) ||
  //   state.stage === 'collateralEditing'

  // if (change.kind === 'withdraw' && canWithdraw) {
  //   const { withdrawAmount } = change
  //   const { stage, priceInfo } = state
  //   const withdrawAmountUSD =
  //     withdrawAmount && priceInfo.currentCollateralPrice.times(withdrawAmount)

  //   return {
  //     ...state,
  //     withdrawAmount,
  //     withdrawAmountUSD,
  //     ...(!withdrawAmount &&
  //       stage === 'collateralEditing' && {
  //         showPaybackAndWithdrawOption: false,
  //         paybackAmount: undefined,
  //       }),
  //     ...depositAndGenerateDefaults,
  //   }
  // }

  // if (change.kind === 'withdrawUSD' && canWithdraw) {
  //   const { withdrawAmountUSD } = change
  //   const { stage, priceInfo } = state
  //   const withdrawAmount =
  //     withdrawAmountUSD && withdrawAmountUSD.gt(zero)
  //       ? withdrawAmountUSD.div(priceInfo.currentCollateralPrice)
  //       : undefined

  //   return {
  //     ...state,
  //     withdrawAmount,
  //     withdrawAmountUSD,
  //     ...(!withdrawAmountUSD &&
  //       stage === 'collateralEditing' && {
  //         showPaybackAndWithdrawOption: false,
  //         paybackAmount: undefined,
  //       }),
  //     ...depositAndGenerateDefaults,
  //   }
  // }

  // if (change.kind === 'withdrawMax' && canWithdraw) {
  //   const { maxWithdrawAmount, maxWithdrawAmountUSD } = state
  //   return {
  //     ...state,
  //     withdrawAmount: maxWithdrawAmount,
  //     withdrawAmountUSD: maxWithdrawAmountUSD,
  //     ...depositAndGenerateDefaults,
  //   }
  // }

  // const canPayback =
  //   (state.stage === 'collateralEditing' &&
  //     state.withdrawAmount &&
  //     state.showPaybackAndWithdrawOption) ||
  //   state.stage === 'daiEditing'

  // if (change.kind === 'payback' && canPayback) {
  //   const { paybackAmount } = change
  //   const { stage } = state
  //   return {
  //     ...state,
  //     paybackAmount,
  //     ...(!paybackAmount &&
  //       stage === 'daiEditing' && {
  //         showPaybackAndWithdrawOption: false,
  //         withdrawAmount: undefined,
  //         withdrawAmountUSD: undefined,
  //       }),
  //     ...depositAndGenerateDefaults,
  //   }
  // }

  // if (change.kind === 'paybackMax' && canPayback) {
  //   const { maxPaybackAmount } = state

  //   return {
  //     ...state,
  //     paybackAmount: maxPaybackAmount,
  //     ...depositAndGenerateDefaults,
  //   }
  // }

  if (change.kind === 'requiredCollRatio') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      requiredCollRatio: change.requiredCollRatio,
      depositAmount: state.depositAmount,
      depositAmountUSD: state.depositAmountUSD,
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
    } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      depositAmount: change.depositAmount,
      depositAmountUSD: change.depositAmount?.times(currentCollateralPrice),
      showSliderController: false,
    }
  }

  if (change.kind === 'depositAmountUSD') {
    const {
      priceInfo: { currentCollateralPrice },
    } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
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
      depositAmount: maxDepositAmount,
      depositAmountUSD: maxDepositAmountUSD,
      showSliderController: false,
    }
  }

  if (change.kind === 'paybackAmount') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      paybackAmount: change.paybackAmount,
    }
  }

  if (change.kind === 'paybackAmountMax') {
    const { maxPaybackAmount } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
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
    }
  }

  if (change.kind === 'withdrawAmountUSD') {
    const { priceInfo } = state
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      withdrawAmountUSD: change.withdrawAmountUSD,
      withdrawAmount: change.withdrawAmountUSD?.div(priceInfo.currentCollateralPrice),
    }
  }

  if (change.kind === 'withdrawAmountMax') {
    const { maxWithdrawAmount, maxWithdrawAmountUSD } = state

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      withdrawAmount: maxWithdrawAmount,
      withdrawAmountUSD: maxWithdrawAmountUSD,
    }
  }

  if (change.kind === 'generateAmount') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      generateAmount: change.generateAmount,
    }
  }

  if (change.kind === 'generateAmountMax') {
    const { maxGenerateAmount } = state
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      generateAmount: maxGenerateAmount,
    }
  }

  return state
}
