import { Box } from '@theme-ui/components'
import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { PickCloseState } from 'components/dumb/PickCloseState'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
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
  closeVaultOptions,
  sidebarAutomationFeatureCopyMap,
} from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { stopLossSliderBasicConfig } from 'features/automation/protection/stopLoss/sliderConfig'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { formatAmount, formatFiatBalance } from 'helpers/formatters/format'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Text } from 'theme-ui'

interface SetDownsideProtectionInformationProps {
  afterStopLossRatio: BigNumber
  executionPrice: BigNumber
  ethPrice: BigNumber
  isCollateralActive: boolean
  isOpenFlow?: boolean
}

export function SetDownsideProtectionInformation({
  afterStopLossRatio,
  executionPrice,
  ethPrice,
  isCollateralActive,
  isOpenFlow,
}: SetDownsideProtectionInformationProps) {
  const { t } = useTranslation()
  const {
    positionData: {
      debt,
      liquidationPenalty,
      liquidationPrice,
      liquidationRatio,
      lockedCollateral,
      token,
    },
  } = useAutomationContext()

  const afterDynamicStopLossPrice = liquidationPrice
    .div(liquidationRatio)
    .times(afterStopLossRatio.div(100))

  const afterMaxToken = lockedCollateral
    .times(afterDynamicStopLossPrice)
    .minus(debt)
    .div(afterDynamicStopLossPrice)

  const ethDuringLiquidation = lockedCollateral
    .times(liquidationPrice)
    .minus(debt.multipliedBy(one.plus(liquidationPenalty)))
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
  executionPrice: BigNumber
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  stopLossState: StopLossFormChange
  isEditing: boolean
  isOpenFlow?: boolean
}

export function SidebarAdjustStopLossEditingStage({
  isEditing,
  errors,
  warnings,
  stopLossState,
  executionPrice,
  isOpenFlow,
}: SidebarAdjustStopLossEditingStageProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const {
    stopLossTriggerData,
    environmentData: { ethMarketPrice },
    positionData: { id, ilk, token, debt, positionRatio, debtFloor },
    metadata: {
      stopLoss: {
        getSliderPercentageFill,
        getRightBoundary,
        sliderMin,
        sliderMax,
        resetData,
        sliderLeftLabel,
        sliderRightLabel,
        sliderChangeCallback,
        closeToChangeCallback,
      },
    },
  } = useAutomationContext()

  useDebouncedCallback(
    (value) =>
      trackingEvents.automation.inputChange(
        AutomationEventIds.MoveSlider,
        id ? Pages.StopLoss : Pages.OpenVault,
        CommonAnalyticsSections.Form,
        {
          vaultId: id ? id.toString() : 'n/a',
          ilk: ilk,
          collateralRatio: positionRatio.times(100).decimalPlaces(2).toString(),
          triggerValue: value,
        },
      ),
    stopLossState.stopLossLevel.decimalPlaces(2).toString(),
  )

  const isVaultEmpty = debt.isZero()
  const feature = t(sidebarAutomationFeatureCopyMap[AutomationFeatures.STOP_LOSS])

  if (isVaultEmpty && stopLossTriggerData.isStopLossEnabled) {
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
        title={t('automation.closed-vault-not-existing-trigger-header', { feature })}
        description={t('automation.closed-vault-not-existing-trigger-description', { feature })}
      />
    )
  }

  const sliderPercentageFill = getSliderPercentageFill({ state: stopLossState })
  const rightBoundry = getRightBoundary({ state: stopLossState })

  return (
    <>
      {!debt.isZero() ? (
        <Grid>
          <PickCloseState
            isCollateralActive={stopLossState.collateralActive}
            collateralTokenSymbol={token}
            collateralTokenIconCircle={getToken(token).iconCircle}
            onclickHandler={(optionName: string) => {
              uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                type: 'close-type',
                toCollateral: optionName === closeVaultOptions[0],
              })
              trackingEvents.automation.buttonClick(
                AutomationEventIds.CloseToX,
                Pages.StopLoss,
                CommonAnalyticsSections.Form,
                {
                  vaultId: id.toString(),
                  ilk: ilk,
                  closeTo: optionName as CloseVaultTo,
                },
              )
              closeToChangeCallback && closeToChangeCallback(optionName)
            }}
          />
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('protection.set-downside-protection-desc')}{' '}
            <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 2 }}>
              {t('here')}.
            </AppLink>
          </Text>
          <SliderValuePicker
            {...stopLossSliderBasicConfig}
            sliderPercentageFill={sliderPercentageFill}
            lastValue={stopLossState.stopLossLevel}
            maxBoundry={sliderMax}
            minBoundry={sliderMin}
            rightBoundry={rightBoundry}
            leftBoundry={stopLossState.stopLossLevel}
            onChange={(slCollRatio) => {
              if (stopLossState.collateralActive === undefined) {
                uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                  type: 'close-type',
                  toCollateral: false,
                })
              }

              uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                type: 'stop-loss-level',
                stopLossLevel: slCollRatio,
              })

              sliderChangeCallback && sliderChangeCallback(slCollRatio)
            }}
            leftLabel={t(sliderLeftLabel)}
            rightLabel={t(sliderRightLabel)}
          />
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
                  type: 'reset',
                  resetData,
                })
              }}
            />
          )}
          <Grid>
            {!stopLossState.stopLossLevel.isZero() && (
              <>
                <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
                <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
              </>
            )}
            <SetDownsideProtectionInformation
              afterStopLossRatio={stopLossState.stopLossLevel}
              executionPrice={executionPrice}
              ethPrice={ethMarketPrice}
              isCollateralActive={stopLossState.collateralActive}
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
