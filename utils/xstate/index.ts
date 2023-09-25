import type { EventObject } from 'xstate'

/**
 * @see: https://github.com/statelyai/xstate/discussions/1591
 */
export function assertEventType<TE extends EventObject, TType extends TE['type']>(
  event: TE,
  eventType: TType,
): asserts event is TE & { type: TType } {
  if (event.type !== eventType) {
    throw new Error(`Invalid event: expected "${eventType}", got "${event.type}"`)
  }
}

export function assertErrorEvent<TE extends EventObject>(
  event: TE,
): asserts event is TE & { data: unknown } {
  if (!event.type.startsWith('error.platform') && event.type !== 'xstate.error') {
    throw new Error(`Invalid event: expected error invocation, got "${event.type}"`)
  }
}
