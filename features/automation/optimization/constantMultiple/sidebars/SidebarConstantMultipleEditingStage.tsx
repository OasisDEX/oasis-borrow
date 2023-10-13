import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { AppLink } from 'components/Links'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import {
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  sidebarAutomationFeatureCopyMap,
} from 'features/automation/common/consts'
import { automationInputsAnalytics } from 'features/automation/common/helpers/automationInputsAnalytics'
import { automationMultipleRangeSliderAnalytics } from 'features/automation/common/helpers/automationMultipleRangeSliderAnalytics'
import { calculateCollRatioFromMultiple } from 'features/automation/common/helpers/calculateCollRatioFromMultiple'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers/calculateMultipleFromTargetCollRatio'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import { AutomationFeatures } from 'features/automation/common/types'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.constants'
import type { ConstantMultipleFormChange } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.types'
import { prepareConstantMultipleResetData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange.constants'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { handleNumericInput } from 'helpers/input'
import {
  extractConstantMultipleCommonErrors,
  extractConstantMultipleCommonWarnings,
  extractConstantMultipleMaxBuyErrors,
  extractConstantMultipleMinSellErrors,
  extractConstantMultipleSliderWarnings,
} from 'helpers/messageMappers'
import { uiChanges } from 'helpers/uiChanges'
import { useHash } from 'helpers/useHash'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Text } from 'theme-ui'

import { ConstantMultipleInfoSectionControl } from './ConstantMultipleInfoSectionControl'

interface SidebaConstantMultiplerEditingStageProps {
  isEditing: boolean
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  constantMultipleState: ConstantMultipleFormChange
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
}

export function SidebarConstantMultipleEditingStage({
  isEditing,
  errors,
  warnings,
  constantMultipleState,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
}: SidebaConstantMultiplerEditingStageProps) {
  const { t } = useTranslation()
  const [, setHash] = useHash()
  const {
    positionData: { ilk, id, positionRatio, debt, debtFloor, token },
    triggerData: {
      autoBuyTriggerData,
      autoSellTriggerData,
      constantMultipleTriggerData,
      stopLossTriggerData,
    },
  } = useAutomationContext()

  automationMultipleRangeSliderAnalytics({
    leftValue: constantMultipleState.sellExecutionCollRatio,
    rightValue: constantMultipleState.buyExecutionCollRatio,
    type: AutomationFeatures.CONSTANT_MULTIPLE,
    targetMultiple: calculateMultipleFromTargetCollRatio(
      constantMultipleState.targetCollRatio,
    ).decimalPlaces(2),
    ilk,
    vaultId: id,
    positionRatio,
  })

  automationInputsAnalytics({
    minSellPrice: constantMultipleState.minSellPrice,
    withMinSellPriceThreshold: constantMultipleState.sellWithThreshold,
    maxBuyPrice: constantMultipleState.maxBuyPrice,
    withMaxBuyPriceThreshold: constantMultipleState.buyWithThreshold,
    type: AutomationFeatures.CONSTANT_MULTIPLE,
    ilk,
    vaultId: id,
    positionRatio,
  })

  const isVaultEmpty = debt.isZero()
  const { ConstantMultipleReadOnly: constantMultipleReadOnlyEnabled } = useAppConfig('features')

  if (constantMultipleReadOnlyEnabled && !isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('constant-multiple.adding-new-triggers-disabled')}
        description={t('constant-multiple.adding-new-triggers-disabled-description')}
      />
    )
  }

  const feature = t(sidebarAutomationFeatureCopyMap[AutomationFeatures.CONSTANT_MULTIPLE])

  if (isVaultEmpty && constantMultipleTriggerData.isTriggerEnabled) {
    return (
      <SidebarFormInfo
        title={t('automation.closed-vault-existing-trigger-header', { feature })}
        description={t('automation.closed-vault-existing-trigger-description', { feature })}
      />
    )
  }

  if (isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('automation.closed-vault-not-existing-trigger-header', {
          feature,
          debtToken: 'DAI',
        })}
        description={t('automation.closed-vault-not-existing-trigger-description', {
          feature,
          debtToken: 'DAI',
        })}
      />
    )
  }

  return constantMultipleState.eligibleMultipliers.length ? (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('constant-multiple.set-trigger-description', {
          token,
          buyExecutionCollRatio: constantMultipleState.buyExecutionCollRatio.toNumber(),
          sellExecutionCollRatio: constantMultipleState.sellExecutionCollRatio.toNumber(),
          multiplier: constantMultipleState.multiplier,
        })}
      </Text>
      <Text as="p" variant="boldParagraph3" sx={{ color: 'neutral80' }}>
        {t('constant-multiple.set-trigger-risk')}
        <AppLink href={EXTERNAL_LINKS.KB.CONSTANT_MULTIPLE_RISKS} sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>
      <Box sx={{ mb: 2 }}>
        <ActionPills
          active={constantMultipleState.multiplier.toString()}
          variant="secondary"
          items={constantMultipleState.multipliers.map((multiplier) => ({
            id: multiplier.toString(),
            label: `${multiplier}x`,
            disabled: !constantMultipleState.eligibleMultipliers.includes(multiplier),
            action: () => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'is-editing',
                isEditing: true,
              })
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'multiplier',
                multiplier: multiplier,
              })

              trackingEvents.automation.buttonClick(
                MixpanelAutomationEventIds.TargetMultiplier,
                MixpanelPages.ConstantMultiple,
                MixpanelCommonAnalyticsSections.Form,
                {
                  vaultId: id.toString(),
                  ilk: ilk,
                  targetMultiple: multiplier.toString(),
                },
              )
            },
          }))}
        />
      </Box>
      <MultipleRangeSlider
        min={constantMultipleState.minTargetRatio.toNumber()}
        max={constantMultipleState.maxTargetRatio.toNumber()}
        onChange={(value) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
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
          value0: 'warning100',
          value1: 'success100',
        }}
        step={1}
        leftDescription={t('auto-sell.sell-trigger-ratio')}
        rightDescription={t('auto-buy.trigger-coll-ratio')}
        leftThumbColor="warning100"
        rightThumbColor="success100"
        middleMark={{
          text: `${constantMultipleState.multiplier}x`,
          value: constantMultipleState.targetCollRatio.toNumber(),
        }}
        isResetAction={constantMultipleState.isResetAction}
      />
      {isEditing && (
        <>
          <VaultWarnings
            warningMessages={extractConstantMultipleSliderWarnings(warnings)}
            ilkData={{ debtFloor }}
          />
          <VaultErrors
            errorMessages={errors.filter(
              (item) => item === 'targetCollRatioExceededDustLimitCollRatio',
            )}
            ilkData={{ debtFloor, token }}
          />
        </>
      )}
      <VaultActionInput
        action={t('auto-buy.set-max-buy-price')}
        amount={constantMultipleState?.maxBuyPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((maxBuyPrice) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'max-buy-price',
            maxBuyPrice: maxBuyPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
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
      {isEditing && (
        <>
          <VaultErrors
            errorMessages={extractConstantMultipleMaxBuyErrors(errors)}
            ilkData={{ debtFloor, token }}
          />
          <VaultWarnings
            warningMessages={warnings.filter(
              (item) => item === 'settingAutoBuyTriggerWithNoThreshold',
            )}
            ilkData={{ debtFloor }}
          />
        </>
      )}

      <VaultActionInput
        action={t('auto-sell.set-min-sell-price')}
        amount={constantMultipleState?.minSellPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((minSellPrice) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'min-sell-price',
            minSellPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
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
      {isEditing && (
        <>
          <VaultErrors
            errorMessages={extractConstantMultipleMinSellErrors(errors)}
            ilkData={{ debtFloor, token }}
          />
          <VaultWarnings
            warningMessages={extractConstantMultipleCommonWarnings(warnings)}
            ilkData={{ debtFloor }}
            isAutoBuyEnabled={autoBuyTriggerData.isTriggerEnabled}
            isAutoSellEnabled={autoSellTriggerData.isTriggerEnabled}
          />
          <VaultErrors
            errorMessages={extractConstantMultipleCommonErrors(errors)}
            ilkData={{ debtFloor, token }}
          />
        </>
      )}
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
        }}
        value={constantMultipleState.maxBaseFeeInGwei.toNumber()}
        analytics={{
          page: MixpanelPages.ConstantMultiple,
          additionalParams: { vaultId: id.toString(), ilk: ilk },
        }}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'is-reset-action',
                isResetAction: true,
              })
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareConstantMultipleResetData({
                  defaultMultiplier: constantMultipleState.defaultMultiplier,
                  defaultCollRatio: constantMultipleState.defaultCollRatio,
                  constantMultipleTriggerData,
                }),
              })
            }}
          />
          <ConstantMultipleInfoSectionControl
            token={token}
            nextBuyPrice={nextBuyPrice}
            nextSellPrice={nextSellPrice}
            collateralToBePurchased={collateralToBePurchased}
            collateralToBeSold={collateralToBeSold}
            estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
            estimatedBuyFee={estimatedBuyFee}
            estimatedSellFee={estimatedSellFee}
            constantMultipleState={constantMultipleState}
          />
        </>
      )}
    </>
  ) : (
    <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
      {stopLossTriggerData?.isStopLossEnabled ? (
        <Trans
          i18nKey="constant-multiple.sl-too-high"
          components={[
            <Text
              as="span"
              sx={{ fontWeight: 'semiBold', color: 'interactive100', cursor: 'pointer' }}
              onClick={() => {
                uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                  type: 'Protection',
                  currentProtectionFeature: AutomationFeatures.STOP_LOSS,
                })
                setHash(VaultViewMode.Protection)
              }}
            />,
          ]}
          values={{
            maxStopLoss: calculateCollRatioFromMultiple(
              constantMultipleState.eligibleMultipliers[0] || constantMultipleState.multipliers[0],
            ).minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)),
          }}
        />
      ) : (
        <Trans
          i18nKey="constant-multiple.coll-ratio-too-close-to-dust-limit"
          components={[
            <Text
              as="span"
              sx={{ fontWeight: 'semiBold', color: 'interactive100', cursor: 'pointer' }}
              onClick={() => {
                uiChanges.publish(TAB_CHANGE_SUBJECT, {
                  type: 'change-tab',
                  currentMode: VaultViewMode.Overview,
                })
                setHash(VaultViewMode.Protection)
              }}
            />,
          ]}
        />
      )}
    </Text>
  )
}
