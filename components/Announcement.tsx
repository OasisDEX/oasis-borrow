import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React, { useLayoutEffect, useState } from 'react'
import { Box, Flex, IconButton, SxProps, Text } from 'theme-ui'

import { AppLink } from './Links'
import { WithArrow } from './WithArrow'

function Separator() {
  return (
    <Text
      variant="paragraph3"
      sx={{
        fontWeight: 'semiBold',
        color: 'muted',
        mx: 3,
        ml: 4,
        '@media screen and (max-width: 400px)': {
          display: 'none',
        },
      }}
    >
      |
    </Text>
  )
}

function Closeable({ children, onClose }: { onClose?: () => void } & WithChildren) {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <IconButton
        onClick={onClose}
        sx={{
          cursor: 'pointer',
          height: 3,
          width: 3,
          padding: 0,
          position: 'absolute',
          top: 3,
          right: 3,
          zIndex: 1,
          color: 'onSurface',
          '&:hover': {
            color: 'primary',
          },
        }}
      >
        <Icon name="close_squared" size={14} />
      </IconButton>
    </Box>
  )
}

export function Announcement({ children, sx }: WithChildren & SxProps) {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        px: [3, 4],
        py: [2, 3],
        borderRadius: 'large',
        background: 'rgba(255,255,255, 0.65)',
        width: ['100%', 'fit-content'],
        justifySelf: 'center',
        ...sx,
      }}
    >
      <Flex
        sx={{
          height: '36px',
          width: ' 36px',
          background: 'surface',
          boxShadow: 'banner',
          borderRadius: 'roundish',
          mr: 3,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="announcement" height="25px" width="25px" />
      </Flex>
      {children}
    </Flex>
  )
}

interface GenericAnnouncementProps {
  text: string
  discordLink: string
  link?: string
  linkText?: string
}

export function GenericAnnouncement({
  text,
  discordLink,
  link,
  linkText,
}: GenericAnnouncementProps) {
  const [shouldRender, setShouldRender] = useState(true)

  useLayoutEffect(() => {
    setShouldRender(!sessionStorage.getItem('isAnnouncementHidden'))
  }, [])

  return shouldRender ? (
    <Closeable
      onClose={() => {
        setShouldRender(false)
        sessionStorage.setItem('isAnnouncementHidden', 'true')
      }}
    >
      <Announcement sx={{ mb: 3, textAlign: 'left' }}>
        <Box>
          <Box sx={{ mb: 2 }}>
            <Text
              variant="paragraph3"
              sx={{ fontWeight: 'semiBold', fontSize: [1, 2], mr: 3, pr: 2 }}
            >
              {text}
            </Text>
          </Box>
          <Flex
            sx={{
              '@media screen and (max-width: 400px)': {
                flexDirection: 'column',
              },
            }}
          >
            <AppLink href={discordLink}>
              <WithArrow>Visit Discord</WithArrow>
            </AppLink>
            {link && linkText && (
              <>
                <Separator />
                <AppLink href={link}>
                  <WithArrow>{linkText}</WithArrow>
                </AppLink>
              </>
            )}
          </Flex>
        </Box>
      </Announcement>
    </Closeable>
  ) : null
}
