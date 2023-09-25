import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import React from 'react'
import { Button } from 'theme-ui'
import { share } from 'theme/icons'

interface ShareButtonPropsWithLink {
  hashtags?: never
  link: string
  text?: never
  url?: never
  via?: never
}

interface ShareButtonPropsWithParts {
  hashtags?: string
  link?: never
  text?: string
  url: string
  via?: string
}

type ShareButtonProps = ShareButtonPropsWithLink | ShareButtonPropsWithParts

export const twitterSharePositionText = 'Check out this position'
export const twitterSharePositionVia = 'summerfinance_'

export function getTwitterShareUrl({
  hashtags,
  text,
  url,
  via,
}: ShareButtonPropsWithParts): string {
  return `https://twitter.com/intent/tweet?${new URLSearchParams({
    url,
    ...(hashtags && { hashtags }),
    ...(text && { text }),
    ...(via && { via }),
  }).toString()}`
}

export function ShareButton({ link, ...rest }: ShareButtonProps) {
  return (
    <AppLink href={link || getTwitterShareUrl(rest as ShareButtonPropsWithParts)}>
      <Button
        sx={{
          display: 'flex',
          justifyContent: 'center',
          height: '28px',
          width: '28px',
          pt: '2px',
          pr: 0,
          pb: 0,
          pl: '2px',
          fontSize: 1,
          border: '1px solid',
          borderColor: 'neutral20',
          borderRadius: 'ellipse',
          backgroundColor: 'neutral10',
          boxShadow: ['none', null, null, 'surface'],
          transition: 'border-color 200ms, background-color 200ms, color 200ms',
          '&:hover': {
            backgroundColor: 'neutral10',
            borderColor: 'primary100',
            svg: {
              color: 'primary100',
            },
          },
          svg: {
            fill: 'primary60',
            transition: 'color 200ms',
            marginRight: '3px',
            marginTop: '1px',
          },
        }}
      >
        <Icon icon={share} size={17} />
      </Button>
    </AppLink>
  )
}
