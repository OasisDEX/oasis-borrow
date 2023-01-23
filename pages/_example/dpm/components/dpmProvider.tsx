import { useInterpret } from '@xstate/react'
import React from 'react'
import { from, Subject } from 'rxjs'
import { createMachine, send } from 'xstate'

import { UserDpmAccount } from '../../../../blockchain/userDpmProxies'
import { useAaveContext } from '../../../../features/aave/AaveContextProvider'
import { DPMAccountStateMachine } from '../../../../features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'

const dpmContext = React.createContext<ReturnType<typeof setupDpmContext> | undefined>(undefined)

// This is the easiest solution to deal with `sendParent` in machines.
// We create a dummy parent machine that will send all events from the child machine.
// We can subscribe to the events and react to them.
// Another Solution:
//  1. Change `sendParent` to send and:.
//    a. in `getOpenAaveStateMachine.ts` override the sendResultToParent function to `sendParent` instead of `send`
//    b. don't use `spawn` and pass a service (using for example: useInterpret) to getOpenStateMachine and react to `DPM_ACCOUNT_CREATED` event
const dummyParent = createMachine({
  schema: {
    events: {} as any,
    context: {} as {},
  },
  id: 'parent',
  initial: 'idle',
  states: {
    idle: {},
  },
  on: {
    '*': {
      actions: (context, event) => send({ ...event }),
    },
  },
})

function setupDpmContext(machine: DPMAccountStateMachine) {
  const createdDpmAccount = new Subject<UserDpmAccount>()
  const parentService = useInterpret(dummyParent)
    .start()
    .onEvent((event) => {
      if (event.type === 'DPM_ACCOUNT_CREATED') {
        // @ts-ignore
        createdDpmAccount.next(event.userDpmAccount)
      }
    })

  const service = useInterpret(machine, { parent: parentService }).start()

  const states$ = from(service)
  return {
    stateMachine: service,
    states$,
    dpmAccounts$: createdDpmAccount.asObservable(),
  }
}

export function useDpmContext(): ReturnType<typeof setupDpmContext> {
  const ac = React.useContext(dpmContext)
  if (!ac) {
    throw new Error('DpmContext not available!')
  }
  return ac
}

export function DpmContextProvider({ children }: React.PropsWithChildren<any>) {
  const { dpmAccountStateMachine } = useAaveContext()
  const context = setupDpmContext(dpmAccountStateMachine)
  return <dpmContext.Provider value={context}>{children}</dpmContext.Provider>
}
