import { IPosition, IPositionTransition } from '@oasisdex/oasis-actions'
import { VaultChangesInformationContainer } from 'components/vault/VaultChangesInformation'
import { StrategyTokenBalance } from 'features/aave/common/BaseAaveContext'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { HasGasEstimation } from 'helpers/form'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

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
      balance?: StrategyTokenBalance
      estimatedGasPrice?: HasGasEstimation
      transition?: IPositionTransition
      userSettings?: UserSettingsState
      currentPosition?: IPosition
    }
  }
}

export function StrategyInformationContainer({ state }: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { transition, currentPosition, balance } = state.context

  const simulationHasSwap = transition?.simulation.swap.toTokenAmount.gt(zero)

  return transition && currentPosition ? (
    <VaultChangesInformationContainer title={t('vault-changes.order-information')}>
      {simulationHasSwap && balance && (
        <TransactionTokenAmount
          {...state.context}
          transactionParameters={transition}
          balance={balance}
        />
      )}
      {simulationHasSwap && balance && (
        <PriceImpact {...state.context} transactionParameters={transition} balance={balance} />
      )}
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
