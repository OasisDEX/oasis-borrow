import { MixpanelUserContext, trackingEvents } from 'analytics/analytics'
import { AppLink } from 'components/Links'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages } from 'features/discover/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Heading, Text } from 'theme-ui'

export function DiscoverTableBanner({
  kind,
  icon,
  link,
  userContext,
}: { kind: DiscoverPages; userContext: MixpanelUserContext } & DiscoverBanner) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        flexWrap: ['wrap', null, 'nowrap'],
        gap: ['24px', null, 4],
        alignItems: 'center',
        py: ['24px', null, 3],
        px: ['24px', null, 4],
        borderRadius: 'medium',
        boxShadow: 'vaultDetailsCard',
      }}
    >
      <Box sx={{ flexShrink: 0, svg: { display: 'block' } }}>{icon}</Box>
      <Box>
        <Heading as="h3" variant="boldParagraph2">
          {t(`discover.table.banner.${kind}.title`)}
        </Heading>
        <Text as="p" variant="paragraph3" sx={{ mt: 1, color: 'neutral80' }}>
          {t(`discover.table.banner.${kind}.description`)}
        </Text>
      </Box>
      <Box sx={{ flexShrink: 0, width: ['100%', null, 'auto'] }}>
        <AppLink
          href={link}
          onClick={() => {
            trackingEvents.discover.clickedTableBanner(kind, link, userContext)
          }}
        >
          <Button variant="action">{t(`discover.table.banner.${kind}.cta`)}</Button>
        </AppLink>
      </Box>
    </Flex>
  )
}
