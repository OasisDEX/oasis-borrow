import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { AjnaSimulationValidationItem } from 'actions/ajna/types'
import type BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import type {
  AjnaGenericPosition,
  AjnaValidationItem,
  ProtocolFlow,
  ProtocolProduct,
  ProtocolSidebarStep,
} from 'features/ajna/common/types'
import type { AjnaFormState } from 'features/ajna/common/types/AjnaFormState.types'
import type { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto.types'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
  AjnaPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import type { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto.types'
import type { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto.types'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'
import { Trans } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface AjnaValidationWithLinkProps {
  name: string
  values?: { [key: string]: string }
}

const AjnaValidationWithLink: FC<AjnaValidationWithLinkProps> = ({ name, values }) => {
  const translationKey = `ajna.validations.${name}`

  const linkMap: { [key: string]: string } = {
    'price-below-htp': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE,
    'price-between-htp-and-lup': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE,
    'price-between-lup-and-momp': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE,
    'price-above-momp': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE,
    'collateral-to-claim': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_EARN,
    'is-during-grace-time': EXTERNAL_LINKS.DOCS.AJNA.LIQUIDATIONS,
    'is-being-liquidated': EXTERNAL_LINKS.DOCS.AJNA.LIQUIDATIONS,
  }

  return (
    <Trans
      i18nKey={translationKey}
      values={values}
      components={{
        1: <strong />,
        2: (
          <AppLink
            sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
            href={linkMap[name] || EXTERNAL_LINKS.DOCS.AJNA.HUB}
          />
        ),
      }}
    />
  )
}

const AjnaSafetyOnMessage: FC = () => (
  <Trans
    i18nKey={'ajna.validations.safety-switch-on'}
    components={[
      <AppLink sx={{ fontSize: 'inherit', color: 'inherit' }} href={EXTERNAL_LINKS.DISCORD} />,
    ]}
  />
)

interface GetAjnaBorrowValidationsParams {
  ajnaSafetySwitchOn: boolean
  flow: ProtocolFlow
  collateralBalance: BigNumber
  collateralToken: string
  quoteToken: string
  currentStep: ProtocolSidebarStep
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  product: ProtocolProduct
  quoteBalance: BigNumber
  simulationErrors?: AjnaSimulationValidationItem[]
  simulationWarnings?: AjnaSimulationValidationItem[]
  simulationNotices?: AjnaSimulationValidationItem[]
  simulationSuccesses?: AjnaSimulationValidationItem[]
  state: AjnaFormState
  position: AjnaGenericPosition
  positionAuction: AjnaPositionAuction
  txError?: TxError
}

interface MapSimulationValidationParams {
  items: AjnaSimulationValidationItem[]
  collateralToken: string
  quoteToken: string
  token: string
}

const mapSimulationValidation = ({
  items,
  collateralToken,
  quoteToken,
  token,
}: MapSimulationValidationParams): AjnaValidationItem[] =>
  items.map((item) => ({
    message: {
      component: (
        <AjnaValidationWithLink
          name={item.name}
          values={{ ...item.data, collateralToken, quoteToken, token }}
        />
      ),
    },
  }))

function isFormValid({
  currentStep,
  product,
  state,
  position,
}: {
  currentStep: GetAjnaBorrowValidationsParams['currentStep']
  product: GetAjnaBorrowValidationsParams['product']
  state: GetAjnaBorrowValidationsParams['state']
  position: AjnaGenericPosition
}): boolean {
  switch (product) {
    case 'borrow': {
      const { action, generateAmount, depositAmount, paybackAmount, withdrawAmount, loanToValue } =
        state as AjnaBorrowFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-borrow':
            case 'deposit-borrow':
              return !!depositAmount?.gt(0) || !!generateAmount?.gt(0)
            case 'withdraw-borrow':
              return !!withdrawAmount?.gt(0) || !!paybackAmount?.gt(0)
            case 'generate-borrow':
              return !!generateAmount?.gt(0) || !!depositAmount?.gt(0)
            case 'payback-borrow':
              return !!paybackAmount?.gt(0) || !!withdrawAmount?.gt(0)
            case 'switch-borrow':
              return true
            case 'close-borrow':
              return true
            case 'adjust-borrow':
              return !!loanToValue
            default:
              return false
          }
        default:
          return true
      }
    }
    case 'earn': {
      const { action, depositAmount, withdrawAmount, price } = state as AjnaEarnFormState
      const earnPosition = position as AjnaEarnPosition
      const isEmptyPosition = earnPosition.quoteTokenAmount.isZero() && earnPosition.price.isZero()

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-earn':
              return !!depositAmount?.gt(0)
            case 'deposit-earn':
              if (isEmptyPosition) {
                return !!depositAmount?.gt(0)
              }

              return !!depositAmount?.gt(0) || !areEarnPricesEqual(earnPosition.price, price)
            case 'withdraw-earn':
              if (isEmptyPosition) {
                return !!withdrawAmount?.gt(0)
              }

              return !!withdrawAmount?.gt(0) || !areEarnPricesEqual(earnPosition.price, price)
            case 'claim-earn': {
              return true
            }
            default:
              return false
          }
        default:
          return true
      }
    }
    case 'multiply':
      const { action, depositAmount, withdrawAmount, loanToValue, paybackAmount, generateAmount } =
        state as AjnaMultiplyFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-multiply':
              return !!depositAmount?.gt(0)
            case 'adjust':
              return !!loanToValue
            case 'generate-multiply':
            case 'deposit-collateral-multiply':
              return !!depositAmount || !!generateAmount
            case 'payback-multiply':
            case 'withdraw-multiply':
              return !!withdrawAmount || !!paybackAmount
            case 'deposit-quote-multiply':
              return !!loanToValue && !!depositAmount
            case 'switch-multiply':
            case 'close-multiply':
              return true
            default:
              return false
          }
        default:
          return true
      }
  }
}

export function getAjnaValidation({
  ajnaSafetySwitchOn,
  flow,
  collateralBalance,
  collateralToken,
  quoteToken,
  currentStep,
  ethBalance,
  ethPrice,
  gasEstimationUsd,
  product,
  quoteBalance,
  simulationErrors = [],
  simulationWarnings = [],
  simulationNotices = [],
  simulationSuccesses = [],
  state,
  txError,
  position,
  positionAuction,
}: GetAjnaBorrowValidationsParams): {
  isFormValid: boolean
  isFormFrozen: boolean
  hasErrors: boolean
  errors: AjnaValidationItem[]
  warnings: AjnaValidationItem[]
  notices: AjnaValidationItem[]
  successes: AjnaValidationItem[]
} {
  const localErrors: AjnaValidationItem[] = []
  const localWarnings: AjnaValidationItem[] = []
  const localNotices: AjnaValidationItem[] = []
  const localSuccesses: AjnaValidationItem[] = []
  const isEarnProduct = product === 'earn'
  const depositBalance = isEarnProduct ? quoteBalance : collateralBalance
  const token = product === 'earn' ? quoteToken : collateralToken

  if (ethFundsForTxValidator({ txError })) {
    localErrors.push({
      message: {
        translationKey: 'has-insufficient-eth-funds-for-tx',
      },
    })
  }

  if ('depositAmount' in state && state.depositAmount?.gt(depositBalance)) {
    localErrors.push({ message: { translationKey: 'deposit-amount-exceeds-collateral-balance' } })
  }
  if ('paybackAmount' in state && state.paybackAmount?.gt(quoteBalance)) {
    localErrors.push({ message: { translationKey: 'payback-amount-exceeds-debt-token-balance' } })
  }

  if (ajnaSafetySwitchOn && flow === 'manage') {
    switch (product) {
      case 'borrow':
      case 'multiply':
        if (
          'debtAmount' in position &&
          position.debtAmount?.isZero() &&
          (('loanToValue' in state && state.loanToValue?.gt(zero)) ||
            ('depositAmount' in state && state.depositAmount?.gt(zero)) ||
            ('paybackAmount' in state && state.paybackAmount?.gt(zero)) ||
            ('generateAmount' in state && state.generateAmount?.gt(zero)))
        ) {
          localErrors.push({
            message: { component: <AjnaSafetyOnMessage /> },
          })
        }

        break
      case 'earn':
        if (
          'quoteTokenAmount' in position &&
          position.quoteTokenAmount?.isZero() &&
          'depositAmount' in state &&
          state.depositAmount?.gt(zero)
        ) {
          localErrors.push({
            message: { component: <AjnaSafetyOnMessage /> },
          })
        }

        break
    }
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

  if (['borrow', 'multiply'].includes(product)) {
    const borrowishAuction = positionAuction as AjnaBorrowishPositionAuction

    if (borrowishAuction.isDuringGraceTime) {
      localWarnings.push({
        message: {
          component: <AjnaValidationWithLink name="is-during-grace-time" />,
        },
      })
    }

    if (borrowishAuction.isBeingLiquidated) {
      localWarnings.push({
        message: {
          component: <AjnaValidationWithLink name="is-being-liquidated" />,
        },
      })
    }
  }

  const errors = [
    ...localErrors,
    ...mapSimulationValidation({ items: simulationErrors, collateralToken, quoteToken, token }),
  ]

  const warnings = [
    ...localWarnings,
    ...mapSimulationValidation({ items: simulationWarnings, collateralToken, quoteToken, token }),
  ]
  const notices = [
    ...localNotices,
    ...mapSimulationValidation({ items: simulationNotices, collateralToken, quoteToken, token }),
  ]
  const successes = [
    ...localSuccesses,
    ...mapSimulationValidation({ items: simulationSuccesses, collateralToken, quoteToken, token }),
  ]

  const isFormFrozen =
    product === 'earn' && (positionAuction as AjnaEarnPositionAuction).isBucketFrozen

  return {
    isFormValid: isFormValid({ currentStep, product, state, position }),
    hasErrors: errors.length > 0,
    isFormFrozen,
    errors,
    warnings: errors.length > 0 ? [] : warnings,
    notices,
    successes,
  }
}
