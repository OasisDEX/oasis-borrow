import { TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { closeVaultOptions } from 'features/automation/protection/common/consts/closeTypeConfig'
import { stopLossSliderBasicConfig } from 'features/automation/protection/common/consts/sliderConfig'
import {
  prepareAddStopLossTriggerData,
  StopLossTriggerData,
} from 'features/automation/protection/common/stopLossTriggerData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { useMemo, useState } from 'react'

import { failedStatuses, progressStatuses } from '../../common/txStatues'
import { transactionStateHandler } from '../common/AutomationTransactionPlunger'
import {
  DEFAULT_SL_SLIDER_BOUNDARY,
  MAX_DEBT_FOR_SETTING_STOP_LOSS,
  MAX_SL_SLIDER_VALUE_OFFSET,
} from '../common/consts/automationDefaults'
import { getIsEditingProtection, getSliderPercentageFill } from '../common/helpers'
import { ADD_FORM_CHANGE, AddFormChange } from '../common/UITypes/AddFormChange'
import { MULTIPLY_VAULT_PILL_CHANGE_SUBJECT } from '../common/UITypes/MultiplyVaultPillChange'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'
import { AdjustSlFormLayoutProps } from './AdjustSlFormLayout'
import { SidebarAdjustStopLoss } from './sidebar/SidebarAdjustStopLoss'

interface AdjustSlFormControlProps {
  vault: Vault
  priceInfo: PriceInfo
  ilkData: IlkData
  triggerData: StopLossTriggerData
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  ctx: Context
  accountIsController: boolean
  toggleForms: () => void
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
  tx?: TxHelpers
}

export function AdjustSlFormControl({
  vault,
  priceInfo: { currentCollateralPrice, nextCollateralPrice },
  ilkData,
  triggerData,
  autoSellTriggerData,
  autoBuyTriggerData,
  ctx,
  accountIsController,
  toggleForms,
  tx,
  ethMarketPrice,
  balanceInfo,
}: AdjustSlFormControlProps) {
  const { triggerId, stopLossLevel, isStopLossEnabled, isToCollateral } = triggerData

  const isOwner = ctx.status === 'connected' && ctx.account === vault.controller
  const { addGasEstimation$, uiChanges } = useAppContext()

  const [firstStopLossSetup, setFirstStopLossSetup] = useState(!isStopLossEnabled)
  // below useState has been added to handle button disable just after click
  const [isTxStarted, setIsTxStarted] = useState(false)

  const token = vault.token
  const tokenData = getToken(token)

  const [uiState] = useUIChanges<AddFormChange>(ADD_FORM_CHANGE)

  const replacedTriggerId = triggerId || 0

  const txData = useMemo(
    () =>
      prepareAddStopLossTriggerData(
        vault,
        uiState.collateralActive,
        uiState.selectedSLValue,
        replacedTriggerId,
      ),
    [uiState.collateralActive, uiState.selectedSLValue, replacedTriggerId],
  )
  /* This can be extracted to some reusable ReactHook useGasEstimate<TxDataType>(addAutomationBotTrigger,txData)*/
  const gasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(addAutomationBotTrigger, txData),
    )
  }, [txData])

  const redirectToCloseVault = () => {
    uiChanges.publish(TAB_CHANGE_SUBJECT, {
      type: 'change-tab',
      currentMode: VaultViewMode.Overview,
    })

    uiChanges.publish(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT, {
      type: 'change-multiply-pill',
      currentStage: 'closeVault',
    })
  }

  const [gasEstimationData] = useObservable(gasEstimationData$)

  const isEditing = getIsEditingProtection({
    isStopLossEnabled,
    selectedSLValue: uiState.selectedSLValue,
    stopLossLevel,
    collateralActive: uiState.collateralActive,
    isToCollateral,
  })

  const liqRatio = ilkData.liquidationRatio

  const closeProps: PickCloseStateProps = {
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
      uiChanges.publish(ADD_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === closeVaultOptions[0],
      })
    },
    isCollateralActive: uiState.collateralActive,
    collateralTokenSymbol: token,
    collateralTokenIconCircle: tokenData.iconCircle,
  }

  const max = autoSellTriggerData.isTriggerEnabled
    ? autoSellTriggerData.execCollRatio.div(100).minus(DEFAULT_SL_SLIDER_BOUNDARY)
    : vault.collateralizationRatioAtNextPrice.minus(MAX_SL_SLIDER_VALUE_OFFSET)

  const sliderPercentageFill = getSliderPercentageFill({
    value: uiState.selectedSLValue,
    min: ilkData.liquidationRatio.plus(DEFAULT_SL_SLIDER_BOUNDARY),
    max,
  })

  const maxBoundry = new BigNumber(max.multipliedBy(100).toFixed(0, BigNumber.ROUND_DOWN))

  const afterNewLiquidationPrice = uiState.selectedSLValue
    .dividedBy(100)
    .multipliedBy(nextCollateralPrice)
    .dividedBy(vault.collateralizationRatioAtNextPrice)

  const sliderProps: SliderValuePickerProps = {
    ...stopLossSliderBasicConfig,
    sliderPercentageFill,
    leftBoundry: uiState.selectedSLValue,
    rightBoundry: afterNewLiquidationPrice,
    lastValue: uiState.selectedSLValue,
    maxBoundry,
    minBoundry: liqRatio.plus(DEFAULT_SL_SLIDER_BOUNDARY).multipliedBy(100),
    onChange: (slCollRatio) => {
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

  const txStatus = uiState?.txDetails?.txStatus
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const maxDebtForSettingStopLoss = vault.debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'stopLossEditing'

  const isProgressDisabled = !!(
    !isOwner ||
    (!isEditing && txStatus !== TxStatus.Success) ||
    isProgressStage ||
    isTxStarted ||
    maxDebtForSettingStopLoss
  )

  const addTriggerConfig: RetryableLoadingButtonProps = {
    translationKey: isStopLossEnabled ? 'update-stop-loss' : 'add-stop-loss',
    onClick: (finishLoader: (succeded: boolean) => void) => {
      if (tx === undefined) {
        return
      }

      setIsTxStarted(true)

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
                ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(
                    ethMarketPrice,
                  )
                : zero

            if (txState.status === TxStatus.Success) {
              setFirstStopLossSetup(false)
            }

            uiChanges.publish(ADD_FORM_CHANGE, {
              type: 'tx-details',
              txDetails: {
                txHash: (txState as any).txHash,
                txStatus: txState.status,
                txError: txState.status === TxStatus.Error ? txState.error : undefined,
                txCost: totalCost,
              },
            })

            if (progressStatuses.includes(txState.status)) {
              setIsTxStarted(false)
            }
          },
          transactionState,
          finishLoader,
          waitForTx,
        )
      }

      const sendTxErrorHandler = () => {
        finishLoader(false)
      }

      // TODO circular dependency waitForTx <-> txSendSuccessHandler
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
      (!isEditing && !uiState?.txDetails) ||
      maxDebtForSettingStopLoss,
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
  const gasEstimationUsd =
    gasEstimationData && (gasEstimationData as HasGasEstimation).gasEstimationUsd

  const etherscan = ctx.etherscan.url

  const props: AdjustSlFormLayoutProps = {
    token,
    closePickerConfig: closeProps,
    slValuePickerConfig: sliderProps,
    addTriggerConfig: addTriggerConfig,
    txState: txStatus,
    txProgressing,
    txCost: uiState?.txDetails?.txCost,
    txHash: uiState?.txDetails?.txHash,
    txError: uiState?.txDetails?.txError,
    gasEstimation,
    gasEstimationUsd,
    accountIsController,
    dynamicStopLossPrice,
    amountOnStopLossTrigger,
    tokenPrice: currentCollateralPrice,
    ethPrice: ethMarketPrice,
    vault,
    ilkData,
    etherscan,
    selectedSLValue: uiState.selectedSLValue,
    toggleForms,
    firstStopLossSetup,
    isEditing,
    collateralizationRatioAtNextPrice: vault.collateralizationRatioAtNextPrice,
    ethBalance: balanceInfo.ethBalance,
    stage,
    isProgressDisabled,
    redirectToCloseVault,
    currentCollateralRatio: vault.collateralizationRatio,
    isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    autoBuyTriggerData,
  }

  return <SidebarAdjustStopLoss {...props} />
}
