import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelTopBannerEvents } from 'analytics/types'
import { useAppConfig } from 'helpers/config'
import { useLocalStorage } from 'helpers/useLocalStorage'
import React from 'react'
import { Box } from 'theme-ui'
import { rollDownTopBannerAnimation } from 'theme/animations'

import { AppLink } from './Links'
import { WithArrow } from './WithArrow'

export default function TopBanner() {
  const { topBanner } = useAppConfig('parameters')
  const [topBannerClosed, setTopBannerClosed] = useLocalStorage(
    `TopBanner_${topBanner.name}_closed`,
    false,
  )
  return topBannerClosed || !topBanner.name ? null : (
    <>
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
          href={topBanner.url as string}
          onClick={() => {
            trackingEvents.topBannerEvent(MixpanelTopBannerEvents.TopBannerClicked, 'rebranding')
          }}
          sx={{ display: 'inline', padding: 3 }}
        >
          <WithArrow variant="boldParagraph2" sx={{ fontSize: '16px', display: 'inline' }}>
            <Icon
              name="loudspeaker"
              sx={{ mr: 2, position: 'relative', top: '2px', transition: '0.2s transform' }}
            />
            {topBanner.message}
          </WithArrow>
        </AppLink>
        <Icon
          name="close"
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
              topBanner.name as string,
            )
            setTopBannerClosed(true)
          }}
        />
      </Box>
    </>
  )
}
