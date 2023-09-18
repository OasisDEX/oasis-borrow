import { IMultiplyStrategy, IPosition, IStrategy } from '@oasisdex/dma-library'
import { VaultChangesInformationContainer } from 'components/vault/VaultChangesInformation'
import { useAaveLikeConfig } from 'features/aave/hooks'
import { getSlippage, ProductType, StrategyTokenBalance } from 'features/aave/types'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { HasGasEstimation } from 'helpers/context/types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { FeesInformation } from './FeesInformation'
import { FlashLoanInformation } from './FlashLoanInformation'
import { LtvInformation } from './LtvInformation'
import { MultiplyInformation } from './MultiplyInformation'
import {
  OutstandingDebtInformation,
  TotalCollateralInformation,
} from './OutstandingDebtInformation'
import { PriceImpact } from './PriceImpact'
import { SlippageInformation } from './SlippageInformation'
import { TransactionTokenAmount } from './TransactionTokenAmount'

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

function isMultiplyStrategy(transition?: IStrategy): transition is IMultiplyStrategy {
  return !!transition && (transition as IMultiplyStrategy).flashloan !== undefined
}

export function StrategyInformationContainer({
  state,
  changeSlippageSource,
}: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { orderInformation: orderInformationConfig } = useAaveLikeConfig()

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
      {isMultiplyStrategy(transition) && orderInformationConfig.showFlashloanInformation && (
        <FlashLoanInformation
          transactionParameters={transition}
          networkId={state.context.strategyConfig.networkId}
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
