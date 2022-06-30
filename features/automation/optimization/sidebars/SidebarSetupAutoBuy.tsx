import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  BasicBSTriggerData,
  prepareAddBasicBSTriggerData,
  prepareRemoveBasicBSTriggerData,
} from 'features/automation/common/basicBSTriggerData'
import {
  addBasicBSTrigger,
  removeBasicBSTrigger,
} from 'features/automation/common/basicBStxHandlers'
import {
  failedStatuses,
  progressStatuses,
} from 'features/automation/protection/common/consts/txStatues'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { PriceInfo } from 'features/shared/priceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

import { SidebarAutoBuyAdditionStage } from './SidebarAutoBuyAdditionStage'
import { SidebarAutoBuyEditingStage } from './SidebarAutoBuyEditingStage'
import { SidebarAutoBuyRemovalEditingStage } from './SidebarAutoBuyRemovalEditingStage'

export interface SidebarSetupAutoBuyProps {
  isAutoBuyOn: boolean
  vault: Vault
  autoBuyTriggerData: BasicBSTriggerData
  ilkData: IlkData
  // maxGasPercentagePrice?: MaxGasPriceValues
  priceInfo: PriceInfo
  // context: Context
}

export function SidebarSetupAutoBuy({
  isAutoBuyOn,
  vault,
  ilkData,
  autoBuyTriggerData,
  // maxGasPercentagePrice,
  priceInfo,
}: // context,
SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)
  const { uiChanges, txHelpers$, context$ } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  // TODO ŁW move stuff from uiState to props, init uiState in OptimizationFormControl pass props

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
    ],
  )

  const cancelTxData = prepareRemoveBasicBSTriggerData({
    vaultData: vault,
    triggerType: TriggerType.BasicBuy,
    triggerId: uiState.triggerId,
  })

  const isAddForm = uiState.currentForm === 'add'
  const isRemoveForm = uiState.currentForm === 'remove'
  const isEditing =
    !autoBuyTriggerData.targetCollRatio.isEqualTo(uiState.targetCollRatio) ||
    !autoBuyTriggerData.execCollRatio.isEqualTo(uiState.execCollRatio)
  !autoBuyTriggerData.triggerId.isZero() || isRemoveForm // TODO ŁW check also maxBuyOrMinSellPrice

  const isOwner = context?.status === 'connected' && context?.account === vault.controller
  // TODO ŁW - adjust isDisabled, when min max will be defined, apply validations etc.
  const isDisabled =
    (isProgressStage !== undefined && isProgressStage) || !isOwner || (isAddForm && !isEditing)
  const flow = isAddForm ? 'addBasicBuy' : 'cancelBasicBuy'
  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage }) // TODO ŁW returns setup proxy as no proxy is passed, can't get how the same method returns confirm in basic sell ŁW

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
                  addTxData={addTxData}
                  basicBuyState={uiState}
                  isEditing
                  autoBuyTriggerData={autoBuyTriggerData}
                  priceInfo={priceInfo}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoBuyRemovalEditingStage
                  vault={vault}
                  cancelTxData={cancelTxData}
                  priceInfo={priceInfo}
                  basicBuyState={uiState}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutoBuyAdditionStage stage={stage} />
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled,
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
                addBasicBSTrigger(txHelpers, addTxData, uiChanges, priceInfo.currentEthPrice, 'buy')
              }
              if (isRemoveForm) {
                removeBasicBSTrigger(
                  txHelpers,
                  cancelTxData,
                  uiChanges,
                  priceInfo.currentEthPrice,
                  'buy',
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
          },
        },
      }),
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
