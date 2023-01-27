import { useInterpret } from '@xstate/react'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { from, Subject } from 'rxjs'
import { createMachine, send } from 'xstate'

export const dummyParent = createMachine({
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

export function setupDpmContext(machine: DPMAccountStateMachine) {
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
