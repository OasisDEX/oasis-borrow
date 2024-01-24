import { AppLink } from 'components/Links'
import { ProtocolLabel } from 'components/ProtocolLabel'
import type { MarketingTemplateHeroProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateHero: FC<MarketingTemplateHeroProps> = ({
  description,
  image,
  link: { label, url },
  protocol,
  title,
}) => {
  return (
    <Flex sx={{ flexDirection: ['column', null, 'row'], rowGap: '48px', columnGap: 5 }}>
      <Box sx={{ flex: '1 1 0', my: [0, null, '48px', 6] }}>
        <ProtocolLabel protocol={protocol} />
        <Heading variant="header1" sx={{ mt: '12px' }}>
          {title}
        </Heading>
        <Text as="p" variant="paragraph1" sx={{ mt: '20px', color: 'neutral80' }}>
          {description}
        </Text>
        <Box sx={{ mt: '24px' }}>
          <AppLink variant="primary" href={url} sx={{ px: 4 }}>
            {label} →
          </AppLink>
        </Box>
      </Box>
      <Box sx={{ flex: '1 1 0' }}>
        <Image src={image} sx={{ maxWidth: ['100%', null, 'none'] }} />
      </Box>
    </Flex>
  )
}
