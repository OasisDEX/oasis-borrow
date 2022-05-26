import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { useAppContext } from '../../../../../components/AppContextProvider'
import {
  SidebarSection,
  SidebarSectionProps,
} from '../../../../../components/sidebar/SidebarSection'
import { VaultErrors } from '../../../../../components/vault/VaultErrors'
import { VaultWarnings } from '../../../../../components/vault/VaultWarnings'
import { VaultViewMode } from '../../../../../components/VaultTabSwitch'
import { getPrimaryButtonLabel } from '../../../../sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from '../../../../sidebar/getSidebarProgress'
import { getSidebarSuccess } from '../../../../sidebar/getSidebarSuccess'
import { getSidebarTitle } from '../../../../sidebar/getSidebarTitle'
import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
} from '../../common/UITypes/ProtectionFormModeChange'
import { TAB_CHANGE_SUBJECT } from '../../common/UITypes/TabChange'
import { errorsValidation, warningsValidation } from '../../common/validation'
import { AdjustSlFormLayoutProps } from '../AdjustSlFormLayout'
import { SidebarAdjustStopLossAddStage } from './SidebarAdjustStopLossAddStage'
import { SidebarAdjustStopLossEditingStage } from './SidebarAdjustStopLossEditingStage'

export function SidebarAdjustStopLoss(props: AdjustSlFormLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const {
    token,
    txHash,
    addTriggerConfig,
    ethPrice,
    ilkData,
    etherscan,
    toggleForms,
    selectedSLValue,
    firstStopLossSetup,
    collateralizationRatioAtNextPrice,
    txError,
    gasEstimationUsd,
    ethBalance,
    stage,
    isProgressDisabled,
  } = props

  function backToVaultOverview() {
    uiChanges.publish(TAB_CHANGE_SUBJECT, {
      type: 'change-tab',
      currentMode: VaultViewMode.Overview,
    })
    uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
      currentMode: AutomationFromKind.ADJUST,
      type: 'change-mode',
    })
  }

  const flow = firstStopLossSetup ? 'addSl' : 'adjustSl'
  const errors = errorsValidation({ txError, selectedSLValue, ilkData })
  const warnings = warningsValidation({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
    selectedSLValue,
    collateralizationRatioAtNextPrice,
  })

  const progress = getSidebarProgress({ stage, openTxHash: txHash, token, etherscan, flow })

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {(stage === 'editing' || stage === 'txFailure') && (
          <SidebarAdjustStopLossEditingStage {...props} />
        )}
        {(stage === 'txSuccess' || stage === 'txInProgress') && (
          <SidebarAdjustStopLossAddStage {...props} />
        )}
        {stage === 'editing' && !selectedSLValue.isZero() && (
          <>
            <VaultErrors errorMessages={errors} ilkData={ilkData} />
            <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
          </>
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ stage, token, flow }),
      disabled: isProgressDisabled,
      isLoading: stage === 'txInProgress',
      action: () => {
        if (stage !== 'txSuccess') {
          addTriggerConfig.onClick(() => null)
        } else {
          backToVaultOverview()
        }
      },
    },
    ...(!firstStopLossSetup &&
      stage !== 'txInProgress' && {
        textButton: {
          label: t('protection.navigate-cancel'),
          action: () => toggleForms(),
        },
      }),
    ...(txHash && {
      progress,
    }),
    success: getSidebarSuccess({ stage, openTxHash: txHash, token, flow, etherscan }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
