import { PickCloseState } from 'components/dumb/PickCloseState'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { AdjustSlFormLayoutProps, SetDownsideProtectionInformation } from '../AdjustSlFormLayout'

export type SidebarAdjustStopLossEditingStageProps = Pick<
  AdjustSlFormLayoutProps,
  | 'closePickerConfig'
  | 'collateralizationRatioAtNextPrice'
  | 'currentCollateralRatio'
  | 'ethBalance'
  | 'ethPrice'
  | 'gasEstimation'
  | 'gasEstimationUsd'
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
> & { errors: VaultErrorMessage[]; warnings: VaultWarningMessage[] }
export function SidebarAdjustStopLossEditingStage({
  closePickerConfig,
  collateralizationRatioAtNextPrice,
  currentCollateralRatio,
  ethBalance,
  ethPrice,
  gasEstimation,
  gasEstimationUsd,
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
}: SidebarAdjustStopLossEditingStageProps) {
  const { t } = useTranslation()

  const isVaultEmpty = vault.debt.isZero()

  if (isVaultEmpty && !isStopLossEnabled) {
    return (
      <SidebarFormInfo
        title={t('protection.closed-vault-not-existing-trigger-header')}
        description={t('protection.closed-vault-not-existing-trigger-description')}
      />
    )
  }

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
            gasEstimation={gasEstimation}
            gasEstimationUsd={gasEstimationUsd}
            afterStopLossRatio={selectedSLValue}
            tokenPrice={tokenPrice}
            ethPrice={ethPrice}
            isCollateralActive={closePickerConfig.isCollateralActive}
            collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
            selectedSLValue={selectedSLValue}
            ethBalance={ethBalance}
            txError={txError}
            currentCollateralRatio={currentCollateralRatio}
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
      )}
    </>
  )
}
