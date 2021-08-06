import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { ManageMultiplyVaultState, ManageVaultChange } from './manageMultiplyVault'
import { otherActionsDefaults } from './manageMultiplyVaultForm'

interface DepositCollateralChange {
  kind: 'depositCollateral'
  depositAmount?: BigNumber
}

interface DepositCollateralUSDChange {
  kind: 'depositCollateralUSD'
  depositAmountUSD?: BigNumber
}

interface DepositCollateralMaxChange {
  kind: 'depositCollateralMax'
}

interface DepositDaiChange {
  kind: 'depositDai'
  paybackAmount?: BigNumber
}

interface DepositDaiMaxChange {
  kind: 'depositDaiMax'
}
interface WithdrawCollateralChange {
  kind: 'withdrawCollateral'
  withdrawAmount?: BigNumber
}

interface WithdrawCollateralUSDChange {
  kind: 'withdrawCollateralUSD'
  withdrawAmountUSD?: BigNumber
}

interface WithdrawCollateralMaxChange {
  kind: 'withdrawCollateralMax'
}

interface WithdrawDaiChange {
  kind: 'withdrawDai'
  generateAmount?: BigNumber
}

interface WithdrawDaiMaxChange {
  kind: 'withdrawDaiMax'
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
  | DepositCollateralChange
  | DepositCollateralUSDChange
  | DepositCollateralMaxChange
  | DepositDaiChange
  | DepositDaiMaxChange
  | WithdrawCollateralChange
  | WithdrawCollateralUSDChange
  | WithdrawCollateralMaxChange
  | WithdrawDaiChange
  | WithdrawDaiMaxChange
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

export function applyManageVaultInput(change: ManageVaultChange, state: ManageMultiplyVaultState) {
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
      ...otherActionsDefaults,
      requiredCollRatio: change.requiredCollRatio,
    }
  }

  if (change.kind === 'buyAmount') {
    const { buyAmount } = change
    const { priceInfo } = state
    const buyAmountUSD = buyAmount?.times(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...otherActionsDefaults,
      buyAmount,
      buyAmountUSD,

      sellAmount: undefined,
      sellAmountUSD: undefined,
    }
  }

  if (change.kind === 'buyAmountUSD') {
    const { buyAmountUSD } = change
    const { priceInfo } = state
    const buyAmount = buyAmountUSD?.div(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...otherActionsDefaults,
      buyAmount,
      buyAmountUSD,

      sellAmount: undefined,
      sellAmountUSD: undefined,
    }
  }

  if (change.kind === 'buyMax') {
    // const { priceInfo } = state
    // TODO use buying power here or debt ceiling

    return {
      ...state,
      ...otherActionsDefaults,
      buyAmount: zero,
      buyAmountUSD: zero,

      sellAmount: undefined,
      sellAmountUSD: undefined,
    }
  }

  if (change.kind === 'sellAmount') {
    const { sellAmount } = change
    const { priceInfo } = state
    const sellAmountUSD = sellAmount?.times(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...otherActionsDefaults,
      sellAmount,
      sellAmountUSD,

      buyAmount: undefined,
      buyAmountUSD: undefined,
    }
  }

  if (change.kind === 'sellAmountUSD') {
    const { sellAmountUSD } = change
    const { priceInfo } = state
    const sellAmount = sellAmountUSD?.div(priceInfo.currentCollateralPrice)

    return {
      ...state,
      ...otherActionsDefaults,
      sellAmount,
      sellAmountUSD,

      buyAmount: undefined,
      buyAmountUSD: undefined,
    }
  }

  if (change.kind === 'sellMax') {
    // const { sellAmountUSD } = change
    const {
      vault: { freeCollateral, freeCollateralUSD },
    } = state
    // const sellAmount = sellAmountUSD?.div(priceInfo.currentCollateralPrice)
    // TO DO: figure out what is the sell max amount

    return {
      ...state,
      ...otherActionsDefaults,
      sellAmount: freeCollateral,
      sellAmountUSD: freeCollateralUSD,

      buyAmount: undefined,
      buyAmountUSD: undefined,
    }
  }

  if (change.kind === 'depositCollateral') {
    const {
      priceInfo: { currentCollateralPrice },
    } = state

    return {
      ...state,
      ...otherActionsDefaults,
      depositAmount: change.depositAmount,
      depositAmountUSD: change.depositAmount?.times(currentCollateralPrice),
    }
  }

  if (change.kind === 'depositCollateralUSD') {
    const {
      priceInfo: { currentCollateralPrice },
    } = state

    return {
      ...state,
      ...otherActionsDefaults,
      depositAmountUSD: change.depositAmountUSD,
      depositAmount: change.depositAmountUSD?.div(currentCollateralPrice),
    }
  }

  if (change.kind === 'depositCollateralMax') {
    const { maxDepositCollateral, maxDepositCollateralUSD } = state

    return {
      ...state,
      ...otherActionsDefaults,
      depositAmount: maxDepositCollateral,
      depositAmountUSD: maxDepositCollateralUSD,
    }
  }

  if (change.kind === 'depositDai') {
    return {
      ...state,
      ...otherActionsDefaults,
      paybackAmount: change.paybackAmount,
    }
  }

  if (change.kind === 'depositDaiMax') {
    const { maxDepositDai } = state

    return {
      ...state,
      ...otherActionsDefaults,
      paybackAmount: maxDepositDai,
    }
  }

  if (change.kind === 'withdrawCollateral') {
    const { priceInfo } = state
    return {
      ...state,
      ...otherActionsDefaults,
      withdrawAmount: change.withdrawAmount,
      withdrawAmountUSD: change.withdrawAmount?.times(priceInfo.currentCollateralPrice),
    }
  }

  if (change.kind === 'withdrawCollateralUSD') {
    const { priceInfo } = state
    return {
      ...state,
      ...otherActionsDefaults,
      withdrawAmountUSD: change.withdrawAmountUSD,
      withdrawAmount: change.withdrawAmountUSD?.div(priceInfo.currentCollateralPrice),
    }
  }

  if (change.kind === 'withdrawCollateralMax') {
    const { maxWithdrawCollateral, maxWithdrawCollateralUSD } = state

    return {
      ...state,
      ...otherActionsDefaults,
      withdrawAmount: maxWithdrawCollateral,
      withdrawAmountUSD: maxWithdrawCollateralUSD,
    }
  }

  if (change.kind === 'withdrawDai') {
    return {
      ...state,
      ...otherActionsDefaults,
      generateAmount: change.generateAmount,
    }
  }

  if (change.kind === 'withdrawDaiMax') {
    const { maxWithdrawDai } = state
    return {
      ...state,
      ...otherActionsDefaults,
      generateAmount: maxWithdrawDai,
    }
  }

  return state
}
