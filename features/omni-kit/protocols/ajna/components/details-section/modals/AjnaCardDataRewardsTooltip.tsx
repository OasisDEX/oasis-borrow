import type BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Flex, Text, ThemeUIProvider } from 'theme-ui'

interface AjnaCardDataRewardsTooltipProps {
  total: BigNumber
  claimable: BigNumber
  owner: string
  isLoading: boolean
  isOwner: boolean
}

export function AjnaCardDataRewardsTooltip({
  isLoading,
  total,
  claimable,
  isOwner,
  owner,
}: AjnaCardDataRewardsTooltipProps) {
  const { t } = useTranslation()

  return (
    <ThemeUIProvider theme={ajnaExtensionTheme}>
      <Flex as="span" sx={{ flexDirection: 'column', rowGap: 1 }}>
        <Text variant="paragraph3">
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
              <Text sx={{ fontWeight: 'semiBold', display: 'block', mb: 2 }}>
                {formatCryptoBalance(claimable)} $AJNA{' '}
                {t('ajna.content-card.borrow-rate.tooltip-claimable-now')}
              </Text>
              <Text sx={{ fontWeight: 'semiBold', display: 'block', mb: 2 }}>
                {formatCryptoBalance(total.minus(claimable))} $AJNA{' '}
                {t('ajna.content-card.borrow-rate.tooltip-claimable-next-period')}
              </Text>
              <Text sx={{ fontWeight: 'semiBold', display: 'block', mb: 2 }}>
                {formatCryptoBalance(total)} $AJNA{' '}
                {t('ajna.content-card.borrow-rate.tooltip-earned')}
              </Text>
            </>
          )}
        </Text>
      </Flex>
    </ThemeUIProvider>
  )
}
