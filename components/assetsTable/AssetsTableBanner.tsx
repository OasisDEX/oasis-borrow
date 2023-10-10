import type { AssetsTableBannerProps } from 'components/assetsTable/types'
import { AppLink } from 'components/Links'
import React from 'react'
import { Box, Button, Flex, Heading, Text } from 'theme-ui'

export function AssetsTableBanner({
  cta,
  description,
  icon,
  link,
  title,
  onClick,
}: AssetsTableBannerProps) {
  return (
    <Flex
      sx={{
        flexWrap: ['wrap', null, 'nowrap'],
        gap: ['24px', null, 4],
        alignItems: 'center',
        my: '12px',
        py: ['24px', null, 3],
        px: ['24px', null, 4],
        borderRadius: 'medium',
        boxShadow: 'vaultDetailsCard',
      }}
    >
      <Flex sx={{ flexShrink: 0, svg: { display: 'block' } }}>{icon}</Flex>
      <Box>
        <Heading as="h3" variant="boldParagraph2">
          {title}
        </Heading>
        <Text as="p" variant="paragraph3" sx={{ mt: 1, color: 'neutral80' }}>
          {description}
        </Text>
      </Box>
      <Box sx={{ flexShrink: 0, width: ['100%', null, 'auto'], ml: 'auto' }}>
        <AppLink
          href={link}
          internalInNewTab={true}
          onClick={() => {
            onClick && onClick(link)
          }}
        >
          <Button variant="action">{cta}</Button>
        </AppLink>
      </Box>
    </Flex>
  )
}
