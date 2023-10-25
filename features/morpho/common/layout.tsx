import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { Footer } from 'components/Footer'
import { PageSEOTags } from 'components/HeadTags'
import { WithAnnouncementLayout } from 'components/layouts/WithAnnouncementLayout'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import type { WithChildren } from 'helpers/types/With.types'
import type { FC } from 'react'
import React from 'react'
import { theme } from 'theme'
import { ThemeUIProvider } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'
import { FeaturesEnum } from 'types/config'

export const MorphoWrapper: FC = ({ children }) => {
  return (
    <WithFeatureToggleRedirect feature={FeaturesEnum.MorphoBlue}>
      {children}
    </WithFeatureToggleRedirect>
  )
}

export function MorphoLayout({ children }: WithChildren) {
  return (
    <ThemeUIProvider theme={theme}>
      <WithAnnouncementLayout
        sx={{ zIndex: 2, position: 'relative' }}
        showAnnouncement={false}
        footer={<Footer />}
        header={<NavigationController />}
        bg={<BackgroundLight />}
      >
        <MorphoWrapper>{children}</MorphoWrapper>
      </WithAnnouncementLayout>
    </ThemeUIProvider>
  )
}

export const morphoPageSeoTags = (
  <PageSEOTags title="seo.morpho.title" description="seo.morpho.description" url="/" />
)
