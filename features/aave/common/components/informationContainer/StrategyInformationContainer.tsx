import { IPosition, IPositionTransition } from '@oasisdex/oasis-actions'
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
      transition?: IPositionTransition
      userSettings?: UserSettingsState
      currentPosition?: IPosition
    }
  }
}

export function StrategyInformationContainer({ state }: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { transition, currentPosition } = state.context

  const simulationHasSwap = transition?.simulation.swap.toTokenAmount.gt(zero)

  return transition && currentPosition ? (
    <VaultChangesInformationContainer title={t('vault-changes.order-information')}>
      {simulationHasSwap && (
        <TransactionTokenAmount {...state.context} transactionParameters={transition} />
      )}
      {simulationHasSwap && <PriceImpact {...state.context} transactionParameters={transition} />}
      {simulationHasSwap && <SlippageInformation {...state.context.userSettings!} />}
      <MultiplyInformation
        {...state.context}
        transactionParameters={transition}
        currentPosition={currentPosition}
      />
      <OutstandingDebtInformation
        currentPosition={currentPosition}
        newPosition={transition.simulation.position}
      />
      <TotalCollateralInformation
        currentPosition={currentPosition}
        newPosition={transition.simulation.position}
      />
      <LtvInformation
        {...state.context}
        transactionParameters={transition}
        currentPosition={currentPosition}
      />
      <FeesInformation
        swap={transition.simulation.swap}
        estimatedGasPrice={state.context.estimatedGasPrice}
      />
    </VaultChangesInformationContainer>
  ) : (
    <></>
  )
}
