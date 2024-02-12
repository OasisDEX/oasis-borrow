import { getToken } from 'blockchain/tokensMetadata'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import type { OpenAaveEditingStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

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
        maxAmount={state.context.balance?.deposit.balance}
        showMax={true}
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
