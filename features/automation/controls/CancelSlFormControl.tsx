import { TxState, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { networksById } from 'blockchain/config'
import { IlkDataList } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { ethers } from 'ethers'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError, useUIChanges } from 'helpers/observableHook'
import { FixedSizeArray } from 'helpers/types'
import { useEffect, useState } from 'react'
import React from 'react'

import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { TriggersTypes } from '../common/enums/TriggersTypes'
import { extractSLData, isTxStatusFailed, isTxStatusFinal, prepareTriggerData, StopLossTriggerData } from '../common/StopLossTriggerDataExtractor'
import { AddFormChange } from '../common/UITypes/AddFormChange'
import { CancelSlFormLayout, CancelSlFormLayoutProps } from './CancelSlFormLayout'



function prepareRemoveTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
): AutomationBotRemoveTriggerData {

  const baseTriggerData = prepareTriggerData(vaultData, isCloseToCollateral, stopLossLevel)
  
  return {
    ...baseTriggerData,
    kind: TxMetaKind.removeTrigger
  }
}

export function CancelSlFormControl({ id }: { id: BigNumber }) {
  const uiSubjectName = 'AdjustSlForm'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const [collateralActive, setCloseToCollateral] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))
  //const [txLoderCompletedHandler, setTxHandler] = useState<(succeded : boolean) => void>();

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

  type Action =
    | { type: 'stop-loss'; stopLoss: BigNumber }
    | { type: 'close-type'; toCollateral: boolean }

  function reducerHandler(state: AddFormChange, action: Action): AddFormChange {
    switch (action.type) {
      case 'stop-loss':
        return { ...state, selectedSLValue: action.stopLoss }
      case 'close-type':
        return { ...state, collateralActive: action.toCollateral }
    }
  }

  function renderLayout(
    vaultData: Vault,
    collateralPriceData: CollateralPricesWithFilters,
    ilksData: IlkDataList,
    slTriggerData: StopLossTriggerData,
    txHelpers: TxHelpers,
    isOwner: boolean,
  ) {
    const token = vaultData.token
    const tokenData = getToken(token)
    const currentIlkData = ilksData.filter((x) => x.ilk === vaultData.ilk)[0]
    const currentCollateralData = collateralPriceData.data.filter(
      (x) => x.token === vaultData.token,
    )[0]
    const startingSlRatio = slTriggerData.isStopLossEnabled
      ? slTriggerData.stopLossLevel
      : currentIlkData.liquidationRatio

    const currentCollRatio = vaultData.lockedCollateral
      .multipliedBy(currentCollateralData.currentPrice)
      .dividedBy(vaultData.debt)

    const startingAfterNewLiquidationPrice = currentCollateralData.currentPrice
      .multipliedBy(startingSlRatio)
      .dividedBy(currentCollRatio)

    const [afterNewLiquidationPrice, setAfterLiqPrice] = useState(
      new BigNumber(startingAfterNewLiquidationPrice),
    )

    const initial: AddFormChange = {
      collateralActive: false,
      selectedSLValue: new BigNumber(currentCollRatio),
    }

    const dispatch = useUIChanges(reducerHandler, initial, uiSubjectName)

    const [txStatus, txStatusSetter] = useState<TxState<AutomationBotRemoveTriggerData> | undefined>(
      undefined,
    )

    const maxBoundry =
      currentCollRatio.isNaN() || !currentCollRatio.isFinite() ? new BigNumber(5) : currentCollRatio

    const liqRatio = currentIlkData.liquidationRatio

    //set proper defaults
    useEffect(() => {
      setSelectedSLValue(startingSlRatio.multipliedBy(100))
    }, [])

    const removeTriggerConfig: RetryableLoadingButtonProps = {
      translationKey: 'cancel-stop-loss',
      onClick: (finishLoader: (succeded: boolean) => void) => {
        //TODO: this tx handler can be more generic and reused
        const txSendSuccessHandler = (x: TxState<AutomationBotRemoveTriggerData>) => {
          txStatusSetter(x)
          if (isTxStatusFinal(x.status)) {
            if (isTxStatusFailed(x.status)) {
              finishLoader(false)
              waitForTx.unsubscribe()
              txStatusSetter(undefined)
            } else {
              finishLoader(true)
              waitForTx.unsubscribe()
              txStatusSetter(undefined)
            }
          }
        }

        const sendTxErrorHandler = () => {
          finishLoader(false)
        }

        const txData = prepareRemoveTriggerData(vaultData, collateralActive, selectedSLValue)

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
          return renderLayout(vault, collateralPrice, ilksData, extractSLData(triggerData), tx, ctx.account !== vault.controller)
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
