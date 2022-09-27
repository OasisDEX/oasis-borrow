import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { ActionPills } from 'components/ActionPills'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import {
  ACCEPTABLE_FEE_DIFF,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { calculateCollRatioFromMultiple } from 'features/automation/common/helpers'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { AddConstantMultipleInfoSection } from 'features/automation/optimization/constantMultiple/controls/AddConstantMultipleInfoSection'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import {
  ConstantMultipleTriggerData,
  prepareConstantMultipleResetData,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange'
import { handleNumericInput } from 'helpers/input'
import {
  extractConstantMultipleCommonErrors,
  extractConstantMultipleCommonWarnings,
  extractConstantMultipleMaxBuyErrors,
  extractConstantMultipleMinSellErrors,
  extractConstantMultipleSliderWarnings,
} from 'helpers/messageMappers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHash } from 'helpers/useHash'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Text } from 'theme-ui'

interface SidebaConstantMultiplerEditingStageProps {
  vault: Vault
  ilkData: IlkData
  isEditing: boolean
  autoBuyTriggerData: AutoBSTriggerData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  token: string
  constantMultipleState: ConstantMultipleFormChange
  autoSellTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  stopLossTriggerData: StopLossTriggerData
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
}

export function SidebarConstantMultipleEditingStage({
  vault,
  ilkData,
  isEditing,
  autoBuyTriggerData,
  errors,
  warnings,
  token,
  constantMultipleState,
  autoSellTriggerData,
  constantMultipleTriggerData,
  stopLossTriggerData,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
}: SidebaConstantMultiplerEditingStageProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const [, setHash] = useHash()

  const isVaultEmpty = vault.debt.isZero()
  const constantMultipleReadOnlyEnabled = useFeatureToggle('ConstantMultipleReadOnly')

  if (constantMultipleReadOnlyEnabled && !isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('constant-multiple.adding-new-triggers-disabled')}
        description={t('constant-multiple.adding-new-triggers-disabled-description')}
      />
    )
  }

  if (isVaultEmpty && constantMultipleTriggerData.isTriggerEnabled) {
    return (
      <SidebarFormInfo
        title={t('constant-multiple.closed-vault-existing-trigger-header')}
        description={t('constant-multiple.closed-vault-existing-trigger-description')}
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
        <AppLink
          href="https://kb.oasis.app/help/what-are-the-risks-associated-with-constant-multiple"
          sx={{ fontSize: 2 }}
        >
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
      <VaultWarnings
        warningMessages={extractConstantMultipleSliderWarnings(warnings)}
        ilkData={ilkData}
      />
      <VaultErrors
        errorMessages={errors.filter(
          (item) => item === 'targetCollRatioExceededDustLimitCollRatio',
        )}
        ilkData={ilkData}
      />
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
      <VaultErrors errorMessages={extractConstantMultipleMaxBuyErrors(errors)} ilkData={ilkData} />
      <VaultWarnings
        warningMessages={warnings.filter((item) => item === 'settingAutoBuyTriggerWithNoThreshold')}
        ilkData={ilkData}
      />
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
      <VaultErrors errorMessages={extractConstantMultipleMinSellErrors(errors)} ilkData={ilkData} />
      <VaultWarnings
        warningMessages={extractConstantMultipleCommonWarnings(warnings)}
        ilkData={ilkData}
        isAutoBuyEnabled={autoBuyTriggerData.isTriggerEnabled}
        isAutoSellEnabled={autoSellTriggerData.isTriggerEnabled}
      />
      <VaultErrors errorMessages={extractConstantMultipleCommonErrors(errors)} ilkData={ilkData} />
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

interface ConstantMultipleInfoSectionControlProps {
  token: string
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
  constantMultipleState: ConstantMultipleFormChange
}

function ConstantMultipleInfoSectionControl({
  token,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
  constantMultipleState,
}: ConstantMultipleInfoSectionControlProps) {
  const feeDiff = estimatedBuyFee.minus(estimatedSellFee).abs()
  const estimatedOasisFee = feeDiff.gt(ACCEPTABLE_FEE_DIFF)
    ? [estimatedBuyFee, estimatedSellFee].sort((a, b) => (a.gt(b) ? 0 : -1))
    : [BigNumber.maximum(estimatedBuyFee, estimatedSellFee)]

  return (
    <AddConstantMultipleInfoSection
      token={token}
      targetColRatio={constantMultipleState.targetCollRatio}
      multiplier={constantMultipleState.multiplier}
      buyExecutionCollRatio={constantMultipleState.buyExecutionCollRatio}
      nextBuyPrice={nextBuyPrice}
      collateralToBePurchased={collateralToBePurchased}
      maxPriceToBuy={
        constantMultipleState.buyWithThreshold
          ? constantMultipleState.maxBuyPrice || zero
          : undefined
      }
      sellExecutionCollRatio={constantMultipleState.sellExecutionCollRatio}
      nextSellPrice={nextSellPrice}
      collateralToBeSold={collateralToBeSold}
      minPriceToSell={
        constantMultipleState.sellWithThreshold
          ? constantMultipleState.minSellPrice || zero
          : undefined
      }
      estimatedOasisFee={estimatedOasisFee}
      estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
    />
  )
}
