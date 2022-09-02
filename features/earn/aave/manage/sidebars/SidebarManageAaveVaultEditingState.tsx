import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'
import { Sender } from 'xstate'

import { VaultActionInput } from '../../../../../components/vault/VaultActionInput'
import { handleNumericInput } from '../../../../../helpers/input'
import { ManageAaveEvent, ManageAaveStateMachineState } from '../state'

export interface ManageAaveEditingStateProps {
  state: ManageAaveStateMachineState
  send: Sender<ManageAaveEvent>
}

export function SidebarManageAaveVaultEditingState(props: ManageAaveEditingStateProps) {
  const { state } = props
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
        onChange={handleNumericInput(() => {
          // if (amount) {
          //   send({ type: 'SET_AMOUNT', amount })
          // }
        })}
        currencyCode={state.context.token!}
        disabled={false}
        tokenUsdPrice={new BigNumber(10)}
      />
    </Grid>
  )
}
