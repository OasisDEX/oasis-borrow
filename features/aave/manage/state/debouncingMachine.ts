import { actions, createMachine } from 'xstate'
const { assign, sendTo } = actions

type InvokeServiceEvent<TRequest = unknown> = {
  type: 'INVOKE_ACTION'
  params: TRequest
}

const isInvokeServiceEvent = <TRequest = unknown>(
  event: unknown,
): event is InvokeServiceEvent<TRequest> =>
  typeof event === 'object' && event !== null && 'type' in event && event.type === 'INVOKE_ACTION'

export const createDebouncingMachine = <TRequest = unknown, TResponse = never>(
  action: (params: TRequest) => Promise<TResponse>,
  debounceTime: number = 1000,
) =>
  createMachine(
    {
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./debouncingMachine.typegen').Typegen0,
      id: 'debouncingMachine',
      preserveActionOrder: true,
      predictableActionArguments: true,
      schema: {
        context: {} as {
          loading: boolean
          currentRequest: TRequest | null
          action: (params: TRequest) => Promise<TResponse>
          currentResponse: TResponse | null
        },
        events: {} as
          | {
              type: 'REQUEST_UPDATED'
              request: TRequest
            }
          | { type: 'REQUEST_FINISH'; response: TResponse }
          | { type: 'INVOKE_ACTION'; params: TRequest },
      },
      context: {
        loading: false,
        currentRequest: null,
        action,
        currentResponse: null,
      },
      initial: 'idle',
      invoke: [
        {
          src: 'invokeService',
          id: 'invokeService',
        },
      ],
      states: {
        idle: {},
        debouncing: {
          after: {
            DEBOUNCE_TIME: 'loading',
          },
        },
        loading: {
          entry: ['setLoading', 'sendToService'],
          exit: ['setIdle'],
          on: {
            REQUEST_FINISH: {
              actions: ['updateResponse'],
              target: 'idle',
            },
          },
        },
      },
      on: {
        REQUEST_UPDATED: {
          target: 'debouncing',
          actions: ['updateRequest'],
        },
      },
    },
    {
      actions: {
        setIdle: assign(() => ({
          loading: false,
        })),
        updateRequest: assign({
          currentRequest: (_, event) => event.request,
        }),
        updateResponse: assign({
          currentResponse: (_, event) => event.response,
        }),
        setLoading: assign(() => ({
          loading: true,
        })),
        sendToService: sendTo('invokeService', (context) => ({
          type: 'INVOKE_ACTION',
          params: context.currentRequest,
        })),
      },
      services: {
        invokeService: (context) => (callback, onReceive) => {
          onReceive(async (event) => {
            if (isInvokeServiceEvent<TRequest>(event)) {
              const result = await context.action(event.params)
              callback({
                type: 'REQUEST_FINISH',
                response: result,
              })
            }
          })
        },
      },
      delays: {
        DEBOUNCE_TIME: debounceTime,
      },
    },
  )
