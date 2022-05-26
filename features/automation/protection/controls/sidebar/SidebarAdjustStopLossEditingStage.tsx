import { Box } from '@theme-ui/components'
import { PickCloseState } from 'components/dumb/PickCloseState'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

import { AdjustSlFormLayoutProps, SetDownsideProtectionInformation } from '../AdjustSlFormLayout'

export function SidebarAdjustStopLossEditingStage({
  token,
  txError,
  slValuePickerConfig,
  closePickerConfig,
  tokenPrice,
  ethPrice,
  vault,
  ilkData,
  gasEstimation,
  selectedSLValue,
  isEditing,
  collateralizationRatioAtNextPrice,
  ethBalance,
  gasEstimationUsd,
}: AdjustSlFormLayoutProps) {
  const { t } = useTranslation()
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  return stopLossWriteEnabled ? (
    <>
      <Box mb={3}>
        <PickCloseState {...closePickerConfig} />
      </Box>
      <Text variant="paragraph3" sx={{ color: 'lavender' }}>
        {t('protection.set-downside-protection-desc')}{' '}
        <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>

      <Box mt={3}>
        <SliderValuePicker {...slValuePickerConfig} />
      </Box>
      {isEditing && (
        <>
          <Box>
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
            />
          </Box>
          <Box sx={{ fontSize: 2 }}>
            <Text sx={{ mt: 3, fontWeight: 'semiBold' }}>{t('protection.not-guaranteed')}</Text>
            <Text sx={{ mb: 3 }}>
              {t('protection.guarantee-factors')}{' '}
              <AppLink
                href="https://kb.oasis.app/help/stop-loss-protection"
                sx={{ fontWeight: 'body' }}
              >
                {t('protection.learn-more-about-automation')}
              </AppLink>
            </Text>
          </Box>
        </>
      )}
    </>
  ) : (
    <Text variant="paragraph3" sx={{ color: 'lavender' }}>
      Due to extreme adversarial market conditions we have currently disabled setting up new stop
      loss triggers, as they might not result in the expected outcome for our users. Please use the
      'close vault' option if you want to close your vault right now.
    </Text>
  )
}
