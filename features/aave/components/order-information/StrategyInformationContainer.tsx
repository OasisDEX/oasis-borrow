import React from 'react'
import { IMultiplyStrategy, IPosition, IStrategy } from '@oasisdex/dma-library'
import { VaultChangesInformationContainer } from 'components/vault/VaultChangesInformation'
import { FeesInformation } from 'features/aave/components/order-information/FeesInformation'
import { LtvInformation } from 'features/aave/components/order-information/LtvInformation'
import { MultiplyInformation } from 'features/aave/components/order-information/MultiplyInformation'
import {
  OutstandingDebtInformation,
  TotalCollateralInformation,
} from 'features/aave/components/order-information/OutstandingDebtInformation'
import { PriceImpact } from 'features/aave/components/order-information/PriceImpact'
import { SlippageInformation } from 'features/aave/components/order-information/SlippageInformation'
import { TransactionTokenAmount } from 'features/aave/components/order-information/TransactionTokenAmount'
import { getSlippage, ProductType, StrategyTokenBalance } from 'features/aave/types'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { HasGasEstimation } from 'helpers/context/types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

export type OpenAaveInformationContainerProps = {
  state: {
    context: {
      tokens: {
        debt: string
        collateral: string
        deposit: string
      }
      balance?: StrategyTokenBalance
      estimatedGasPrice?: HasGasEstimation
      transition?: IStrategy
      userSettings?: UserSettingsState
      currentPosition?: IPosition
      strategyConfig: IStrategyConfig
      getSlippageFrom: 'strategyConfig' | 'userSettings'
    }
  }
  changeSlippageSource: (from: 'strategyConfig' | 'userSettings') => void
}

function transitionHasSwap(
  transition?: IMultiplyStrategy | IStrategy,
): transition is IMultiplyStrategy {
  return (
    !!transition && (transition.simulation as IMultiplyStrategy['simulation']).swap !== undefined
  )
}

export function StrategyInformationContainer({
  state,
  changeSlippageSource,
}: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { transition, currentPosition, balance, strategyConfig } = state.context

  const simulationHasSwap =
    transitionHasSwap(transition) && transition?.simulation.swap?.toTokenAmount.gt(zero)

  const shouldShowMultiplyInformation = strategyConfig.type !== ProductType.Borrow

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
        <PriceImpact
          {...state.context}
          transactionParameters={transition}
          slippage={getSlippage(state.context)}
        />
      )}
      {simulationHasSwap && (
        <SlippageInformation
          slippage={getSlippage(state.context)}
          isStrategyHasSlippage={state.context.strategyConfig.defaultSlippage !== undefined}
          getSlippageFrom={state.context.getSlippageFrom}
          changeSlippage={changeSlippageSource}
        />
      )}
      {shouldShowMultiplyInformation && (
        <MultiplyInformation
          {...state.context}
          transactionParameters={transition}
          currentPosition={currentPosition}
        />
      )}
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
