import type {
  MigrateAaveEvent,
  MigrateAaveStateMachine,
} from 'features/aave/manage/state/migrateAaveStateMachine'
import type { Sender, StateFrom } from 'xstate'

export interface MigrateAaveStateProps {
  readonly state: StateFrom<MigrateAaveStateMachine>
  readonly send: Sender<MigrateAaveEvent>
  isLoading: () => boolean
  isLocked: (state: StateFrom<MigrateAaveStateMachine>) => boolean
}
