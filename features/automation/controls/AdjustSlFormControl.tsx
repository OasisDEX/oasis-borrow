import { TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
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
import { useObservable } from 'helpers/observableHook'
import { FixedSizeArray } from 'helpers/types'
import { zero } from 'helpers/zero'
import React, { useEffect, useMemo, useState } from 'react'

import { Context } from '../../../blockchain/network'
import { useAppContext } from '../../../components/AppContextProvider'
import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { getEstimatedGasFeeText } from '../../../components/vault/VaultChangesInformation'
import { GasEstimationStatus } from '../../../helpers/form'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import { progressStatuses } from '../common/consts/txStatues'
import {
  determineProperDefaults,
  extractStopLossData,
  prepareTriggerData,
} from '../common/StopLossTriggerDataExtractor'
import { ADD_FORM_CHANGE, AddFormChange, formChangeReducer } from '../common/UITypes/AddFormChange'
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
  const { triggerId, stopLossLevel, isStopLossEnabled, isToCollateral } = extractStopLossData(
    triggerData,
  )
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']

  const isOwner = ctx.status === 'connected' && ctx.account === vault.controller
  const { addGasEstimation$, uiChanges } = useAppContext()

  const [lastUIState, lastUIStateSetter] = useState<AddFormChange | undefined>(undefined)
  const [firstStopLossSetup] = useState(!isStopLossEnabled)

  const token = vault.token
  const tokenData = getToken(token)
  const currentCollateralData = collateralPrice.data.find((x) => x.token === vault.token)
  const tokenPrice = collateralPrice.data.find((x) => x.token === token)?.currentPrice!
  const ethPrice = collateralPrice.data.find((x) => x.token === 'ETH')?.currentPrice!
  const initialVaultCollRatio = new BigNumber(
    ilkData.liquidationRatio
      .plus(vault.collateralizationRatio)
      .dividedBy(2)
      .toFixed(2, BigNumber.ROUND_CEIL),
  )

  const startingSlRatio = isStopLossEnabled ? stopLossLevel : initialVaultCollRatio

  const defaultUIState: AddFormChange = {
    collateralActive: isToCollateral,
    selectedSLValue: startingSlRatio.multipliedBy(100),
    txDetails: undefined,
  }

  const initial = uiChanges.lastPayload<AddFormChange>(ADD_FORM_CHANGE) ?? defaultUIState

  const [selectedSLValue, setSelectedSLValue] = useState(initial.selectedSLValue)

  const [collateralActive, setCloseToCollateral] = useState(initial.collateralActive)

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<AddFormChange>(ADD_FORM_CHANGE)

    const subscription = uiChanges$.subscribe((value) => {
      lastUIStateSetter(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const currentUIState = lastUIState || initial

  const replacedTriggerId = triggerId || 0

  const txData = useMemo(
    () => prepareAddTriggerData(vault, collateralActive, selectedSLValue, replacedTriggerId),
    [collateralActive, selectedSLValue, replacedTriggerId],
  )
  /* This can be extracted to some reusable ReactHook useGasEstimate<TxDataType>(addAutomationBotTrigger,txData)*/
  const gasEstimationData$ = useMemo(() => {
    console.log('redoing gas estimation')
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(addAutomationBotTrigger, txData),
    )
  }, [txData])

  const gasEstimationData = useObservable(gasEstimationData$)

  const isEditing =
    (!isStopLossEnabled && !selectedSLValue.eq(defaultUIState.selectedSLValue)) ||
    !stopLossLevel.multipliedBy(100).eq(selectedSLValue) ||
    collateralActive !== isToCollateral

  const currentCollRatio = vault.lockedCollateral
    .multipliedBy(currentCollateralData!.currentPrice)
    .dividedBy(vault.debt)

  const startingAfterNewLiquidationPrice = currentCollateralData!.currentPrice
    .multipliedBy(initial.selectedSLValue)
    .dividedBy(100)
    .dividedBy(currentCollRatio)

  const [afterNewLiquidationPrice, setAfterLiqPrice] = useState(
    new BigNumber(startingAfterNewLiquidationPrice),
  )

  const maxBoundry =
    currentCollRatio.isNaN() || !currentCollRatio.isFinite() ? new BigNumber(5) : currentCollRatio

  const liqRatio = ilkData.liquidationRatio

  determineProperDefaults(setSelectedSLValue, startingSlRatio)

  const closeProps: PickCloseStateProps = {
    optionNames: validOptions,
    onclickHandler: (optionName: string) => {
      setCloseToCollateral(optionName === validOptions[0])
      uiChanges.publish(
        ADD_FORM_CHANGE,
        formChangeReducer(lastUIState || ({} as AddFormChange), {
          type: 'close-type',
          toCollateral: optionName === validOptions[0],
        }),
      )
    },
    isCollateralActive: collateralActive,
    collateralTokenSymbol: token,
    collateralTokenIconCircle: tokenData.iconCircle,
  }

  const sliderPercentageFill = initial.selectedSLValue
    .minus(liqRatio.times(100))
    .div(currentCollRatio.minus(liqRatio))

  const sliderProps: SliderValuePickerProps = {
    disabled: false,
    sliderPercentageFill,
    leftBoundry: initial.selectedSLValue,
    rightBoundry: afterNewLiquidationPrice,
    sliderKey: 'set-stoploss',
    lastValue: initial.selectedSLValue,
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

      uiChanges.publish(
        ADD_FORM_CHANGE,
        formChangeReducer(lastUIState || ({} as AddFormChange), {
          type: 'stop-loss',
          stopLoss: slCollRatio,
        }),
      )
    },
  }

  const addTriggerConfig: RetryableLoadingButtonProps = {
    translationKey: isStopLossEnabled ? 'update-stop-loss' : 'add-stop-loss',
    onClick: (finishLoader: (succeded: boolean) => void) => {
      if (tx === undefined) {
        return
      }
      const txSendSuccessHandler = (transactionState: TxState<AutomationBotAddTriggerData>) => {
        transactionStateHandler(
          (txState) => {
            /** TODO: This is not right place for it, this should be encapsulated,
             * probably in similar fashion as addGasEstimation$
             */
            const gasUsed =
              txState.status === TxStatus.Success ? new BigNumber(txState.receipt.gasUsed) : zero

            const effectiveGasPrice =
              txState.status ===
              TxStatus.Success /* Is this even correct? failed tx also have cost */
                ? new BigNumber(txState.receipt.effectiveGasPrice)
                : zero

            const totalCost =
              !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
                ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(tokenPrice)
                : zero
            console.log('Inside transactionStateHandler', txState)

            uiChanges.publish(
              ADD_FORM_CHANGE,
              formChangeReducer(lastUIState || ({} as AddFormChange), {
                type: 'tx-details',
                txDetails: {
                  txHash: (txState as any).txHash,
                  txStatus: txState.status,
                  txCost: totalCost,
                },
              }),
            )
            console.log('After Inside transactionStateHandler')
          },
          transactionState,
          finishLoader,
          waitForTx,
        )
      }

      const sendTxErrorHandler = () => {
        finishLoader(false)
      }

      const waitForTx = tx
        .sendWithGasEstimation(addAutomationBotTrigger, txData)
        .subscribe(txSendSuccessHandler, sendTxErrorHandler)
    },
    onConfirm: () => {
      /* TODO: Remove it */
    },
    isStopLossEnabled,
    isLoading: false,
    isRetry: false,
    isEditing,
    disabled: !isOwner || (!isEditing && currentUIState?.txDetails?.txStatus !== TxStatus.Success),
  }

  const dynamicStopLossPrice = vault.liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(stopLossLevel)

  const amountOnStopLossTrigger = vault.lockedCollateral
    .times(dynamicStopLossPrice)
    .minus(vault.debt)
    .div(dynamicStopLossPrice)

  const txProgressing =
    !!currentUIState?.txDetails?.txStatus &&
    progressStatuses.includes(currentUIState?.txDetails?.txStatus)

  console.log('txProgressing', currentUIState)

  const gasEstimation = getEstimatedGasFeeText(gasEstimationData)
  const etherscan = ctx.etherscan.url

  const props: AdjustSlFormLayoutProps = {
    token,
    closePickerConfig: closeProps,
    slValuePickerConfig: sliderProps,
    addTriggerConfig: addTriggerConfig,
    txState: currentUIState?.txDetails?.txStatus,
    txProgressing,
    txCost: currentUIState?.txDetails?.txCost,
    txHash: currentUIState?.txDetails?.txHash,
    gasEstimation,
    accountIsController,
    stopLossLevel,
    dynamicStopLossPrice,
    amountOnStopLossTrigger,
    tokenPrice,
    ethPrice,
    vault,
    ilkData,
    isEditing,
    etherscan,
    selectedSLValue,
    toggleForms,
    firstStopLossSetup,
  }

  return <AdjustSlFormLayout {...props} />
}
