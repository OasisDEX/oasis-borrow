import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import React from 'react'
import * as icons from 'theme/icons'
import { Box, Button, Text } from 'theme-ui'

type HomepageAnnouncementProps = {
  announcement: {
    message: string
    url: string
    enabled: boolean
    icon: string
    actionLabel: string
    btnBackground: string
    btnColor: string
    iconBackground: string
    iconSize: number
  }
}

export function HomepageAnnouncement({ announcement }: HomepageAnnouncementProps) {
  return announcement.enabled ? (
    <AppLink
      href={announcement.url}
      sx={{
        width: 'fit-content',
        margin: '0 auto',
      }}
    >
      <Box
        sx={{
          background: 'neutral10',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 'round',
          padding: [3, 2],
          paddingRight: 2,
          marginTop: 3,
          flexWrap: 'wrap',
          gap: [2, 'unset'],
        }}
      >
        {announcement.icon ? (
          <Box
            sx={{
              background: announcement.iconBackground,
              padding: '0 5px',
              width: '32px',
              height: '32px',
              minWidth: '24px',
              minHeight: '24px',
              borderRadius: 'round',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 3,
            }}
          >
            <Icon
              icon={icons[announcement.icon as keyof typeof icons]}
              size={announcement.iconSize}
            />
          </Box>
        ) : null}
        <Text
          variant="boldParagraph3"
          sx={{
            marginRight: 3,
          }}
        >
          {announcement.message}
        </Text>
        <Button
          variant="secondary"
          sx={{
            py: '6px',
            pl: '20px',
            pr: 4,
            background: announcement.btnBackground,
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          <WithArrow sx={{ color: announcement.btnColor }}>{announcement.actionLabel}</WithArrow>
        </Button>
      </Box>
    </AppLink>
  ) : null
}
