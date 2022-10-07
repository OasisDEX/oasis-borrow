import React from 'react'
import { Sender } from 'xstate'

import { ManageAaveEvent, ManageAaveStateMachineState } from '../state'

export interface ManageAaveEditingStateProps {
  state: ManageAaveStateMachineState
  send: Sender<ManageAaveEvent>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SidebarManageAaveVaultEditingState(props: ManageAaveEditingStateProps) {
  // const { state } = props
  // const { t } = useTranslation()

  return <></>

  // return (
  //   <Grid gap={3}>
  //     <VaultActionInput
  //       action={'Deposit'}
  //       amount={state.context.amount}
  //       hasAuxiliary={true}
  //       auxiliaryAmount={state.context.auxiliaryAmount}
  //       hasError={false}
  //       maxAmount={state.context.tokenBalance}
  //       showMax={true}
  //       maxAmountLabel={t('balance')}
  //       onChange={handleNumericInput(() => {
  //         // if (amount) {
  //         //   send({ type: 'SET_AMOUNT', amount })
  //         // }
  //       })}
  //       currencyCode={state.context.token!}
  //       disabled={false}
  //       tokenUsdPrice={new BigNumber(10)}
  //     />
  //   </Grid>
  // )
}
