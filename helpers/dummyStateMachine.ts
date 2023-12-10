import { useInterpret } from '@xstate/react'
import type { NetworkIds } from 'blockchain/networks'
import type { ethers } from 'ethers'
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

export function setupDpmContext(machine: DPMAccountStateMachine, networkId: NetworkIds) {
  const parentService = useInterpret(dummyParent).start()
  const service = useInterpret(machine, {
    parent: parentService,
    context: {
      runWithEthers: true,
      networkId,
    },
  }).start()
  return {
    stateMachine: service,
  }
}

export function setupAllowanceContext(
  machine: AllowanceStateMachine,
  networkId: NetworkIds,
  signer?: ethers.Signer,
  token?: string,
) {
  const parentService = useInterpret(machine).start()
  const service = useInterpret(machine, {
    parent: parentService,
    context: {
      minimumAmount: zero,
      token,
      runWithEthers: true,
      networkId,
      signer,
    },
  }).start()

  // update signer which is initially undefined
  service.send('SET_ALLOWANCE', { signer })
  return {
    stateMachine: service,
  }
}
