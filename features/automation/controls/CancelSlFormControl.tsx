import { TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkDataList } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { useState } from 'react'
import React from 'react'

import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import {
  determineProperDefaults,
  extractSLData,
  prepareTriggerData,
  StopLossTriggerData,
} from '../common/StopLossTriggerDataExtractor'
import { CancelSlFormLayout, CancelSlFormLayoutProps } from './CancelSlFormLayout'

function prepareRemoveTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  triggerId: number,
): AutomationBotRemoveTriggerData {
  const baseTriggerData = prepareTriggerData(vaultData, isCloseToCollateral, stopLossLevel)

  return {
    ...baseTriggerData,
    kind: TxMetaKind.removeTrigger,
    triggerId,
  }
}

export function CancelSlFormControl({ id }: { id: BigNumber }) {
  const [collateralActive] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))

  const {
    vault$,
    collateralPrices$,
    ilkDataList$,
    automationTriggersData$,
    txHelpers$,
    connectedContext$,
  } = useAppContext()

  const autoTriggersData$ = automationTriggersData$(id)

  const vaultDataWithError = useObservableWithError(vault$(id))
  const collateralPricesWithError = useObservableWithError(collateralPrices$)
  const ilksDataWithError = useObservableWithError(ilkDataList$)
  const autoTriggerDataWithError = useObservableWithError(autoTriggersData$)
  const txHelpersWithError = useObservableWithError(txHelpers$)
  const contextWithError = useObservableWithError(connectedContext$)

  function renderLayout(
    vaultData: Vault,
    collateralPriceData: CollateralPricesWithFilters,
    ilksData: IlkDataList,
    slTriggerData: StopLossTriggerData,
    txHelpers: TxHelpers,
    isOwner: boolean,
  ) {
    const currentIlkData = ilksData.filter((x) => x.ilk === vaultData.ilk)[0]

    const startingSlRatio = slTriggerData.isStopLossEnabled
      ? slTriggerData.stopLossLevel
      : currentIlkData.liquidationRatio
    const [txStatus, txStatusSetter] = useState<
      TxState<AutomationBotRemoveTriggerData> | undefined
    >()

    determineProperDefaults(setSelectedSLValue, startingSlRatio)

    const removeTriggerConfig: RetryableLoadingButtonProps = {
      translationKey: 'cancel-stop-loss',
      onClick: (finishLoader: (succeded: boolean) => void) => {
        const txSendSuccessHandler = (transactionState: TxState<AutomationBotRemoveTriggerData>) =>
          transactionStateHandler(txStatusSetter, transactionState, finishLoader, waitForTx)

        const sendTxErrorHandler = () => {
          finishLoader(false)
        }
        const txData = prepareRemoveTriggerData(
          vaultData,
          collateralActive,
          selectedSLValue,
          slTriggerData.triggerId,
        )
        
        const waitForTx = txHelpers
          .sendWithGasEstimation(removeAutomationBotTrigger, txData)
          .subscribe(txSendSuccessHandler, sendTxErrorHandler)
      },
      isLoading: false,
      isRetry: false,
      disabled: isOwner,
    }

    const props: CancelSlFormLayoutProps = {
      liquidationPrice: vaultData.liquidationPrice,
      removeTriggerConfig: removeTriggerConfig,
      txState: txStatus,
    }

    return <CancelSlFormLayout {...props} />
  }

  return (
    <WithErrorHandler
      error={[
        vaultDataWithError.error,
        collateralPricesWithError.error,
        ilksDataWithError.error,
        autoTriggerDataWithError.error,
        txHelpersWithError.error,
        contextWithError.error,
      ]}
    >
      <WithLoadingIndicator
        value={[
          vaultDataWithError.value,
          collateralPricesWithError.value,
          ilksDataWithError.value,
          autoTriggerDataWithError.value,
          txHelpersWithError.value,
          contextWithError.value,
        ]}
        customLoader={<VaultContainerSpinner />}
      >
        {([vault, collateralPrice, ilksData, triggerData, tx, ctx]) => {
          return renderLayout(
            vault,
            collateralPrice,
            ilksData,
            extractSLData(triggerData),
            tx,
            ctx.account !== vault.controller,
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
