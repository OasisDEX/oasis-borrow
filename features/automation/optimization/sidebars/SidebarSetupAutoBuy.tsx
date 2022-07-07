import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger, removeAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import {
  BasicBSTriggerData,
  prepareAddBasicBSTriggerData,
  prepareRemoveBasicBSTriggerData,
} from 'features/automation/common/basicBSTriggerData'
import {
  addBasicBSTrigger,
  removeBasicBSTrigger,
} from 'features/automation/common/basicBStxHandlers'
import { resolveMaxBuyOrMinSellPrice } from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import {
  errorsAddBasicBuyValidation,
  warningsBasicBuyValidation,
} from 'features/automation/common/validators'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { extractCancelAutoBuyErrors, extractCancelAutoBuyWarnings } from 'helpers/messageMappers'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

import { SidebarAutoBuyCreationStage } from './SidebarAutoBuyAdditionStage'
import { SidebarAutoBuyEditingStage } from './SidebarAutoBuyEditingStage'
import { SidebarAutoBuyRemovalEditingStage } from './SidebarAutoBuyRemovalEditingStage'

export interface SidebarSetupAutoBuyProps {
  isAutoBuyOn: boolean
  vault: Vault
  autoBuyTriggerData: BasicBSTriggerData
  ilkData: IlkData
  priceInfo: PriceInfo
  txHelpers?: TxHelpers
  context: Context
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
}

export function SidebarSetupAutoBuy({
  isAutoBuyOn,
  vault,
  ilkData,
  autoBuyTriggerData,
  priceInfo,
  context,
  txHelpers,
  balanceInfo,
  ethMarketPrice,
}: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)
  const { uiChanges, addGasEstimation$ } = useAppContext()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const txStatus = uiState?.txDetails?.txStatus
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'editing'

  const addTxData = useMemo(
    () =>
      prepareAddBasicBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicBuy,
        execCollRatio: uiState.execCollRatio,
        targetCollRatio: uiState.targetCollRatio,
        maxBuyOrMinSellPrice: uiState.withThreshold ? uiState.maxBuyOrMinSellPrice || zero : zero, // todo we will need here validation that this field cant be empty
        continuous: uiState.continuous, // leave as default
        deviation: uiState.deviation,
        replacedTriggerId: uiState.triggerId,
      }),
    [
      uiState.execCollRatio.toNumber(),
      uiState.targetCollRatio.toNumber(),
      uiState.maxBuyOrMinSellPrice?.toNumber(),
      uiState.triggerId.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )

  const addTriggerGasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(addAutomationBotTrigger, addTxData),
    )
  }, [addTxData])

  const [addTriggerGasEstimationData] = useObservable(addTriggerGasEstimationData$)
  const addTriggerGasEstimation = getEstimatedGasFeeText(addTriggerGasEstimationData)
  const addTriggerGasEstimationUsd =
    addTriggerGasEstimationData &&
    (addTriggerGasEstimationData as HasGasEstimation).gasEstimationUsd

  const cancelTxData = useMemo(
    () =>
      prepareRemoveBasicBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicBuy,
        triggerId: uiState.triggerId,
      }),
    [uiState.triggerId.toNumber(), vault.collateralizationRatio.toNumber()],
  )

  const cancelTriggerGasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(removeAutomationBotTrigger, cancelTxData),
    )
  }, [cancelTxData])

  const [cancelTriggerGasEstimationData] = useObservable(cancelTriggerGasEstimationData$)
  const cancelTriggerGasEstimation = getEstimatedGasFeeText(cancelTriggerGasEstimationData)
  const cancelTriggerGasEstimationUsd =
    cancelTriggerGasEstimationData &&
    (cancelTriggerGasEstimationData as HasGasEstimation).gasEstimationUsd

  const isAddForm = uiState.currentForm === 'add'
  const isRemoveForm = uiState.currentForm === 'remove'
  const maxBuyOrMinSellPrice = resolveMaxBuyOrMinSellPrice(autoBuyTriggerData.maxBuyOrMinSellPrice)
  const isEditing =
    !autoBuyTriggerData.targetCollRatio.isEqualTo(uiState.targetCollRatio) ||
    !autoBuyTriggerData.execCollRatio.isEqualTo(uiState.execCollRatio) ||
    (maxBuyOrMinSellPrice?.toNumber() !== uiState.maxBuyOrMinSellPrice?.toNumber() &&
      !autoBuyTriggerData.triggerId.isZero()) ||
    isRemoveForm

  const isOwner = context?.status === 'connected' && context?.account === vault.controller
  const isDisabled =
    (isProgressStage ||
      !isOwner ||
      !isEditing ||
      (uiState.withThreshold &&
        (uiState.maxBuyOrMinSellPrice === undefined || uiState.maxBuyOrMinSellPrice?.isZero())) ||
      uiState.execCollRatio.isZero()) &&
    stage !== 'txSuccess'

  const isFirstSetup = autoBuyTriggerData.triggerId.isZero()
  const flow: SidebarFlow = isRemoveForm
    ? 'cancelBasicBuy'
    : isFirstSetup
    ? 'addBasicBuy'
    : 'editBasicBuy'
  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })

  const gasEstimationUsd = isAddForm ? addTriggerGasEstimationUsd : cancelTriggerGasEstimationUsd

  const errors = errorsAddBasicBuyValidation({
    txError: uiState.txDetails?.txError,
    maxBuyPrice: uiState.maxBuyOrMinSellPrice,
    withThreshold: uiState.withThreshold,
  })

  const warnings = warningsBasicBuyValidation({
    token: vault.token,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    gasEstimationUsd,
    withThreshold: uiState.withThreshold,
  })

  const cancelAutoBuyWarnings = extractCancelAutoBuyWarnings(warnings)
  const cancelAutoBuyErrors = extractCancelAutoBuyErrors(errors)

  const sidebarStatus = getSidebarStatus({
    stage,
    txHash: uiState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
  })

  if (isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('auto-buy.form-title'),
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarAutoBuyEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  basicBuyState={uiState}
                  isEditing={isEditing}
                  autoBuyTriggerData={autoBuyTriggerData}
                  priceInfo={priceInfo}
                  errors={errors}
                  warnings={warnings}
                  addTriggerGasEstimation={addTriggerGasEstimation}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoBuyRemovalEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelAutoBuyErrors}
                  warnings={cancelAutoBuyWarnings}
                  cancelTriggerGasEstimation={cancelTriggerGasEstimation}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutoBuyCreationStage stage={stage} />
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled || !!errors.length,
        isLoading: stage === 'txInProgress',
        action: () => {
          if (txHelpers) {
            if (stage === 'txSuccess') {
              uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
                type: 'tx-details',
                txDetails: {},
              })
              uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
                type: 'current-form',
                currentForm: 'add',
              })
            } else {
              if (isAddForm) {
                addBasicBSTrigger(
                  txHelpers,
                  addTxData,
                  uiChanges,
                  priceInfo.currentEthPrice,
                  BASIC_BUY_FORM_CHANGE,
                )
              }
              if (isRemoveForm) {
                removeBasicBSTrigger(
                  txHelpers,
                  cancelTxData,
                  uiChanges,
                  priceInfo.currentEthPrice,
                  BASIC_BUY_FORM_CHANGE,
                )
              }
            }
          }
        },
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
          hidden: uiState.triggerId.isZero(),
          action: () => {
            uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
              type: 'current-form',
              currentForm: isAddForm ? 'remove' : 'add',
            })
            uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
              type: 'tx-details',
              txDetails: {},
            })
          },
        },
      }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
