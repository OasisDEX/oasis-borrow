import { IPosition, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { amountFromWei } from '../../../../../blockchain/utils'
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
      tokens: {
        debt: string
        collateral: string
        deposit: string
      }
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

  const { strategy, currentPosition, tokens } = state.context
  const debtToken = tokens.debt
  const sourceTokenFee = strategy?.simulation?.swap?.sourceTokenFee || zero
  const targetTokenFee = strategy?.simulation?.swap?.targetTokenFee || zero
  const swapFee = sourceTokenFee.plus(targetTokenFee)
  const { convertToAaveOracleAssetPrice$ } = useAaveContext()

  const [feeInDebtToken, feeInDebtTokenError] = useObservable(
    convertToAaveOracleAssetPrice$({
      token: debtToken,
      amount: swapFee,
    }),
  )

  const [currentDebtInDebtToken, currentDebtInDebtTokenError] = useObservable(
    convertToAaveOracleAssetPrice$({
      token: debtToken,
      amount: amountFromWei(
        currentPosition?.debt.amount || zero,
        currentPosition?.debt.denomination || 'ETH',
      ),
    }),
  )

  const [afterDebtInDebtToken, afterDebtInDebtTokenError] = useObservable(
    convertToAaveOracleAssetPrice$({
      token: debtToken,
      amount: amountFromWei(
        strategy?.simulation.position.debt.amount || zero,
        strategy?.simulation.position.debt.denomination || 'ETH',
      ),
    }),
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
      <WithErrorHandler error={[currentDebtInDebtTokenError, afterDebtInDebtTokenError]}>
        <WithLoadingIndicator value={[currentDebtInDebtToken, afterDebtInDebtToken]}>
          {([currentDebtInDebtToken, afterDebtInDebtToken]) => (
            <OutstandingDebtInformation
              currentDebtInDebtToken={currentDebtInDebtToken}
              afterDebtInDebtToken={afterDebtInDebtToken}
              debtToken={state.context.tokens.debt}
            />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
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
                debtToken={debtToken}
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
