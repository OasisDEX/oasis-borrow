import { BigNumber } from 'bignumber.js'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { FC } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface LazySummerPorfolioPositionBannerProps {
  position: PortfolioPosition
}

export const LazySummerPorfolioPositionBanner: FC<LazySummerPorfolioPositionBannerProps> = ({
  position,
}) => {
  const { lazySummerBestApy, netValue, details } = position

  const apyDetails = details.find((detail) => detail.type === 'apy')

  if (!apyDetails || !lazySummerBestApy || !('rawValue' in apyDetails && apyDetails.rawValue)) {
    return null
  }

  const standardEarningsPerYear = apyDetails.rawValue * netValue

  const lazySummerEarningsPerYear = lazySummerBestApy.value * netValue

  const earningsPerYear = lazySummerEarningsPerYear - standardEarningsPerYear

  const copy =
    earningsPerYear > 0
      ? `Earn ${formatCryptoBalance(new BigNumber(earningsPerYear))} more / year and $SUMR rewards`
      : 'Earn top DeFi yields, automatically optimized by AI with Lazy Summer.'

  return (
    <Flex
      onClick={() => {
        window.open(lazySummerBestApy.link, '_blank')
      }}
      sx={{
        paddingY: 2,
        paddingX: 3,
        borderRadius: 'medium',
        background:
          'linear-gradient(90deg, rgba(255, 73, 164, 0.1) 0%, rgba(176, 73, 255, 0.1) 93%)',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 3,
        mb: 3,
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
        },
        transition: 'opacity 100ms',
      }}
    >
      <Text
        as="p"
        variant="paragraph4"
        sx={{
          background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 93%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {copy}
      </Text>
      <Text
        as="p"
        variant="paragraph4"
        sx={{
          background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 93%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Get Started &rarr;
      </Text>
    </Flex>
  )
}
