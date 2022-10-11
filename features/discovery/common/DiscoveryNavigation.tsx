import { AppLink } from 'components/Links'
import { DiscoveryPageMeta, discoveryPagesMeta } from 'features/discovery/meta'
import { DiscoveryPages } from 'features/discovery/types'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { theme } from 'theme'
import { Box, Flex, Text } from 'theme-ui'

export function DiscoveryNavigation({ active }: { active: DiscoveryPages }) {
  return (
    <Flex
      as="ul"
      sx={{
        flexWrap: 'wrap',
        justifyContent: ['space-around', 'space-around', 'center'],
        mb: '48px',
        p: 0,
        listStyle: 'none',
      }}
    >
      {discoveryPagesMeta.map((item, i) => (
        <DiscoveryNavigationItem key={i} isActive={active === item.kind} {...item} />
      ))}
    </Flex>
  )
}

export function DiscoveryNavigationItem({
  isActive,
  kind,
  iconColor,
  iconContent,
}: { isActive: boolean } & DiscoveryPageMeta) {
  const { t } = useTranslation()
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false)

  return (
    <Box
      as="li"
      key={kind}
      sx={{ width: ['50%', 'auto'], mx: [0, 0, 4], p: [2, 0], textAlign: 'center' }}
      onMouseEnter={() => {
        setIsMouseOver(true)
      }}
      onMouseLeave={() => {
        setIsMouseOver(false)
      }}
    >
      <AppLink
        href={`/discovery/${kind}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: 3,
          color: isActive || isMouseOver ? 'primary100' : 'neutral80',
          transition: '200ms color',
        }}
      >
        <svg
          width="33"
          height="32"
          viewBox="0 0 33 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="16.5"
            cy="16"
            r="16"
            fill={isActive || isMouseOver ? iconColor : theme.colors.neutral80}
            style={{ transition: '200ms fill' }}
          />
          {iconContent}
        </svg>
        <Text as="span" sx={{ mt: 2 }}>
          {t(`discovery.navigation.${kind}`)}
        </Text>
      </AppLink>
    </Box>
  )
}
