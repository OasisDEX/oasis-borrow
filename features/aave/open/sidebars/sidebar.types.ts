import type { OpenAaveEvent, OpenAaveStateMachine } from 'features/aave/open/state'
import type { Sender, StateFrom } from 'xstate'

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

export interface OpenAaveStateProps {
  readonly state: StateFrom<OpenAaveStateMachine>
  readonly send: Sender<OpenAaveEvent>
  isLoading: () => boolean
}

export interface OpenAaveEditingStateProps {
  state: StateFrom<OpenAaveStateMachine>
  send: Sender<OpenAaveEvent>
}
