import { MixpanelPages } from 'analytics/types'
import BigNumber from 'bignumber.js'
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
  maxUint256,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  sidebarAutomationFeatureCopyMap,
} from 'features/automation/common/consts'
import { adjustDefaultValuesIfOutsideSlider } from 'features/automation/common/helpers/adjustDefaultValuesIfOutsideSlider'
import { automationInputsAnalytics } from 'features/automation/common/helpers/automationInputsAnalytics'
import { automationMultipleRangeSliderAnalytics } from 'features/automation/common/helpers/automationMultipleRangeSliderAnalytics'
import { prepareAutoBSResetData } from 'features/automation/common/helpers/prepareAutoBSResetData'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AUTO_BUY_FORM_CHANGE } from 'features/automation/common/state/autoBSFormChange.constants'
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
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Text } from 'theme-ui'

import { AutoBuyInfoSectionControl } from './AutoBuyInfoSectionControl'

interface SidebarAutoBuyEditingStageProps {
  isEditing: boolean
  autoBuyState: AutoBSFormChange
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
}

export function SidebarAutoBuyEditingStage({
  isEditing,
  autoBuyState,
  errors,
  warnings,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
}: SidebarAutoBuyEditingStageProps) {
  const {
    positionData: { id, ilk, token, debt, debtFloor, lockedCollateral, positionRatio },
    triggerData: { autoBuyTriggerData, stopLossTriggerData },
  } = useAutomationContext()
  const [, setHash] = useHash()
  const { t } = useTranslation()
  const { ReadOnlyBasicBS: readOnlyAutoBSEnabled } = useAppConfig('features')
  const isVaultEmpty = debt.isZero()
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBuyState.execCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })

  const { isStopLossEnabled, stopLossLevel } = stopLossTriggerData

  useEffect(() => {
    adjustDefaultValuesIfOutsideSlider({
      autoBSState: autoBuyState,
      sliderMax,
      sliderMin,
      uiChanges,
      publishType: AUTO_BUY_FORM_CHANGE,
    })
  }, [positionRatio.toNumber()])

  automationMultipleRangeSliderAnalytics({
    leftValue: autoBuyState.targetCollRatio,
    rightValue: autoBuyState.execCollRatio,
    type: AutomationFeatures.AUTO_BUY,
    ilk,
    vaultId: id,
    positionRatio,
  })

  automationInputsAnalytics({
    maxBuyPrice: autoBuyState.maxBuyOrMinSellPrice,
    withMaxBuyPriceThreshold: autoBuyState.withThreshold,
    type: AutomationFeatures.AUTO_BUY,
    vaultId: id,
    ilk,
    positionRatio,
  })

  const isCurrentCollRatioHigherThanSliderMax = positionRatio.times(100).gt(sliderMax)

  if (
    isStopLossEnabled &&
    stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)).gt(sliderMax)
  ) {
    return (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="auto-buy.sl-too-high"
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
          i18nKey="auto-buy.coll-ratio-too-high"
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
        title={t('auto-buy.adding-new-triggers-disabled')}
        description={t('auto-buy.adding-new-triggers-disabled-description')}
      />
    )
  }

  const feature = t(sidebarAutomationFeatureCopyMap[AutomationFeatures.AUTO_BUY])

  if (isVaultEmpty && autoBuyTriggerData.isTriggerEnabled) {
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
      <>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {autoBuyState.maxBuyOrMinSellPrice !== undefined
            ? t('auto-buy.set-trigger-description', {
                targetCollRatio: autoBuyState.targetCollRatio.toNumber(),
                token,
                execCollRatio: autoBuyState.execCollRatio,
                executionPrice: executionPrice.toFixed(2),
                minBuyPrice: autoBuyState.maxBuyOrMinSellPrice,
              })
            : t('auto-buy.set-trigger-description-no-threshold', {
                targetCollRatio: autoBuyState.targetCollRatio.toNumber(),
                token,
                execCollRatio: autoBuyState.execCollRatio,
                executionPrice: executionPrice.toFixed(2),
              })}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.SETTING_AUTO_BUY} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </Text>{' '}
        <MultipleRangeSlider
          min={sliderMin.toNumber()}
          max={sliderMax.toNumber()}
          onChange={(value) => {
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'target-coll-ratio',
              targetCollRatio: new BigNumber(value.value0),
            })
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'execution-coll-ratio',
              execCollRatio: new BigNumber(value.value1),
            })
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'is-editing',
              isEditing: true,
            })
          }}
          value={{
            value0: autoBuyState.targetCollRatio.toNumber(),
            value1: autoBuyState.execCollRatio.toNumber(),
          }}
          valueColors={{
            value0: 'primary100',
            value1: 'success100',
          }}
          step={1}
          leftDescription={t('auto-buy.target-coll-ratio')}
          rightDescription={t('auto-buy.trigger-coll-ratio')}
          leftThumbColor="primary100"
          rightThumbColor="success100"
        />
        <VaultActionInput
          action={t('auto-buy.set-max-buy-price')}
          amount={autoBuyState.maxBuyOrMinSellPrice}
          hasAuxiliary={false}
          hasError={false}
          currencyCode="USD"
          onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'max-buy-or-sell-price',
              maxBuyOrMinSellPrice,
            })
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'is-editing',
              isEditing: true,
            })
          })}
          onToggle={(toggleStatus) => {
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'with-threshold',
              withThreshold: toggleStatus,
            })
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'max-buy-or-sell-price',
              maxBuyOrMinSellPrice: !toggleStatus
                ? undefined
                : autoBuyTriggerData.maxBuyOrMinSellPrice.isEqualTo(maxUint256)
                  ? zero
                  : autoBuyTriggerData.maxBuyOrMinSellPrice,
            })
            uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
              type: 'is-editing',
              isEditing: true,
            })
          }}
          showToggle={true}
          toggleOnLabel={t('protection.set-no-threshold')}
          toggleOffLabel={t('protection.set-threshold')}
          toggleOffPlaceholder={t('protection.no-threshold')}
          defaultToggle={autoBuyState.withThreshold}
        />
      </>
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} autoType="Auto-Buy" />
          <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
        </>
      )}
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
          uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        value={autoBuyState.maxBaseFeeInGwei.toNumber()}
        analytics={{
          page: MixpanelPages.AutoBuy,
          additionalParams: { vaultId: id.toString(), ilk },
        }}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareAutoBSResetData(
                  autoBuyTriggerData,
                  positionRatio,
                  AUTO_BUY_FORM_CHANGE,
                ),
              })
            }}
          />
          <AutoBuyInfoSectionControl
            executionPrice={executionPrice}
            autoBuyState={autoBuyState}
            debtDelta={debtDelta}
            collateralDelta={collateralDelta}
          />
        </>
      )}
    </>
  )
}
