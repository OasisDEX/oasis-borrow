// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Badge, Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

interface CardBalanceProps {
  icon: string
  balance: BigNumber
  token?: string
  customText?: string
}

interface CardProductProps {
  icon: JSX.Element
  title: string
  description: string
  bottomComponent: JSX.Element
  onClick?: () => void
  isComingSoon?: boolean
}

export function CardBalance({ token, icon, balance, customText }: CardBalanceProps) {
  const { t } = useTranslation()

  return (
    <Card variant="secondaryRounded" sx={{ my: 2, px: 4 }}>
      <Grid gap={2}>
        <Text sx={{ fontSize: 4, color: 'textAlt', fontWeight: 'semiBold' }}>
          {token && t('token-balance', { token })}
          {customText}
        </Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Icon name={icon} size={22} />
          <Text sx={{ ml: 1, fontSize: 5 }}>{formatCryptoBalance(balance)}</Text>
        </Flex>
      </Grid>
    </Card>
  )
}

export function CardProduct({
  icon,
  title,
  description,
  bottomComponent,
  onClick,
  isComingSoon,
}: CardProductProps) {
  const { t } = useTranslation()

  return (
    <Card
      variant="primaryWithHover"
      onClick={onClick}
      sx={isComingSoon ? { pointerEvents: 'none', bg: 'background' } : {}}
    >
      <Flex sx={{ m: 2 }}>
        <Box sx={{ mr: [3, 4], mt: 2 }}>{icon}</Box>
        <Grid
          sx={{ flex: 1, color: 'primary', gap: (theme) => theme.sizingsCustom.gapCardProduct }}
        >
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="smallHeading">
              {title}{' '}
              {isComingSoon && (
                <Badge
                  variant="primary"
                  sx={{ bg: 'muted', ml: 2, fontWeight: 'semiBold', fontSize: 1, lineHeight: 1 }}
                >
                  {t('coming-soon')}
                </Badge>
              )}
            </Heading>
          </Flex>
          <Text>{description}</Text>
          {bottomComponent}
        </Grid>
      </Flex>
    </Card>
  )
}
