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
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useUIChanges } from 'helpers/observableHook'
import { FixedSizeArray } from 'helpers/types'
import React, { useState } from 'react'

import { ContextConnected } from '../../../blockchain/network'
import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import {
  determineProperDefaults,
  extractSLData,
  prepareTriggerData,
  StopLossTriggerData,
} from '../common/StopLossTriggerDataExtractor'
import { AddFormChange } from '../common/UITypes/AddFormChange'
import { TriggersData } from '../triggers/AutomationTriggersData'
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
    replacedTriggerId,
    kind: TxMetaKind.addTrigger,
  }
}

interface AdjustSlFormControlProps {
  vault: Vault
  collateralPrice: CollateralPricesWithFilters
  ilksData: IlkDataList
  triggerData: TriggersData
  tx: TxHelpers
  ctx: ContextConnected
}

export function AdjustSlFormControl({
  vault,
  collateralPrice,
  ilksData,
  triggerData,
  tx,
  ctx,
}: AdjustSlFormControlProps) {
  const uiSubjectName = 'AdjustSlForm'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const [collateralActive, setCloseToCollateral] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))

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
    ilksDataList: IlkDataList,
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

    const replacedTriggerId = slTriggerData.triggerId || 0

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

  return renderLayout(
    vault,
    collateralPrice,
    ilksData,
    extractSLData(triggerData),
    tx,
    ctx.status === 'connected' && ctx.account !== vault.controller,
  )
}
