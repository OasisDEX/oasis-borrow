import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'
import { Sender } from 'xstate'

import { VaultActionInput } from '../../../../components/vault/VaultActionInput'
import { handleNumericInput } from '../../../../helpers/input'
import { OpenAaveEvent, OpenAaveStateMachineState } from '../state'

export interface OpenAaveEditingStateProps {
  state: OpenAaveStateMachineState
  send: Sender<OpenAaveEvent>
}

export function SidebarOpenAaveVaultEditingState(props: OpenAaveEditingStateProps) {
  const { state, send } = props
  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      <VaultActionInput
        action={'Deposit'}
        amount={state.context.userInput?.amount}
        hasAuxiliary={true}
        auxiliaryAmount={state.context.auxiliaryAmount}
        hasError={false}
        maxAmount={state.context.tokenBalance}
        showMax={true}
        maxAmountLabel={t('balance')}
        onChange={handleNumericInput((amount) => {
          if (amount) {
            send({ type: 'SET_AMOUNT', amount: amount })
          }
        })}
        currencyCode={state.context.tokens.deposit}
        disabled={false}
      />
    </Grid>
  )
}
