import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getToken } from 'blockchain/tokensMetadata'
import { PriceInfo } from 'features/shared/priceInfo'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

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
  const tokenInfo = getToken(token)
  const currentPrice = formatAmount(priceInfo.currentCollateralPrice, 'USD')
  const nextPrice = formatAmount(priceInfo.nextCollateralPrice, 'USD')
  const priceChange = formatPercent(priceInfo.collateralPricePercentageChange.times(100), {
    precision: 2,
  })

  return (
    <Grid mt={4}>
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
        <Box>
          {t('manage-vault.current-price', { token })} ${currentPrice}
        </Box>
        <Box>
          {t('manage-vault.next-price', { token })} ${nextPrice} {priceChange}
        </Box>
      </Flex>

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
