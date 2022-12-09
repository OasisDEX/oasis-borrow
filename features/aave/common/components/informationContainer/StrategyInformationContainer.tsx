import { IPosition, IPositionTransition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesInformationContainer } from '../../../../../components/vault/VaultChangesInformation'
import { HasGasEstimation } from '../../../../../helpers/form'
import { UserSettingsState } from '../../../../userSettings/userSettings'
import { FeesInformation } from './FeesInformation'
import { LtvInformation } from './LtvInformation'
import { MultiplyInformation } from './MultiplyInformation'
import { OutstandingDebtInformation } from './OutstandingDebtInformation'
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
      strategy?: IPositionTransition
      userSettings?: UserSettingsState
      currentPosition?: IPosition
    }
  }
}

export function StrategyInformationContainer({ state }: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { strategy, currentPosition } = state.context

  return strategy && currentPosition ? (
    <VaultChangesInformationContainer title={t('vault-changes.order-information')}>
      <TransactionTokenAmount {...state.context} transactionParameters={strategy} />
      <PriceImpact {...state.context} transactionParameters={strategy} />
      <SlippageInformation {...state.context.userSettings!} />
      <MultiplyInformation
        {...state.context}
        transactionParameters={strategy}
        currentPosition={currentPosition}
      />
      <OutstandingDebtInformation
        currentPosition={currentPosition}
        newPosition={strategy.simulation.position}
      />
      <LtvInformation
        {...state.context}
        transactionParameters={strategy}
        currentPosition={currentPosition}
      />
      <FeesInformation
        swap={strategy.simulation.swap}
        estimatedGasPrice={state.context.estimatedGasPrice}
      />
    </VaultChangesInformationContainer>
  ) : (
    <></>
  )
}
