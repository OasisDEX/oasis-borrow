import { NORMALISED_PRECISION } from 'actions/aave-like'
import { getToken } from 'blockchain/tokensMetadata'
import { amountFromPrecision } from 'blockchain/utils'
import { MessageCard } from 'components/MessageCard'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import type { SecondaryInputProps } from 'features/aave/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ErrorMessageCannotBorrowDueToProtocolCap } from './ErrorMessageCannotBorrowDueToProtocolCap'

export function DebtInput(props: SecondaryInputProps) {
  const { state, send } = props

  const userInputDebt = state.context.userInput?.debtAmount
  let maxDebt = zero

  const debtDigits = getToken(state.context.tokens.debt)?.digits

  if (state.context.transition) {
    maxDebt = amountFromPrecision(
      state.context.transition.simulation.position.maxDebtToBorrowWithCurrentCollateral,
      NORMALISED_PRECISION,
    )
  }

  const amountDebtTooHigh = userInputDebt?.gt(maxDebt) || false

  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      <VaultActionInput
        action={'Borrow'}
        amount={userInputDebt}
        hasAuxiliary={true}
        auxiliaryAmount={
          state.context.userInput.debtAmount?.times(state.context.balance?.debt.price || zero) ||
          zero
        }
        hasError={amountDebtTooHigh}
        maxAmount={maxDebt}
        showMax={true}
        maxAmountLabel={t('max')}
        onSetMax={() => {
          send({ type: 'SET_DEBT', debt: maxDebt })
        }}
        onChange={handleNumericInput((amount) => {
          send({ type: 'SET_DEBT', debt: amount })
        })}
        currencyCode={state.context.tokens.debt}
        currencyDigits={debtDigits}
        disabled={false}
        tokenUsdPrice={state.context.balance?.debt.price}
      />
      {amountDebtTooHigh && (
        <MessageCard
          messages={[
            t('vault-errors.borrow-amount-exceeds-max', {
              maxBorrowAmount: formatCryptoBalance(maxDebt),
              token: state.context.tokens.debt,
            }),
          ]}
          withBullet={false}
          type="error"
        />
      )}
      <ErrorMessageCannotBorrowDueToProtocolCap context={state.context} />
    </Grid>
  )
}
