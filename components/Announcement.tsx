import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Flex, Grid, SxProps, Text } from 'theme-ui'

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
        <Icon name="announcement" height="25px" width="25px" sx={{ flexShrink: 0 }} />
      </Flex>
      {children}
    </Flex>
  )
}

export function UrgentAnnouncement() {
  return (
    <Announcement sx={{ mb: 3, textAlign: 'left', zIndex: 1 }}>
      <Grid gap={2}>
        <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', fontSize: [1, 2], mr: 3 }}>
          NOTE: You may currently experience issues if trying to generate Dai due to the Maker
          Protocol being over its Global Debt Ceiling.
          <br /> A governance vote that raises the debt ceiling has passed and is available for
          execution on Jun 2, 2021, 14:00 UTC.
          <br /> Please try again at that time.
        </Text>
      </Grid>
    </Announcement>
  )
}
