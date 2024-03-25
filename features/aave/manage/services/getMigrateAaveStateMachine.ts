import type { MigrateAaveLikeParameters } from 'actions/aave-like'
import type {
  MigrateAaveStateMachine,
  MigrateAaveStateMachineServices,
} from 'features/aave/manage/state/migrateAaveStateMachine'
import { createMigrateAaveStateMachine } from 'features/aave/manage/state/migrateAaveStateMachine'
import type { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import type { TransactionParametersV2StateMachine } from 'features/stateMachines/transactionParameters'

export function getMigrateAaveStateMachine(
  services: MigrateAaveStateMachineServices,
  migratePositionStateMachine: TransactionParametersV2StateMachine<MigrateAaveLikeParameters>,
  dpmProxyMachine: DPMAccountStateMachine,
): MigrateAaveStateMachine {
  return createMigrateAaveStateMachine(migratePositionStateMachine, dpmProxyMachine).withConfig({
    services: {
      ...services,
    },
  })
}
