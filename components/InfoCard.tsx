import React from 'react'
import { Box, Card, Heading, SxStyleProp, Text } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { WithChildren } from '../helpers/types'
import { AppLink } from './Links'
import { Icon } from '@makerdao/dai-ui-icons'

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
      <Heading sx={{ my: 2, fontWeight: 'bold', color: 'primary' }}>{title}</Heading>
      <Text sx={{ mb: 3, color: 'text.subtitle', minHeight: '3em', maxWidth: ['unset', '320px'] }}>
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
        ...sx,
        borderRadius: 'large',
        border: 'none',
        backgroundImage: `url(${staticFilesRuntimeUrl(backgroundImage)}), ${backgroundGradient}`,
        backgroundPosition: 'bottom 0px right 0px',
        backgroundRepeat: 'no-repeat',
        minHeight: ['414px', 'unset'],
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
          sx={{ display: 'block', p: 4, cursor: 'pointer' }}
        >
          <CardContent title={props.title} subtitle={props.subtitle}>
            <Box
              sx={{
                pb: 3,
                fontSize: 3,
                color: 'primary',
                fontWeight: 'semiBold',
                '&:hover svg': {
                  transform: 'translateX(8px)',
                },
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
                  color: 'primary',
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
