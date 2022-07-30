import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { VaultActionInput } from '../../../../../components/vault/VaultActionInput'
import { handleNumericInput } from '../../../../../helpers/input'
import { OpenAaveStateMachineState } from '../state/types'

export interface OpenAaveEditingStateProps {
  state: OpenAaveStateMachineState
  setAmount: (amount?: BigNumber) => void
}

export function SidebarOpenAaveVaultEditingState(props: OpenAaveEditingStateProps) {
  const { state, setAmount } = props
  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      <VaultActionInput
        action={'Deposit'}
        amount={state.context.amount}
        hasAuxiliary={true}
        auxiliaryAmount={state.context.auxiliaryAmount}
        hasError={false}
        maxAmount={state.context.tokenBalance}
        showMax={true}
        maxAmountLabel={t('balance')}
        onChange={handleNumericInput(setAmount)}
        currencyCode={state.context.token!}
        disabled={false}
        tokenUsdPrice={new BigNumber(10)}
      />
    </Grid>
  )
}
