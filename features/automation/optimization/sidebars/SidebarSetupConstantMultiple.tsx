import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { ActionPills } from 'components/ActionPills'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ConstantMultipleInfoSection } from 'features/automation/basicBuySell/InfoSections/ConstantMultipleInfoSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { commonOptimizationDropdownItems } from 'features/automation/optimization/common/dropdown'
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
import React from 'react'
import { Grid } from 'theme-ui'

const SLIDER_MAX_FOR_BIG_VAULTS = 500

interface SidebarSetupConstantMultipleProps {
  vault: Vault
  stage: SidebarVaultStages
  constantMultipleState: ConstantMultipleFormChange
  isAddForm: boolean
  isRemoveForm: boolean
  // isEditing: boolean //TODO ŁW, will be used in middle stages
  isDisabled: boolean
  isFirstSetup: boolean

  // multiplier?: number
  onChange: (multiplier: number) => void
  txHandler: () => void
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}

export function SidebarSetupConstantMultiple({
  vault,
  isAddForm,
  isRemoveForm,
  // isEditing,
  isDisabled,
  isFirstSetup,
  stage,
  onChange: onMultiplierChange,
  constantMultipleState,
  txHandler,
  ilkData,
  autoBuyTriggerData,
  stopLossTriggerData,
}: SidebarSetupConstantMultipleProps) {
  const { t } = useTranslation()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()
  const { debt, lockedCollateral, token } = vault

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })
  const acceptableMultipliers = [1.25, 1.5, 2, 2.5, 3, 4]
  function handleChangeMultiplier(multiplier: number) {
    onMultiplierChange(multiplier)
  }

  const nextBuyPrice = collateralPriceAtRatio({
    // TODO: PK get value from constantMultipleState
    colRatio: new BigNumber(3),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const nextSellPrice = collateralPriceAtRatio({
    // TODO: PK get value from constantMultipleState
    colRatio: new BigNumber(2),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  // TODO: PK get both values based on function:
  // const { debtDelta } = getBasicBSVaultChange({
  //   basicBSState: basicBuyState,
  //   vault,
  //   executionPrice,
  // })
  const collateralToBePurchased = new BigNumber(1.125)
  const collateralToBeSold = new BigNumber(1.125)
  const { min: sliderMin } = getBasicSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })
  const sliderMax = min([
    vault.lockedCollateralUSD
      .div(ilkData.debtFloor)
      .multipliedBy(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
      .toNumber(),
    SLIDER_MAX_FOR_BIG_VAULTS,
  ])

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
            max={sliderMax || SLIDER_MAX_FOR_BIG_VAULTS}
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
            }}
            defaultToggle={constantMultipleState?.sellWithThreshold}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
          />
          <ConstantMultipleInfoSectionControl
            token={token}
            nextBuyPrice={nextBuyPrice}
            nextSellPrice={nextSellPrice}
            collateralToBePurchased={collateralToBePurchased}
            collateralToBeSold={collateralToBeSold}
          />
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

function textButtonHandler(): void {
  alert('switch to remove')
}

interface ConstantMultipleInfoSectionControlProps {
  token: string
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  // TODO: PK get constantMultipleState here
}

function ConstantMultipleInfoSectionControl({
  token,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
}: ConstantMultipleInfoSectionControlProps) {
  // TODO: PK get those values from constantMultipleState when there is actual data
  const targetColRatio = new BigNumber(200)
  const multiplier = 2
  const slippage = new BigNumber(0.5)
  const triggerColRatioToBuy = new BigNumber(200)
  const triggerColRatioToSell = new BigNumber(300)
  const maxPriceToBuy = new BigNumber(1600)
  const minPriceToSell = new BigNumber(1200)

  return (
    <ConstantMultipleInfoSection
      token={token}
      targetColRatio={targetColRatio}
      multiplier={multiplier}
      slippage={slippage}
      triggerColRatioToBuy={triggerColRatioToBuy}
      nextBuyPrice={nextBuyPrice}
      collateralToBePurchased={collateralToBePurchased}
      maxPriceToBuy={maxPriceToBuy}
      triggerColRatioToSell={triggerColRatioToSell}
      nextSellPrice={nextSellPrice}
      collateralToBeSold={collateralToBeSold}
      minPriceToSell={minPriceToSell}
    />
  )
}
