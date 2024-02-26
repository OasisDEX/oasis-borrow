import { useActor } from '@xstate/react'
import type { ManageAaveContext } from 'features/aave/manage/state'
import type { MigrateAaveStateMachine } from 'features/aave/manage/state/migrateAaveStateMachine'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountView } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import React from 'react'
import type { ActorRefFrom } from 'xstate'

import { MigrateAaveFailureStateView } from './MigrateAaveFailureStateView'
import { MigrateAaveSuccessStateView } from './MigrateAaveSuccessStateView'
import { MigrateWelcomeStateView } from './MigrateWelcomeStateView'
import { MigrationInProgressStateView } from './MigrationInProgressStateView'
import { MigrateStateView } from './StartMigrateStateView'

export interface SidebarMigrateAaveVaultProps {
  context: ManageAaveContext & {
    refMigrationMachine: ActorRefFrom<MigrateAaveStateMachine>
  }
}

export function SidebarMigrateAaveVault({ context }: SidebarMigrateAaveVaultProps) {
  const [migrationState, send] = useActor(context.refMigrationMachine)

  const isLoading = () => {
    return migrationState.matches('background.loading')
  }

  if (migrationState.matches('frontend.idle')) {
    return <MigrateWelcomeStateView state={migrationState} send={send} isLoading={isLoading} />
  }
  if (migrationState.matches('frontend.review')) {
    return <MigrateStateView state={migrationState} send={send} isLoading={isLoading} />
  }
  if (
    migrationState.matches('frontend.dpmProxyCreating') &&
    migrationState.context.refDpmAccountMachine
  ) {
    return <CreateDPMAccountView machine={migrationState.context.refDpmAccountMachine} />
  }
  if (
    migrationState.matches('frontend.allowanceSetting') &&
    migrationState.context.refAllowanceStateMachine
  ) {
    return <AllowanceView allowanceMachine={migrationState.context.refAllowanceStateMachine} />
  }
  if (migrationState.matches('frontend.txInProgressEthers')) {
    return <MigrationInProgressStateView state={migrationState} send={send} isLoading={isLoading} />
  }
  if (migrationState.matches('frontend.txFailure')) {
    return <MigrateAaveFailureStateView state={migrationState} send={send} isLoading={isLoading} />
  }
  if (migrationState.matches('frontend.txSuccess')) {
    return <MigrateAaveSuccessStateView state={migrationState} send={send} isLoading={isLoading} />
  }
  return <></>
}
