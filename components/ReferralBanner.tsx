import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React, { ReactNode } from 'react'
import { Flex, Image, Text } from 'theme-ui'

import { Banner } from './Banner'
import { AppLink } from './Links'

interface ReferralBannerProps {
  handleClose: () => void
  heading: ReactNode
}

export function ReferralBanner({ handleClose, heading }: ReferralBannerProps) {
  return (
    <Banner
      close={() => {
        handleClose()
      }}
      sx={{
        marginBottom: 3,
        overflow: 'hidden',
        borderRadius: '50px',
        width: '412px',
        height: '44px',
        p: 1,
        '&:hover': {
          opacity: '80%',
          cursor: 'pointer',
        },
      }}
      withClose={false}
    >
      <AppLink href={'/referrals'}>
        <Flex sx={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Image
            src={staticFilesRuntimeUrl('/static/img/referral_banner.svg')}
            sx={{ height: '36px' }}
          />{' '}
          <Text
            variant="text.paragraph3"
            sx={{ zIndex: 1, pl: '8px', pr: 1, fontWeight: 'semiBold' }}
          >
            {heading}
          </Text>
        </Flex>
      </AppLink>
    </Banner>
  )
}
