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
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useMemo, useState } from 'react'

import { Context } from '../../../../blockchain/network'
import { useAppContext } from '../../../../components/AppContextProvider'
import { RetryableLoadingButtonProps } from '../../../../components/dumb/RetryableLoadingButton'
import { getEstimatedGasFeeText } from '../../../../components/vault/VaultChangesInformation'
import { GasEstimationStatus } from '../../../../helpers/form'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import { progressStatuses } from '../common/consts/txStatues'
import { getIsEditingProtection } from '../common/helpers'
import { extractStopLossData, prepareTriggerData } from '../common/StopLossTriggerDataExtractor'
import { ADD_FORM_CHANGE, AddFormChange } from '../common/UITypes/AddFormChange'
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
  collateralizationRatioAtNextPrice: BigNumber
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
  collateralizationRatioAtNextPrice,
  toggleForms,
  tx,
}: AdjustSlFormControlProps) {
  const { triggerId, stopLossLevel, isStopLossEnabled, isToCollateral } = extractStopLossData(
    triggerData,
  )
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']

  const isOwner = ctx.status === 'connected' && ctx.account === vault.controller
  const { addGasEstimation$, uiChanges } = useAppContext()

  const [firstStopLossSetup] = useState(!isStopLossEnabled)

  const token = vault.token
  const tokenData = getToken(token)
  const currentCollateralData = collateralPrice.data.find((x) => x.token === vault.token)
  const tokenPrice = collateralPrice.data.find((x) => x.token === token)?.currentPrice!
  const ethPrice = collateralPrice.data.find((x) => x.token === 'ETH')?.currentPrice!

  const [uiState] = useUIChanges<AddFormChange>(ADD_FORM_CHANGE)

  const [selectedSLValue, setSelectedSLValue] = useState(uiState.selectedSLValue)

  const replacedTriggerId = triggerId || 0

  const txData = useMemo(
    () =>
      prepareAddTriggerData(vault, uiState.collateralActive, selectedSLValue, replacedTriggerId),
    [uiState.collateralActive, selectedSLValue, replacedTriggerId],
  )
  /* This can be extracted to some reusable ReactHook useGasEstimate<TxDataType>(addAutomationBotTrigger,txData)*/
  const gasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(addAutomationBotTrigger, txData),
    )
  }, [txData])

  const [gasEstimationData] = useObservable(gasEstimationData$)

  const isEditing = getIsEditingProtection({
    isStopLossEnabled,
    selectedSLValue: uiState.selectedSLValue,
    startingSlRatio: selectedSLValue,
    stopLossLevel,
    collateralActive: uiState.collateralActive,
    isToCollateral,
  })

  const currentCollRatio = vault.lockedCollateral
    .multipliedBy(currentCollateralData!.currentPrice)
    .dividedBy(vault.debt)

  const startingAfterNewLiquidationPrice = currentCollateralData!.currentPrice
    .multipliedBy(uiState.selectedSLValue)
    .dividedBy(100)
    .dividedBy(currentCollRatio)

  const [afterNewLiquidationPrice, setAfterLiqPrice] = useState(
    new BigNumber(startingAfterNewLiquidationPrice),
  )

  const maxBoundry =
    currentCollRatio.isNaN() || !currentCollRatio.isFinite() ? new BigNumber(5) : currentCollRatio

  const liqRatio = ilkData.liquidationRatio

  const closeProps: PickCloseStateProps = {
    optionNames: validOptions,
    onclickHandler: (optionName: string) => {
      uiChanges.publish(ADD_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === validOptions[0],
      })
    },
    isCollateralActive: uiState.collateralActive,
    collateralTokenSymbol: token,
    collateralTokenIconCircle: tokenData.iconCircle,
  }

  const sliderPercentageFill = uiState.selectedSLValue
    .minus(liqRatio.times(100))
    .div(currentCollRatio.minus(liqRatio))

  const sliderProps: SliderValuePickerProps = {
    disabled: false,
    sliderPercentageFill,
    leftBoundry: uiState.selectedSLValue,
    rightBoundry: afterNewLiquidationPrice,
    sliderKey: 'set-stoploss',
    lastValue: uiState.selectedSLValue,
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

      if (uiState.collateralActive === undefined) {
        uiChanges.publish(ADD_FORM_CHANGE, {
          type: 'close-type',
          toCollateral: false,
        })
      }

      uiChanges.publish(ADD_FORM_CHANGE, {
        type: 'stop-loss',
        stopLoss: slCollRatio,
      })
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

            uiChanges.publish(ADD_FORM_CHANGE, {
              type: 'tx-details',
              txDetails: {
                txHash: (txState as any).txHash,
                txStatus: txState.status,
                txCost: totalCost,
              },
            })
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
    isStopLossEnabled,
    isLoading: false,
    isRetry: false,
    isEditing,
    disabled:
      !isOwner ||
      (!isEditing && uiState?.txDetails?.txStatus !== TxStatus.Success) ||
      (!isEditing && !uiState?.txDetails),
  }

  const dynamicStopLossPrice = vault.liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(stopLossLevel)

  const amountOnStopLossTrigger = vault.lockedCollateral
    .times(dynamicStopLossPrice)
    .minus(vault.debt)
    .div(dynamicStopLossPrice)

  const txProgressing =
    !!uiState?.txDetails?.txStatus && progressStatuses.includes(uiState?.txDetails?.txStatus)

  const gasEstimation = getEstimatedGasFeeText(gasEstimationData)
  const etherscan = ctx.etherscan.url

  const props: AdjustSlFormLayoutProps = {
    token,
    closePickerConfig: closeProps,
    slValuePickerConfig: sliderProps,
    addTriggerConfig: addTriggerConfig,
    txState: uiState?.txDetails?.txStatus,
    txProgressing,
    txCost: uiState?.txDetails?.txCost,
    txHash: uiState?.txDetails?.txHash,
    gasEstimation,
    accountIsController,
    dynamicStopLossPrice,
    amountOnStopLossTrigger,
    tokenPrice,
    ethPrice,
    vault,
    ilkData,
    etherscan,
    selectedSLValue,
    toggleForms,
    firstStopLossSetup,
    isEditing,
    collateralizationRatioAtNextPrice,
  }

  return <AdjustSlFormLayout {...props} />
}
