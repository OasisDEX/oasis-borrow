import { AppLink } from 'components/Links'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { TokensGroup } from 'components/TokensGroup'
import type { MarketingTemplateHeroProps } from 'features/marketing-layouts/types'
import { isArray } from 'lodash'
import React, { type FC } from 'react'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateHero: FC<MarketingTemplateHeroProps> = ({
  description,
  image,
  link: { label, url },
  protocol = [],
  title,
  token = [],
}) => {
  const protocols = isArray(protocol) ? protocol : [protocol]
  const tokens = isArray(token) ? token : [token]

  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        alignItems: 'center',
        rowGap: '48px',
        columnGap: 5,
      }}
    >
      <Box sx={{ flex: '1 1 0' }}>
        {protocols.length + tokens.length > 0 && (
          <Flex as="ul" sx={{ gap: 1, m: 0, p: 0, listStyle: 'none' }}>
            {protocols.map((_protocol) => (
              <Box as="li">
                <ProtocolLabel protocol={_protocol} />
              </Box>
            ))}
            {tokens.map((_token) => (
              <Box as="li">
                <TokensGroup tokens={[_token]} forceSize={30} />
              </Box>
            ))}
          </Flex>
        )}
        <Heading as="h1" variant="header1" sx={{ mt: '12px' }}>
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
