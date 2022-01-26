import React from 'react'
import { Box, Card, Heading, SxStyleProp, Text } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { AppLink } from './Links'

function CardWithManyLinks({
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
        {links.map(({ href, text }) => (
          <Box sx={{ pb: 3 }} key={href}>
            <AppLink href={href} sx={{ fontSize: 3, color: 'primary' }}>
              {text} -&gt;
            </AppLink>
          </Box>
        ))}
      </Box>
    </Card>
  )
}

function CardWithOneLink({
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
        borderRadius: 'large',
        border: 'none',
        backgroundImage: `url(${staticFilesRuntimeUrl(backgroundImage)}), ${backgroundGradient}`,
        backgroundPosition: 'bottom 0px right 0px',
        backgroundRepeat: 'no-repeat',
        minHeight: ['414px', 'unset'],
        padding: 0,
      }}
    >
      <AppLink href={links[0].href} variant="unStyled" sx={{ display: 'block', p: 4 }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Heading sx={{ my: 2, fontWeight: 'bold', color: 'primary' }}>{title}</Heading>
          <Text
            sx={{ mb: 3, color: 'text.subtitle', minHeight: '3em', maxWidth: ['unset', '320px'] }}
          >
            {subtitle}
          </Text>
          <Box sx={{ pb: 3, fontSize: 3, color: 'primary', fontWeight: 'semiBold' }}>
            {links[0].text} -&gt;
          </Box>
        </Box>
      </AppLink>
    </Card>
  )
}

// function CardInternal ({})

type InfoCardProps = {
  title: string
  subtitle: string
  links: Array<{ href: string; text: string }>
  backgroundImage: string
  backgroundGradient: string
  sx?: SxStyleProp
}

export function InfoCard(props: InfoCardProps) {
  if (props.links.length === 1) {
    return <CardWithOneLink {...props} />
  } else {
    return <CardWithManyLinks {...props} />
  }
}
