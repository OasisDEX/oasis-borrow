import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  errorsBasicSellValidation,
  warningsBasicSellValidation,
} from 'features/automation/common/validators'
import { commonProtectionDropdownItems } from 'features/automation/protection/common/dropdown'
import { getBasicSellMinMaxValues } from 'features/automation/protection/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { SidebarAutoSellCancelEditingStage } from 'features/automation/protection/controls/sidebar/SidebarAuteSellCancelEditingStage'
import { SidebarAutoSellAddEditingStage } from 'features/automation/protection/controls/sidebar/SidebarAutoSellAddEditingStage'
import { SidebarAutoSellCreationStage } from 'features/automation/protection/controls/sidebar/SidebarAutoSellCreationStage'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { extractCancelAutoSellErrors, extractCancelAutoSellWarnings } from 'helpers/messageMappers'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoSellProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  isAutoSellActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  basicSellState: BasicBSFormChange
  txHandler: () => void
  textButtonHandler: () => void
  stage: SidebarVaultStages
  gasEstimationUsd?: BigNumber
  addTriggerGasEstimation: ReactNode
  cancelTriggerGasEstimation: ReactNode
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  debtDelta: BigNumber
  collateralDelta: BigNumber
}

export function SidebarSetupAutoSell({
  vault,
  ilkData,
  balanceInfo,
  context,
  ethMarketPrice,

  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,

  isAutoSellActive,
  basicSellState,
  txHandler,
  textButtonHandler,
  stage,

  gasEstimationUsd,
  addTriggerGasEstimation,
  cancelTriggerGasEstimation,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,

  debtDelta,
  collateralDelta,
}: SidebarSetupAutoSellProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelBasicSell'
    : isFirstSetup
    ? 'addBasicSell'
    : 'editBasicSell'

  const sidebarStatus = getSidebarStatus({
    stage,
    txHash: basicSellState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
  })

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })
  const sidebarTitle = getSidebarTitle({ flow, stage, token: vault.token })

  const errors = errorsBasicSellValidation({
    ilkData,
    vault,
    debtDelta,
    basicSellState,
    autoBuyTriggerData,
    isRemoveForm,
  })

  const { min, max } = getBasicSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const warnings = warningsBasicSellValidation({
    vault,
    gasEstimationUsd,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    minSellPrice: basicSellState.maxBuyOrMinSellPrice,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    basicSellState,
    sliderMin: min,
    sliderMax: max,
  })

  const cancelAutoSellWarnings = extractCancelAutoSellWarnings(warnings)
  const cancelAutoSellErrors = extractCancelAutoSellErrors(errors)

  const validationErrors = isAddForm ? errors : cancelAutoSellErrors

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
                  basicSellState={basicSellState}
                  autoSellTriggerData={autoSellTriggerData}
                  errors={errors}
                  warnings={warnings}
                  addTriggerGasEstimation={addTriggerGasEstimation}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                  sliderMin={min}
                  sliderMax={max}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoSellCancelEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelAutoSellErrors}
                  warnings={cancelAutoSellWarnings}
                  cancelTriggerGasEstimation={cancelTriggerGasEstimation}
                  basicSellState={basicSellState}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutoSellCreationStage
              stage={stage}
              isAddForm={isAddForm}
              isRemoveForm={isRemoveForm}
            />
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled || !!validationErrors.length,
        isLoading: stage === 'txInProgress',
        action: () => txHandler(),
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
          hidden: basicSellState.triggerId.isZero(),
          action: () => textButtonHandler(),
        },
      }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
