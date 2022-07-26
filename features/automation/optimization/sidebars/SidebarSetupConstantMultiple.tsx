import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { ActionPills } from 'components/ActionPills'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ConstantMultipleInfoSection } from 'features/automation/basicBuySell/InfoSections/ConstantMultipleInfoSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { commonOptimizationDropdownItems } from 'features/automation/optimization/common/dropdown'
import { DEFAULT_SL_SLIDER_BOUNDARY } from 'features/automation/protection/common/consts/automationDefaults'
import { getBasicSellMinMaxValues } from 'features/automation/protection/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
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
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { handleNumericInput } from 'helpers/input'
import { useUIChanges } from 'helpers/uiChangesHook'
import { min } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Grid } from 'theme-ui'

const SLIDER_MAX_FOR_BIG_VAULTS = 500

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
  txHandler: () => void
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  vault: Vault
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
  txHandler,
  ilkData,
  autoBuyTriggerData,
  stopLossTriggerData,
  vault,
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

  const { min: sliderMin } = getBasicSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })
  const sliderMax = min([vault.lockedCollateralUSD.div(ilkData.debtFloor).multipliedBy(100).decimalPlaces(0, BigNumber.ROUND_DOWN).toNumber(), SLIDER_MAX_FOR_BIG_VAULTS])

  if (activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('constant-multiple.title'),
      dropdown: {
        forcePanel: 'constantMultiple',
        disabled: isDropdownDisabled({ stage }),
        items: commonOptimizationDropdownItems(uiChanges, t),
      },
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
            min={sliderMin.toNumber()}
            max={sliderMax? sliderMax : SLIDER_MAX_FOR_BIG_VAULTS}
            onChange={(value) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'sell-execution-coll-ratio',
                sellExecutionCollRatio: new BigNumber(value.value0),
              })
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'buy-execution-coll-ratio',
                buyExecutionCollRatio: new BigNumber(value.value1),
              })
            }}
            value={{
              value0: constantMultipleState.sellExecutionCollRatio.toNumber(),
              value1: constantMultipleState.buyExecutionCollRatio.toNumber(),
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
