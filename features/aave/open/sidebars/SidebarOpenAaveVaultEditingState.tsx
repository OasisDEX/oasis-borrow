import React from 'react'
import { getToken } from 'blockchain/tokensMetadata'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { OpenAaveEvent, OpenAaveStateMachine } from 'features/aave/open/state'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
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
        action="Deposit"
        amount={state.context.userInput?.amount}
        hasAuxiliary
        auxiliaryAmount={state.context.auxiliaryAmount}
        hasError={false}
        maxAmount={state.context.balance?.deposit.balance}
        showMax
        maxAmountLabel={t('balance')}
        onSetMax={() => {
          send({ type: 'SET_AMOUNT', amount: state.context.balance?.deposit.balance ?? zero })
        }}
        onChange={handleNumericInput((amount) => {
          send({ type: 'SET_AMOUNT', amount })
        })}
        currencyCode={state.context.tokens.deposit}
        currencyDigits={getToken(state.context.tokens.deposit)?.digits}
        disabled={false}
        tokenUsdPrice={state.context.balance?.deposit.price}
      />
    </Grid>
  )
}
