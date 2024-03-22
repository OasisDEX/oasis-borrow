import { useActor } from '@xstate/react'
import { amountFromWei } from 'blockchain/utils'
import { LackOfFlashloanLiquidityModal } from 'features/aave/components/LackOfFlashloanLiquidityModal'
import type { ManageAaveContext } from 'features/aave/manage/state'
import type { MigrateAaveStateMachine } from 'features/aave/manage/state/migrateAaveStateMachine'
import { CreateDPMAccountView } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import { allDefined } from 'helpers/allDefined'
import { useBalancerVaultLiquidity } from 'helpers/hooks'
import { useModalContext } from 'helpers/modalHook'
import React, { useEffect, useMemo } from 'react'
import type { ActorRefFrom, StateFrom } from 'xstate'

import { MigrateAaveFailureStateView } from './MigrateAaveFailureStateView'
import { MigrateAaveSuccessStateView } from './MigrateAaveSuccessStateView'
import { MigrateAllowanceFailureStateView } from './MigrateAllowanceFailureStateView'
import { MigrateStartAllowanceStateView } from './MigrateStartAllowanceStateView'
import { MigrateWelcomeStateView } from './MigrateWelcomeStateView'
import { MigrationInProgressStateView } from './MigrationInProgressStateView'
import { MigrateStateView } from './StartMigrateStateView'

export interface SidebarMigrateAaveVaultProps {
  context: ManageAaveContext & {
    refMigrationMachine: ActorRefFrom<MigrateAaveStateMachine>
  }
}

export function isLocked(state: StateFrom<MigrateAaveStateMachine>) {
  const { positionOwner, web3Context } = state.context

  return !(allDefined(positionOwner, web3Context) && positionOwner === web3Context!.account)
}

function SidebarMigrationAaveVaultStatesView({ context }: SidebarMigrateAaveVaultProps) {
  const [migrationState, send] = useActor(context.refMigrationMachine)
  const isLoading = () => {
    return migrationState.matches('background.loading')
  }

  if (migrationState.matches('frontend.idle')) {
    return (
      <MigrateWelcomeStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  if (migrationState.matches('frontend.review')) {
    return (
      <MigrateStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  if (
    migrationState.matches('frontend.dpmProxyCreating') &&
    migrationState.context.refDpmAccountMachine
  ) {
    return <CreateDPMAccountView machine={migrationState.context.refDpmAccountMachine} />
  }
  if (migrationState.matches('frontend.allowanceReview')) {
    return (
      <MigrateStartAllowanceStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  if (migrationState.matches('frontend.allowanceSetting')) {
    return (
      <MigrateStartAllowanceStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  if (migrationState.matches('frontend.allowanceFailure')) {
    return (
      <MigrateAllowanceFailureStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  if (migrationState.matches('frontend.txInProgressEthers')) {
    return (
      <MigrationInProgressStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  if (migrationState.matches('frontend.txFailure')) {
    return (
      <MigrateAaveFailureStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  if (migrationState.matches('frontend.txSuccess')) {
    return (
      <MigrateAaveSuccessStateView
        state={migrationState}
        send={send}
        isLoading={isLoading}
        isLocked={isLocked}
      />
    )
  }
  return <></>
}

export function SidebarMigrateAaveVault({ context }: SidebarMigrateAaveVaultProps) {
  const flashloanLiquidity = useBalancerVaultLiquidity({
    tokenSymbol: context.strategyConfig.tokens.collateral,
    networkId: context.strategyConfig.networkId,
  })

  const { openModal } = useModalContext()

  const collateralAmount = context.currentPosition?.collateral.amount

  const shouldShowLiquidityModal = useMemo(() => {
    if (flashloanLiquidity === null || collateralAmount === undefined) {
      return false
    }
    const collateralToCheck = amountFromWei(
      collateralAmount,
      context.strategyConfig.tokens.collateral,
    )
    return collateralToCheck.gte(flashloanLiquidity)
  }, [flashloanLiquidity, collateralAmount, context.strategyConfig.tokens.collateral])

  useEffect(() => {
    if (shouldShowLiquidityModal) {
      openModal(LackOfFlashloanLiquidityModal, {})
    }
  }, [openModal, shouldShowLiquidityModal])

  return (
    <>
      <SidebarMigrationAaveVaultStatesView context={context} />
    </>
  )
}
