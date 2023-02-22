import { VaultActionInput } from 'components/vault/VaultActionInput'
import { OpenAaveEvent, OpenAaveStateMachine } from 'features/aave/open/state'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'
import { Sender, StateFrom } from 'xstate'

export interface OpenAaveEditingStateProps {
  state: StateFrom<OpenAaveStateMachine>
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
        onSetMax={() => {
          send({ type: 'SET_AMOUNT', amount: state.context.tokenBalance! })
        }}
        onChange={handleNumericInput((amount) => {
          send({ type: 'SET_AMOUNT', amount })
        })}
        currencyCode={state.context.tokens.deposit}
        disabled={false}
        tokenUsdPrice={state.context.collateralPrice}
      />
    </Grid>
  )
}
