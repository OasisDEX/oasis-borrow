import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  errorsBasicSellValidation,
  warningsBasicSellValidation,
} from 'features/automation/common/validators'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { SidebarAutoBuyConfirmationStage } from 'features/automation/optimization/sidebars/SidebarAutoBuyConfirmationStage'
import { commonProtectionDropdownItems } from 'features/automation/protection/common/dropdown'
import { getBasicSellMinMaxValues } from 'features/automation/protection/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { SidebarAutoSellCancelEditingStage } from 'features/automation/protection/controls/sidebar/SidebarAuteSellCancelEditingStage'
import { SidebarAutoSellAddEditingStage } from 'features/automation/protection/controls/sidebar/SidebarAutoSellAddEditingStage'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/sidebars/SidebarAutomationFeatureCreationStage'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { calculateStepNumber, selectSideBarTextBtnLabel } from 'helpers/functions'
import { extractCancelBSErrors, extractCancelBSWarnings } from 'helpers/messageMappers'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoSellProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoSellActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  basicSellState: BasicBSFormChange
  txHandler: () => void
  textButtonHandler: () => void
  stage: SidebarVaultStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  debtDelta: BigNumber
  collateralDelta: BigNumber
  isConfirmation: boolean
  isProgressStage: boolean
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
  constantMultipleTriggerData,

  isAutoSellActive,
  basicSellState,
  txHandler,
  textButtonHandler,
  stage,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,
  isConfirmation,
  isProgressStage,

  debtDelta,
  collateralDelta,
}: SidebarSetupAutoSellProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const gasEstimation = useGasEstimationContext()

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
    constantMultipleTriggerData,
    isRemoveForm,
  })

  const { min, max } = getBasicSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const warnings = warningsBasicSellValidation({
    vault,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    minSellPrice: basicSellState.maxBuyOrMinSellPrice,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    basicSellState,
    sliderMin: min,
    sliderMax: max,
  })

  const cancelAutoSellWarnings = extractCancelBSWarnings(warnings)
  const cancelAutoSellErrors = extractCancelBSErrors(errors)
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
              {isAddForm && !isConfirmation && (
                <SidebarAutoSellAddEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  isEditing={isEditing}
                  basicSellState={basicSellState}
                  autoSellTriggerData={autoSellTriggerData}
                  errors={errors}
                  warnings={warnings}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                  sliderMin={min}
                  sliderMax={max}
                />
              )}
              {isConfirmation && (
                <SidebarAutoBuyConfirmationStage
                  vault={vault}
                  basicBuyState={basicSellState}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoSellCancelEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelAutoSellErrors}
                  warnings={cancelAutoSellWarnings}
                  basicSellState={basicSellState}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutomationFeatureCreationStage
              featureName="Auto-Sell"
              stage={stage}
              isAddForm={isAddForm}
              isRemoveForm={isRemoveForm}
            />
          )}
        </Grid>
      ),
      primaryButton: {
        label: `${primaryButtonLabel} ${calculateStepNumber(
          isConfirmation,
          stage,
          isProgressStage,
        )}`,
        disabled: isDisabled || !!validationErrors.length,
        isLoading: stage === 'txInProgress',
        action: () => {
          if (!isConfirmation) {
            uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
              type: 'is-confirmation',
              isConfirmation: true,
            })
          } else {
            txHandler()
          }
        },
      },
      ...((stage !== 'txInProgress' || isConfirmation) && {
        textButton: {
          label: selectSideBarTextBtnLabel(isConfirmation, isAddForm, t),
          hidden: basicSellState.triggerId.isZero(),
          action: () => {
            if (isConfirmation) {
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'is-confirmation',
                isConfirmation: false,
              })
            } else {
              textButtonHandler()
            }
          },
        },
      }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
