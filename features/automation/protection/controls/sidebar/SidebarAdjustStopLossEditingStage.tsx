import BigNumber from 'bignumber.js'
import { UIChanges } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseState } from 'components/dumb/PickCloseState'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { ADD_FORM_CHANGE } from 'features/automation/protection/common/UITypes/AddFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { getStartingSlRatio } from '../../common/helpers'
import { AdjustSlFormLayoutProps, SetDownsideProtectionInformation } from '../AdjustSlFormLayout'

export type SidebarAdjustStopLossEditingStageProps = Pick<
  AdjustSlFormLayoutProps,
  | 'closePickerConfig'
  | 'collateralizationRatioAtNextPrice'
  | 'currentCollateralRatio'
  | 'ethBalance'
  | 'ethPrice'
  | 'ilkData'
  | 'isEditing'
  | 'selectedSLValue'
  | 'slValuePickerConfig'
  | 'token'
  | 'tokenPrice'
  | 'txError'
  | 'vault'
  | 'isAutoSellEnabled'
  | 'isStopLossEnabled'
  | 'isToCollateral'
  | 'stopLossLevel'
  | 'isOpenFlow'
> & { errors: VaultErrorMessage[]; warnings: VaultWarningMessage[] }
export function SidebarAdjustStopLossEditingStage({
  closePickerConfig,
  collateralizationRatioAtNextPrice,
  currentCollateralRatio,
  ethBalance,
  ethPrice,
  ilkData,
  isEditing,
  selectedSLValue,
  slValuePickerConfig,
  token,
  tokenPrice,
  txError,
  vault,
  isStopLossEnabled,
  errors,
  warnings,
  isToCollateral,
  stopLossLevel,
  isOpenFlow,
}: SidebarAdjustStopLossEditingStageProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const isVaultEmpty = vault.debt.isZero()

  if (isVaultEmpty && !isStopLossEnabled) {
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
    stopLossLevel,
    isStopLossEnabled,
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
          <SliderValuePicker {...slValuePickerConfig} />
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
                handleReset(
                  uiChanges,
                  isToCollateral,
                  stopLossLevel,
                  initialSlRatioWhenTriggerDoesntExist,
                )
              }}
            />
          )}
          <Grid>
            {!selectedSLValue.isZero() && (
              <>
                <VaultErrors errorMessages={errors} ilkData={ilkData} />
                <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
              </>
            )}
            <SetDownsideProtectionInformation
              token={token}
              vault={vault}
              ilkData={ilkData}
              afterStopLossRatio={selectedSLValue}
              tokenPrice={tokenPrice}
              ethPrice={ethPrice}
              isCollateralActive={closePickerConfig.isCollateralActive}
              collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
              selectedSLValue={selectedSLValue}
              ethBalance={ethBalance}
              txError={txError}
              currentCollateralRatio={currentCollateralRatio}
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
function handleReset(
  uiChanges: UIChanges,
  isToCollateral: boolean,
  stopLossLevel: BigNumber,
  initialSlRatioWhenTriggerDoesntExist: BigNumber,
) {
  uiChanges.publish(ADD_FORM_CHANGE, {
    type: 'close-type',
    toCollateral: isToCollateral,
  })
  uiChanges.publish(ADD_FORM_CHANGE, {
    type: 'stop-loss',
    stopLoss: stopLossLevel.isZero() ? initialSlRatioWhenTriggerDoesntExist : stopLossLevel,
  })
}
