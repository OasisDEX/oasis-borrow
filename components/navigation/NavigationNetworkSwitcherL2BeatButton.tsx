import { Icon } from 'components/Icon'
import { useTranslation } from 'next-i18next'
import l2beatLogo from 'public/static/img/l2beat-logo.svg'
import React, { useState } from 'react'
import { Box, Image, Link } from 'theme-ui'
import { arrow_right_light } from 'theme/icons'

export const L2BeatSection = () => {
  const [hover, setHover] = useState<boolean>(false)
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 12px',
        gap: '8px',
      }}
    >
      <Link
        href="https://l2beat.com/scaling/summary"
        target="_blank"
        variant="networkPicker"
        sx={{
          fontWeight: '400',
          whiteSpace: 'pre',
          ':hover': {
            fontWeight: '600',
          },
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          textDecoration: 'none',
        }}
        onMouseOver={() => {
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Image
            src={l2beatLogo}
            sx={{
              mr: 3,
              minWidth: 4,
              minHeight: 4,
              position: 'relative',
              zIndex: '2',
            }}
          />
          {t('navigation-network.l2beat-title')}
        </Box>
        {hover && <Icon icon={arrow_right_light} />}
      </Link>
      {hover && (
        <Box
          sx={{
            fontSize: '12px',
            color: 'neutral80',
            fontWeight: '600',
            lineHeight: '20px',
          }}
        >
          {t('navigation-network.l2beat-description')}
        </Box>
      )}
    </Box>
  )
}
