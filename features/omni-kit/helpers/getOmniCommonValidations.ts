import type BigNumber from 'bignumber.js'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import type {
  OmniFormState,
  OmniPartialValidations,
  OmniValidationItem,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'

interface GetOmniValidationsParams {
  collateralToken: string
  ethBalance: BigNumber
  quoteBalance: BigNumber
  collateralBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  productType: OmniProductType
  quoteToken: string
  state: OmniFormState
  txError?: TxError
}

export function getOmniCommonValidations({
  collateralToken,
  ethBalance,
  collateralBalance,
  quoteBalance,
  ethPrice,
  gasEstimationUsd,
  productType,
  quoteToken,
  state,
  txError,
}: GetOmniValidationsParams): OmniPartialValidations {
  const localErrors: OmniValidationItem[] = []
  const localWarnings: OmniValidationItem[] = []
  const isEarnProduct = productType === OmniProductType.Earn
  const depositBalance = isEarnProduct ? quoteBalance : collateralBalance

  if ('depositAmount' in state && state.depositAmount?.gt(depositBalance)) {
    localErrors.push({ message: { translationKey: 'deposit-amount-exceeds-collateral-balance' } })
  }

  if (ethFundsForTxValidator({ txError })) {
    localErrors.push({
      message: {
        translationKey: 'has-insufficient-eth-funds-for-tx',
      },
    })
  }

  const hasPotentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token: isEarnProduct ? quoteToken : collateralToken,
    ethBalance,
    ethPrice,
    depositAmount:
      'paybackAmount' in state && state.paybackAmount?.gt(zero) && quoteToken === 'ETH'
        ? state.paybackAmount
        : state.depositAmount,
    gasEstimationUsd,
  })

  if (hasPotentialInsufficientEthFundsForTx) {
    localWarnings.push({
      message: { translationKey: 'has-potential-insufficient-eth-funds-for-tx' },
    })
  }

  return {
    localErrors,
    localWarnings,
  }
}
