import React from 'react'
import { Box, Card, Heading, SxStyleProp, Text } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { AppLink } from './Links'

export function InfoCard({
  title,
  subtitle,
  links,
  backgroundImage,
  backgroundGradient,
  sx,
}: {
  title: string
  subtitle: string
  links: Array<{ href: string; text: string }>
  backgroundImage: string
  backgroundGradient: string
  sx?: SxStyleProp
}) {
  return (
    <Card
      sx={{
        ...sx,
        p: 4,
        borderRadius: 'large',
        border: 'none',
        backgroundImage: `url(${staticFilesRuntimeUrl(backgroundImage)}), ${backgroundGradient}`,
        backgroundPosition: 'bottom 0px right 0px',
        backgroundRepeat: 'no-repeat',
        minHeight: ['414px', 'unset'],
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Heading sx={{ my: 2, fontWeight: 'bold', color: 'primary' }}>{title}</Heading>
        <Text
          sx={{ mb: 3, color: 'text.subtitle', minHeight: '3em', maxWidth: ['unset', '320px'] }}
        >
          {subtitle}
        </Text>
        {links.map(({ href, text }, i) => (
          <AppLink
            key={i}
            href={href}
            sx={{ pb: 3, fontSize: 3, color: 'primary', display: 'block' }}
          >
            {text} -&gt;
          </AppLink>
        ))}
      </Box>
    </Card>
  )
}
