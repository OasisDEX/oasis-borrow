import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Box, Card, Heading, SxStyleProp, Text } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { WithChildren } from '../helpers/types'
import { AppLink } from './Links'

function CardContent({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
} & WithChildren) {
  return (
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      <Heading sx={{ my: 2, fontWeight: 'bold', color: 'primary100' }}>{title}</Heading>
      <Text sx={{ mb: 3, color: 'neutral80', minHeight: '3em', maxWidth: ['unset', '320px'] }}>
        {subtitle}
      </Text>
      {children}
    </Box>
  )
}

function CardWrapper({
  backgroundImage,
  backgroundGradient,
  sx,
  children,
}: {
  backgroundImage: string
  backgroundGradient: string
  sx?: SxStyleProp
} & WithChildren) {
  return (
    <Card
      sx={{
        borderRadius: 'large',
        border: 'none',
        backgroundImage: `url(${staticFilesRuntimeUrl(backgroundImage)}), ${backgroundGradient}`,
        backgroundPosition: 'bottom 0px right 0px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: ['70%, cover', '220px, cover'],
        minHeight: ['414px', 'unset'],
        ...sx,
      }}
    >
      {children}
    </Card>
  )
}

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
    return (
      <CardWrapper {...props} sx={{ ...props.sx, p: 0 }}>
        <AppLink
          href={props.links[0].href}
          variant="unStyled"
          sx={{
            display: 'block',
            p: 4,
            cursor: 'pointer',
            height: '100%',
            '&:hover svg': {
              transform: 'translateX(8px)',
            },
          }}
        >
          <CardContent title={props.title} subtitle={props.subtitle}>
            <Box
              sx={{
                pb: 3,
                fontSize: 3,
                color: 'primary100',
                fontWeight: 'semiBold',
              }}
            >
              {props.links[0].text}
              <Icon
                name="arrow_right"
                size="15px"
                sx={{ position: 'relative', left: '6px', transition: '0.2s' }}
              />
            </Box>
          </CardContent>
        </AppLink>
      </CardWrapper>
    )
  } else {
    return (
      <CardWrapper {...props} sx={{ ...props.sx, p: 4 }}>
        <CardContent title={props.title} subtitle={props.subtitle}>
          {props.links.map(({ href, text }) => (
            <Box sx={{ pb: 3 }} key={href}>
              <AppLink
                href={href}
                sx={{
                  fontSize: 3,
                  color: 'primary100',
                  '&:hover svg': {
                    transform: 'translateX(8px)',
                  },
                }}
              >
                {text}
                <Icon
                  name="arrow_right"
                  size="15px"
                  sx={{ position: 'relative', left: '6px', transition: '0.2s' }}
                />
              </AppLink>
            </Box>
          ))}
        </CardContent>
      </CardWrapper>
    )
  }
}
