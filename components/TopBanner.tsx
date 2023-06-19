import { Icon } from '@makerdao/dai-ui-icons'
import { TopBannerEvents, trackingEvents } from 'analytics/analytics'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useLocalStorage } from 'helpers/useLocalStorage'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from 'theme-ui'

import { AppLink } from './Links'
import { WithArrow } from './WithArrow'

export const TopBanner = ({ name }: { name: string }) => {
  const [topBannerClosed, setTopBannerClosed] = useLocalStorage(`TopBanner_${name}_closed`, false)
  const { t } = useTranslation()
  return topBannerClosed ? null : (
    <>
      <Box
        sx={{
          position: 'relative',
          textAlign: 'center',
          padding: 3,
          background: 'linear-gradient(90.6deg, #D3F5FF 0%, #F2FCFF 39.53%, #FFE7D8 99.87%)',
          '&:hover svg.arrow': {
            transform: 'translateX(10px)',
          },
        }}
      >
        <AppLink
          href={EXTERNAL_LINKS.BLOG.MAIN}
          onClick={() => {
            trackingEvents.topBannerEvent(TopBannerEvents.TopBannerClicked, name)
          }}
        >
          <WithArrow variant="boldParagraph2" sx={{ fontSize: '16px' }}>
            <Icon
              name="loudspeaker"
              sx={{ mr: 2, position: 'relative', top: '2px', transition: '0.2s transform' }}
            />
            {t('top-banner.rebranding')}
          </WithArrow>
        </AppLink>
        <Icon
          name="close"
          sx={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }}
          onClick={() => {
            trackingEvents.topBannerEvent(TopBannerEvents.TopBannerClosed, name)
            setTopBannerClosed(true)
          }}
        />
      </Box>
    </>
  )
}
