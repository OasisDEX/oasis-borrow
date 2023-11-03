'use client'
import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelTopBannerEvents } from 'analytics/types'
import { useAppConfig } from 'helpers/config'
import type { ConfiguredAppParameters } from 'helpers/config/types'
import { useLocalStorage } from 'helpers/useLocalStorage'
import React from 'react'
import { useCookie, useWindowSize } from 'react-use'
import { rollDownTopBannerAnimation } from 'theme/animations'
import { close, loudspeaker } from 'theme/icons'
import { Box, Text } from 'theme-ui'

import { Icon } from './Icon'
import { AppLink } from './Links'
import { WithArrow } from './WithArrow'

type TopBanner = ConfiguredAppParameters['topBanner']

function OneBanner({ banner }: { banner: TopBanner }) {
  const [bannerClosed, setBannerClosed] = useLocalStorage(`TopBanner_${banner.name}_closed`, false)

  const { width } = useWindowSize()

  const isClosed = banner.closeable && bannerClosed
  return !banner.enabled || isClosed || !banner.name ? null : (
    <Box
      sx={{
        position: 'relative',
        textAlign: 'center',
        background: 'linear-gradient(90.6deg, #D3F5FF 0%, #F2FCFF 39.53%, #FFE7D8 99.87%)',
        '&:hover svg.arrow': {
          transform: 'translateX(10px)',
        },
        height: ['auto', 0],
        overflow: 'hidden',
        ...rollDownTopBannerAnimation,
      }}
    >
      <AppLink
        href={banner.url as string}
        onClick={() => {
          trackingEvents.topBannerEvent(MixpanelTopBannerEvents.TopBannerClicked, banner.name)
        }}
        sx={{ display: 'inline-block' }}
      >
        <WithArrow as={'span'} variant="boldParagraph2">
          <Text
            as={'span'}
            variant="boldParagraph2"
            sx={{
              fontSize: '16px',
              display: 'inline-block',
              width: `${width - 100}px`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Icon
              icon={loudspeaker}
              sx={{ mr: 2, position: 'relative', transition: '0.2s transform' }}
            />
            {banner.message}
          </Text>
        </WithArrow>
      </AppLink>
      {banner.closeable && (
        <Icon
          icon={close}
          sx={{
            position: 'absolute',
            top: '4px',
            right: '20px',
            cursor: 'pointer',
            padding: 3,
            boxSizing: 'content-box',
          }}
          onClick={() => {
            trackingEvents.topBannerEvent(
              MixpanelTopBannerEvents.TopBannerClosed,
              banner.name as string,
            )
            setBannerClosed(true)
          }}
        />
      )}
    </Box>
  )
}

const getLocationBanner = (
  viewerCountry: Readonly<string | null>,
  locationBanner: ConfiguredAppParameters['locationBanner'],
) => {
  return Object.entries(locationBanner)
    .filter(([country]) => {
      return country === viewerCountry
    })
    .map(([, banner]) => banner)[0]
}

export default function TopBanners() {
  const { topBanner, locationBanner } = useAppConfig('parameters')
  const [viewerCountry] = useCookie('country')

  const locationBasedBanner = getLocationBanner(viewerCountry, locationBanner)

  return (
    <>
      <OneBanner banner={topBanner} />
      {locationBasedBanner && <OneBanner banner={locationBasedBanner} />}
    </>
  )
}
