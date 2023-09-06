import { useInterpret } from '@xstate/react'
import { NetworkIds } from 'blockchain/networks'
import { AllowanceStateMachine } from 'features/stateMachines/allowance'
import { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { zero } from 'helpers/zero'
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
