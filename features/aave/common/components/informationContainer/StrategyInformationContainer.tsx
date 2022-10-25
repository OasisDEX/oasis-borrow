import { IPosition, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesInformationContainer } from '../../../../../components/vault/VaultChangesInformation'
import { HasGasEstimation } from '../../../../../helpers/form'
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
      collateralToken: string
      token: string
      collateralPrice?: BigNumber
      tokenPrice?: BigNumber
      estimatedGasPrice?: HasGasEstimation
      transactionParameters?: IStrategy
      slippage: BigNumber
      currentPosition: IPosition
    }
  }
}

export function StrategyInformationContainer({ state }: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { transactionParameters } = state.context

  return transactionParameters ? (
    <VaultChangesInformationContainer title={t('vault-changes.order-information')}>
      <TransactionTokenAmount {...state.context} transactionParameters={transactionParameters} />
      <PriceImpact {...state.context} transactionParameters={transactionParameters} />
      <SlippageInformation {...state.context} />
      <MultiplyInformation {...state.context} transactionParameters={transactionParameters} />
      <OutstandingDebtInformation
        {...state.context}
        transactionParameters={transactionParameters}
      />
      <LtvInformation {...state.context} transactionParameters={transactionParameters} />
      <FeesInformation {...state.context} transactionParameters={transactionParameters} />
    </VaultChangesInformationContainer>
  ) : (
    <></>
  )
}
