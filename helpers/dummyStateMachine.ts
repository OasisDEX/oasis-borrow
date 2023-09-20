import { useInterpret } from '@xstate/react'
import { NetworkIds } from 'blockchain/networks'
import type { AllowanceStateMachine } from 'features/stateMachines/allowance'
import type { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { createMachine, send } from 'xstate'

import { zero } from './zero'

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
  const parentService = useInterpret(dummyParent).start()
  const service = useInterpret(machine, { parent: parentService }).start()
  return {
    stateMachine: service,
  }
}

export function setupAllowanceContext(machine: AllowanceStateMachine) {
  const parentService = useInterpret(dummyParent).start()
  const service = useInterpret(machine, {
    parent: parentService,
    context: {
      minimumAmount: zero,
      token: 'ETH',
      runWithEthers: false,
      networkId: NetworkIds.MAINNET,
    },
  }).start()
  return {
    stateMachine: service,
  }
}
