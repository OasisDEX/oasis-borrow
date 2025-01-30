import { ActionBanner } from 'components/ActionBanner'
import type { RaysUserResponse } from 'features/rays/getRaysUser'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAddress } from 'helpers/formatters/format'
import React from 'react'
import { summer_light } from 'theme/icons'
import { Box, Text } from 'theme-ui'

interface LazySummerBannerProps {
  address: string
  isOwner: boolean
  raysData?: RaysUserResponse
}

export const LazySummerBanner = ({ address, isOwner, raysData }: LazySummerBannerProps) => {
  const title = isOwner
    ? 'The wait is over! You’re eligible to claim $SUMR'
    : `The wait is over! Wallet (${formatAddress(address, 6)}) is eligible to claim $SUMR`

  return Number(raysData?.userRays?.allPossiblePoints ?? 0) > 0 ? (
    <Box sx={{ mb: 4 }}>
      <ActionBanner
        icon={summer_light}
        title={title}
        cta={{
          label: 'Claim $SUMR',
          url: `${EXTERNAL_LINKS.LAZY_SUMMER}${isOwner ? `/portfolio/${address}` : ''}`,
          targetBlank: true,
        }}
        sx={{
          background: 'white',
        }}
      >
        <Text variant="boldParagraph3" color="#868385">
          $SUMR powers the Lazy Summer Protocol – DeFi’s best yield optimizer. Claim your $SUMR now
          and get ready for the protocol launching on February 11th!
        </Text>
      </ActionBanner>
    </Box>
  ) : null
}
