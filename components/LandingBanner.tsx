import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Flex, Grid, Heading, Image, Text } from 'theme-ui'

interface LandingBannerProps {
  title: string
  description: string
  background: string
  image: {
    src: string
  }
  button?: ReactNode
  link: {
    label: string
    href: string
  }
}

export function LandingBanner({
  image,
  title,
  description,
  background,
  button,
  link,
}: LandingBannerProps) {
  return (
    <Box sx={{ borderRadius: 'round', background }}>
      <Grid
        sx={{
          gridTemplateColumns: ['1fr', '1fr 316px'],
          height: ['auto', 'auto', '322px'],
          gap: [4, 0, 0],
        }}
      >
        <Box
          sx={{
            justifyContent: 'center',
            height: 'inherit',
            mt: '5',
            display: ['flex', 'none'],
          }}
        >
          <Image
            src={staticFilesRuntimeUrl(image.src)}
            sx={{
              objectFit: 'contain',
              height: 'inherit',
            }}
          />
        </Box>
        <Flex sx={{ p: [4, 5], flexDirection: 'column', justifyContent: 'space-between' }}>
          <Heading as="h2" variant="header4" sx={{ mb: '12px' }}>
            {title}
          </Heading>
          <Text as="p" variant="paragraph1" sx={{ color: 'neutral80' }}>
            {description}
          </Text>
          <Flex
            sx={{
              mt: [5, 4],
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 4,
              flexDirection: ['column', 'row'],
            }}
          >
            {button}
            <AppLink href={link.href} sx={{ fontSize: 4, fontWeight: 'regular', mb: [4, 0] }}>
              {link.label}
            </AppLink>
          </Flex>
        </Flex>
        <Box
          sx={{
            justifyContent: 'flex-end',
            height: 'inherit',
            display: ['none', 'flex'],
            overflow: 'hidden',
          }}
        >
          <Image
            src={staticFilesRuntimeUrl(image.src)}
            sx={{
              minWidth: 'unset',
              maxWidth: 'unset',
              height: ['calc(100% + 10px)', 'calc(100% + 52px)'],
              transform: [
                'translateX(30px) translateY(-5px)',
                'translateX(60px) translateY(-27px)',
              ],
              objectFit: 'contain',
            }}
          />
        </Box>
      </Grid>
    </Box>
  )
}
