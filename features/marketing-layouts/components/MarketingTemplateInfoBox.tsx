import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import type { MarketingTemplateInfoBoxProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateInfoBox: FC<MarketingTemplateInfoBoxProps> = ({
  description,
  image,
  link,
  title,
  tokens,
}) => {
  return (
    <Flex>
      <Box>
        <Heading as="h3" variant="header4">
          {title}
        </Heading>
        <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
          {description}
        </Text>
        {link && (
          <AppLink href={link.url} sx={{ display: 'inline-block' }}>
            <WithArrow sx={{ fontSize: 3, color: 'interactive100' }}>{link.label}</WithArrow>
          </AppLink>
        )}
      </Box>
      <Image src={image} sx={{ flexShrink: 0 }} />
    </Flex>
  )
}
