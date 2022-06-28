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
import { commonProtectionDropdownItems } from 'features/automation/protection/common/dropdown'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { SidebarAutoSellEditingStage } from 'features/automation/protection/controls/sidebar/SidebarAutoSellEditingStage'
import { PriceInfo } from 'features/shared/priceInfo'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  vault: Vault
  ilkData: IlkData
  priceInfo: PriceInfo
  autoSellTriggerData: BasicBSTriggerData
  isAutoSellActive: boolean
}

export function SidebarSetupAutoSell({
  vault,
  ilkData,
  priceInfo,
  autoSellTriggerData,
  isAutoSellActive,
}: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const { uiChanges, txHelpers$ } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)
  console.log(uiState.txDetails)
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
    ],
  )

  const removeTxData = prepareRemoveBasicBSTriggerData({
    vaultData: vault,
    triggerType: TriggerType.BasicSell,
    triggerId: uiState.triggerId,
  })

  const isAddForm = uiState.currentForm === 'add'
  const isRemoveForm = uiState.currentForm === 'remove'
  // TODO isEditing to be extended
  const isEditing = !autoSellTriggerData.targetCollRatio.isEqualTo(uiState.targetCollRatio)

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

  if (isAutoSellActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('auto-sell.form-title'),
      dropdown: {
        forcePanel: 'autoSell',
        disabled: isDropdownDisabled({ stage }),
        items: commonProtectionDropdownItems(uiChanges, t),
      },
      content: (
        <Grid gap={3}>
          {isAddForm && (
            <SidebarAutoSellEditingStage
              vault={vault}
              ilkData={ilkData}
              isEditing={isEditing}
              addTxData={addTxData}
              priceInfo={priceInfo}
              basicSellState={uiState}
            />
          )}
          {isRemoveForm && <>Remove form TBD</>}
        </Grid>
      ),
      primaryButton: {
        label: 'Confirm',
        disabled: false,
        action: () => {
          if (txHelpers) {
            if (isAddForm) {
              addBasicBSTrigger(txHelpers, addTxData, uiChanges, priceInfo.currentEthPrice)
            }
            if (isRemoveForm) {
              removeBasicBSTrigger(txHelpers, removeTxData, uiChanges, priceInfo.currentEthPrice)
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
          },
        },
      }),
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
