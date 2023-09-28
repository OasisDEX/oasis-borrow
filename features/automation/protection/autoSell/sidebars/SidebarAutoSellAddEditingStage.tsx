import { MixpanelPages } from 'analytics/types'
import { BigNumber } from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
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
import { adjustDefaultValuesIfOutsideSlider } from 'features/automation/common/helpers/adjustDefaultValuesIfOutsideSlider'
import { automationInputsAnalytics } from 'features/automation/common/helpers/automationInputsAnalytics'
import { automationMultipleRangeSliderAnalytics } from 'features/automation/common/helpers/automationMultipleRangeSliderAnalytics'
import { prepareAutoBSResetData } from 'features/automation/common/helpers/prepareAutoBSResetData'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AUTO_SELL_FORM_CHANGE } from 'features/automation/common/state/autoBSFormChange.constants'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import { AutomationFeatures } from 'features/automation/common/types'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange.constants'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { handleNumericInput } from 'helpers/input'
import { uiChanges } from 'helpers/uiChanges'
import { useHash } from 'helpers/useHash'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Text } from 'theme-ui'

import { AutoSellInfoSectionControl } from './AutoSellInfoSectionControl'

interface SidebarAutoSellAddEditingStageProps {
  isEditing: boolean
  autoSellState: AutoBSFormChange
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
}

export function SidebarAutoSellAddEditingStage({
  isEditing,
  autoSellState,
  errors,
  warnings,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
}: SidebarAutoSellAddEditingStageProps) {
  const {
    positionData: { id, ilk, debt, debtFloor, lockedCollateral, positionRatio, token },
    triggerData: { autoSellTriggerData, stopLossTriggerData },
  } = useAutomationContext()
  const { t } = useTranslation()
  const [, setHash] = useHash()
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoSellState.execCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const { ReadOnlyBasicBS: readOnlyAutoBSEnabled } = useAppConfig('features')
  const isVaultEmpty = debt.isZero()

  const { isStopLossEnabled, stopLossLevel } = stopLossTriggerData

  useEffect(() => {
    adjustDefaultValuesIfOutsideSlider({
      autoBSState: autoSellState,
      sliderMax,
      sliderMin,
      uiChanges,
      publishType: AUTO_SELL_FORM_CHANGE,
    })
  }, [positionRatio.toNumber()])

  automationMultipleRangeSliderAnalytics({
    leftValue: autoSellState.execCollRatio,
    rightValue: autoSellState.targetCollRatio,
    vaultId: id,
    positionRatio,
    ilk,
    type: AutomationFeatures.AUTO_SELL,
  })

  automationInputsAnalytics({
    minSellPrice: autoSellState.maxBuyOrMinSellPrice,
    withMinSellPriceThreshold: autoSellState.withThreshold,
    vaultId: id,
    positionRatio,
    ilk,
    type: AutomationFeatures.AUTO_SELL,
  })

  const isCurrentCollRatioHigherThanSliderMax = positionRatio.times(100).gt(sliderMax)

  if (
    isStopLossEnabled &&
    stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)).gt(sliderMax)
  ) {
    return (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="auto-sell.sl-too-high"
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
            maxStopLoss: sliderMax.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)),
          }}
        />
      </Text>
    )
  }

  if (isCurrentCollRatioHigherThanSliderMax) {
    return (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="auto-sell.coll-ratio-too-high"
          components={[
            <Text
              as="span"
              sx={{ fontWeight: 'semiBold', color: 'interactive100', cursor: 'pointer' }}
              onClick={() => {
                uiChanges.publish(TAB_CHANGE_SUBJECT, {
                  type: 'change-tab',
                  currentMode: VaultViewMode.Overview,
                })
                setHash(VaultViewMode.Overview)
              }}
            />,
          ]}
          values={{
            maxAutoBuyCollRatio: sliderMax.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)),
          }}
        />
      </Text>
    )
  }

  if (readOnlyAutoBSEnabled && !isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('auto-sell.adding-new-triggers-disabled')}
        description={t('auto-sell.adding-new-triggers-disabled-description')}
      />
    )
  }

  const feature = t(sidebarAutomationFeatureCopyMap[AutomationFeatures.AUTO_SELL])

  if (isVaultEmpty && autoSellTriggerData.isTriggerEnabled) {
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

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {autoSellState.maxBuyOrMinSellPrice !== undefined
          ? t('auto-sell.set-trigger-description', {
              targetCollRatio: autoSellState.targetCollRatio.toNumber(),
              token,
              execCollRatio: autoSellState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
              minSellPrice: autoSellState.maxBuyOrMinSellPrice,
            })
          : t('auto-sell.set-trigger-description-no-threshold', {
              targetCollRatio: autoSellState.targetCollRatio.toNumber(),
              token,
              execCollRatio: autoSellState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
            })}{' '}
        <AppLink href={EXTERNAL_LINKS.KB.SETTING_AUTO_SELL} sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>{' '}
      <MultipleRangeSlider
        min={sliderMin.toNumber()}
        max={sliderMax.toNumber()}
        onChange={(value) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'execution-coll-ratio',
            execCollRatio: new BigNumber(value.value0),
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'target-coll-ratio',
            targetCollRatio: new BigNumber(value.value1),
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        value={{
          value0: autoSellState.execCollRatio.toNumber(),
          value1: autoSellState.targetCollRatio.toNumber(),
        }}
        valueColors={{
          value0: 'warning100',
          value1: 'primary100',
        }}
        step={1}
        leftDescription={t('auto-sell.sell-trigger-ratio')}
        rightDescription={t('auto-sell.target-coll-ratio')}
        leftThumbColor="warning100"
        rightThumbColor="primary100"
      />
      <VaultActionInput
        action={t('auto-sell.set-min-sell-price')}
        amount={autoSellState.maxBuyOrMinSellPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice,
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'with-threshold',
            withThreshold: toggleStatus,
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice: !toggleStatus
              ? undefined
              : autoSellTriggerData.maxBuyOrMinSellPrice,
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        defaultToggle={autoSellState.withThreshold}
        showToggle={true}
        toggleOnLabel={t('protection.set-no-threshold')}
        toggleOffLabel={t('protection.set-threshold')}
        toggleOffPlaceholder={t('protection.no-threshold')}
      />
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} autoType="Auto-Sell" />
          <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
        </>
      )}
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        value={autoSellState.maxBaseFeeInGwei.toNumber()}
        analytics={{
          page: MixpanelPages.AutoSell,
          additionalParams: { vaultId: id.toString(), ilk },
        }}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareAutoBSResetData(
                  autoSellTriggerData,
                  positionRatio,
                  AUTO_SELL_FORM_CHANGE,
                ),
              })
            }}
          />
          <AutoSellInfoSectionControl
            autoSellState={autoSellState}
            debtDelta={debtDelta}
            collateralDelta={collateralDelta}
            executionPrice={executionPrice}
            maxGasFee={autoSellState.maxBaseFeeInGwei.toNumber()}
          />
        </>
      )}
    </>
  )
}
