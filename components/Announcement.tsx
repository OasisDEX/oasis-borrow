import React, { useLayoutEffect, useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { announcement } from 'theme/icons'

import { Icon } from './Icon'
import { AppLink } from './Links'
import { Notice } from './Notice'
import { WithArrow } from './WithArrow'

function Separator() {
  return (
    <Text
      variant="paragraph3"
      sx={{
        fontWeight: 'semiBold',
        color: 'neutral80',
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
interface AnnouncementProps {
  discordLink?: string
  link?: string
  linkText?: string
  text: string
  withClose?: boolean
}

export function Announcement({ discordLink, link, linkText, text, withClose }: AnnouncementProps) {
  const [shouldRender, setShouldRender] = useState(true)

  useLayoutEffect(() => {
    setShouldRender(!sessionStorage.getItem('isAnnouncementHidden'))
  }, [])

  return shouldRender ? (
    <Notice
      close={() => {
        setShouldRender(false)
        sessionStorage.setItem('isAnnouncementHidden', 'true')
      }}
      withClose={withClose}
    >
      <Flex
        sx={{
          alignItems: 'center',
          borderRadius: 'large',
          background: 'rgba(255,255,255, 0.65)',
          width: ['100%', 'fit-content'],
          justifySelf: 'center',
          textAlign: 'left',
        }}
      >
        <Box sx={{ mr: 4, flexShrink: 0 }}>
          <Flex
            sx={{
              border: 'bold',
              borderRadius: 'circle',
              width: '56px',
              height: '56px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon={announcement} width="24" height="24" />
          </Flex>
        </Box>
        <Box>
          <Box sx={{ mb: 2 }}>
            <Text
              variant="paragraph3"
              sx={{ fontWeight: 'semiBold', fontSize: [1, 2], mr: 3, pr: 2, color: 'neutral80' }}
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
            {discordLink && (
              <AppLink href={discordLink}>
                <WithArrow>Visit Discord</WithArrow>
              </AppLink>
            )}
            {discordLink && link && linkText && <Separator />}
            {link && linkText && (
              <AppLink href={link}>
                <WithArrow>{linkText}</WithArrow>
              </AppLink>
            )}
          </Flex>
        </Box>
      </Flex>
    </Notice>
  ) : null
}
