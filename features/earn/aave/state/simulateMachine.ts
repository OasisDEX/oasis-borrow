import { createMachine } from 'xstate'

export const simulateMachine = createMachine({
  tsTypes: {} as import('./simulateMachine.typegen').Typegen0,
  id: 'SimulateSectio',
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        AmountChanged: {
          target: 'Calculating',
        },
        TokenChanged: {
          target: 'Calculating',
        },
      },
    },
    Calculating: {
      invoke: {
        src: 'calculateService',
        id: 'calculateService',
        onDone: [
          {
            target: 'Idle',
          },
        ],
      },
    },
  },
})
