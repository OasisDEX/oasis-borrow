import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Image } from 'theme-ui'

type NavigationBrandingPillColor = string | [string, string]

export interface NavigationBrandingPill {
  color: NavigationBrandingPillColor
  label: string
}

interface NavigationBrandingProps {
  link?: string
  pill?: NavigationBrandingPill
}

function getPillColor(color: NavigationBrandingPillColor) {
  return Array.isArray(color) ? `linear-gradient(90deg, ${color[0]} 0%, ${color[1]} 100%)` : color
}

export function NavigationBranding({ link = '/', pill }: NavigationBrandingProps) {
  return (
    <AppLink withAccountPrefix={false} href={link} sx={{ display: 'flex' }}>
      <Image src={staticFilesRuntimeUrl('/static/img/logo_v2.svg')} />
      {pill && (
        <Box
          sx={{
            height: '24px',
            ml: 2,
            lineHeight: '24px',
            px: 2,
            fontSize: 1,
            fontWeight: 'medium',
            color: 'neutral10',
            borderRadius: 'roundish',
            background: getPillColor(pill.color),
          }}
        >
          {pill.label}
        </Box>
      )}
    </AppLink>
  )
}
