import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getToken } from 'blockchain/tokensMetadata'
import { PriceInfo } from 'features/shared/priceInfo'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

import { getPriceChangeColor } from './VaultDetails'

function VaultHeaderPrice({
  label,
  value,
  sub,
  subColor,
}: {
  label: string
  value: string
  sub?: string
  subColor?: string
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        fontSize: 3,
        ml: 3,
        pl: 3,
        '::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '1px',
          height: '16px',
          margin: 'auto',
          backgroundColor: 'lightIcon',
        },
        ':first-child': {
          ml: 0,
          pl: 0,
          '::before': {
            content: 'none',
          }
        }
      }}
    >
      <Text as="span" sx={{ color: 'text.subtitle' }}>{label}</Text>
      <Text as="span" sx={{ ml: 1, fontWeight: 'semiBold' }}>{value}</Text>
      {sub && subColor && (
        <Text as="span" sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor }}>{sub}</Text>
      )}
    </Box>
  )
}

export function VaultHeaderContainer({
  children,
  header,
  token,
  priceInfo,
}: {
  children: ReactNode
  header: string
  token: string
  priceInfo: PriceInfo
}) {
  const { t } = useTranslation()
  const vaultRedesignedEnabled = useFeatureToggle('vaultRedesigned')
  const { currentCollateralPrice, nextCollateralPrice, collateralPricePercentageChange } = priceInfo
  const tokenInfo = getToken(token)
  const currentPrice = formatAmount(currentCollateralPrice, 'USD')
  const nextPrice = formatAmount(nextCollateralPrice, 'USD')
  const priceChange = formatPercent(collateralPricePercentageChange.times(100), {
    precision: 2,
  })
  const priceChangeColor = getPriceChangeColor({ collateralPricePercentageChange })

  return (
    <Grid mt={4}>
      {vaultRedesignedEnabled ? (
        <>
          <Heading
            as="h1"
            variant="heading1"
            sx={{
              fontWeight: 'semiBold',
              fontSize: '28px',
              pb: 2,
            }}
          >
            <Icon
              name={tokenInfo.iconCircle}
              size="32px"
              sx={{ verticalAlign: 'text-bottom', mr: 2 }}
            />
            {header}
          </Heading>
          <Flex>
            <VaultHeaderPrice
              label={t('manage-vault.current-price', { token })}
              value={`$${currentPrice}`}
            />
            <VaultHeaderPrice
              label={t('manage-vault.next-price', { token })}
              value={`$${nextPrice}`}
              sub={priceChange}
              subColor={priceChangeColor}
            />
          </Flex>
        </>
      ) : (
        <Heading
          as="h1"
          variant="heading1"
          sx={{
            fontWeight: 'semiBold',
            pb: 2,
          }}
        >
          {header}
        </Heading>
      )}

      <Box
        sx={{
          mb: 4,
          fontSize: 1,
          fontWeight: 'semiBold',
          color: 'text.subtitle',
          display: ['grid', 'flex'],
          gridTemplateColumns: '1fr 1fr',
          gap: [3, 0],
        }}
      >
        {children}
      </Box>
    </Grid>
  )
}
