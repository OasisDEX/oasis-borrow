import { TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkDataList } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservableWithError, useUIChanges } from 'helpers/observableHook'
import { FixedSizeArray } from 'helpers/types'
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
import { AddFormChange } from '../common/UITypes/AddFormChange'
import { AdjustSlFormLayout, AdjustSlFormLayoutProps } from './AdjustSlFormLayout'

function prepareAddTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  replacedTriggerId: number,
): AutomationBotAddTriggerData {
  const baseTriggerData = prepareTriggerData(vaultData, isCloseToCollateral, stopLossLevel)

  return {
    ...baseTriggerData,
    replacedTriggerId: replacedTriggerId,
    kind: TxMetaKind.addTrigger,
  }
}

export function AdjustSlFormControl({ id }: { id: BigNumber }) {
  const uiSubjectName = 'AdjustSlForm'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const [collateralActive, setCloseToCollateral] = useState(false)
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

    const [txStatus, txStatusSetter] = useState<TxState<AutomationBotAddTriggerData> | undefined>()

    console.log('currentCollRatio')
    console.log(currentCollRatio.toFixed(2))

    const maxBoundry =
      currentCollRatio.isNaN() || !currentCollRatio.isFinite() ? new BigNumber(5) : currentCollRatio

    const liqRatio = currentIlkData.liquidationRatio

    determineProperDefaults(setSelectedSLValue, startingSlRatio)

    const closeProps: PickCloseStateProps = {
      optionNames: validOptions,
      onclickHandler: (optionName: string) => {
        setCloseToCollateral(optionName === validOptions[0])
        dispatch({
          type: 'close-type',
          toCollateral: optionName === validOptions[0],
        })
      },
      isCollateralActive: collateralActive,
      collateralTokenSymbol: token,
      collateralTokenIconCircle: tokenData.iconCircle,
    }

    console.log('maxBoundry')
    console.log(maxBoundry.toFixed(2))

    const sliderProps: SliderValuePickerProps = {
      disabled: false,
      leftBoundry: selectedSLValue,
      rightBoundry: afterNewLiquidationPrice,
      sliderKey: 'set-stoploss',
      lastValue: selectedSLValue,
      leftBoundryFormatter: (x: BigNumber) => formatPercent(x),
      leftBoundryStyling: { fontWeight: 'semiBold', textAlign: 'right' },
      rightBoundryFormatter: (x: BigNumber) => '$ ' + formatAmount(x, 'USD'),
      rightBoundryStyling: { fontWeight: 'semiBold', textAlign: 'right', color: 'primary' },
      step: 0.05,
      maxBoundry: maxBoundry.multipliedBy(100),
      minBoundry: liqRatio.multipliedBy(100),
      onChange: (slCollRatio) => {
        setSelectedSLValue(slCollRatio)
        /*TO DO: this is duplicated and can be extracted*/
        const currentCollRatio = vaultData.lockedCollateral
          .multipliedBy(currentCollateralData.currentPrice)
          .dividedBy(vaultData.debt)
        const computedAfterLiqPrice = slCollRatio
          .dividedBy(100)
          .multipliedBy(currentCollateralData.currentPrice)
          .dividedBy(currentCollRatio)
        /* END OF DUPLICATION */
        setAfterLiqPrice(computedAfterLiqPrice)
        dispatch({
          type: 'stop-loss',
          stopLoss: slCollRatio,
        })
      },
    }

    const replacedTriggerId = slTriggerData.triggerId ? slTriggerData.triggerId : 0
    console.log('slTriggerData')
    console.log(slTriggerData)
    const addTriggerConfig: RetryableLoadingButtonProps = {
      translationKey: 'add-stop-loss',
      onClick: (finishLoader: (succeded: boolean) => void) => {
        const txSendSuccessHandler = (transactionState: TxState<AutomationBotAddTriggerData>) =>
          transactionStateHandler(txStatusSetter, transactionState, finishLoader, waitForTx)
        const sendTxErrorHandler = () => {
          finishLoader(false)
        }
        const txData = prepareAddTriggerData(
          vaultData,
          collateralActive,
          selectedSLValue,
          replacedTriggerId,
        )
        console.log('replacedTriggerId')
        console.log(replacedTriggerId)
        console.log('txData')
        console.log(txData)
        const waitForTx = txHelpers
          .sendWithGasEstimation(addAutomationBotTrigger, txData)
          .subscribe(txSendSuccessHandler, sendTxErrorHandler)
      },
      isLoading: false,
      isRetry: false,
      disabled: isOwner,
    }

    const props: AdjustSlFormLayoutProps = {
      closePickerConfig: closeProps,
      slValuePickerConfig: sliderProps,
      addTriggerConfig: addTriggerConfig,
      txState: txStatus,
    }

    return <AdjustSlFormLayout {...props} />
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
        {([vault, collateralPrice, ilksData, triggerData, tx, ctx]) =>
          renderLayout(
            vault,
            collateralPrice,
            ilksData,
            extractSLData(triggerData),
            tx,
            ctx.account !== vault.controller,
          )
        }
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
