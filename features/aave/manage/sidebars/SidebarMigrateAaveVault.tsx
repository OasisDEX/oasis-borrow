import { useActor } from '@xstate/react'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import type { ManageAaveContext } from 'features/aave/manage/state'
import type {
  MigrateAaveEvent,
  MigrateAaveStateMachine,
} from 'features/aave/manage/state/migrateAaveStateMachine'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountView } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'
import type { ActorRefFrom, Sender, StateFrom } from 'xstate'

export interface SidebarMigrateAaveVaultProps {
  context: ManageAaveContext & {
    refMigrationMachine: ActorRefFrom<MigrateAaveStateMachine>
  }
}

export interface MigrateAaveStateProps {
  readonly state: StateFrom<MigrateAaveStateMachine>
  readonly send: Sender<MigrateAaveEvent>
  isLoading: () => boolean
}

function MigrateStateView({ state, send, isLoading }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const nextStepButton = {
    steps: [state.context.currentStep, state.context.totalSteps] as [number, number],
    isLoading: isLoading(),
    disabled: isLoading() || !state.can('NEXT_STEP'),
    label: t('open-earn.aave.vault-form.confirm-btn'),
    action: () => send('NEXT_STEP'),
  }

  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Migrate',
    content: (
      <Grid gap={3}>
        {/*{withStopLoss && <StopLossTwoTxRequirement typeKey="position" />}*/}
        {/*<StrategyInformationContainer*/}
        {/*  state={state}*/}
        {/*  changeSlippageSource={(from) => {*/}
        {/*    send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })*/}
        {/*  }}*/}
        {/*/>*/}
      </Grid>
    ),
    primaryButton: nextStepButton,
    requireConnection: true,
    requiredChainHexId: state.context.strategyConfig.networkHexId,
  }

  return (
    <ConnectedSidebarSection
      {...sidebarSectionProps}
      textButton={{
        label: t('open-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      }}
      context={state.context}
    />
  )
}

export function SidebarMigrateAaveVault({ context }: SidebarMigrateAaveVaultProps) {
  const [migrationState, send] = useActor(context.refMigrationMachine)

  if (migrationState.matches('frontend.editing')) {
    return <MigrateStateView state={migrationState} send={send} isLoading={() => false} />
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
  return <></>
  // const sidebarSectionProps: SidebarSectionProps = {
  //   title: 'Migrate',
  //   content: (
  //     <Grid gap={3}>
  //       <OpenVaultAnimation />
  //     </Grid>
  //   ),
  //   primaryButton: {
  //     isLoading: true,
  //     disabled: true,
  //     label: 'Start Migration',
  //     action: () => {},
  //   },
  // }
  //
  // return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
