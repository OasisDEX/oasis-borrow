import { Icon } from '@makerdao/dai-ui-icons'
import { TopBannerEvents, trackingEvents } from 'analytics/analytics'
import { WithChildren } from 'helpers/types'
import { useLocalStorage } from 'helpers/useLocalStorage'
import React from 'react'
import { Box } from 'theme-ui'
import { rollDownTopBannerAnimation } from 'theme/animations'

export const TopBanner = ({ name, children }: { name: string } & WithChildren) => {
  const [topBannerClosed, setTopBannerClosed] = useLocalStorage(`TopBanner_${name}_closed`, false)
  return topBannerClosed ? null : (
    <>
      <Box
        sx={{
          position: 'relative',
          textAlign: 'center',
          background: 'linear-gradient(90.6deg, #D3F5FF 0%, #F2FCFF 39.53%, #FFE7D8 99.87%)',
          '&:hover svg.arrow': {
            transform: 'translateX(10px)',
          },
          height: 0,
          overflow: 'hidden',
          ...rollDownTopBannerAnimation,
        }}
      >
        {children}
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
            trackingEvents.topBannerEvent(TopBannerEvents.TopBannerClosed, name)
            setTopBannerClosed(true)
          }}
        />
      </Box>
    </>
  )
}
