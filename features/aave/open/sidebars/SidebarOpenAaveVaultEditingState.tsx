import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'
import { Sender, StateFrom } from 'xstate'

import { VaultActionInput } from '../../../../components/vault/VaultActionInput'
import { handleNumericInput } from '../../../../helpers/input'
import { OpenAaveEvent, OpenAaveStateMachine } from '../state'

export interface OpenAaveEditingStateProps {
  state: StateFrom<OpenAaveStateMachine>
  send: Sender<OpenAaveEvent>
}

export function SidebarOpenAaveVaultEditingState(props: OpenAaveEditingStateProps) {
  const { state, send } = props
  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      <WithLoadingIndicator
        // this loader seems to be pointless, but undefined tokenUsdPrice (below) breaks the proper decimals input so it needs to be there
        value={[state.context.collateralPrice]}
        customLoader={
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AppSpinner size={24} />
          </Box>
        }
      >
        {([collateralPrice]) => (
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
            tokenUsdPrice={collateralPrice}
          />
        )}
      </WithLoadingIndicator>
    </Grid>
  )
}
