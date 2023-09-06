import React from 'react'
import { Footer } from 'components/Footer'
import { marketingBackgrounds } from 'components/layouts/backgrounds'
import { BasicLayout } from 'components/layouts/BasicLayout'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import { WithChildren } from 'helpers/types'

export interface MarketingLayoutProps extends WithChildren {
  variant?: string
  topBackground?: keyof typeof marketingBackgrounds
}

export function MarketingLayout({
  children,
  variant,
  topBackground = 'default',
}: MarketingLayoutProps) {
  return (
    <>
      <BasicLayout
        header={<NavigationController />}
        footer={<Footer />}
        variant={variant || 'marketingContainer'}
        sx={{ position: 'relative' }}
        bg={marketingBackgrounds[topBackground]}
      >
        {children}
      </BasicLayout>
    </>
  )
}
