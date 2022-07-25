import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { getBasicBuyMinMaxValues } from 'features/automation/optimization/helpers'
import {
  errorsBasicBuyValidation,
  warningsBasicBuyValidation,
} from 'features/automation/optimization/validators'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { extractCancelAutoBuyErrors, extractCancelAutoBuyWarnings } from 'helpers/messageMappers'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Grid } from 'theme-ui'

import { SidebarAutoBuyCreationStage } from './SidebarAutoBuyAdditionStage'
import { SidebarAutoBuyEditingStage } from './SidebarAutoBuyEditingStage'
import { SidebarAutoBuyRemovalEditingStage } from './SidebarAutoBuyRemovalEditingStage'

export interface SidebarSetupAutoBuyProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  isAutoBuyOn: boolean
  context: Context
  ethMarketPrice: BigNumber
  basicBuyState: BasicBSFormChange
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

export function SidebarSetupAutoBuy({
  vault,
  ilkData,
  balanceInfo,
  context,
  ethMarketPrice,

  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,

  isAutoBuyOn,
  basicBuyState,
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
}: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelBasicBuy'
    : isFirstSetup
    ? 'addBasicBuy'
    : 'editBasicBuy'

  const sidebarStatus = getSidebarStatus({
    stage,
    txHash: basicBuyState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
  })

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })

  const errors = errorsBasicBuyValidation({
    basicBuyState,
    autoSellTriggerData,
    isRemoveForm,
  })

  const { min, max } = getBasicBuyMinMaxValues({
    autoSellTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const warnings = warningsBasicBuyValidation({
    vault,
    gasEstimationUsd,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    minSellPrice: basicBuyState.maxBuyOrMinSellPrice,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    basicBuyState,
    sliderMin: min,
    withThreshold: basicBuyState.withThreshold,
  })

  const cancelAutoBuyWarnings = extractCancelAutoBuyWarnings(warnings)
  const cancelAutoBuyErrors = extractCancelAutoBuyErrors(errors)

  const validationErrors = isAddForm ? errors : cancelAutoBuyErrors

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
                  basicBuyState={basicBuyState}
                  isEditing={isEditing}
                  autoBuyTriggerData={autoBuyTriggerData}
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
                <SidebarAutoBuyRemovalEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelAutoBuyErrors}
                  warnings={cancelAutoBuyWarnings}
                  cancelTriggerGasEstimation={cancelTriggerGasEstimation}
                  basicBuyState={basicBuyState}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutoBuyCreationStage
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
          hidden: basicBuyState.triggerId.isZero(),
          action: () => textButtonHandler(),
        },
      }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
