import BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ConstantMultipleInfoSection } from 'features/automation/basicBuySell/InfoSections/ConstantMultipleInfoSection'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { INITIAL_MULTIPLIER_SELECTED } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { handleNumericInput } from 'helpers/input'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React, {  useCallback } from 'react'
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
  const { uiChanges } = useAppContext()

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
      content: (
        <Grid gap={3}>
          <ActionPills
            active={
              constantMultipleState?.multiplier
                ? constantMultipleState.multiplier.toString()
                : INITIAL_MULTIPLIER_SELECTED.toString()
            }
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
          <MultipleRangeSlider
            min={200} // TODO ŁW min, max
            max={500}
            onChange={(value) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'target-coll-ratio',
                targetCollRatio: new BigNumber(value.value0),
              })
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'execution-coll-ratio',
                execCollRatio: new BigNumber(value.value1),
              })
            }}
            value={{
              value0: constantMultipleState?.sellExecutionCollRatio? constantMultipleState.sellExecutionCollRatio.toNumber() : 250,
              value1: constantMultipleState?.buyExecutionCollRatio? constantMultipleState.buyExecutionCollRatio.toNumber() : 400,
            }}
            valueColors={{
              value0: 'onSuccess',
              value1: 'onWarning',
            }}
            step={1}
            leftDescription={t('auto-sell.sell-trigger-ratio')}
            rightDescription={t('auto-buy.trigger-coll-ratio')}
            leftThumbColor="onSuccess"
            rightThumbColor="onWarning"
          />
          <VaultActionInput
            action={t('auto-buy.set-max-buy-price')}
            amount={constantMultipleState?.maxBuyPrice}
            hasAuxiliary={false}
            hasError={false}
            currencyCode="USD"
            onChange={handleNumericInput((maxBuyPrice) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'max-buy-price',
                maxBuyPrice: maxBuyPrice,
              })
            })}
            onToggle={(toggleStatus) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'buy-with-threshold',
                buyWithThreshold: toggleStatus,
              })
              // uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
              //   type: 'max-buy-or-sell-price',
              //   maxBuyOrMinSellPrice: !toggleStatus
              //     ? undefined
              //     : autoBuyTriggerData.maxBuyOrMinSellPrice.isEqualTo(maxUint256)
              //     ? zero
              //     : autoBuyTriggerData.maxBuyOrMinSellPrice,
              // })
            }}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
            defaultToggle={constantMultipleState?.buyWithThreshold}
          />
          <VaultActionInput
            action={t('auto-sell.set-min-sell-price')}
            amount={constantMultipleState?.minSellPrice}
            hasAuxiliary={false}
            hasError={false}
            currencyCode="USD"
            onChange={handleNumericInput((minSellPrice) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'min-sell-price',
                minSellPrice,
              })
            })}
            onToggle={(toggleStatus) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'sell-with-threshold',
                sellWithThreshold: toggleStatus,
              })
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'min-sell-price',
                // minSellPrice: !toggleStatus
                //   ? undefined
                //   : autoSellTriggerData.maxBuyOrMinSellPrice,
              })
            }}
            defaultToggle={constantMultipleState?.sellWithThreshold}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
          />
          <ConstantMultipleInfoSectionControl />
        </Grid>
      ),
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

interface ConstantMultipleInfoSectionControlProps {}

function ConstantMultipleInfoSectionControl({}: ConstantMultipleInfoSectionControlProps) {
  return <ConstantMultipleInfoSection />
}
