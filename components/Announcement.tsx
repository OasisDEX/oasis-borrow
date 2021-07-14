import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, SxProps, Text } from 'theme-ui'

import { AppLink } from './Links'

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
        }}
      >
        <Icon name="announcement" height="25px" width="25px" />
      </Flex>
      {children}
    </Flex>
  )
}

function WithArrow({ children }: React.PropsWithChildren<{}>) {
  return (
    <Text
      variant="paragraph3"
      sx={{
        fontWeight: 'semiBold',
        fontSize: [1, 2],
        position: 'relative',
        '& .arrow': {
          transition: 'ease-in-out 0.2s',
          transform: 'translateX(0px)',
        },
        '&:hover .arrow': {
          transform: 'translateX(5px)',
        },
      }}
    >
      <Box sx={{ display: 'inline', mr: 2 }}>{children}</Box>
      <Box className="arrow" sx={{ display: 'inline', position: 'absolute' }}>
        →
      </Box>
    </Text>
  )
}

export function WelcomeAnnouncement() {
  const { t } = useTranslation()

  return (
    <Announcement sx={{ mb: 3, textAlign: 'left' }}>
      <Flex sx={{ flexDirection: ['column', 'row'] }}>
        <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', fontSize: [1, 2], mr: 3 }}>
          {t('welcome')}
        </Text>
        <Flex sx={{ flexDirection: ['column', 'row'] }}>
          <AppLink href="https://blog.oasis.app/introducing-the-redesigned-oasis-borrow/">
            <WithArrow>{t('read-blog-post')}</WithArrow>
          </AppLink>
          <Text
            variant="paragraph3"
            sx={{
              fontWeight: 'semiBold',
              color: 'muted',
              mx: 3,
              ml: 4,
              display: ['none', 'block'],
            }}
          >
            |
          </Text>
          <AppLink href={`${window.location.origin}/borrow-old`}>
            <WithArrow>{t('visit-old-oasis')}</WithArrow>
          </AppLink>
        </Flex>
      </Flex>
    </Announcement>
  )
}
