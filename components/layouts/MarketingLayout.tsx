import { Footer } from 'components/Footer'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import React from 'react'

import { marketingBackgrounds } from './backgrounds'
import { BasicLayout } from './BasicLayout'
import type { MarketingLayoutProps } from './MarketingLayout.types'

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
