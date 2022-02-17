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
import React, { useMemo, useState } from 'react'

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
  tx?: TxHelpers
}

export function AdjustSlFormControl({
  vault,
  collateralPrice,
  ilkData,
  triggerData,
  ctx,
  accountIsController,
  tx,
}: AdjustSlFormControlProps) {
  const uiSubjectName = 'AdjustSlForm'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const [collateralActive, setCloseToCollateral] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))

  const isOwner = ctx.status === 'connected' && ctx.account !== vault.controller
  const { triggerId, stopLossLevel, isStopLossEnabled } = extractStopLossData(triggerData)
  const { addGasEstimation$, uiChanges } = useAppContext()
  console.log(ctx)
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

  function reducerHandler(state: AddFormChange, action: Action): AddFormChange {
    switch (action.type) {
      case 'stop-loss':
        return { ...state, selectedSLValue: action.stopLoss }
      case 'close-type':
        return { ...state, collateralActive: action.toCollateral }
    }
  }

  const token = vault.token
  const tokenData = getToken(token)
  const currentCollateralData = collateralPrice.data.find((x) => x.token === vault.token)
  const ethPrice = collateralPrice.data.find((x) => x.token === 'ETH')?.currentPrice!
  const startingSlRatio = isStopLossEnabled ? stopLossLevel : ilkData.liquidationRatio
  const isEditing = isStopLossEnabled
    ? !selectedSLValue.eq(stopLossLevel.multipliedBy(100))
    : !selectedSLValue.eq(ilkData.liquidationRatio.multipliedBy(100))

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
    selectedSLValue: new BigNumber(currentCollRatio),
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
    step: 0.05,
    maxBoundry: maxBoundry.multipliedBy(100),
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
    },
  }

  const addTriggerConfig: RetryableLoadingButtonProps = {
    translationKey:
      txStatus?.status === TxStatus.Success ? 'back-to-vault-overview' : 'add-stop-loss',
    onClick: (finishLoader: (succeded: boolean) => void) => {
      if (tx === undefined) {
        return
      }
      if (txStatus?.status === TxStatus.Success) {
        uiChanges.publish(TAB_CHANGE_SUBJECT, { currentMode: VaultViewMode.Overview })
        setTxStatus(undefined)
        setSelectedSLValue(startingSlRatio)
        return
      }
      const txSendSuccessHandler = (transactionState: TxState<AutomationBotAddTriggerData>) =>
        transactionStateHandler(setTxStatus, transactionState, finishLoader, waitForTx)
      const sendTxErrorHandler = () => {
        finishLoader(false)
      }

      const waitForTx = tx
        .sendWithGasEstimation(addAutomationBotTrigger, txData)
        .subscribe(txSendSuccessHandler, sendTxErrorHandler)
    },
    isLoading: false,
    isRetry: false,
    disabled: isOwner,
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
    ethPrice,
    vault,
    ilkData,
    isEditing,
    etherscan,
  }

  return <AdjustSlFormLayout {...props} />
}
