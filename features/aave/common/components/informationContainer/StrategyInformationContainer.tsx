import { IPosition, IPositionTransition, ISimplePositionTransition } from '@oasisdex/oasis-actions'
import { transitionHasSwap } from 'actions/aave/oasisActionsLibWrapper'
import { VaultChangesInformationContainer } from 'components/vault/VaultChangesInformation'
import { getSlippage, StrategyTokenBalance } from 'features/aave/common/BaseAaveContext'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
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
      transition?: IPositionTransition | ISimplePositionTransition
      userSettings?: UserSettingsState
      currentPosition?: IPosition
      strategyConfig: IStrategyConfig
      getSlippageFrom: 'strategyConfig' | 'userSettings'
    }
  }
  changeSlippageSource: (from: 'strategyConfig' | 'userSettings') => void
}

export function StrategyInformationContainer({
  state,
  changeSlippageSource,
}: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { transition, currentPosition, balance } = state.context

  const simulationHasSwap =
    transitionHasSwap(transition) && transition?.simulation.swap?.toTokenAmount.gt(zero)

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
      {simulationHasSwap && (
        <SlippageInformation
          slippage={getSlippage(state.context)}
          isStrategyHasSlippage={state.context.strategyConfig.defaultSlippage !== undefined}
          getSlippageFrom={state.context.getSlippageFrom}
          changeSlippage={changeSlippageSource}
        />
      )}
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
      {simulationHasSwap && (
        <FeesInformation
          swap={transition.simulation.swap}
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
