import { Box } from '@theme-ui/components'
import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { GasEstimation } from 'components/GasEstimation'
import { AppLink } from 'components/Links'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { getStartingSlRatio } from 'features/automation/protection/stopLoss/helpers'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { formatAmount, formatFiatBalance } from 'helpers/formatters/format'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Text } from 'theme-ui'

interface SetDownsideProtectionInformationProps {
  vault: Vault
  ilkData: IlkData
  afterStopLossRatio: BigNumber
  executionPrice: BigNumber
  ethPrice: BigNumber
  isCollateralActive: boolean
  isOpenFlow?: boolean
}

export function SetDownsideProtectionInformation({
  vault: { lockedCollateral, debt, liquidationPrice, token },
  ilkData,
  afterStopLossRatio,
  executionPrice,
  ethPrice,
  isCollateralActive,
  isOpenFlow,
}: SetDownsideProtectionInformationProps) {
  const { t } = useTranslation()

  const afterDynamicStopLossPrice = liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(afterStopLossRatio.div(100))

  const afterMaxToken = lockedCollateral
    .times(afterDynamicStopLossPrice)
    .minus(debt)
    .div(afterDynamicStopLossPrice)

  const ethDuringLiquidation = lockedCollateral
    .times(liquidationPrice)
    .minus(debt.multipliedBy(one.plus(ilkData.liquidationPenalty)))
    .div(liquidationPrice)

  const savingCompareToLiquidation = afterMaxToken.minus(ethDuringLiquidation)

  const maxTokenOrDai = isCollateralActive
    ? `${formatAmount(afterMaxToken, token)} ${token}`
    : `${formatAmount(afterMaxToken.multipliedBy(executionPrice), 'USD')} DAI`

  const savingTokenOrDai = isCollateralActive
    ? `${formatAmount(savingCompareToLiquidation, token)} ${token}`
    : `${formatAmount(savingCompareToLiquidation.multipliedBy(executionPrice), 'USD')} DAI`

  const closeVaultGasEstimation = new BigNumber(1300000) // average based on historical data from blockchain
  const closeVaultGasPrice = new BigNumber(200) // gwei
  const estimatedFeesWhenSlTriggered = formatFiatBalance(
    closeVaultGasEstimation
      .multipliedBy(closeVaultGasPrice)
      .multipliedBy(ethPrice)
      .dividedBy(new BigNumber(10).pow(9)),
  )

  return (
    <VaultChangesInformationContainer title={t('protection.on-stop-loss-trigger')}>
      <VaultChangesInformationItem
        label={`${t('protection.estimated-to-receive')}`}
        value={
          <Flex>
            {t('protection.up-to')} {maxTokenOrDai}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.saving-comp-to-liquidation')}`}
        value={
          <Flex>
            {t('protection.up-to')} {savingTokenOrDai}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.estimated-fees-on-trigger', { token })}`}
        value={<Flex>${estimatedFeesWhenSlTriggered}</Flex>}
        tooltip={<Box>{t('protection.sl-triggered-gas-estimation')}</Box>}
      />
      {!isOpenFlow && (
        <VaultChangesInformationItem
          label={`${t('protection.max-cost')}`}
          value={<GasEstimation />}
        />
      )}
    </VaultChangesInformationContainer>
  )
}

export interface SidebarAdjustStopLossEditingStageProps {
  vault: Vault
  ilkData: IlkData
  ethMarketPrice: BigNumber
  executionPrice: BigNumber
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  stopLossTriggerData: StopLossTriggerData
  stopLossState: StopLossFormChange
  isEditing: boolean
  closePickerConfig: PickCloseStateProps
  sliderConfig: SliderValuePickerProps
  isOpenFlow?: boolean
}

export function SidebarAdjustStopLossEditingStage({
  closePickerConfig,
  ethMarketPrice,
  ilkData,
  isEditing,
  sliderConfig,
  vault,
  errors,
  warnings,
  stopLossTriggerData,
  stopLossState,
  executionPrice,
  isOpenFlow,
}: SidebarAdjustStopLossEditingStageProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  useDebouncedCallback(
    (value) =>
      trackingEvents.automation.inputChange(
        AutomationEventIds.MoveSlider,
        vault.id ? Pages.StopLoss : Pages.OpenVault,
        CommonAnalyticsSections.Form,
        {
          vaultId: vault.id ? vault.id.toString() : 'n/a',
          ilk: vault.ilk,
          collateralRatio: vault.collateralizationRatio.times(100).decimalPlaces(2).toString(),
          triggerValue: value,
        },
      ),
    stopLossState.stopLossLevel.decimalPlaces(2).toString(),
  )

  const isVaultEmpty = vault.debt.isZero()

  if (isVaultEmpty && !stopLossTriggerData.isStopLossEnabled) {
    return (
      <SidebarFormInfo
        title={t('protection.closed-vault-not-existing-trigger-header')}
        description={t('protection.closed-vault-not-existing-trigger-description')}
      />
    )
  }

  const sliderMin = ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  const selectedStopLossCollRatioIfTriggerDoesntExist = sliderMin.plus(
    DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  )

  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist,
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)

  return (
    <>
      {!vault.debt.isZero() ? (
        <Grid>
          <PickCloseState {...closePickerConfig} />
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('protection.set-downside-protection-desc')}{' '}
            <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 2 }}>
              {t('here')}.
            </AppLink>
          </Text>
          <SliderValuePicker {...sliderConfig} />
        </Grid>
      ) : (
        <SidebarFormInfo
          title={t('protection.closed-vault-existing-sl-header')}
          description={t('protection.closed-vault-existing-sl-description')}
        />
      )}

      {isEditing && (
        <>
          {!isOpenFlow && (
            <SidebarResetButton
              clear={() => {
                uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                  type: 'close-type',
                  toCollateral: stopLossTriggerData.isToCollateral,
                })
                uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                  type: 'stop-loss-level',
                  stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
                })
              }}
            />
          )}
          <Grid>
            {!stopLossState.stopLossLevel.isZero() && (
              <>
                <VaultErrors errorMessages={errors} ilkData={ilkData} />
                <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
              </>
            )}
            <SetDownsideProtectionInformation
              vault={vault}
              ilkData={ilkData}
              afterStopLossRatio={stopLossState.stopLossLevel}
              executionPrice={executionPrice}
              ethPrice={ethMarketPrice}
              isCollateralActive={closePickerConfig.isCollateralActive}
              isOpenFlow={isOpenFlow}
            />
            <Text as="p" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
              {t('protection.not-guaranteed')}
            </Text>
            <Text as="p" variant="paragraph3">
              {t('protection.guarantee-factors')}{' '}
              <AppLink
                href="https://kb.oasis.app/help/stop-loss-protection"
                sx={{ fontWeight: 'body' }}
              >
                {t('protection.learn-more-about-automation')}
              </AppLink>
            </Text>
          </Grid>
        </>
      )}
    </>
  )
}
