import { ActionBanner } from 'components/ActionBanner'
import type { RaysUserResponse } from 'features/rays/getRaysUser'
import { useUserRays } from 'features/rays/hooks/useUserRays'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAddress } from 'helpers/formatters/format'
import React from 'react'
import { summer_light } from 'theme/icons'
import { Box, Text } from 'theme-ui'

interface LazySummerBannerProps {
  address: string
  isOwner?: boolean
  raysData?: RaysUserResponse
}

export const LazySummerBannerWithRaysHandling = ({ address, isOwner }: LazySummerBannerProps) => {
  const { userRaysData } = useUserRays({
    walletAddress: address,
  })

  return userRaysData ? (
    <LazySummerBanner isOwner={isOwner} address={address} raysData={userRaysData} />
  ) : null
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
          url: `${EXTERNAL_LINKS.LAZY_SUMMER}/earn/sumr`,
          targetBlank: true,
        }}
        buttonSx={{
          background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 100%)',
          color: 'white',
          '&:hover': {
            borderColor: 'transparent',
          },
        }}
        sx={{
          background: 'white',
        }}
      >
        <Text variant="boldParagraph3" color="#868385">
          $SUMR powers the Lazy Summer Protocol – DeFi’s best yield optimizer. Claim your $SUMR now!
        </Text>
      </ActionBanner>
    </Box>
  ) : null
}
