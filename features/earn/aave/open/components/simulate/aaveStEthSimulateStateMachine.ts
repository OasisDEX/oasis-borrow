import BigNumber from 'bignumber.js'
import { AnyEventObject, assign, createMachine } from 'xstate'

import { assertEventType } from '../../../../../../utils/xstate'
import { AaveStEthYieldsResponse } from '../../../services/stEthYield'

interface AaveStEthSimulateStateMachineContext {
  yields?: AaveStEthYieldsResponse
  token?: string
  amount?: BigNumber
  multiply?: BigNumber
  transactionFee?: BigNumber
  oazoFee?: BigNumber
}

type AaveStEthSimulateStateMachineEvents =
  | AnyEventObject
  | { type: 'TOKEN_CHANGED'; token: string }
  | { type: 'AMOUNT_CHANGED'; amount: BigNumber }
  | { type: 'MULTIPLY_CHANGED'; multiply: BigNumber }
  | { type: 'YIELD_RECEIVED'; yields: AaveStEthYieldsResponse }
  | { type: 'TRANSACTION_FEE_CHANGED'; transactionFee: BigNumber }
  | { type: 'OAZO_FEE_CHANGED'; oazoFee: BigNumber }

export const aaveStEthSimulateStateMachine = createMachine(
  {
    id: 'aaveStEthSimulate',
    initial: 'idle',
    context: {},
    schema: {
      services: {} as {
        getYields: {
          data: AaveStEthYieldsResponse
        }
      },
    },
    states: {
      idle: {
        on: {},
      },
    },
  },
  {
    actions: {
      assignYields: assign<
        AaveStEthSimulateStateMachineContext,
        AaveStEthSimulateStateMachineEvents
      >((ctx, event) => {
        assertEventType(event, 'YIELD_RECEIVED')
        return {
          yields: event.yields,
        }
      }),
    },
  },
)
