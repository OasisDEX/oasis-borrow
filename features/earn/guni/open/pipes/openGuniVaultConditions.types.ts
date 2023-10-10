import type BigNumber from 'bignumber.js'

export interface GuniOpenMultiplyVaultConditions {
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean

  inputAmountsEmpty: boolean

  generateAmountLessThanDebtFloor: boolean
  generateAmountMoreThanMaxFlashAmount: boolean
  generateAmountExceedsDebtCeiling: boolean
  depositAmountExceedsCollateralBalance: boolean
  ledgerWalletContractDataDisabled: boolean

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean
  potentialGenerateAmountLessThanDebtFloor: boolean

  isLoadingStage: boolean
  isSuccessStage: boolean
  canProgress: boolean
  canRegress: boolean
  isExchangeLoading: boolean

  highSlippage: boolean
  customSlippageOverridden: boolean
  customSlippage: BigNumber

  insufficientEthFundsForTx: boolean
}
