import { TxState, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservable, useUIChanges } from 'helpers/observableHook'
import { FixedSizeArray } from 'helpers/types'
import React, { useEffect, useMemo, useState } from 'react'

import { Context } from '../../../blockchain/network'
import { useAppContext } from '../../../components/AppContextProvider'
import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { VaultViewMode } from '../../../components/TabSwitchLayout'
import { getEstimatedGasFeeText } from '../../../components/vault/VaultChangesInformation'
import { GasEstimationStatus } from '../../../helpers/form'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import { progressStatuses } from '../common/consts/txStatues'
import {
  determineProperDefaults,
  extractStopLossData,
  prepareTriggerData,
} from '../common/StopLossTriggerDataExtractor'
import { AddFormChange } from '../common/UITypes/AddFormChange'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'
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
  ilkData: IlkData
  triggerData: TriggersData
  ctx: Context
  accountIsController: boolean
  toggleForms: () => void
  tx?: TxHelpers
}

export function AdjustSlFormControl({
  vault,
  collateralPrice,
  ilkData,
  triggerData,
  ctx,
  accountIsController,
  toggleForms,
  tx,
}: AdjustSlFormControlProps) {
  const uiSubjectName = 'AdjustSlForm'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const [collateralActive, setCloseToCollateral] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))

  const isOwner = ctx.status === 'connected' && ctx.account === vault.controller
  const { triggerId, stopLossLevel, isStopLossEnabled } = extractStopLossData(triggerData)
  const { addGasEstimation$, uiChanges } = useAppContext()

  const [lastUIState, lastUIStateSetter] = useState<AddFormChange | undefined>(undefined)

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<AddFormChange>(uiSubjectName)

    const subscription = uiChanges$.subscribe((value) => {
      lastUIStateSetter(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const replacedTriggerId = triggerId || 0

  const txData = useMemo(
    () => prepareAddTriggerData(vault, collateralActive, selectedSLValue, replacedTriggerId),
    [collateralActive, selectedSLValue, replacedTriggerId],
  )

  const gasEstimationData$ = useMemo(
    () =>
      addGasEstimation$({ gasEstimationStatus: GasEstimationStatus.unset }, ({ estimateGas }) =>
        estimateGas(addAutomationBotTrigger, txData),
      ),
    [txData],
  )

  const gasEstimationData = useObservable(gasEstimationData$)

  type Action =
    | { type: 'stop-loss'; stopLoss: BigNumber }
    | { type: 'close-type'; toCollateral: boolean }
    | { type: 'isEditing'; isEditing: boolean }

  function reducerHandler(state: AddFormChange, action: Action): AddFormChange {
    switch (action.type) {
      case 'stop-loss':
        return { ...state, selectedSLValue: action.stopLoss }
      case 'close-type':
        return { ...state, collateralActive: action.toCollateral }
      case 'isEditing':
        return { ...state, isEditing: action.isEditing }
    }
  }

  const token = vault.token
  const tokenData = getToken(token)
  const currentCollateralData = collateralPrice.data.find((x) => x.token === vault.token)
  const tokenPrice = collateralPrice.data.find((x) => x.token === token)?.currentPrice!
  const startingSlRatio = isStopLossEnabled
    ? stopLossLevel
    : new BigNumber(
        ilkData.liquidationRatio
          .plus(vault.collateralizationRatio)
          .dividedBy(2)
          .toFixed(2, BigNumber.ROUND_CEIL),
      )

  const isEditing = !!lastUIState?.isEditing

  const currentCollRatio = vault.lockedCollateral
    .multipliedBy(currentCollateralData!.currentPrice)
    .dividedBy(vault.debt)

  const startingAfterNewLiquidationPrice = currentCollateralData!.currentPrice
    .multipliedBy(startingSlRatio)
    .dividedBy(currentCollRatio)

  const [afterNewLiquidationPrice, setAfterLiqPrice] = useState(
    new BigNumber(startingAfterNewLiquidationPrice),
  )

  const initial: AddFormChange = {
    collateralActive: false,
    selectedSLValue: startingSlRatio.multipliedBy(100),
    isEditing: false,
  }

  const dispatch = useUIChanges(reducerHandler, initial, uiSubjectName)

  const [txStatus, setTxStatus] = useState<TxState<AutomationBotAddTriggerData> | undefined>()
  const maxBoundry =
    currentCollRatio.isNaN() || !currentCollRatio.isFinite() ? new BigNumber(5) : currentCollRatio

  const liqRatio = ilkData.liquidationRatio

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
    step: 1,
    maxBoundry: new BigNumber(maxBoundry.multipliedBy(100).toFixed(0, BigNumber.ROUND_DOWN)),
    minBoundry: liqRatio.multipliedBy(100),
    onChange: (slCollRatio) => {
      setSelectedSLValue(slCollRatio)
      /*TO DO: this is duplicated and can be extracted*/
      const currentCollRatio = vault.lockedCollateral
        .multipliedBy(currentCollateralData!.currentPrice)
        .dividedBy(vault.debt)
      const computedAfterLiqPrice = slCollRatio
        .dividedBy(100)
        .multipliedBy(currentCollateralData!.currentPrice)
        .dividedBy(currentCollRatio)
      /* END OF DUPLICATION */
      setAfterLiqPrice(computedAfterLiqPrice)
      dispatch({
        type: 'stop-loss',
        stopLoss: slCollRatio,
      })
      dispatch({
        type: 'isEditing',
        isEditing: true,
      })
    },
  }

  const addTriggerConfig: RetryableLoadingButtonProps = {
    translationKey:
      txStatus?.status === TxStatus.Success ? 'back-to-vault-overview' : 'add-stop-loss',
    onClick: (finishLoader: (succeded: boolean) => void) => {
      if (tx === undefined) {
        return
      }
      const txSendSuccessHandler = (transactionState: TxState<AutomationBotAddTriggerData>) => {
        transactionStateHandler(setTxStatus, transactionState, finishLoader, waitForTx)

        if (txStatus?.status === TxStatus.Success) {
          dispatch({
            type: 'isEditing',
            isEditing: false,
          })
        }
      }

      if (txStatus?.status === TxStatus.Success) {
        uiChanges.publish(TAB_CHANGE_SUBJECT, { currentMode: VaultViewMode.Overview })
        setTxStatus(undefined)
        setSelectedSLValue(startingSlRatio)
        return
      }
      const sendTxErrorHandler = () => {
        finishLoader(false)
      }

      const waitForTx = tx
        .sendWithGasEstimation(addAutomationBotTrigger, txData)
        .subscribe(txSendSuccessHandler, sendTxErrorHandler)
    },
    onConfirm: () => {
      dispatch({
        type: 'isEditing',
        isEditing: true,
      })
    },
    isStopLossEnabled,
    isLoading: false,
    isRetry: false,
    isEditing,
    disabled:
      !isOwner ||
      (selectedSLValue.eq(stopLossLevel.multipliedBy(100)) &&
        txStatus?.status !== TxStatus.Success),
  }

  const dynamicStopLossPrice = vault.liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(stopLossLevel)

  const amountOnStopLossTrigger = vault.lockedCollateral
    .times(dynamicStopLossPrice)
    .minus(vault.debt)
    .div(dynamicStopLossPrice)

  const txProgressing = !!txStatus && progressStatuses.includes(txStatus?.status)
  const txSuccess = txStatus?.status === TxStatus.Success
  const gasEstimation = getEstimatedGasFeeText(gasEstimationData)
  const etherscan = ctx.etherscan.url

  const props: AdjustSlFormLayoutProps = {
    token,
    closePickerConfig: closeProps,
    slValuePickerConfig: sliderProps,
    addTriggerConfig: addTriggerConfig,
    txState: txStatus,
    txProgressing,
    txSuccess,
    gasEstimation,
    accountIsController,
    stopLossLevel,
    dynamicStopLossPrice,
    amountOnStopLossTrigger,
    tokenPrice,
    vault,
    ilkData,
    isEditing,
    etherscan,
    selectedSLValue,
    toggleForms,
  }

  return <AdjustSlFormLayout {...props} />
}
