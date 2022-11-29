import { IPosition, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useAppContext } from '../../../../../components/AppContextProvider'
import { VaultChangesInformationContainer } from '../../../../../components/vault/VaultChangesInformation'
import { WithLoadingIndicator } from '../../../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../../../helpers/errorHandlers/WithErrorHandler'
import { HasGasEstimation } from '../../../../../helpers/form'
import { useObservable } from '../../../../../helpers/observableHook'
import { zero } from '../../../../../helpers/zero'
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
      collateralToken: string
      token: string
      collateralPrice?: BigNumber
      tokenPrice?: BigNumber
      estimatedGasPrice?: HasGasEstimation
      strategy?: IStrategy
      userSettings?: UserSettingsState
      currentPosition?: IPosition
    }
  }
}

export function StrategyInformationContainer({ state }: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()

  const { strategy, currentPosition, token } = state.context
  const sourceTokenFee = strategy?.simulation?.swap?.sourceTokenFee || zero
  const targetTokenFee = strategy?.simulation?.swap?.targetTokenFee || zero
  const swapFee = sourceTokenFee.plus(targetTokenFee)
  const { convertToAaveOracleAssetPrice$ } = useAppContext()

  const [feeInDebtToken, feeInDebtTokenError] = useObservable(
    convertToAaveOracleAssetPrice$({ token, amount: swapFee }),
  )

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
        {...state.context}
        transactionParameters={strategy}
        currentPosition={currentPosition}
        debtToken={state.context.token}
      />
      <LtvInformation
        {...state.context}
        transactionParameters={strategy}
        currentPosition={currentPosition}
      />
      <WithErrorHandler error={feeInDebtTokenError}>
        <WithLoadingIndicator value={feeInDebtToken}>
          {(feeInDebtToken) => {
            return (
              <FeesInformation
                debtToken={token}
                feeInDebtToken={feeInDebtToken}
                estimatedGasPrice={state.context.estimatedGasPrice}
              />
            )
          }}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </VaultChangesInformationContainer>
  ) : (
    <></>
  )
}
