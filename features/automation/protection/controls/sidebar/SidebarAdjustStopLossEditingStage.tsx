import { Box } from '@theme-ui/components'
import { PickCloseState } from 'components/dumb/PickCloseState'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

import { AdjustSlFormLayoutProps, SetDownsideProtectionInformation } from '../AdjustSlFormLayout'

export type SidebarAdjustStopLossEditingStageProps = Pick<
  AdjustSlFormLayoutProps,
  | 'token'
  | 'txError'
  | 'slValuePickerConfig'
  | 'closePickerConfig'
  | 'tokenPrice'
  | 'ethPrice'
  | 'vault'
  | 'ilkData'
  | 'gasEstimation'
  | 'selectedSLValue'
  | 'isEditing'
  | 'collateralizationRatioAtNextPrice'
  | 'currentCollateralRatio'
  | 'ethBalance'
  | 'gasEstimationUsd'
>

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
  currentCollateralRatio,
}: SidebarAdjustStopLossEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      {!vault.debt.isZero() ? (
        <>
          <Box mb={3}>
            <PickCloseState {...closePickerConfig} />
          </Box>
          <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
            {t('protection.set-downside-protection-desc')}{' '}
            <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 2 }}>
              {t('here')}.
            </AppLink>
          </Text>
          <Box mt={3}>
            <SliderValuePicker {...slValuePickerConfig} />
          </Box>
        </>
      ) : (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
            {t('protection.closed-vault-existing-sl-description')}
          </Text>
        </>
      )}
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
              currentCollateralRatio={currentCollateralRatio}
            />
          </Box>
          <Box sx={{ fontSize: 2 }}>
            <Text as="p" sx={{ mt: 3, fontWeight: 'semiBold' }}>
              {t('protection.not-guaranteed')}
            </Text>
            <Text as="p" sx={{ mb: 3 }}>
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
  )
}
