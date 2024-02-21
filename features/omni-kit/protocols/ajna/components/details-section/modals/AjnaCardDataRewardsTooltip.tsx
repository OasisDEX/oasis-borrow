import { Skeleton } from 'components/Skeleton'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Box, Flex, Text, ThemeUIProvider } from 'theme-ui'

interface AjnaCardDataRewardsTooltipProps {
  owner: string
  isLoading: boolean
  isOwner: boolean
  rewards: AjnaRewards
}

export function AjnaCardDataRewardsTooltip({
  isLoading,
  isOwner,
  owner,
  rewards: { claimable, currentPeriodTotalEarned, currentPeriodPositionEarned, totalEarnedToDate },
}: AjnaCardDataRewardsTooltipProps) {
  const { t } = useTranslation()
  const unit = 'AJNA'

  const formatted = {
    claimable: `${formatCryptoBalance(claimable)} ${unit}`,
    currentPeriodTotalEarned: `${formatCryptoBalance(currentPeriodTotalEarned)} ${unit}`,
    currentPeriodPositionEarned: `${formatCryptoBalance(currentPeriodPositionEarned)} ${unit}`,
    totalEarnedToDate: `${formatCryptoBalance(totalEarnedToDate)} ${unit}`,
  }

  return (
    <ThemeUIProvider theme={ajnaExtensionTheme}>
      <Flex as="span" sx={{ flexDirection: 'column', rowGap: 1 }}>
        <Text variant="paragraph4" sx={{ fontWeight: 'regular' }}>
          <Trans
            i18nKey={
              isOwner
                ? 'ajna.content-card.borrow-rate.tooltip-description'
                : 'ajna.content-card.borrow-rate.tooltip-description-non-owner'
            }
            values={{ address: formatAddress(owner) }}
            components={{ strong: <Text sx={{ fontWeight: 'semiBold' }} /> }}
          />
        </Text>
        <Text sx={{ mt: 2 }}>
          {isLoading ? (
            <Skeleton width="64px" count={2} gap={1} />
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Text as="span" sx={{ fontWeight: 'semiBold' }}>
                  {formatted.claimable}{' '}
                </Text>
                <Text as="span" sx={{ fontWeight: 'regular' }}>
                  {t('ajna.content-card.borrow-rate.tooltip-claimable-now')}
                </Text>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Text as="span" sx={{ fontWeight: 'semiBold' }}>
                  {formatted.currentPeriodTotalEarned}{' '}
                </Text>
                <Text as="span" sx={{ fontWeight: 'regular' }}>
                  {t('omni-kit.content-card.rewards.modal-value-3')}
                </Text>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Text as="span" sx={{ fontWeight: 'semiBold' }}>
                  {formatted.currentPeriodPositionEarned}{' '}
                </Text>
                <Text as="span" sx={{ fontWeight: 'regular' }}>
                  {t('omni-kit.content-card.rewards.modal-value-4')}
                </Text>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Text as="span" sx={{ fontWeight: 'semiBold' }}>
                  {formatted.totalEarnedToDate}{' '}
                </Text>
                <Text as="span" sx={{ fontWeight: 'regular' }}>
                  {t('omni-kit.content-card.rewards.modal-value-5')}
                </Text>
              </Box>
            </>
          )}
        </Text>
      </Flex>
    </ThemeUIProvider>
  )
}
