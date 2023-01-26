import React from 'react'
import { Grid } from 'theme-ui'

import { SecondaryInputProps } from '../../common/StrategyConfigTypes'
import { zero } from '../../../../helpers/zero'
import { handleNumericInput } from '../../../../helpers/input'
import { VaultActionInput } from '../../../../components/vault/VaultActionInput'
import { amountFromPrecision } from '../../../../blockchain/utils'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'

export function DebtInput(props: SecondaryInputProps) {
  const { state, send } = props

  let maxDebt = zero

  if (state.context.strategy) {
    maxDebt = amountFromPrecision(
      state.context.strategy.simulation.position.maxDebtToBorrow,
      new BigNumber(18), // precision from lib for maxDebtToBorrow is normalised to 18
    )
  }

  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      <VaultActionInput
        action={'Generate'}
        amount={state.context.userInput?.debtAmount}
        hasAuxiliary={true}
        auxiliaryAmount={
          state.context.userInput.debtAmount?.times(state.context.debtPrice || zero) || zero
        }
        hasError={false}
        maxAmount={maxDebt}
        showMax={true}
        maxAmountLabel={t('max')}
        onSetMax={() => {
          send({ type: 'SET_DEBT', debt: maxDebt })
        }}
        onChange={handleNumericInput((amount) => {
          send({ type: 'SET_DEBT', debt: amount || zero })
        })}
        currencyCode={state.context.tokens.debt}
        disabled={false}
        tokenUsdPrice={state.context.debtPrice}
      />
    </Grid>
  )
}
