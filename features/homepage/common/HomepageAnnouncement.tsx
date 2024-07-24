import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { summerLightBrandGradient } from 'helpers/getGradientColor'
import React from 'react'
import * as icons from 'theme/icons'
import { Box, Text } from 'theme-ui'

type HomepageAnnouncementProps = {
  announcement: {
    message: string
    url: string
    enabled: boolean
    icon: string
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
          padding: 2,
          paddingRight: 4,
          marginTop: 3,
        }}
      >
        {announcement.icon ? (
          <Box
            sx={{
              background: summerLightBrandGradient,
              padding: '0 5px',
              width: '24px',
              height: '24px',
              minWidth: '24px',
              minHeight: '24px',
              borderRadius: 'round',
              marginRight: 3,
            }}
          >
            <Icon icon={icons[announcement.icon as keyof typeof icons]} size={24} />
          </Box>
        ) : null}
        <Text
          variant="boldParagraph3"
          sx={{
            marginRight: '-7px',
          }}
        >
          {announcement.message}
        </Text>
        <WithArrow>&nbsp;</WithArrow>
      </Box>
    </AppLink>
  ) : null
}
