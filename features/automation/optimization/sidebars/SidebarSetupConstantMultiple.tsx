import { ActionPills } from 'components/ActionPills'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import {
  AutomationChangeFeature,
  AUTOMATION_CHANGE_FEATURE,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { INITIAL_MULTIPLIER_SELECTED } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback } from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupConstantMultipleProps {
  stage: SidebarVaultStages
  constantMultipleState: ConstantMultipleFormChange // TODO state needs to be initialized
  isAddForm: boolean
  isRemoveForm: boolean
  // isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean

  // multiplier?: number
  onChange: (multiplier: number) => void

}

export function SidebarSetupConstantMultiple({
  isAddForm,
  isRemoveForm,
  // isEditing,
  isDisabled,
  isFirstSetup,
  stage,
  // multiplier =2,
  onChange: onMultiplierChange,
  constantMultipleState,
}: SidebarSetupConstantMultipleProps) {
  const { t } = useTranslation()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })
  const acceptableMultipliers = [1.25, 1.5, 2, 2.5, 3, 4]
  function handleChangeMultiplier(multiplier: number) {
    alert(`multiplier changed to ${multiplier}`)
    useCallback(
      (multiplier: number) => {
        onMultiplierChange(multiplier)
      },
      [onMultiplierChange],
    )
  
  }
  
  if (activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('constant-multiple.title'),
      content: <Grid gap={3}>
         <ActionPills
                active={constantMultipleState?.multiplier ? constantMultipleState.multiplier.toString() : INITIAL_MULTIPLIER_SELECTED.toString()}
                variant="secondary"
                items={[
                  {
                    id: acceptableMultipliers[0].toString(),
                    label: `${acceptableMultipliers[0]}X`,
                    action: () => {
                      handleChangeMultiplier(acceptableMultipliers[0])
                    },
                  },
                  {
                    id: acceptableMultipliers[1].toString(),
                    label: `${acceptableMultipliers[1]}X`,
                    action: () => {
                      handleChangeMultiplier(acceptableMultipliers[1])
                    },
                  },
                  {
                    id: acceptableMultipliers[2].toString(),
                    label: `${acceptableMultipliers[2]}X`,
                    action: () => {
                      handleChangeMultiplier(acceptableMultipliers[2])
                    },
                  },
                  {
                    id: acceptableMultipliers[3].toString(),
                    label: `${acceptableMultipliers[3]}X`,
                    action: () => {
                      handleChangeMultiplier(acceptableMultipliers[3])
                    },
                  },
                  {
                    id: acceptableMultipliers[4].toString(),
                    label: `${acceptableMultipliers[4]}X`,
                    action: () => {
                      handleChangeMultiplier(acceptableMultipliers[4])
                    },
                  },
                  {
                    id: acceptableMultipliers[5].toString(),
                    label: `${acceptableMultipliers[5]}X`,
                    action: () => {
                      handleChangeMultiplier(acceptableMultipliers[5])
                    },
                  },
                  
                ]}
              />
      
      </Grid>,
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

