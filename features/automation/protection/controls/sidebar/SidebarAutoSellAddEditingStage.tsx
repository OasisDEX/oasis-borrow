import { BigNumber } from 'bignumber.js'
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
import { AddAutoSellInfoSection } from 'features/automation/basicBuySell/InfoSections/AddAutoSellInfoSection'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { prepareBasicBSResetData } from 'features/automation/common/helpers'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { handleNumericInput } from 'helpers/input'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Text } from 'theme-ui'

interface AutoSellInfoSectionControlProps {
  vault: Vault
  basicSellState: BasicBSFormChange
  addTriggerGasEstimation: ReactNode
  debtDelta: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
}

function AutoSellInfoSectionControl({
  vault,
  basicSellState,
  addTriggerGasEstimation,
  debtDelta,
  collateralDelta,
  executionPrice,
}: AutoSellInfoSectionControlProps) {
  const deviationPercent = basicSellState.deviation.div(100)

  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(basicSellState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(basicSellState.targetCollRatio)

  return (
    <AddAutoSellInfoSection
      targetCollRatio={basicSellState.targetCollRatio}
      multipleAfterSell={one.div(basicSellState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={basicSellState.execCollRatio}
      nextSellPrice={executionPrice}
      collateralAfterNextSell={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterSell={{
        value: vault.debt,
        secondaryValue: vault.debt.plus(debtDelta),
      }}
      ethToBeSoldAtNextSell={collateralDelta.abs()}
      estimatedTransactionCost={addTriggerGasEstimation}
      token={vault.token}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
    />
  )
}

interface SidebarAutoSellAddEditingStageProps {
  vault: Vault
  ilkData: IlkData
  isEditing: boolean
  basicSellState: BasicBSFormChange
  autoSellTriggerData: BasicBSTriggerData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  addTriggerGasEstimation: ReactNode
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
}

export function SidebarAutoSellAddEditingStage({
  vault,
  ilkData,
  isEditing,
  basicSellState,
  autoSellTriggerData,
  errors,
  warnings,
  addTriggerGasEstimation,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
}: SidebarAutoSellAddEditingStageProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const executionPrice = collateralPriceAtRatio({
    colRatio: basicSellState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const readOnlyBasicBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const isVaultEmpty = vault.debt.isZero()

  if (readOnlyBasicBSEnabled && !isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('auto-sell.adding-new-triggers-disabled')}
        description={t('auto-sell.adding-new-triggers-disabled-description')}
      />
    )
  }

  if (isVaultEmpty && autoSellTriggerData.isTriggerEnabled) {
    return (
      <SidebarFormInfo
        title={t('auto-sell.closed-vault-existing-trigger-header')}
        description={t('auto-sell.closed-vault-existing-trigger-description')}
      />
    )
  }

  if (isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('auto-sell.closed-vault-not-existing-trigger-header')}
        description={t('auto-sell.closed-vault-not-existing-trigger-description')}
      />
    )
  }

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {basicSellState.maxBuyOrMinSellPrice !== undefined
          ? t('auto-sell.set-trigger-description', {
              targetCollRatio: basicSellState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: basicSellState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
              minSellPrice: basicSellState.maxBuyOrMinSellPrice,
            })
          : t('auto-sell.set-trigger-description-no-threshold', {
              targetCollRatio: basicSellState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: basicSellState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
            })}{' '}
        {/* TODO ŁW link to article in kb */}
        <AppLink href="https://kb.oasis.app/help/" sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>{' '}
      <MultipleRangeSlider
        min={sliderMin.toNumber()}
        max={sliderMax.toNumber()}
        onChange={(value) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'execution-coll-ratio',
            execCollRatio: new BigNumber(value.value0),
          })
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'target-coll-ratio',
            targetCollRatio: new BigNumber(value.value1),
          })
        }}
        value={{
          value0: basicSellState.execCollRatio.toNumber(),
          value1: basicSellState.targetCollRatio.toNumber(),
        }}
        valueColors={{
          value0: 'warning100',
          value1: 'success100',
        }}
        step={1}
        leftDescription={t('auto-sell.sell-trigger-ratio')}
        rightDescription={t('auto-sell.target-coll-ratio')}
        leftThumbColor="warning100"
        rightThumbColor="success100"
      />
      <VaultActionInput
        action={t('auto-sell.set-min-sell-price')}
        amount={basicSellState.maxBuyOrMinSellPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'with-threshold',
            withThreshold: toggleStatus,
          })
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice: !toggleStatus
              ? undefined
              : autoSellTriggerData.maxBuyOrMinSellPrice,
          })
        }}
        defaultToggle={basicSellState.withThreshold}
        showToggle={true}
        toggleOnLabel={t('protection.set-no-threshold')}
        toggleOffLabel={t('protection.set-threshold')}
        toggleOffPlaceholder={t('protection.no-threshold')}
      />
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={ilkData} />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
        </>
      )}
      <SidebarResetButton
        clear={() => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'reset',
            resetData: prepareBasicBSResetData(autoSellTriggerData),
          })
        }}
      />
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
        }}
        value={basicSellState.maxBaseFeeInGwei.toNumber()}
      />
      {isEditing && (
        <AutoSellInfoSectionControl
          basicSellState={basicSellState}
          vault={vault}
          addTriggerGasEstimation={addTriggerGasEstimation}
          debtDelta={debtDelta}
          collateralDelta={collateralDelta}
          executionPrice={executionPrice}
        />
      )}
    </>
  )
}
