import { AppLink } from 'components/Links'
import { navigationBreakpointsWithPixels } from 'components/navigation/Navigation'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Image } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

type NavigationBrandingPillColor = string | [string, string]

export interface NavigationBrandingPill {
  color: NavigationBrandingPillColor
  label: string
}

interface NavigationBrandingProps {
  link?: string
  pill?: NavigationBrandingPill
}

export function getPillColor(color: NavigationBrandingPillColor) {
  return Array.isArray(color) ? `linear-gradient(90deg, ${color[0]} 0%, ${color[1]} 100%)` : color
}

export function NavigationBranding({
  link = INTERNAL_LINKS.homepage,
  pill,
}: NavigationBrandingProps) {
  const isViewBelowS = useMediaQuery(`(max-width: ${navigationBreakpointsWithPixels[0]})`)

  return (
    <AppLink
      withAccountPrefix={false}
      href={link}
      sx={{
        position: 'relative',
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        mr: 'auto',
        columnGap: 2,
      }}
    >
      <Image
        sx={{ height: '22px' }}
        src={staticFilesRuntimeUrl(`/static/img/logos/${isViewBelowS ? 'dot' : 'logo'}_dark.svg`)}
      />
      {pill && (
        <Box
          sx={{
            lineHeight: isViewBelowS ? '22px' : '24px',
            px: 2,
            fontSize: 1,
            fontWeight: 'medium',
            color: 'neutral10',
            borderRadius: 'roundish',
            background: getPillColor(pill.color),
            ...(isViewBelowS && {
              position: 'absolute',
              top: '-10px',
              left: '100%',
              ml: '-10px',
            }),
          }}
        >
          {pill.label}
        </Box>
      )}
    </AppLink>
  )
}
