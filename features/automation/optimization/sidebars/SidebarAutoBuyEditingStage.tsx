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
import { AddAutoBuyInfoSection } from 'features/automation/basicBuySell/InfoSections/AddAutoBuyInfoSection'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import { BasicBSTriggerData, maxUint256 } from 'features/automation/common/basicBSTriggerData'
import { prepareBasicBSResetData } from 'features/automation/common/helpers'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { handleNumericInput } from 'helpers/input'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoBuyEditingStageProps {
  vault: Vault
  ilkData: IlkData
  isEditing: boolean
  basicBuyState: BasicBSFormChange
  autoBuyTriggerData: BasicBSTriggerData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  addTriggerGasEstimation: ReactNode
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
}

export function SidebarAutoBuyEditingStage({
  vault,
  ilkData,
  isEditing,
  basicBuyState,
  autoBuyTriggerData,
  errors,
  warnings,
  addTriggerGasEstimation,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
}: SidebarAutoBuyEditingStageProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const readOnlyBasicBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const isVaultEmpty = vault.debt.isZero()
  const executionPrice = collateralPriceAtRatio({
    colRatio: basicBuyState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  if (readOnlyBasicBSEnabled && !isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('auto-buy.adding-new-triggers-disabled')}
        description={t('auto-buy.adding-new-triggers-disabled-description')}
      />
    )
  }

  if (isVaultEmpty) {
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
        {basicBuyState.maxBuyOrMinSellPrice !== undefined
          ? t('auto-buy.set-trigger-description', {
              targetCollRatio: basicBuyState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: basicBuyState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
              minBuyPrice: basicBuyState.maxBuyOrMinSellPrice,
            })
          : t('auto-buy.set-trigger-description-no-threshold', {
              targetCollRatio: basicBuyState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: basicBuyState.execCollRatio,
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
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'target-coll-ratio',
            targetCollRatio: new BigNumber(value.value0),
          })
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'execution-coll-ratio',
            execCollRatio: new BigNumber(value.value1),
          })
        }}
        value={{
          value0: basicBuyState.targetCollRatio.toNumber(),
          value1: basicBuyState.execCollRatio.toNumber(),
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
        amount={basicBuyState.maxBuyOrMinSellPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'with-threshold',
            withThreshold: toggleStatus,
          })
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
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
        defaultToggle={basicBuyState.withThreshold}
      />
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={ilkData} />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
        </>
      )}
      <SidebarResetButton
        clear={() => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'reset',
            resetData: prepareBasicBSResetData(autoBuyTriggerData),
          })
        }}
      />
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
        }}
        value={basicBuyState.maxBaseFeeInGwei.toNumber()}
      />
      {isEditing && (
        <AutoBuyInfoSectionControl
          executionPrice={executionPrice}
          basicBuyState={basicBuyState}
          vault={vault}
          addTriggerGasEstimation={addTriggerGasEstimation}
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
  basicBuyState: BasicBSFormChange
  addTriggerGasEstimation: ReactNode
  debtDelta: BigNumber
  collateralDelta: BigNumber
}

function AutoBuyInfoSectionControl({
  executionPrice,
  vault,
  basicBuyState,
  addTriggerGasEstimation,
  debtDelta,
  collateralDelta,
}: AutoBuyInfoSectionControlProps) {
  const deviationPercent = basicBuyState.deviation.div(100)

  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(basicBuyState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(basicBuyState.targetCollRatio)

  return (
    <AddAutoBuyInfoSection
      token={vault.token}
      colRatioAfterBuy={basicBuyState.targetCollRatio}
      multipleAfterBuy={one.div(basicBuyState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={basicBuyState.execCollRatio}
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
      estimatedTransactionCost={addTriggerGasEstimation}
    />
  )
}
