import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Card, Flex, Link, Spinner, Text } from 'theme-ui'

type SidebarSectionStatusTypes = 'progress' | 'success'

type SidebarSectionStatusTypeDetails = {
  [key in SidebarSectionStatusTypes]: {
    bg: string
    color: string
    icon: ReactNode
  }
}

export interface SidebarSectionStatusProps {
  text: string
  txHash: string
  etherscan: string
  type: SidebarSectionStatusTypes
}

export function SidebarSectionStatus({ text, txHash, etherscan, type }: SidebarSectionStatusProps) {
  const { t } = useTranslation()

  const types: SidebarSectionStatusTypeDetails = {
    progress: {
      bg: 'warning',
      color: 'onWarning',
      icon: <Spinner size={20} color="onWarning" />,
    },
    success: {
      bg: 'success',
      color: 'onSuccess',
      icon: <Icon name="checkmark" size={20} color="onSuccess" />,
    },
  }

  return (
    <Card
      sx={{ backgroundColor: types[type].bg, border: 'none', py: 2, px: 3, borderRadius: 'round' }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        <Flex sx={{ width: 32 }}>{types[type].icon}</Flex>
        <Box>
          <Text as="p" variant="paragraph3" sx={{ color: types[type].color }}>
            {text}
          </Text>
          <Link href={`${etherscan}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            <Text
              as="p"
              variant="paragraph4"
              sx={{ fontWeight: 'semiBold', color: types[type].color }}
            >
              {t('view-on-etherscan')}
            </Text>
          </Link>
        </Box>
      </Flex>
    </Card>
  )
}
