import { MixpanelUserContext, trackingEvents } from 'analytics/analytics'
import { GenericSelect } from 'components/GenericSelect'
import { AppLink } from 'components/Links'
import { DISCOVER_URL } from 'features/discover/helpers'
import { DiscoverPageMeta, discoverPagesMeta } from 'features/discover/meta'
import { DiscoverPages } from 'features/discover/types'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { theme } from 'theme'
import { Box, Flex, Text } from 'theme-ui'
import { useOnMobile } from 'theme/useBreakpointIndex'

interface DiscoverNavigationProps {
  kind: DiscoverPages
  userContext: MixpanelUserContext
}

export function DiscoverNavigation({ kind, userContext }: DiscoverNavigationProps) {
  const { t } = useTranslation()
  const { push } = useRedirect()
  const onMobile = useOnMobile()

  const mobileLinks = discoverPagesMeta.map((item) => ({
    label: t(`discover.navigation.${item.kind}`),
    value: `${DISCOVER_URL}/${item.kind}`,
    kind: item.kind,
  }))
  const selectedLink = mobileLinks.filter((item) => item.kind === kind)[0]

  return (
    <>
      {onMobile ? (
        <GenericSelect
          options={mobileLinks}
          defaultValue={selectedLink}
          onChange={(currentValue) => {
            trackingEvents.discover.selectedCategory(kind, userContext)
            push(currentValue.value)
          }}
          wrapperSx={{ mb: 3 }}
        />
      ) : (
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
          {discoverPagesMeta.map((item, i) => (
            <DiscoverNavigationItem
              key={i}
              isActive={kind === item.kind}
              userContext={userContext}
              {...item}
            />
          ))}
        </Flex>
      )}
    </>
  )
}

export function DiscoverNavigationItem({
  isActive,
  kind,
  iconColor,
  iconContent,
  userContext,
}: { isActive: boolean; userContext: MixpanelUserContext } & DiscoverPageMeta) {
  const { t } = useTranslation()
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false)

  return (
    <Box
      as="li"
      sx={{ width: ['50%', 'auto'], mx: [0, 0, 4], p: [2, 0], textAlign: 'center' }}
      onMouseEnter={() => {
        setIsMouseOver(true)
      }}
      onMouseLeave={() => {
        setIsMouseOver(false)
      }}
    >
      <AppLink
        href={`${DISCOVER_URL}/${kind}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: 3,
          color: isActive || isMouseOver ? 'primary100' : 'neutral80',
          transition: '200ms color',
        }}
        onClick={() => {
          trackingEvents.discover.selectedCategory(kind, userContext)
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
          {t(`discover.navigation.${kind}`)}
        </Text>
      </AppLink>
    </Box>
  )
}
