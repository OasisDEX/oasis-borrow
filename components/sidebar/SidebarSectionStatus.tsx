import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import type { TranslateStringType } from 'helpers/translateStringType'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import { checkmark, clock } from 'theme/icons'
import { Box, Card, Flex, Link, Spinner, Text } from 'theme-ui'

type SidebarSectionStatusTypes = 'progress' | 'success' | 'waiting'

type SidebarSectionStatusTypeDetails = {
  [key in SidebarSectionStatusTypes]: {
    bg: string
    color: string
    icon: ReactNode
    opacity?: number
  }
}

export interface SidebarSectionStatusProps {
  text: string | ReactNode
  txHash: string
  etherscan: string
  etherscanName?: string
  type: SidebarSectionStatusTypes
  description?: TranslateStringType
  icon?: IconProps['icon']
}

export function SidebarSectionStatus({
  text,
  txHash,
  etherscan,
  etherscanName,
  type,
  description,
  icon,
}: SidebarSectionStatusProps) {
  const { t } = useTranslation()

  const types: SidebarSectionStatusTypeDetails = {
    progress: {
      bg: 'warning10',
      color: 'warning100',
      icon: <Spinner size={20} color="warning100" />,
    },
    success: {
      bg: 'success10',
      color: 'success100',
      icon: <Icon icon={checkmark} size={20} color="success100" />,
    },
    waiting: {
      bg: 'secondary60',
      color: 'neutral80',
      icon: <Icon icon={icon ?? clock} size={20} color="neutral80" />,
      opacity: 0.5,
    },
  }

  return (
    <Card
      sx={{
        backgroundColor: types[type].bg,
        border: 'none',
        py: 2,
        px: 3,
        borderRadius: 'round',
        opacity: types[type].opacity,
      }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        <Flex sx={{ width: 32 }}>{types[type].icon}</Flex>
        <Box>
          <Text as="p" variant="paragraph3" sx={{ color: types[type].color }}>
            {text}
          </Text>
          {description && (
            <Text
              as="p"
              variant="paragraph4"
              sx={{ fontWeight: 'semiBold', color: types[type].color }}
            >
              {description}
            </Text>
          )}
          {txHash && (
            <Link href={`${etherscan}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
              <Text
                as="p"
                variant="paragraph4"
                sx={{ fontWeight: 'semiBold', color: types[type].color }}
              >
                {etherscanName
                  ? t('view-on-etherscan-custom', { etherscanName })
                  : t('view-on-etherscan')}
              </Text>
            </Link>
          )}
        </Box>
      </Flex>
    </Card>
  )
}
