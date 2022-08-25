import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { maxUint256 } from 'features/automation/common/consts'
import { prepareAutoBSResetData } from 'features/automation/common/helpers'
import { MaxGasPriceSection } from 'features/automation/common/MaxGasPriceSection'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AddAutoBuyInfoSection } from 'features/automation/optimization/autoBuy/controls/AddAutoBuyInfoSection'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { handleNumericInput } from 'helpers/input'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
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
}: SidebarAutoBuyEditingStageProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyAutoBS')
  const isVaultEmpty = vault.debt.isZero()
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBuyState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

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
        }}
        value={{
          value0: autoBuyState.targetCollRatio.toNumber(),
          value1: autoBuyState.execCollRatio.toNumber(),
        }}
        valueColors={{
          value0: 'warning100',
          value1: 'success100',
        }}
        step={1}
        leftDescription={t('auto-buy.target-coll-ratio')}
        rightDescription={t('auto-buy.trigger-coll-ratio')}
        leftThumbColor="warning100"
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
      <SidebarResetButton
        clear={() => {
          uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
            type: 'reset',
            resetData: prepareAutoBSResetData(autoBuyTriggerData),
          })
        }}
      />
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(AUTO_BUY_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
        }}
        value={autoBuyState.maxBaseFeeInGwei.toNumber()}
      />
      {isEditing && (
        <AutoBuyInfoSectionControl
          executionPrice={executionPrice}
          autoBuyState={autoBuyState}
          vault={vault}
          debtDelta={debtDelta}
          collateralDelta={collateralDelta}
        />
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
