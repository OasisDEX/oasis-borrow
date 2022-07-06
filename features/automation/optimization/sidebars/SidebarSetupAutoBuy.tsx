import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
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
import { resolveMaxBuyOrMinSellPrice } from 'features/automation/common/helpers'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
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
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
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
}

export function SidebarSetupAutoBuy({
  isAutoBuyOn,
  vault,
  ilkData,
  autoBuyTriggerData,
  priceInfo,
  context,
  txHelpers,
}: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)
  const { uiChanges } = useAppContext()
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

  const cancelTxData = prepareRemoveBasicBSTriggerData({
    vaultData: vault,
    triggerType: TriggerType.BasicBuy,
    triggerId: uiState.triggerId,
  })

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
                  addTxData={addTxData}
                  basicBuyState={uiState}
                  isEditing={isEditing}
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
            <SidebarAutoBuyCreationStage stage={stage} />
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
