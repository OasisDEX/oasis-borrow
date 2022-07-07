import { PickCloseState } from 'components/dumb/PickCloseState'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import {
  errorsValidation,
  warningsValidation,
} from 'features/automation/protection/common/validation'
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
>

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
  vault: { debt },
}: SidebarAdjustStopLossEditingStageProps) {
  const { t } = useTranslation()

  const errors = errorsValidation({ txError, debt })
  const warnings = warningsValidation({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  return (
    <>
      {!vault.debt.isZero() ? (
        <Grid>
          <PickCloseState {...closePickerConfig} />
          <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
            {t('protection.set-downside-protection-desc')}{' '}
            <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 2 }}>
              {t('here')}.
            </AppLink>
          </Text>
          <SliderValuePicker {...slValuePickerConfig} />
        </Grid>
      ) : (
        <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
          {t('protection.closed-vault-existing-sl-description')}
        </Text>
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
