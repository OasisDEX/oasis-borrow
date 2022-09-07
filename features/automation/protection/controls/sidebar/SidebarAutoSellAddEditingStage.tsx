import { BigNumber } from 'bignumber.js'
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
import { AddAutoSellInfoSection } from 'features/automation/basicBuySell/InfoSections/AddAutoSellInfoSection'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/common/consts'
import { prepareBasicBSResetData } from 'features/automation/common/helpers'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { handleNumericInput } from 'helpers/input'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHash } from 'helpers/useHash'
import { one } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

import { StopLossTriggerData } from '../../common/stopLossTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from '../../common/UITypes/AutomationFeatureChange'
import { TAB_CHANGE_SUBJECT } from '../../common/UITypes/TabChange'

interface AutoSellInfoSectionControlProps {
  vault: Vault
  basicSellState: BasicBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
}

function AutoSellInfoSectionControl({
  vault,
  basicSellState,
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
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
  stopLossTriggerData: StopLossTriggerData
}

export function SidebarAutoSellAddEditingStage({
  vault,
  ilkData,
  isEditing,
  basicSellState,
  autoSellTriggerData,
  errors,
  warnings,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
  stopLossTriggerData,
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

  const { isStopLossEnabled, stopLossLevel } = stopLossTriggerData

  if (!isStopLossEnabled) {
    adjustDefaultValuesIfOutsideSlider()
  }

  const isCurrentCollRatioHigherThanSliderMax = vault.collateralizationRatio
    .times(100)
    .gt(sliderMax)

  if (isCurrentCollRatioHigherThanSliderMax) {
    return (
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
            }}
          />,
        ]}
        values={{
          maxAutoBuyCollRatio: sliderMax,
        }}
      />
    )
  }

  const [, setHash] = useHash()

  if (isStopLossEnabled && stopLossLevel.times(100).gt(sliderMin)) {
    return (
      <Trans
        i18nKey="auto-sell.sl-too-high"
        components={[
          <Text
            as="span"
            sx={{ fontWeight: 'semiBold', color: 'interactive100', cursor: 'pointer' }}
            onClick={() => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Protection',
                currentProtectionFeature: 'stopLoss',
              })
              setHash(VaultViewMode.Protection)
            }}
          />,
        ]}
        values={{
          maxStopLoss: sliderMax.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)),
        }}
      />
    )
  }

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
        <AppLink
          href="https://kb.oasis.app/help/setting-up-auto-sell-for-your-vault"
          sx={{ fontSize: 2 }}
        >
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
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
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
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
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
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
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
          <VaultErrors errorMessages={errors} ilkData={ilkData} autoType="Auto-Sell" />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
        </>
      )}
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        value={basicSellState.maxBaseFeeInGwei.toNumber()}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareBasicBSResetData(
                  autoSellTriggerData,
                  vault.collateralizationRatio,
                  BASIC_SELL_FORM_CHANGE,
                ),
              })
            }}
          />
          <AutoSellInfoSectionControl
            basicSellState={basicSellState}
            vault={vault}
            debtDelta={debtDelta}
            collateralDelta={collateralDelta}
            executionPrice={executionPrice}
          />
        </>
      )}
    </>
  )

  function adjustDefaultValuesIfOutsideSlider() {
    if (basicSellState.targetCollRatio.gt(sliderMax)) {
      uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
        type: 'target-coll-ratio',
        targetCollRatio: sliderMin,
      })
    }
    if (basicSellState.execCollRatio.lt(sliderMin)) {
      uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        execCollRatio: sliderMax,
      })
    }
  }
}
