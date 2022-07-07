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
import {
  failedStatuses,
  progressStatuses,
} from 'features/automation/protection/common/consts/txStatues'
import { commonProtectionDropdownItems } from 'features/automation/protection/common/dropdown'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { SidebarAutoSellCancelEditingStage } from 'features/automation/protection/controls/sidebar/SidebarAuteSellCancelEditingStage'
import { SidebarAutoSellAddEditingStage } from 'features/automation/protection/controls/sidebar/SidebarAutoSellAddEditingStage'
import { SidebarAutoSellCreationStage } from 'features/automation/protection/controls/sidebar/SidebarAutoSellCreationStage'
import { PriceInfo } from 'features/shared/priceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoSellProps {
  vault: Vault
  ilkData: IlkData
  priceInfo: PriceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  isAutoSellActive: boolean
  txHelpers?: TxHelpers
  context: Context
}

export function SidebarSetupAutoSell({
  vault,
  ilkData,
  priceInfo,
  autoSellTriggerData,
  autoBuyTriggerData,
  isAutoSellActive,
  txHelpers,
  context,
}: SidebarSetupAutoSellProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)

  const addTxData = useMemo(
    () =>
      prepareAddBasicBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicSell,
        execCollRatio: uiState.execCollRatio,
        targetCollRatio: uiState.targetCollRatio,
        maxBuyOrMinSellPrice: uiState.withThreshold ? uiState.maxBuyOrMinSellPrice || zero : zero, // todo we will need here validation that this field cant be empty
        continuous: uiState.continuous,
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
    triggerType: TriggerType.BasicSell,
    triggerId: uiState.triggerId,
  })

  const isAddForm = uiState.currentForm === 'add'
  const isRemoveForm = uiState.currentForm === 'remove'

  const maxBuyOrMinSellPrice = resolveMaxBuyOrMinSellPrice(autoSellTriggerData.maxBuyOrMinSellPrice)

  const isEditing =
    !autoSellTriggerData.targetCollRatio.isEqualTo(uiState.targetCollRatio) ||
    !autoSellTriggerData.execCollRatio.isEqualTo(uiState.execCollRatio) ||
    (maxBuyOrMinSellPrice?.toNumber() !== uiState.maxBuyOrMinSellPrice?.toNumber() &&
      !autoSellTriggerData.triggerId.isZero()) ||
    isRemoveForm

  const isFirstSetup = autoSellTriggerData.triggerId.isZero()
  const txStatus = uiState?.txDetails?.txStatus
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelBasicSell'
    : isFirstSetup
    ? 'addBasicSell'
    : 'editBasicSell'

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'editing'

  const isOwner = context.status === 'connected' && context.account === vault.controller
  const isDisabled =
    (isProgressStage ||
      !isOwner ||
      !isEditing ||
      (uiState.withThreshold &&
        (uiState.maxBuyOrMinSellPrice === undefined || uiState.maxBuyOrMinSellPrice?.isZero())) ||
      uiState.execCollRatio.isZero()) &&
    stage !== 'txSuccess'

  const sidebarStatus = getSidebarStatus({
    stage,
    txHash: uiState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
  })

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })
  const sidebarTitle = getSidebarTitle({ flow, stage, token: vault.token })
  if (isAutoSellActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown: {
        forcePanel: 'autoSell',
        disabled: isDropdownDisabled({ stage }),
        items: commonProtectionDropdownItems(uiChanges, t),
      },
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarAutoSellAddEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  isEditing={isEditing}
                  addTxData={addTxData}
                  priceInfo={priceInfo}
                  basicSellState={uiState}
                  autoSellTriggerData={autoSellTriggerData}
                  autoBuyTriggerData={autoBuyTriggerData}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoSellCancelEditingStage vault={vault} cancelTxData={cancelTxData} />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutoSellCreationStage stage={stage} />
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
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'tx-details',
                txDetails: {},
              })
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'current-form',
                currentForm: 'add',
              })
            } else {
              if (isAddForm) {
                addBasicBSTrigger(txHelpers, addTxData, uiChanges, priceInfo.currentEthPrice)
              }
              if (isRemoveForm) {
                removeBasicBSTrigger(txHelpers, cancelTxData, uiChanges, priceInfo.currentEthPrice)
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
            uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
              type: 'current-form',
              currentForm: isAddForm ? 'remove' : 'add',
            })
            uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
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
