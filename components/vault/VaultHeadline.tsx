import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getToken } from 'blockchain/tokensMetadata'
import { PriceInfo } from 'features/shared/priceInfo'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { getPriceChangeColor } from './VaultDetails'

export interface HeadlineDetailsProp {
  label: string
  value: string
  sub?: string
  subColor?: string
}

export function VaultHeadlineDetails({ label, value, sub, subColor }: HeadlineDetailsProp) {
  return (
    <Box
      sx={{
        position: 'relative',
        fontSize: 3,
        mt: [2, 0],
        ml: [0, 3],
        pl: [0, 3],
        '::before': {
          content: ['none', '""'],
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '1px',
          height: '16px',
          margin: 'auto',
          backgroundColor: 'neutral60',
        },
        ':first-child': {
          ml: 0,
          pl: 0,
          '::before': {
            content: 'none',
          },
        },
      }}
    >
      <Text as="span" sx={{ color: 'neutral80' }}>
        {label}
      </Text>
      <Text as="span" sx={{ ml: 1, fontWeight: 'semiBold', color: 'primary100' }}>
        {value}
      </Text>
      {sub && subColor && (
        <Text as="span" sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor }}>
          {sub}
        </Text>
      )}
    </Box>
  )
}

export function VaultHeadline({
  header,
  token,
  priceInfo,
}: {
  header: string
  token: string
  priceInfo: PriceInfo
}) {
  const { t } = useTranslation()
  const { currentCollateralPrice, nextCollateralPrice, collateralPricePercentageChange } = priceInfo
  const { iconCircle } = getToken(token)
  const currentPrice = formatAmount(currentCollateralPrice, 'USD')
  const nextPrice = formatAmount(nextCollateralPrice, 'USD')
  const priceChange = formatPercent(collateralPricePercentageChange.times(100), {
    precision: 2,
  })
  const priceChangeColor = getPriceChangeColor({ collateralPricePercentageChange })

  return (
    <Flex
      sx={{
        flexDirection: ['column', null, null, 'row'],
        justifyContent: 'space-between',
        alignItems: ['flex-start', null, null, 'flex-end'],
        mb: 4,
      }}
    >
      <Heading
        as="h1"
        variant="heading1"
        sx={{
          fontWeight: 'semiBold',
          fontSize: '28px',
          color: 'primary100',
        }}
      >
        <Icon name={iconCircle} size="32px" sx={{ verticalAlign: 'text-bottom', mr: 2 }} />
        {header}
      </Heading>
      <Flex
        sx={{
          mt: ['24px', null, null, 0],
          flexDirection: ['column', 'row'],
        }}
      >
        <VaultHeadlineDetails
          label={t('manage-vault.current-price', { token })}
          value={`$${currentPrice}`}
        />
        <VaultHeadlineDetails
          label={t('manage-vault.next-price', { token })}
          value={`$${nextPrice}`}
          sub={priceChange}
          subColor={priceChangeColor}
        />
      </Flex>
    </Flex>
  )
}
