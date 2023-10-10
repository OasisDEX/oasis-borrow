import dayjs from 'dayjs'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

interface ActivityItemProps {
  timestamp: number | Date
  label: ReactNode
  icon: JSX.Element
  iconColor?: string
  componentRight?: JSX.Element
}

export function ActivityItem({
  timestamp,
  label,
  icon,
  iconColor,
  componentRight,
}: ActivityItemProps) {
  const momentTimestamp = typeof timestamp === 'number' ? dayjs.unix(timestamp) : dayjs(timestamp)
  const isSameYear = dayjs().isSame(dayjs(momentTimestamp), 'year')

  const timestampText = isSameYear
    ? momentTimestamp.format('MMM DD HH:mm')
    : momentTimestamp.format('MMM DD YYYY HH:mm')

  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        mx: 2,
        py: 1,
        '&:first-child:last-child': {
          alignSelf: 'flex-start',
        },
      }}
    >
      <Flex sx={{ alignItems: 'center', pr: componentRight ? 2 : 0 }}>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: 'light',
            color: iconColor || 'primary100',
            borderColor: iconColor || 'primary100',
            mr: 3,
          }}
        >
          {icon}
        </Flex>
        <Box sx={{ flex: 1 }}>
          <Text sx={{ fontSize: 4 }}>{label}</Text>
          <Text variant="timestampText">{timestampText}</Text>
        </Box>
      </Flex>
      <Flex sx={{ alignItems: 'center', fontSize: 4 }}>{componentRight}</Flex>
    </Flex>
  )
}

export function NoActivity() {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{ minHeight: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Heading variant="surfaceHeading" pb={3} sx={{ textAlign: 'center', fontWeight: 'body' }}>
        {t('no-activity')}
      </Heading>
    </Flex>
  )
}
