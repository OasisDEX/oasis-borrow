import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Flex, Grid, SxProps, Text } from 'theme-ui'

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

export function InfrastructureAnnouncement() {
  return (
    <Announcement sx={{ mb: 3, textAlign: 'left', zIndex: 1, mx: 'auto' }}>
      <Grid gap={2} sx={{ flex: 1 }}>
        <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', fontSize: [1, 2], mr: 3 }}>
          Our team will be performing maintenance on Oasis.app servers on Wednesday June 23rd.
          <br />
          To avoid downtime, we have set-up a back-up version at{' '}
          <AppLink href="https://oazo.app/borrow">Oazo.app</AppLink> and{' '}
          <AppLink href="https://oazo.io/borrow">Oazo.io</AppLink>. <br />
          Check{' '}
          <AppLink href="https://twitter.com/oasisdotapp">
            https://twitter.com/oasisdotapp
          </AppLink>{' '}
          for updates.
        </Text>
      </Grid>
    </Announcement>
  )
}
