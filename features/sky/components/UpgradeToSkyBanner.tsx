import { ActionBanner } from 'components/ActionBanner'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box } from 'theme-ui'

export const UpgradeToSkyBanner = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <ActionBanner
        title="The Sky Ecosystem is here"
        lightText
        customCtaVariant="outlineSmall"
        cta={{
          label: 'Upgrade now',
          url: INTERNAL_LINKS.skySwapPage,
        }}
        sx={{
          backgroundImage: `url(${staticFilesRuntimeUrl('/static/img/sky-banner-background.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          color: 'white',
        }}
      >
        Upgrade your DAI to USDS, the upgraded stablecoin of the Sky Ecosystem with native rewards.{' '}
        <AppLink
          href={EXTERNAL_LINKS.BLOG.SKY_BLOG_POST}
          sx={{ color: 'neutral10', textDecoration: 'underline' }}
        >
          Learn more.
        </AppLink>
      </ActionBanner>
    </Box>
  )
}
