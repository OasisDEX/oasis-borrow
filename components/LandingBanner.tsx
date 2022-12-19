import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React, { ReactNode } from 'react'
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
    <Box sx={{ borderRadius: '32px', background }}>
      <Grid sx={{ gridTemplateColumns: ['1fr', '2fr 1fr'], height: ['auto', '322px'] }}>
        <Flex sx={{ p: '64px', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Heading as="h2" sx={{ mb: 2, fontSize: '28px' }}>
            {title}
          </Heading>
          <Text sx={{ color: 'neutral80', fontSize: 4 }}>{description}</Text>
          <Flex sx={{ mt: 4, alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
            {button}
            <AppLink href={link.href} sx={{ fontSize: '18px', fontWeight: 'regular' }}>
              {link.label}
            </AppLink>
          </Flex>
        </Flex>
        <Flex sx={{ justifyContent: 'flex-end', height: 'inherit' }}>
          <Image
            src={staticFilesRuntimeUrl(image.src)}
            sx={{
              objectFit: 'contain',
              height: 'inherit',
              display: ['none', 'flex'],
            }}
          />
        </Flex>
      </Grid>
    </Box>
  )
}
