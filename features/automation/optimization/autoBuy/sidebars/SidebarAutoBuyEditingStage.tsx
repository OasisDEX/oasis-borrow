import { Pages } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { maxUint256, MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/common/consts'
import {
  adjustDefaultValuesIfOutsideSlider,
  automationInputsAnalytics,
  automationMultipleRangeSliderAnalytics,
  prepareAutoBSResetData,
} from 'features/automation/common/helpers'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { AddAutoBuyInfoSection } from 'features/automation/optimization/autoBuy/controls/AddAutoBuyInfoSection'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange'
import { handleNumericInput } from 'helpers/input'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHash } from 'helpers/useHash'
import { one, zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoBuyEditingStageProps {
  vault: Vault
  ilkData: IlkData
  isEditing: boolean
  autoBuyState: AutoBSFormChange
  autoBuyTriggerData: AutoBSTriggerData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
  stopLossTriggerData: StopLossTriggerData
}

export function SidebarAutoBuyEditingStage({
  vault,
  ilkData,
  isEditing,
  autoBuyState,
  autoBuyTriggerData,
  errors,
  warnings,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
  stopLossTriggerData,
}: SidebarAutoBuyEditingStageProps) {
  const { uiChanges } = useAppContext()
  const [, setHash] = useHash()
  const { t } = useTranslation()
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const isVaultEmpty = vault.debt.isZero()
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBuyState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
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
  }, [vault.collateralizationRatio.toNumber()])

  automationMultipleRangeSliderAnalytics({
    leftValue: autoBuyState.targetCollRatio,
    rightValue: autoBuyState.execCollRatio,
    vault,
    type: AutomationFeatures.AUTO_BUY,
  })

  automationInputsAnalytics({
    maxBuyPrice: autoBuyState.maxBuyOrMinSellPrice,
    withMaxBuyPriceThreshold: autoBuyState.withThreshold,
    vault,
    type: AutomationFeatures.AUTO_BUY,
  })

  const isCurrentCollRatioHigherThanSliderMax = vault.collateralizationRatio
    .times(100)
    .gt(sliderMax)

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

  if (isVaultEmpty && autoBuyTriggerData.isTriggerEnabled) {
    return (
      <SidebarFormInfo
        title={t('auto-buy.closed-vault-existing-trigger-header')}
        description={t('auto-buy.closed-vault-existing-trigger-description')}
      />
    )
  }

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {autoBuyState.maxBuyOrMinSellPrice !== undefined
          ? t('auto-buy.set-trigger-description', {
              targetCollRatio: autoBuyState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: autoBuyState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
              minBuyPrice: autoBuyState.maxBuyOrMinSellPrice,
            })
          : t('auto-buy.set-trigger-description-no-threshold', {
              targetCollRatio: autoBuyState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: autoBuyState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
            })}{' '}
        <AppLink
          href="https://kb.oasis.app/help/setting-up-auto-buy-for-your-vault"
          sx={{ fontSize: 2 }}
        >
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
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={ilkData} autoType="Auto-Buy" />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
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
          page: Pages.AutoBuy,
          additionalParams: { vaultId: vault.id.toString(), ilk: vault.ilk },
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
                  vault.collateralizationRatio,
                  AUTO_BUY_FORM_CHANGE,
                ),
              })
            }}
          />
          <AutoBuyInfoSectionControl
            executionPrice={executionPrice}
            autoBuyState={autoBuyState}
            vault={vault}
            debtDelta={debtDelta}
            collateralDelta={collateralDelta}
          />
        </>
      )}
    </>
  )
}

interface AutoBuyInfoSectionControlProps {
  executionPrice: BigNumber
  vault: Vault
  autoBuyState: AutoBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
}

function AutoBuyInfoSectionControl({
  executionPrice,
  vault,
  autoBuyState,
  debtDelta,
  collateralDelta,
}: AutoBuyInfoSectionControlProps) {
  const deviationPercent = autoBuyState.deviation.div(100)

  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(autoBuyState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(autoBuyState.targetCollRatio)

  return (
    <AddAutoBuyInfoSection
      token={vault.token}
      colRatioAfterBuy={autoBuyState.targetCollRatio}
      multipleAfterBuy={one.div(autoBuyState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={autoBuyState.execCollRatio}
      nextBuyPrice={executionPrice}
      collateralAfterNextBuy={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterNextBuy={{
        value: vault.debt,
        secondaryValue: vault.debt.plus(debtDelta),
      }}
      collateralToBePurchased={collateralDelta.abs()}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
    />
  )
}
