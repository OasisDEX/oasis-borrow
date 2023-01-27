import { IPosition, IPositionTransition, ISimplePositionTransition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesInformationContainer } from '../../../../../components/vault/VaultChangesInformation'
import { HasGasEstimation } from '../../../../../helpers/form'
import { zero } from '../../../../../helpers/zero'
import { UserSettingsState } from '../../../../userSettings/userSettings'
import { FeesInformation } from './FeesInformation'
import { LtvInformation } from './LtvInformation'
import { MultiplyInformation } from './MultiplyInformation'
import {
  OutstandingDebtInformation,
  TotalCollateralInformation,
} from './OutstandingDebtInformation'
import { PriceImpact } from './PriceImpact'
import { SlippageInformation } from './SlippageInformation'
import { TransactionTokenAmount } from './TransactionTokenAmount'
import { transitionHasSwap } from '../../../oasisActionsLibWrapper'

type OpenAaveInformationContainerProps = {
  state: {
    context: {
      tokens: {
        debt: string
        collateral: string
        deposit: string
      }
      collateralPrice?: BigNumber
      tokenPrice?: BigNumber
      estimatedGasPrice?: HasGasEstimation
      strategy?: IPositionTransition | ISimplePositionTransition
      userSettings?: UserSettingsState
      currentPosition?: IPosition
    }
  }
}

export function StrategyInformationContainer({ state }: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { strategy, currentPosition } = state.context

  const simulationHasSwap =
    transitionHasSwap(strategy) && strategy?.simulation.swap?.toTokenAmount.gt(zero)

  return strategy && currentPosition ? (
    <VaultChangesInformationContainer title={t('vault-changes.order-information')}>
      {simulationHasSwap && (
        <TransactionTokenAmount {...state.context} transactionParameters={strategy} />
      )}
      {simulationHasSwap && <PriceImpact {...state.context} transactionParameters={strategy} />}
      {simulationHasSwap && <SlippageInformation {...state.context.userSettings!} />}
      <MultiplyInformation
        {...state.context}
        transactionParameters={strategy}
        currentPosition={currentPosition}
      />
      <OutstandingDebtInformation
        currentPosition={currentPosition}
        newPosition={strategy.simulation.position}
      />
      <TotalCollateralInformation
        currentPosition={currentPosition}
        newPosition={strategy.simulation.position}
      />
      <LtvInformation
        {...state.context}
        transactionParameters={strategy}
        currentPosition={currentPosition}
      />
      {simulationHasSwap && (
        <FeesInformation
          swap={strategy.simulation.swap}
          estimatedGasPrice={state.context.estimatedGasPrice}
        />
      )}
      {!simulationHasSwap && (
        <FeesInformation estimatedGasPrice={state.context.estimatedGasPrice} />
      )}
    </VaultChangesInformationContainer>
  ) : (
    <></>
  )
}
