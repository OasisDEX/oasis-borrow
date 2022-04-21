import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Flex, Heading, Text } from 'theme-ui'

import { AppLink } from '../Links'
import { WithArrow } from '../WithArrow'

interface VaultInformationItemProps {
  text: string
  value: string | BigNumber
}

function VaultInformationItem({ text, value }: VaultInformationItemProps) {
  return (
    <Flex
      sx={{
        justifyContent: 'space-between',
        py: 3,
        borderBottom: '1px solid',
        borderBottomColor: 'border',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Text sx={{ color: 'text.subtitle', fontWeight: 'semiBold', fontSize: 1 }}>{text}</Text>
      <Text sx={{ color: 'primary', fontWeight: 'semiBold', fontSize: 1 }}>{value}</Text>
    </Flex>
  )
}

interface VaultInformationProps {
  items: { text: string; value: string | BigNumber }[]
}

export function VaultInformation({ items }: VaultInformationProps) {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        p: 4,
        border: 'lightMuted',
        maxWidth: '688px',
      }}
    >
      <Heading variant="headerSettings" sx={{ mb: 3 }}>
        {t('vault-information')}
      </Heading>
      <Box>
        {items.map((item) => (
          <VaultInformationItem key={item.text} text={item.text} value={item.value} />
        ))}
      </Box>
      <AppLink href="https://kb.oasis.app/help">
        <WithArrow sx={{ color: 'link', fontSize: 1, mt: 3 }}>{t('learn-more-at-oasis')}</WithArrow>
      </AppLink>
    </Card>
  )
}
