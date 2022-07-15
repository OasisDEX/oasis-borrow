import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  AutomationChangeFeature,
  AUTOMATION_CHANGE_FEATURE,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupContantMultipleProps {
  stage: SidebarVaultStages

  isAddForm: boolean
  isRemoveForm: boolean
  // isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
}

export function SidebarSetupConstantMultiple({
  isAddForm,
  isRemoveForm,
  // isEditing,
  isDisabled,
  isFirstSetup,
  stage,
}: SidebarSetupContantMultipleProps) {
  const { t } = useTranslation()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })

  if (activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('constant-multiple.title'),
      content: <Grid gap={3}></Grid>,
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled /*|| !!errors.length*/ && stage !== 'txSuccess',
        isLoading: stage === 'txInProgress',
        action: () => txHandler(),
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
          hidden: true,
          action: () => textButtonHandler(),
        },
      }),
      // TODO ŁW status:
    }
    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}

function txHandler(): void {
  alert('adding trigger')
}
function textButtonHandler(): void {
  alert('switch to remove')
}
